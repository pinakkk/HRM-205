import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/lib/env";

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;
  if (!_redis) {
    _redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

/**
 * Rate-limit factory. Returns null when Redis isn't configured (dev fallback).
 * Caller decides what to do: typically `if (!rl) return ok` in dev.
 */
export function makeRateLimit(opts: {
  prefix: string;
  limit: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
}): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.limit, opts.window),
    prefix: `rl:${opts.prefix}`,
    analytics: false,
  });
}

export const rateLimits = {
  login: () => makeRateLimit({ prefix: "login", limit: 5, window: "1 m" }),
  kudos: () => makeRateLimit({ prefix: "kudos", limit: 10, window: "1 d" }),
  allocator: () => makeRateLimit({ prefix: "allocator", limit: 3, window: "1 h" }),
  feedback: () => makeRateLimit({ prefix: "feedback", limit: 20, window: "1 d" }),
  checkIn: () => makeRateLimit({ prefix: "check-in", limit: 5, window: "1 m" }),
};

// ─── Cache helpers ─────────────────────────────────────
export const cacheKeys = {
  leaderboard: (scope: string, period: string) => `leaderboard:${scope}:${period}`,
  wallet: (userId: string) => `wallet:${userId}`,
  auditSummary: () => `audit:summary`,
  idempAllocator: (cycleId: string) => `idemp:allocator:${cycleId}`,
};

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  return (await redis.get<T>(key)) ?? null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function cacheInvalidate(...keys: string[]) {
  const redis = getRedis();
  if (!redis || keys.length === 0) return;
  await redis.del(...keys);
}
