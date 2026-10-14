/**
 * ============================================================================
 * FABER INTERNAL PRODUCT VISUALIZER - NODE.JS EXPRESS SERVER (PURE JAVASCRIPT)
 * ============================================================================
 *
 * WHAT THIS BACKEND DOES:
 * 1. Webhook Tool Handler (`/api/tool` & `/api/oration/product-tool`):
 *    - Receives tool calls triggered by the Oration AI voice/chat agent.
 *    - Extracts product mentions (e.g. "chimney 1", "curved glass", "compare dishwashers").
 *    - Resolves and normalizes the input strictly to the 4 authorized demo appliances.
 *    - Pushes the image links immediately to the user's side HTML widget via Server-Sent Events (SSE).
 *
 * 2. Real-Time Streaming Channel (`/api/stream/:sessionId`):
 *    - Browser clients subscribe to this endpoint using `new EventSource(...)`.
 *    - Keeps an open, lightweight HTTP connection to stream product updates instantly (sub-10ms).
 *    - Sends periodic keepalive comments to prevent firewall/proxy timeouts.
 *
 * 3. Environment & Key Management (`/api/config`):
 *    - Reads `ORATION_PUBLIC_KEY` and `ORATION_AGENT_ID` from `.dev.vars` or `.env`.
 *    - Serves them to the frontend on request so the HTML frontend NEVER has to expose or hardcode keys.
 *
 * 4. Catalog Endpoint (`/api/products`):
 *    - Serves the 4 authorized Faber demo products with high-resolution image links.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ----------------------------------------------------------------------------
// MIDDLEWARE CONFIGURATION
// ----------------------------------------------------------------------------
// 1. Enable CORS for all origins so independent frontends can connect across ports/hosts
app.use(cors());

// 2. Parse incoming JSON request bodies (e.g. { "products": ["chimney 1"] })
app.use(express.json());

// 3. Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------------------------------
// 1. ENVIRONMENT VARIABLE LOADER
// Loads keys from .dev.vars or .env into process.env.
// Checks both tool-backend directory and root directory.
// ----------------------------------------------------------------------------
function loadEnv() {
  ['.dev.vars', '.env'].forEach((filename) => {
    const possiblePaths = [
      path.join(__dirname, filename),
      path.join(__dirname, '..', filename)
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        try {
          const lines = fs.readFileSync(filePath, 'utf8').split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
              const key = trimmed.substring(0, eqIdx).trim();
              let val = trimmed.substring(eqIdx + 1).trim();

              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.substring(1, val.length - 1);
              }

              // Set in process.env
              if (val && !val.startsWith('pk_your_') && !val.startsWith('ag_your_')) {
                process.env[key] = val;
              } else if (!process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        } catch (e) {
          console.warn(`[Config] Could not read ${filePath}:`, e);
        }
      }
    }
  });
}
loadEnv();

// Serve frontend page if available locally
const staticCandidate = [
  path.join(__dirname, '..', 'frontend-page'),
  path.join(__dirname, '..', 'frontend-app'),
  path.join(__dirname, 'public')
].find((dir) => fs.existsSync(dir));

if (staticCandidate) {
  app.use(express.static(staticCandidate));
}

// ----------------------------------------------------------------------------
// 2. AUTHORIZED DEMO PRODUCTS (Strict Scope: Exactly 4 demo appliances)
// ----------------------------------------------------------------------------
const DEMO_PRODUCTS = {
  // Demo Product 1: Wall-Mounted Curved Glass Chimney
  chimney1: {
    id: 'chimney1',
    name: 'Chimney 1',
    title: 'Faber Curved Glass Auto-Clean Chimney',
    imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100'
  },
  // Demo Product 2: Vertical Angular Filterless Chimney
  chimney2: {
    id: 'chimney2',
    name: 'Chimney 2',
    title: 'Faber Angular Filterless Luxury Chimney',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A2322.jpg?v=1718706990&width=1500'
  },
  // Demo Product 3: Integrated Built-in Dishwasher
  dishwasher1: {
    id: 'dishwasher1',
    name: 'Dishwasher 1',
    title: 'Faber FBID 8PR 14S Dishwasher',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000'
  },
  // Demo Product 4: Freestanding Stainless Steel Dishwasher
  dishwasher2: {
    id: 'dishwasher2',
    name: 'Dishwasher 2',
    title: 'Faber FSID 8PR 14S Dishwasher',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500'
  }
};

/**
 * Fuzzy Product Resolver
 * Normalizes any text or model alias into one of the 4 demo products.
 *
 * @param {string} val - Raw input string (e.g. "chimney 1", "FBID", "curved")
 * @returns {Object|null} Matching demo product object or null
 */
function resolveProduct(val) {
  if (!val) return null;
  // Convert to lowercase and strip all punctuation and whitespace
  const str = String(val).toLowerCase().replace(/[^a-z0-9]/g, '');

  if (str.includes('chimney1') || str.includes('curved') || str.includes('zenith')) {
    return DEMO_PRODUCTS.chimney1;
  }
  if (str.includes('chimney2') || str.includes('angular') || str.includes('crest')) {
    return DEMO_PRODUCTS.chimney2;
  }
  if (str.includes('dishwasher1') || str.includes('fbid')) {
    return DEMO_PRODUCTS.dishwasher1;
  }
  if (str.includes('dishwasher2') || str.includes('fsid')) {
    return DEMO_PRODUCTS.dishwasher2;
  }
  return null;
}

