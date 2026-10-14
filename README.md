# Faber Product Visualizer - Tool Backend Service

This is the standalone **Tool Backend Service** for the Faber Voice & Chat Product Visualizer.

It serves as the webhook tool endpoint that receives Oration AI tool triggers, normalizes appliance selections to the 4 demo images, and streams them in real-time via Server-Sent Events (SSE) or WebSockets to the side HTML visualizer widget.

---

## 📁 Repository Structure

```
tool-backend/
├── src/
│   ├── index.ts                # Cloudflare Worker API & Real-time router
│   ├── catalog.ts              # The 4 Faber appliances & fuzzy alias resolver
│   └── sessionRoom.ts          # Durable Object (WebSocket Hibernation & SSE streaming)
├── server.js                   # Node.js Express server for local development
├── test-suite.js               # 12 automated input test cases (100% passing)
├── package.json                # Dependencies & deployment scripts
├── wrangler.jsonc              # Cloudflare Worker configuration
└── tsconfig.json               # TypeScript compiler config
```

---

## 🧪 Local Testing & Verification

### 1. Run Node.js Server Locally
```bash
npm install
npm run dev
# Or: node server.js
```
The server starts on `http://localhost:3000`.

### 2. Run Comprehensive Automated Test Suite
```bash
npm test
# Or: node test-suite.js
```
Validates all 12 input variants (single strings, arrays, comma-delimited strings, stringified JSON arrays, direct CDN URLs, aliases, etc.).

---

## 🚢 Deployment Guide

### Step 1: Push this directory to GitHub

```bash
cd tool-backend
git add .
git commit -m "chore: manual deployment only"
git push origin main
```

---

### Step 2: Manual Deployment to Cloudflare Workers

Deploy directly from your machine whenever you are ready:

1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```
2. **Set production environment secrets** (optional for Oration keys & webhook secret):
   ```bash
   npx wrangler secret put ORATION_PUBLIC_KEY
   npx wrangler secret put ORATION_AGENT_ID
   npx wrangler secret put TOOL_WEBHOOK_SECRET
   ```
3. **Deploy**:
   ```bash
   npm run deploy
   # Or: npx wrangler deploy
   ```
Your Worker will be live at:
`https://faber-oration-visualizer.YOUR_SUBDOMAIN.workers.dev`

---

## 📡 API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/tool` | `POST` / `GET` | Main tool endpoint called by Oration Agent when an appliance is discussed. |
| `/api/oration/product-tool`| `POST` | Alternative tool endpoint alias for Oration webhook integration. |
| `/api/stream/:sessionId` | `GET` | SSE stream subscribed to by the frontend `index.html` to receive image links. |
| `/api/ws?sessionId=...` | `GET` (Upgrade) | Real-time WebSocket connection to the session Durable Object. |
| `/api/config` | `GET` | Returns `publicKey` and `agentId` from environment variables for `<oration-widget>`. |
| `/api/products` | `GET` | Returns all 4 authorized demo Faber appliances. |
| `/api/health` | `GET` | Simple health check endpoint. |

---

## 🛡️ Authorized Demo Appliances (Strict Scope)

Only the following 4 Faber products are handled:
1. **Chimney 1**: Faber Curved Glass Auto-Clean Chimney (`.../IMG_4526-2.jpg`)
2. **Chimney 2**: Faber Angular Filterless Luxury Chimney (`.../0P5A2322.jpg`)
3. **Dishwasher 1**: Faber FBID 8PR 14S Integrated Dishwasher (`.../0P5A9911.jpg`)
4. **Dishwasher 2**: Faber FSID 8PR 14S Freestanding Dishwasher (`.../WhatsApp_Image_...jpg`)
