// Simple local harness to run Netlify-style functions for dev/testing.
// Usage: node dev-functions-server.cjs

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const FUNCTIONS_DIR = path.join(__dirname, 'netlify', 'functions');
const PORT = process.env.PORT || 8888;

function toNetlifyEvent(req, body) {
  const parsed = url.parse(req.url, true);
  return {
    body: body || null,
    headers: req.headers,
    httpMethod: req.method,
    queryStringParameters: parsed.query || {},
    path: parsed.pathname
  };
}

function sendResponse(res, lambdaRes) {
  res.writeHead(lambdaRes.statusCode || 200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(typeof lambdaRes.body === 'string' ? lambdaRes.body : JSON.stringify(lambdaRes.body));
}

// Load functions
const functions = {};
if (fs.existsSync(FUNCTIONS_DIR)) {
  const files = fs.readdirSync(FUNCTIONS_DIR).filter(f => f.endsWith('.cjs'));
  for (const file of files) {
    try {
      const mod = require(path.join(FUNCTIONS_DIR, file));
      const name = path.basename(file, '.cjs');
      functions[name] = mod.handler || mod;
      console.log('Loaded function', name);
    } catch (err) {
      console.error('Error loading function', file, err);
    }
  }
} else {
  console.warn('Functions directory not found:', FUNCTIONS_DIR);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsed = url.parse(req.url);
  const match = parsed.pathname.match(/^\/\.netlify\/functions\/(.+)$/);
  if (!match) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  const name = match[1];
  const fn = functions[name];
  if (!fn) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Function not found' }));
  }

  let bodyChunks = [];
  req.on('data', chunk => bodyChunks.push(chunk));
  req.on('end', async () => {
    const body = bodyChunks.length ? Buffer.concat(bodyChunks).toString() : null;
    const event = toNetlifyEvent(req, body);
    try {
      const result = await fn(event, {});
      if (result && typeof result === 'object' && 'statusCode' in result) {
        sendResponse(res, result);
      } else {
        // allow returning raw body
        sendResponse(res, { statusCode: 200, body: result });
      }
    } catch (err) {
      console.error('Function error', name, err.stack || err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Dev functions server listening on http://0.0.0.0:${PORT}`);
});

module.exports = server;
