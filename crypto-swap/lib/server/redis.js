import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL;
let client;

async function connectRedis() {
  if (client) return client;
  if (!REDIS_URL) return null;

  client = createClient({ url: REDIS_URL });
  client.on('error', (err) => {
    // Keep the client around so we don't retry forever on bad config.
    console.error('[Redis] connection error', err.message || err);
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('[Redis] connection failed', error?.message || error);
    return null;
  }
}

export async function getRedisClient() {
  if (globalThis.__BoltSwapRedisClient) {
    return globalThis.__BoltSwapRedisClient;
  }
  const redis = await connectRedis();
  if (redis) {
    globalThis.__BoltSwapRedisClient = redis;
  }
  return redis;
}

export async function rateLimit(key, limit = 20, windowSeconds = 60) {
  const redis = await getRedisClient();
  if (!redis) return { allowed: true, count: 0, remaining: limit, resetAt: null };

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  return {
    allowed: count <= limit,
    count,
    remaining: Math.max(limit - count, 0),
    resetAt: Date.now() + windowSeconds * 1000,
  };
}

export async function enqueueJob(queue, payload) {
  const redis = await getRedisClient();
  if (!redis) return null;
  const item = JSON.stringify({ queue, payload, enqueuedAt: new Date().toISOString() });
  await redis.lPush(`queue:${queue}`, item);
  await redis.expire(`queue:${queue}`, 60 * 60 * 24);
  return payload;
}
