import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { getRedisClient } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const checks = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy',
    services: {
      supabase: { status: 'unknown' },
      redis: { status: 'unknown' },
    },
    system: {
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      },
    },
  };

  // ── 1. Check Supabase ────────────────────────────────────────────────────────
  try {
    const supabaseStart = Date.now();
    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
      const latencyMs = Date.now() - supabaseStart;

      if (error && error.code !== 'PGRST116') {
        checks.services.supabase = {
          status: 'degraded',
          error: error.message,
          latencyMs,
        };
      } else {
        checks.services.supabase = {
          status: 'healthy',
          latencyMs,
        };
      }
    } else {
      checks.services.supabase = {
        status: 'unconfigured',
        note: 'Supabase credentials not yet provided in .env.local',
      };
    }
  } catch (err) {
    checks.status = 'degraded';
    checks.services.supabase = {
      status: 'unhealthy',
      error: err.message,
    };
  }

  // ── 2. Check Redis ───────────────────────────────────────────────────────────
  try {
    const redisStart = Date.now();
    const redis = await getRedisClient();
    if (redis && redis.isReady) {
      const pong = await redis.ping();
      checks.services.redis = {
        status: pong === 'PONG' ? 'healthy' : 'degraded',
        latencyMs: Date.now() - redisStart,
      };
    } else {
      checks.services.redis = {
        status: 'optional-unconfigured',
        note: 'Fallback to in-memory caching',
      };
    }
  } catch (err) {
    checks.services.redis = {
      status: 'unhealthy',
      error: err.message,
    };
  }

  checks.responseTimeMs = Date.now() - startTime;

  const httpStatus = checks.status === 'unhealthy' ? 503 : 200;
  return NextResponse.json(checks, { status: httpStatus });
}
