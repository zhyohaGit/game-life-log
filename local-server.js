const http = require('http');
const https = require('https');
const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4188);
const HOST = '127.0.0.1';
const MAX_BODY = 30 * 1024 * 1024;

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

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'GameLifeLog/1.0 (+https://github.com/zhyohaGit/game-life-log)'
      }
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
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
  const { createdAt, updatedAt, ...rest } = record || {};
  return rest;
}

function buildCanonicalMap(seed) {
  const map = {};
  seed.forEach((game) => {
    if (game.steamAppId) map[`steam:${game.steamAppId}`] = game;
    if (game.title) map[`title:${game.title}`] = game;
  });
  return map;
}

function hardcodedCanonicalMap() {
  return buildCanonicalMap([
    {
      steamAppId: '2852190',
      title: '怪物猎人物语3：命运双龙',
      cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2852190/de3717096a093d7bf9ab504563621bc17e37ccf4/header.jpg?t=1778720498'
    },
    {
      steamAppId: '2499860',
      title: '勇者斗恶龙7 重制版',
      cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2499860/ea0c655407c078a8994b7e91256c79d90169133a/header.jpg?t=1772804835'
    }
  ]);
}

async function loadCanonicalMap() {
  const map = hardcodedCanonicalMap();
  try {
    const current = JSON.parse(await fs.readFile(path.join(ROOT, 'data.json'), 'utf8'));
    if (Array.isArray(current)) {
      Object.assign(map, buildCanonicalMap(current));
    }
  } catch {}
  return map;
}

function mergeCanonicalMetadata(record, canonicalMap) {
  const game = cleanRecord(record);
  const canonical = (game.steamAppId && canonicalMap[`steam:${game.steamAppId}`]) || canonicalMap[`title:${game.title}`];
  if (!canonical) return game;

  const shouldUseCanonicalTitle =
    !game.title ||
    game.title === 'DQ7' ||
    game.title === '怪物猎人物语3 命运双龙';

  return {
    ...game,
    title: shouldUseCanonicalTitle ? canonical.title : game.title,
    cover: game.cover || canonical.cover || '',
    tags: (game.tags && game.tags.length) ? game.tags : (canonical.tags || []),
    steamAppId: game.steamAppId || canonical.steamAppId || ''
  };
}

function sanitizeYearlyPicks(value, records) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const knownIds = new Set(records.map((record) => String(record.id || '')).filter(Boolean));
  const result = {};
  for (const [year, ids] of Object.entries(value)) {
    if (!/^\d{4}$/.test(year) || !Array.isArray(ids)) continue;
    result[year] = ids
      .map((item) => String(item))
      .filter((item) => item && (knownIds.size === 0 || knownIds.has(item)))
      .slice(0, 9);
  }
  return result;
}

function toDataJs(records, yearlyPicks = {}) {
  return `const GAMES = ${JSON.stringify(records, null, 2)}\n;\n\nconst YEARLY_PICKS = ${JSON.stringify(yearlyPicks, null, 2)}\n;\n`;
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
  const yearlyPicks = sanitizeYearlyPicks(payload.yearlyPicks, records || []);
  const message = String(payload.message || 'Update game records').trim() || 'Update game records';
  const dryRun = Boolean(payload.dryRun);

  if (!Array.isArray(records)) {
    json(res, 400, { ok: false, error: 'records must be an array' });
    return;
  }

  const canonicalMap = await loadCanonicalMap();
  const mergedRecords = records.map((record) => mergeCanonicalMetadata(record, canonicalMap));

  if (dryRun) {
    json(res, 200, { ok: true, dryRun: true, count: mergedRecords.length, records: mergedRecords });
    return;
  }

  const prettyJson = JSON.stringify(mergedRecords, null, 2) + '\n';
  await fs.writeFile(path.join(ROOT, 'data.json'), prettyJson, 'utf8');
  await fs.writeFile(path.join(ROOT, 'data.js'), toDataJs(mergedRecords, yearlyPicks), 'utf8');

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
    count: mergedRecords.length,
    committed,
    push: push.stdout.trim() || push.stderr.trim() || 'pushed'
  });
}

async function searchSteamStore(query) {
  const params = new URLSearchParams({
    term: query,
    l: 'schinese',
    cc: 'cn'
  });
  const data = await fetchJson(`https://store.steampowered.com/api/storesearch/?${params.toString()}`);
  const baseItems = (data.items || [])
    .filter((item) => item.type === 'app' && item.id && item.name)
    .slice(0, 12);

  const items = await Promise.all(baseItems.map(async (item) => {
    const appId = String(item.id);
    let detail = {};
    try {
      const appDetails = await fetchJson(`https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic&l=schinese&cc=cn`);
      detail = appDetails?.[appId]?.data || {};
    } catch {}

    return {
      source: 'Steam',
      title: detail.name || item.name,
      appId,
      cover: detail.header_image || item.tiny_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
      thumbnail: item.tiny_image || detail.capsule_image || '',
      url: `https://store.steampowered.com/app/${appId}/`
    };
  }));

  return items;
}

function coverSearchQueries(query) {
  const variants = [query];
  const compact = query.replace(/\s+/g, '').toLowerCase();
  if (/^dq\s*7$/i.test(query) || compact.includes('勇者斗恶龙7') || compact.includes('勇者鬥惡龍7')) {
    variants.push('dragon quest 7');
  }
  if (compact.includes('怪物猎人物语3') || compact.includes('怪物獵人物語3') || compact.includes('命运双龙') || compact.includes('命運雙龍')) {
    variants.push('Monster Hunter Stories 3 Twisted Reflection', 'Monster Hunter Stories 3', '命运双龙');
  }
  return [...new Set(variants)];
}

async function searchCovers(req, res) {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const query = String(url.searchParams.get('q') || '').trim();
  if (!query) {
    json(res, 400, { ok: false, error: 'q is required' });
    return;
  }

  let usedQuery = query;
  let items = [];
  for (const candidateQuery of coverSearchQueries(query)) {
    usedQuery = candidateQuery;
    items = await searchSteamStore(candidateQuery);
    if (items.length) break;
  }

  json(res, 200, { ok: true, query, usedQuery, items });
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

    if (url.pathname === '/api/cover-search' && req.method === 'GET') {
      await searchCovers(req, res);
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
