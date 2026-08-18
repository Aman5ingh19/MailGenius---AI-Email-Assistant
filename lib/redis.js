import { createClient } from 'redis';
import logger from '@/lib/logger';

// ─── Singleton Redis client ────────────────────────────────────────────────────
// Uses Upstash REST URL (free tier) or any standard Redis URL
let client = null;
let isConnecting = false;

export async function getRedisClient() {
  if (client?.isReady) return client;
  if (isConnecting) {
    // Wait briefly if another connection is in progress
    await new Promise((r) => setTimeout(r, 200));
    return client;
  }

  if (!process.env.REDIS_URL) {
    return null; // Redis not configured — fall back gracefully
  }

  isConnecting = true;
  try {
    client = createClient({ url: process.env.REDIS_URL });

    client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    client.on('connect', () => {
      logger.info('Redis connected');
    });

    await client.connect();
    isConnecting = false;
    return client;
  } catch (err) {
    isConnecting = false;
    logger.error('Failed to connect to Redis', { error: err.message });
    return null;
  }
}

// ─── Cache helpers ─────────────────────────────────────────────────────────────

/**
 * Get a cached value, or compute it and store it.
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function that returns the value
 * @param {number} ttlSeconds - Time to live in seconds (default 60s)
 */
export async function cached(key, fetchFn, ttlSeconds = 60) {
  const redis = await getRedisClient();

  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.debug('Cache hit', { key });
        return JSON.parse(cached);
      }
    } catch {}
  }

  const value = await fetchFn();

  if (redis) {
    try {
      await redis.setEx(key, ttlSeconds, JSON.stringify(value));
      logger.debug('Cache set', { key, ttlSeconds });
    } catch {}
  }

  return value;
}

/**
 * Invalidate a cache key.
 */
export async function invalidateCache(key) {
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(key);
    } catch {}
  }
}
