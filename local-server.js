const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4188);
const HOST = '127.0.0.1';
const MAX_BODY = 8 * 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.ps1': 'text/plain; charset=utf-8'
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': `http://${HOST}:${PORT}`,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function json(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2));
}

function runGit(args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: ROOT, windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function cleanRecord(record) {
  const { id, createdAt, updatedAt, ...rest } = record || {};
  return rest;
}

function toDataJs(records) {
  return `const GAMES = ${JSON.stringify(records.map(cleanRecord), null, 2)}\n;\n`;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function publishRecords(req, res) {
  const raw = await readBody(req);
  const payload = JSON.parse(raw || '{}');
  const records = payload.records;
  const message = String(payload.message || 'Update game records').trim() || 'Update game records';
  const dryRun = Boolean(payload.dryRun);

  if (!Array.isArray(records)) {
    json(res, 400, { ok: false, error: 'records must be an array' });
    return;
  }

  if (dryRun) {
    json(res, 200, { ok: true, dryRun: true, count: records.length });
    return;
  }

  const prettyJson = JSON.stringify(records.map(cleanRecord), null, 2) + '\n';
  await fs.writeFile(path.join(ROOT, 'data.json'), prettyJson, 'utf8');
  await fs.writeFile(path.join(ROOT, 'data.js'), toDataJs(records), 'utf8');

  await runGit(['add', '--', 'data.json', 'data.js']);
  let committed = false;
  try {
    await runGit(['diff', '--cached', '--quiet']);
  } catch {
    await runGit(['commit', '-m', message]);
    committed = true;
  }

  const push = await runGit(['push', 'origin', 'HEAD:master']);
  json(res, 200, {
    ok: true,
    count: records.length,
    committed,
    push: push.stdout.trim() || push.stderr.trim() || 'pushed'
  });
}

async function serveFile(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const target = path.resolve(ROOT, '.' + pathname);

  if (!target.startsWith(ROOT)) {
    send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
    return;
  }

  try {
    const data = await fs.readFile(target);
    send(res, 200, data, MIME[path.extname(target).toLowerCase()] || 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      send(res, 204, '');
      return;
    }

    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    if (url.pathname === '/api/status') {
      json(res, 200, { ok: true, localPublish: true, root: ROOT });
      return;
    }

    if (url.pathname === '/api/publish' && req.method === 'POST') {
      await publishRecords(req, res);
      return;
    }

    if (req.method === 'GET') {
      await serveFile(req, res);
      return;
    }

    json(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (error) {
    json(res, 500, {
      ok: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Game Life Log local editor: http://${HOST}:${PORT}/`);
  console.log('Keep this window open while editing and publishing.');
});
