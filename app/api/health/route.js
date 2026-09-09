import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
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
      mongodb: { status: 'unknown' },
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

  // ── 1. Check MongoDB ─────────────────────────────────────────────────────────
  try {
    const mongoStart = Date.now();
    await connectDB();
    const state = mongoose.connection.readyState;
    const isConnected = state === 1;

    checks.services.mongodb = {
      status: isConnected ? 'healthy' : 'degraded',
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown',
      latencyMs: Date.now() - mongoStart,
    };

    if (!isConnected) {
      checks.status = 'degraded';
    }
  } catch (err) {
    checks.status = 'degraded';
    checks.services.mongodb = {
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
