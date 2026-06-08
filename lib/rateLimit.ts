import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  identifier?: (req: NextRequest) => string;
}

// In-memory store for edge/serverless — swap for Redis in production
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter.
 * For production multi-instance deployments, replace `store` with an
 * upstash/redis client using UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000; // 1 minute default
  const max = options.max ?? 60; // 60 req/min default
  const getKey = options.identifier ??
    ((req: NextRequest) => {
      const forwarded = req.headers.get('x-forwarded-for');
      return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
    });

  return async function checkRateLimit(req: NextRequest): Promise<void | NextResponse> {
    const key = getKey(req);
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (entry.count >= max) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
          },
        }
      );
    }

    entry.count += 1;
    return;
  };
}

/** Strict rate limit — auth endpoints: 10 requests per 15 minutes */
export const authRateLimit = rateLimit({ windowMs: 15 * 60_000, max: 10 });

/** Standard API rate limit: 100 req/min */
export const apiRateLimit = rateLimit({ windowMs: 60_000, max: 100 });

/** Loose rate limit — public read endpoints: 300 req/min */
export const publicRateLimit = rateLimit({ windowMs: 60_000, max: 300 });
