/**
 * Comprehensive Node Server Input Test Suite
 * Tests all input formats, parameter types, aliases, and embedding patterns for /api/tool
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper: Make HTTP Request
function sendRequest({ method = 'POST', path = '/api/tool', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

const tests = [
  {
    id: 'TC-01',
    name: 'Standard Single Product String',
    description: 'LLM outputs a single product string in body.product',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { product: 'chimney 1' }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 1 &&
        res.body.displayedImages[0].name === 'Chimney 1';
    }
  },
  {
    id: 'TC-02',
    name: 'Multiple Products Array (Comparison)',
    description: 'LLM outputs an array of strings in body.products',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { products: ['dishwasher 1', 'dishwasher 2'] }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 2 &&
        res.body.displayedImages.some(p => p.name === 'Dishwasher 1') &&
        res.body.displayedImages.some(p => p.name === 'Dishwasher 2');
    }
  },
  {
    id: 'TC-03',
    name: 'Oration Stringified JSON Array (body.product_enums)',
    description: 'Oration template strings the array as: "[\"chimney 1\", \"chimney 2\"]"',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { product_enums: '["chimney 1", "chimney 2"]' }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 2 &&
        res.body.displayedImages[0].name === 'Chimney 1' &&
        res.body.displayedImages[1].name === 'Chimney 2';
    }
  },
  {
    id: 'TC-04',
    name: 'Comma-Separated String in Single Key',
    description: 'LLM outputs a comma-delimited string: "dishwasher 1, chimney 2"',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { product: 'dishwasher 1, chimney 2' }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 2;
    }
  },
  {
    id: 'TC-05',
    name: 'Model Name / Alias Resolution (FBID & Curved Glass)',
    description: 'User says model codes like "FBID" or descriptive names like "curved glass"',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { products: ['FBID', 'curved glass'] }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.some(p => p.name === 'Dishwasher 1') &&
        res.body.displayedImages.some(p => p.name === 'Chimney 1');
    }
  },
  {
    id: 'TC-06',
    name: 'Direct Raw Image URL Passthrough',
    description: 'Tool sends a direct CDN image link via body.imageUrl',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: {
        title: 'Custom Faber Spotlight',
        imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100'
      }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 1 &&
        res.body.displayedImages[0].link.includes('IMG_4526-2.jpg');
    }
  },
  {
    id: 'TC-07',
    name: 'Session ID in URL Query Parameter',
    description: 'Oration sends sessionId in query string: ?sessionId=sess_query_test',
    request: {
      method: 'POST',
      path: '/api/tool?sessionId=sess_query_test',
      body: { product: 'chimney 2' }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages[0].name === 'Chimney 2';
    }
  },
  {
    id: 'TC-08',
    name: 'Session ID in JSON Request Body',
    description: 'Oration sends sessionId inside the POST JSON body',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: {
        sessionId: 'sess_body_test',
        product: 'dishwasher 2'
      }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages[0].name === 'Dishwasher 2';
    }
  },
  {
    id: 'TC-09',
    name: 'GET Query Parameter Request',
    description: 'Triggering tool via simple browser GET: /api/tool?product=chimney1',
    request: {
      method: 'GET',
      path: '/api/tool?product=chimney1&sessionId=sess_get_test'
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages[0].name === 'Chimney 1';
    }
  },
  {
    id: 'TC-10',
    name: 'Mixed Valid & Invalid Items (Partial Match Filter)',
    description: 'Array contains valid appliances alongside unknown words like "microwave"',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { products: ['chimney 1', 'microwave', 'toaster', 'dishwasher 1'] }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 2 &&
        res.body.displayedImages.some(p => p.name === 'Chimney 1') &&
        res.body.displayedImages.some(p => p.name === 'Dishwasher 1');
    }
  },
  {
    id: 'TC-11',
    name: 'Empty Body / Fallback to Full Catalog',
    description: 'Request has empty body {} -> Safely shows all 4 demo appliances',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: {}
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 4;
    }
  },
  {
    id: 'TC-12',
    name: 'All 4 Products Sequence Query',
    description: 'Request sends all 4 appliances in random order',
    request: {
      method: 'POST',
      path: '/api/tool',
      body: { products: ['dishwasher 2', 'chimney 1', 'dishwasher 1', 'chimney 2'] }
    },
    validate: (res) => {
      return res.status === 200 &&
        res.body.displayedImages.length === 4;
    }
  }
];

async function runTestSuite() {
  console.log('================================================================');
  console.log('       FABER NODE.JS SERVER - COMPREHENSIVE INPUT TEST SUITE    ');
  console.log(`       Target Endpoint: http://localhost:${PORT}/api/tool       `);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const t of tests) {
    try {
      const res = await sendRequest(t.request);
      const isOk = t.validate(res);

      if (isOk) {
        passed++;
        console.log(`✅ [PASS] ${t.id}: ${t.name}`);
        results.push({ id: t.id, name: t.name, status: 'PASS', details: res.body });
      } else {
        failed++;
        console.log(`❌ [FAIL] ${t.id}: ${t.name}`);
        console.log('   Response:', res.body);
        results.push({ id: t.id, name: t.name, status: 'FAIL', error: res.body });
      }
    } catch (err) {
      failed++;
      console.log(`💥 [ERROR] ${t.id}: ${t.name} -> ${err.message}`);
      results.push({ id: t.id, name: t.name, status: 'ERROR', error: err.message });
    }
  }

  console.log('\n================================================================');
  console.log(` Total Tests: ${tests.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
