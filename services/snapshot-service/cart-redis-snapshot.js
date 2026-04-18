// services/snapshot-service/cart-redis-snapshot.js
//
// Produces a point-in-time snapshot of every cart stored in the cart Redis
// Cluster and uploads it to MinIO as a single JSON file. The snapshot walks
// all MASTER nodes with SCAN, reads each cart hash, and writes one record
// per user. The output is restore-friendly: replaying it with HSET on a
// fresh cluster recreates every cart exactly.

const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const CART_KEY_PATTERN = process.env.CART_KEY_PATTERN || 'cart:*';
const SCAN_COUNT = Number(process.env.CART_SCAN_COUNT || 200);

function parseNodes(str) {
  return (str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [host, port] = entry.split(':');
      return { host, port: parseInt(port || '6379', 10) };
    });
}

async function scanMaster(node, match, count) {
  const keys = [];
  let cursor = '0';
  do {
    const [next, batch] = await node.scan(cursor, 'MATCH', match, 'COUNT', count);
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');
  return keys;
}

/**
 * Walks all master nodes in the cart Redis Cluster and writes every cart
 * hash to disk as JSON Lines. Returns the output path.
 */
async function dumpCartClusterToFile(outPath) {
  const nodes = parseNodes(process.env.CART_REDIS_NODES);
  if (nodes.length === 0) {
    throw new Error('CART_REDIS_NODES is empty — nothing to snapshot');
  }

  const cluster = new Redis.Cluster(nodes, {
    redisOptions: {
      password: process.env.CART_REDIS_PASSWORD || undefined,
      connectTimeout: 3000,
    },
    clusterRetryStrategy: (times) => (times > 5 ? null : Math.min(100 * times, 2000)),
  });

  try {
    await new Promise((resolve, reject) => {
      cluster.once('ready', resolve);
      cluster.once('error', reject);
      setTimeout(() => reject(new Error('Timed out waiting for cart redis cluster')), 15000);
    });

    const masters = cluster.nodes('master');
    console.log(`[cart-snapshot] cluster is ready — ${masters.length} master(s)`);

    const stream = fs.createWriteStream(outPath, { encoding: 'utf8' });
    stream.write(
      JSON.stringify({
        type: 'cart-redis-snapshot',
        takenAt: new Date().toISOString(),
        masters: masters.length,
        pattern: CART_KEY_PATTERN,
      }) + '\n'
    );

    let totalKeys = 0;
    for (const master of masters) {
      const keys = await scanMaster(master, CART_KEY_PATTERN, SCAN_COUNT);
      for (const key of keys) {
        // Read the whole hash via the cluster client so it follows any
        // ASK/MOVED redirects automatically.
        const fields = await cluster.hgetall(key);
        stream.write(
          JSON.stringify({
            key,
            type: 'hash',
            fields,
          }) + '\n'
        );
        totalKeys += 1;
      }
    }

    await new Promise((resolve) => stream.end(resolve));
    console.log(`[cart-snapshot] wrote ${totalKeys} cart(s) to ${outPath}`);
    return { path: outPath, totalKeys };
  } finally {
    cluster.quit().catch(() => cluster.disconnect());
  }
}

async function performCartSnapshot(uploader, bucket) {
  if (!process.env.CART_REDIS_NODES) {
    console.log('[cart-snapshot] CART_REDIS_NODES not set — skipping');
    return;
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `cart-redis-snapshot-${timestamp}.jsonl`;
  const filePath = path.join('/tmp', fileName);
  const objectName = `redis-snapshots/cart/${fileName}`;

  try {
    await dumpCartClusterToFile(filePath);
    await uploader(filePath, objectName);
    console.log(`[cart-snapshot] uploaded ${objectName} to ${bucket}`);
  } catch (err) {
    console.error('[cart-snapshot] failed:', err);
    try {
      fs.unlinkSync(filePath);
    } catch (_) {
      // file may not exist
    }
  }
}

module.exports = { performCartSnapshot, dumpCartClusterToFile };
