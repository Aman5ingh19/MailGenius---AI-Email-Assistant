import { getRedisClient } from '@/lib/redis';
import logger from '@/lib/logger';

// ─── In-memory fallback (when Redis not configured) ──────────────────────────
const memoryStore = new Map(); // { key: { count, resetAt } }

function memoryRateLimit(key, limit, windowSecs) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSecs * 1000 });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowSecs * 1000 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// ─── Redis-backed sliding window rate limiter ──────────────────────────────────
/**
 * Rate limit using a Redis sorted set (sliding window algorithm).
 * Falls back to in-memory if Redis is unavailable.
 *
 * @param {string} identifier - Unique key (e.g. userId, IP)
 * @param {object} opts
 * @param {number} opts.limit - Max requests allowed in the window
 * @param {number} opts.windowSecs - Window size in seconds
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, retryAfterMs: number }}
 */
export async function rateLimit(identifier, { limit = 20, windowSecs = 60 } = {}) {
  const key = `rl:${identifier}`;
  const redis = await getRedisClient();

  // ── Fallback to in-memory ──────────────────────────────────────────────────
  if (!redis) {
    const result = memoryRateLimit(key, limit, windowSecs);
    if (!result.allowed) {
      logger.warn('Rate limit exceeded (memory)', { identifier, limit });
    }
    return {
      ...result,
      retryAfterMs: result.allowed ? 0 : result.resetAt - Date.now(),
    };
  }

  // ── Redis sliding window ───────────────────────────────────────────────────
  const now = Date.now();
  const windowStart = now - windowSecs * 1000;

  try {
    const pipeline = redis.multi();
    // Remove expired entries from the sorted set
    pipeline.zRemRangeByScore(key, '-inf', windowStart);
    // Add current request with score = timestamp
    pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
    // Count requests in window
    pipeline.zCard(key);
    // Set expiry on the key
    pipeline.expire(key, windowSecs);

    const results = await pipeline.exec();
    const count = results[2]; // zCard result

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);
    const resetAt = now + windowSecs * 1000;

    if (!allowed) {
      logger.warn('Rate limit exceeded (Redis)', { identifier, count, limit });
    }

    return {
      allowed,
      remaining,
      resetAt,
      retryAfterMs: allowed ? 0 : windowSecs * 1000,
    };
  } catch (err) {
    logger.error('Redis rate limit error — falling back to allow', { error: err.message });
    // On Redis error, allow the request to avoid blocking users
    return { allowed: true, remaining: limit, resetAt: now + windowSecs * 1000, retryAfterMs: 0 };
  }
}

// ─── Express-style response headers helper ─────────────────────────────────────
export function rateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    ...(result.retryAfterMs > 0 ? { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) } : {}),
  };
}
