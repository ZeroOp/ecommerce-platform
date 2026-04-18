// services/snapshot-service/opensearch-snapshot.js
//
// Scrolls every document out of an OpenSearch index and writes it to disk as
// JSON Lines, then hands the file off to the shared MinIO uploader. Kept
// intentionally dependency-free (plain http(s)) so the snapshot service does
// not need the opensearch-java client or its transport stack.

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const OPENSEARCH_HOST = process.env.OPENSEARCH_HOST || 'opensearch-srv';
const OPENSEARCH_PORT = Number(process.env.OPENSEARCH_PORT || 9200);
const OPENSEARCH_SCHEME = process.env.OPENSEARCH_SCHEME || 'http';
const OPENSEARCH_USER = process.env.OPENSEARCH_USERNAME || '';
const OPENSEARCH_PASS = process.env.OPENSEARCH_PASSWORD || '';
const SCROLL_TTL = process.env.OPENSEARCH_SCROLL_TTL || '1m';
const SCROLL_SIZE = Number(process.env.OPENSEARCH_SCROLL_SIZE || 500);

function authHeader() {
  if (!OPENSEARCH_USER) return {};
  const token = Buffer.from(`${OPENSEARCH_USER}:${OPENSEARCH_PASS}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

function httpJson(method, pathAndQuery, body) {
  return new Promise((resolve, reject) => {
    const lib = OPENSEARCH_SCHEME === 'https' ? https : http;
    const payload = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = lib.request(
      {
        method,
        hostname: OPENSEARCH_HOST,
        port: OPENSEARCH_PORT,
        path: pathAndQuery,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': payload.length } : {}),
          ...authHeader(),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(raw ? JSON.parse(raw) : {});
            } catch (err) {
              reject(new Error(`OpenSearch non-JSON response: ${raw.slice(0, 200)}`));
            }
            return;
          }
          reject(new Error(`OpenSearch ${method} ${pathAndQuery} -> HTTP ${res.statusCode}: ${raw.slice(0, 200)}`));
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function indexExists(index) {
  try {
    // HEAD through a GET + ignore 404
    await httpJson('GET', `/${encodeURIComponent(index)}`);
    return true;
  } catch (err) {
    if (/HTTP 404/.test(err.message)) return false;
    throw err;
  }
}

async function dumpIndexToFile(index, outPath) {
  if (!(await indexExists(index))) {
    console.log(`[opensearch-snapshot] index '${index}' missing — skipping`);
    return { wrote: 0, skipped: true };
  }

  let scrollResp = await httpJson(
    'POST',
    `/${encodeURIComponent(index)}/_search?scroll=${encodeURIComponent(SCROLL_TTL)}`,
    { size: SCROLL_SIZE, query: { match_all: {} } }
  );

  const stream = fs.createWriteStream(outPath, { encoding: 'utf8' });
  stream.write(
    JSON.stringify({
      type: 'opensearch-snapshot',
      index,
      takenAt: new Date().toISOString(),
    }) + '\n'
  );

  let scrollId = scrollResp._scroll_id;
  let total = 0;

  try {
    while (scrollResp.hits && scrollResp.hits.hits && scrollResp.hits.hits.length > 0) {
      for (const hit of scrollResp.hits.hits) {
        stream.write(
          JSON.stringify({
            _id: hit._id,
            _index: hit._index,
            _source: hit._source,
          }) + '\n'
        );
        total += 1;
      }
      scrollResp = await httpJson('POST', '/_search/scroll', {
        scroll: SCROLL_TTL,
        scroll_id: scrollId,
      });
      scrollId = scrollResp._scroll_id || scrollId;
    }
  } finally {
    if (scrollId) {
      httpJson('DELETE', '/_search/scroll', { scroll_id: scrollId }).catch(() => {});
    }
    await new Promise((resolve) => stream.end(resolve));
  }
  console.log(`[opensearch-snapshot] wrote ${total} docs from ${index} to ${outPath}`);
  return { wrote: total, skipped: false };
}

async function performOpenSearchSnapshot(uploader, bucket, indexes) {
  const targets = indexes && indexes.length ? indexes : ['products'];
  for (const index of targets) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `opensearch-${index}-snapshot-${timestamp}.jsonl`;
    const filePath = path.join('/tmp', fileName);
    const objectName = `opensearch-snapshots/${index}/${fileName}`;
    try {
      const { skipped } = await dumpIndexToFile(index, filePath);
      if (skipped) continue;
      await uploader(filePath, objectName);
      console.log(`[opensearch-snapshot] uploaded ${objectName} to ${bucket}`);
    } catch (err) {
      console.error(`[opensearch-snapshot] ${index} failed:`, err.message);
      try {
        fs.unlinkSync(filePath);
      } catch (_) {
        // file may not exist
      }
    }
  }
}

module.exports = { performOpenSearchSnapshot, dumpIndexToFile };
