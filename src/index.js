/**
 * Faber Product Visualizer - Cloudflare Worker Entrypoint (Pure JavaScript)
 *
 * WHAT THIS FILE DOES:
 * 1. Exports the `SessionRoom` Durable Object class for stateful WebSocket/SSE handling.
 * 2. Implements the Worker `fetch()` router handling all HTTP & WebSocket endpoints.
 * 3. Enforces full Cross-Origin Resource Sharing (CORS) so that independent frontends
 *    (running locally on any port or deployed anywhere) can interact with this API.
 * 4. Provides endpoints:
 *    - `GET  /api/config`            : Returns Oration public keys & agent ID from environment.
 *    - `GET  /api/products`          : Returns the 4 authorized Faber demo appliances.
 *    - `GET  /api/stream/:sessionId` : Subscribes browser to Server-Sent Events (SSE).
 *    - `GET  /api/ws`                : Upgrades browser to high-performance WebSocket.
 *    - `POST /api/tool`              : Receives Oration custom tool triggers and broadcasts image links.
 *    - `GET  /api/health`            : Basic health check endpoint.
 */

import { SessionRoom } from './sessionRoom.js';
import { resolveToolRequest, getAllProducts } from './catalog.js';

// Export Durable Object class to Cloudflare runtime
export { SessionRoom };

/**
 * Builds CORS response headers allowing frontend requests across different ports/domains.
 *
 * @param {Object} env - Cloudflare environment variables
 * @param {Request} request - Incoming HTTP request
 * @returns {HeadersInit} CORS headers object
 */
function getCorsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '*';
  const allowed = env.ALLOWED_ORIGIN || '*';
  const resolvedOrigin = allowed === '*' ? '*' : allowed.includes(origin) ? origin : allowed;

  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  /**
   * Main Cloudflare Worker request handler.
   *
   * @param {Request} request - The incoming HTTP request
   * @param {Object} env - Bound environment variables & Durable Object namespaces
   * @param {Object} _ctx - ExecutionContext for background tasks
   * @returns {Promise<Response>}
   */
  async fetch(request, env, _ctx) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(env, request);
    const rawPath = url.pathname.replace(/\/+$/, '') || '/';

    // =========================================================================
    // 1. CORS Preflight (OPTIONS)
    // =========================================================================
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // =========================================================================
    // 2. Client Configuration Endpoint (/api/config, /config)
    // Securely passes public keys to the browser so frontend HTML never stores keys
    // =========================================================================
    if ((rawPath === '/api/config' || rawPath === '/config') && request.method === 'GET') {
      const rawPk = env.ORATION_PUBLIC_KEY || '';
      const rawAg = env.ORATION_AGENT_ID || '';
      const pk = (!rawPk || rawPk.startsWith('pk_your_')) ? '70588826-0a19-4c4f-abdf-6de6c720d793' : rawPk;
      const ag = (!rawAg || rawAg.startsWith('ag_your_')) ? '538568f1-6a55-4e3f-989c-164f391a8443' : rawAg;

      return new Response(
        JSON.stringify({
          publicKey: pk,
          agentId: ag,
          webhookSecretConfigured: Boolean(env.TOOL_WEBHOOK_SECRET),
          defaultSessionId: 'default'
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // =========================================================================
    // 3. Full Demo Appliance Catalog (/api/catalog, /api/products)
    // Returns the 4 authorized Faber demo products
    // =========================================================================
    // 3. Full Demo Appliance Catalog (/api/catalog, /api/products, /products)
    // Returns the 4 authorized Faber demo products
    // =========================================================================
    if ((rawPath === '/api/catalog' || rawPath === '/catalog' || rawPath === '/api/products' || rawPath === '/products') && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'success',
          products: getAllProducts()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // =========================================================================
    // 4. Health Check (/api/health, /health, /)
    // =========================================================================
    if ((rawPath === '/api/health' || rawPath === '/health' || rawPath === '/') && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'faber-tool-backend',
          message: 'Faber Voice & Chat Product Visualizer Backend is online',
          endpoints: {
            tool: '/api/tool',
            stream: '/api/stream/default',
            config: '/api/config',
            products: '/api/products',
            health: '/api/health'
          },
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // =========================================================================
    // 5. WebSocket Upgrade Endpoint (/api/ws, /ws)
    // Routes to the session's dedicated Durable Object
    // =========================================================================
    if (rawPath === '/api/ws' || rawPath === '/ws') {
      const sessionId = url.searchParams.get('sessionId') || 'default';
      const doId = env.SESSION_ROOM.idFromName(sessionId);
      const roomStub = env.SESSION_ROOM.get(doId);

      return roomStub.fetch('http://internal/ws', request);
    }

    // =========================================================================
    // 6. Server-Sent Events (SSE) Stream Endpoint (/api/stream/:sessionId)
    // Real-time one-way event stream used by the side HTML visualizer widget
    // =========================================================================
    if (rawPath.startsWith('/api/stream') || rawPath.startsWith('/stream')) {
      const parts = rawPath.split('/');
      const sessionId = (parts[3] || parts[2] || url.searchParams.get('sessionId') || 'default').trim();
      const doId = env.SESSION_ROOM.idFromName(sessionId);
      const roomStub = env.SESSION_ROOM.get(doId);

      return roomStub.fetch('http://internal/stream', request);
    }

    // =========================================================================
    // 7. Oration Tool Endpoint (/api/tool, /tool, or POST /)
    // Called by Oration AI Agent when appliances are discussed during speech/chat
    // =========================================================================
    if (
      rawPath === '/api/tool' ||
      rawPath === '/tool' ||
      rawPath === '/api/display-product' ||
      rawPath === '/display-product' ||
      rawPath === '/api/oration/product-tool' ||
      (rawPath === '/' && request.method === 'POST')
    ) {
      // Optional Secret verification (enforced if custom secret is configured)
      const configuredSecret = env.TOOL_WEBHOOK_SECRET?.trim();
      if (configuredSecret && configuredSecret !== 'faber_internal_secret_2026') {
        const queryToken = url.searchParams.get('token');
        const authHeader = request.headers.get('Authorization') || '';
        const bearerToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.substring(7).trim() : null;

        if (queryToken !== configuredSecret && bearerToken !== configuredSecret) {
          return new Response(
            JSON.stringify({
              error: 'Unauthorized: Invalid or missing webhook secret token',
              status: 401
            }),
            {
              status: 401,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }
      }

      try {
        let body = {};
        if (request.method === 'POST') {
          const rawText = await request.text();
          if (rawText && rawText.trim().length > 0) {
            try {
              body = JSON.parse(rawText);
            } catch {
              body = { product: rawText.trim() };
            }
          }
        } else if (request.method === 'GET') {
          body = {
            sessionId: url.searchParams.get('sessionId'),
            product: url.searchParams.get('product'),
            products: url.searchParams.get('products'),
            product_enums: url.searchParams.get('product_enums'),
            display_mode: url.searchParams.get('display_mode')
          };
        }

        // Extract session ID (from URL query string or body JSON)
        let rawSessionId = url.searchParams.get('sessionId') || body.sessionId || 'default';
        if (typeof rawSessionId !== 'string' || !rawSessionId.trim() || rawSessionId.includes('{{') || rawSessionId === 'undefined' || rawSessionId === 'null') {
          rawSessionId = 'default';
        }
        const sessionId = rawSessionId.trim();
        const displayModeRaw = body.display_mode || url.searchParams.get('display_mode');

        // Extract query parameters as object
        const queryParams = Object.fromEntries(url.searchParams.entries());

        // Resolve rich component and products from catalog engine
        const resolved = resolveToolRequest(body, queryParams);
        const products = resolved.products || [];

        // Structured payload delivered to the side HTML widget
        const visualPayload = {
          type: 'PRODUCT_UPDATE',
          action: 'DISPLAY_COMPONENT',
          componentType: resolved.componentType || 'products',
          title: resolved.title,
          subtitle: resolved.subtitle,
          sessionId,
          timestamp: new Date().toISOString(),
          products: products,
          images: resolved.images || products.map((p) => ({
            name: p.name,
            title: p.title || p.name,
            imageUrl: p.imageUrl,
            description: p.description
          })),
          guideData: resolved.guideData || null,
          manualData: resolved.manualData || null
        };

        // 1. Always broadcast to the universal 'default' room so all visualizer screens update immediately
        const defaultDoId = env.SESSION_ROOM.idFromName('default');
        const defaultStub = env.SESSION_ROOM.get(defaultDoId);
        await defaultStub.fetch('http://internal/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visualPayload)
        });

        // 2. If a specific custom session ID was also provided, broadcast to it as well
        if (sessionId !== 'default') {
          const doId = env.SESSION_ROOM.idFromName(sessionId);
          const roomStub = env.SESSION_ROOM.get(doId);
          await roomStub.fetch('http://internal/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visualPayload)
          });
        }

        // Return confirmation back to Oration AI Agent
        return new Response(
          JSON.stringify({
            status: 'success',
            message: `Sent visual component (${resolved.componentType}) to the side HTML widget: ${resolved.title}`,
            componentType: resolved.componentType,
            title: resolved.title,
            displayedCount: products.length,
            displayedProducts: products.map((p) => p.name),
            displayedImages: (resolved.images || []).map((p) => ({
              name: p.name,
              link: p.imageUrl
            })),
            sessionId
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      } catch (err) {
        console.error('[ToolWebhook] Error handling product tool request:', err);
        return new Response(
          JSON.stringify({
            error: 'Failed to process product tool payload',
            message: err instanceof Error ? err.message : String(err)
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          }
        );
      }
    }

    // =========================================================================
    // 8. Fallback 404
    // =========================================================================
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Endpoint not found',
        endpoints: ['/api/tool', '/api/stream/:sessionId', '/api/ws', '/api/config', '/api/products', '/api/health']
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
};
