/**
 * Faber Real-Time Session Room - Durable Object (Pure JavaScript)
 *
 * WHAT THIS FILE DOES:
 * 1. Manages real-time state synchronization per user session (`sessionId`).
 * 2. Supports dual streaming protocols:
 *    - Server-Sent Events (SSE) via `/stream`: Subscribed by web clients to receive image links.
 *    - WebSockets via `/ws`: Subscribed by interactive widgets using Cloudflare's WebSocket Hibernation API.
 * 3. Handles `/broadcast` (POST): Called when an Oration AI tool triggers an update.
 *    It caches the last product state in Durable Object storage and delivers the payload
 *    instantly to all active SSE writers and WebSocket connections.
 * 4. Automatic Replay: When a user connects or refreshes their browser, the most recent product
 *    payload is immediately replayed so their screen doesn't show a blank state.
 */

import { DurableObject } from 'cloudflare:workers';

export class SessionRoom extends DurableObject {
  /**
   * Initializes the SessionRoom Durable Object instance.
   * @param {Object} ctx - Cloudflare DurableObjectState (provides storage and WebSocket hibernation)
   * @param {Object} env - Environment bindings
   */
  constructor(ctx, env) {
    super(ctx, env);
    this.sseWriters = new Set();
  }

  /**
   * Main HTTP / WebSocket request router for this session.
   * @param {Request} request - Incoming fetch or WebSocket upgrade request
   * @returns {Promise<Response>} HTTP or WebSocket response
   */
  async fetch(request) {
    const url = new URL(request.url);

    // =========================================================================
    // 1. SSE Stream Endpoint (/stream)
    // Used by frontend index.html via new EventSource('/api/stream/:sessionId')
    // =========================================================================
    if (url.pathname === '/stream' || url.pathname.startsWith('/stream')) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      this.sseWriters.add(writer);

      const encoder = new TextEncoder();
      writer.write(encoder.encode(': keepalive\n\n'));

      // If a product payload was previously displayed, replay it immediately upon connection
      this.ctx.storage.get('lastPayload').then((lastPayload) => {
        if (lastPayload) {
          try {
            writer.write(encoder.encode(`data: ${JSON.stringify(lastPayload)}\n\n`));
          } catch (e) {
            console.warn('[SessionRoom] Failed to send cached payload to SSE client', e);
          }
        }
      });

      return new Response(readable, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // =========================================================================
    // 2. WebSocket Upgrade Endpoint (/ws)
    // Uses Cloudflare's zero-cost WebSocket Hibernation API
    // =========================================================================
    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
        return new Response('Expected WebSocket upgrade request', { status: 426 });
      }

      // Create a WebSocket pair: [clientSocket, serverSocket]
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Register server socket with hibernation API (keeps socket alive with 0 compute cost when idle)
      this.ctx.acceptWebSocket(server);

      // Send initial connection confirmation
      server.send(
        JSON.stringify({
          type: 'CONNECTED',
          message: 'Connected to Faber Real-Time Session Room',
          timestamp: new Date().toISOString()
        })
      );

      // Replay last cached product display to the newly connected socket
      const lastPayload = await this.ctx.storage.get('lastPayload');
      if (lastPayload) {
        try {
          server.send(JSON.stringify(lastPayload));
        } catch (e) {
          console.warn('[SessionRoom] Failed to send cached payload to client socket', e);
        }
      }

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    // =========================================================================
    // 3. Broadcast Payload Endpoint (/broadcast)
    // Called internally by the tool handler to push images to connected clients
    // =========================================================================
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      try {
        const payload = await request.json();

        // Persist the latest payload to survive hibernations and browser refreshes
        await this.ctx.storage.put('lastPayload', payload);

        // 3a. Broadcast to all active and hibernated WebSockets
        const sockets = this.ctx.getWebSockets();
        const serialized = JSON.stringify(payload);
        let deliveredCount = 0;

        for (const ws of sockets) {
          try {
            ws.send(serialized);
            deliveredCount++;
          } catch (err) {
            console.error('[SessionRoom] Error sending to websocket', err);
          }
        }

        // 3b. Broadcast to all active Server-Sent Event (SSE) streams
        const encoder = new TextEncoder();
        const sseData = encoder.encode(`data: ${serialized}\n\n`);
        for (const writer of this.sseWriters) {
          writer.write(sseData).catch(() => this.sseWriters.delete(writer));
        }

        return new Response(
          JSON.stringify({
            success: true,
            totalSubscribers: sockets.length + this.sseWriters.size,
            deliveredCount
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            error: err instanceof Error ? err.message : 'Broadcast failed'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // =========================================================================
    // 4. Last State Query Endpoint (/last-state)
    // =========================================================================
    if (url.pathname === '/last-state' && request.method === 'GET') {
      const lastPayload = await this.ctx.storage.get('lastPayload');
      return new Response(JSON.stringify({ payload: lastPayload || null }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found in SessionRoom', { status: 404 });
  }

  /**
   * WebSocket message handler (handles ping/pong heartbeat)
   * @param {WebSocket} ws
   * @param {string|ArrayBuffer} message
   */
  async webSocketMessage(ws, message) {
    try {
      if (typeof message === 'string') {
        const data = JSON.parse(message);
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
          return;
        }
      }
    } catch {
      if (typeof message === 'string' && message.trim().toUpperCase() === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    }
  }

  /**
   * WebSocket close event handler
   */
  async webSocketClose(ws, code, reason, _wasClean) {
    try {
      ws.close(code, reason || 'Connection closed');
    } catch {
      // Ignore already closed socket errors
    }
  }

  /**
   * WebSocket error handler
   */
  async webSocketError(_ws, error) {
    console.warn('[SessionRoom] WebSocket error encountered:', error);
  }
}
