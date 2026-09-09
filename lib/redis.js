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

  const redisUrl = process.env.REDIS_URL || 
    (process.env.REDIS_HOST ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}` : null);

  if (!redisUrl) {
    return null; // Redis not configured — fall back gracefully
  }

  isConnecting = true;
  try {
    client = createClient({ url: redisUrl });

    client.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    client.on('connect', () => {
      logger.info('Redis connected');
    });

    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 2000)),
    ]);
    isConnecting = false;
    return client;
  } catch (err) {
    isConnecting = false;
    logger.warn('Redis unavailable, using memory fallback:', { error: err.message });
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