// ----------------------------------------------------------------------------
// 3. REAL-TIME STREAMING CONNECTIONS (Server-Sent Events)
// Maps sessionId -> Express response stream
// ----------------------------------------------------------------------------
const activeClients = new Map();

/**
 * GET /api/stream/:sessionId
 * Subscribed by frontend index.html via EventSource to receive image links live.
 */
app.get('/api/stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  // Set HTTP headers required for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Register client connection under its sessionId
  activeClients.set(sessionId, res);
  console.log(`[SSE Connected] Session: ${sessionId}`);

  // Send periodic keepalive ping every 25 seconds to keep connection open through firewalls
  const ping = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  // Clean up when client closes browser tab or navigates away
  req.on('close', () => {
    clearInterval(ping);
    activeClients.delete(sessionId);
    console.log(`[SSE Disconnected] Session: ${sessionId}`);
  });
});

/**
 * Core Tool Request Handler
 * Handles both POST and GET tool calls from Oration AI or test buttons.
 *
 * Flow:
 * 1. Extracts sessionId (from query string or body).
 * 2. Parses inputs (direct imageUrl, array of products, comma string, or aliases).
 * 3. Resolves to the 4 demo appliances.
 * 4. Pushes image links to the connected browser session via SSE.
 * 5. Returns a confirmation JSON response to the caller.
 */
function handleToolCall(req, res) {
  // Extract session ID
  const sessionId = req.query.sessionId || req.body.sessionId || 'default';
  const body = req.body || {};

  console.log(`[Tool Hit] Session: ${sessionId}`, body);

  let itemsToDisplay = [];

  // Case 1: Direct raw image URL provided in body
  if (body.imageUrl || body.link) {
    const directUrl = body.imageUrl || body.link;
    itemsToDisplay.push({
      name: body.product || body.title || 'Product Image',
      title: body.title || 'Appliance Display',
      imageUrl: directUrl
    });
  }

  // Case 2: Array or string of products / product_enums / aliases
  let list = body.products || body.product_enums || body.product || body.product_name || req.query.product;

  if (typeof list === 'string') {
    try {
      // Handle stringified JSON array: '["chimney 1", "chimney 2"]'
      const parsed = JSON.parse(list);
      if (Array.isArray(parsed)) list = parsed;
      else list = [list];
    } catch {
      // Handle comma-separated string: "dishwasher 1, chimney 2"
      list = list.includes(',') ? list.split(',').map((s) => s.trim()) : [list];
    }
  }

  if (Array.isArray(list)) {
    for (const item of list) {
      const matched = resolveProduct(item);
      // Deduplicate items
      if (matched && !itemsToDisplay.some((p) => p.id === matched.id)) {
        itemsToDisplay.push(matched);
      }
    }
  }

  // Fallback: If empty, show all 4 demo appliances safely
  if (itemsToDisplay.length === 0) {
    itemsToDisplay = Object.values(DEMO_PRODUCTS);
  }

  // Visual payload formatted for the side HTML widget
  const widgetPayload = {
    action: 'DISPLAY_IMAGES',
    timestamp: new Date().toISOString(),
    images: itemsToDisplay.map((p) => ({
      name: p.name,
      title: p.title,
      imageUrl: p.imageUrl
    })),
    products: itemsToDisplay.map((p) => ({
      name: p.name,
      title: p.title,
      imageUrl: p.imageUrl
    }))
  };

  // SEND IMAGE LINKS TO THE SIDE HTML WIDGET VIA SSE
  const clientRes = activeClients.get(sessionId);
  if (clientRes) {
    clientRes.write(`data: ${JSON.stringify(widgetPayload)}\n\n`);
  }

  // Also broadcast to other connected sessions as fallback
  activeClients.forEach((stream, id) => {
    if (id !== sessionId) {
      stream.write(`data: ${JSON.stringify(widgetPayload)}\n\n`);
    }
  });

  // Return success response to the Oration Agent
  return res.status(200).json({
    status: 'success',
    message: `Sent ${itemsToDisplay.length} image link(s) to the side HTML widget.`,
    displayedImages: itemsToDisplay.map((p) => ({
      name: p.name,
      link: p.imageUrl
    })),
    products: itemsToDisplay.map((p) => ({
      name: p.name,
      imageUrl: p.imageUrl
    }))
  });
}

// ----------------------------------------------------------------------------
// 4. API ROUTE REGISTRATION
// ----------------------------------------------------------------------------

// Tool endpoints (POST & GET for testing flexibility)
app.post('/api/tool', handleToolCall);
app.post('/api/display-product', handleToolCall);
app.post('/api/oration/product-tool', handleToolCall);
app.get('/api/tool', handleToolCall);

// Configuration endpoint: Provides keys to <oration-widget> without exposing them in HTML files
app.get('/api/config', (req, res) => {
  loadEnv();
  res.json({
    publicKey: process.env.ORATION_PUBLIC_KEY || '',
    agentId: process.env.ORATION_AGENT_ID || ''
  });
});

// Full catalog lookup endpoint
app.get('/api/products', (req, res) => {
  res.json({ products: Object.values(DEMO_PRODUCTS) });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// 5. SERVER STARTUP
// ----------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Faber Visualizer Tool Backend on http://localhost:${PORT}`);
  console.log(` Tool Endpoint: http://localhost:${PORT}/api/tool`);
  console.log(` Keys loaded from env: PublicKey=${process.env.ORATION_PUBLIC_KEY ? 'Yes' : 'No'}, AgentId=${process.env.ORATION_AGENT_ID ? 'Yes' : 'No'}`);
  console.log(`=======================================================`);
});
