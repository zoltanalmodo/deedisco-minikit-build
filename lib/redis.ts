// lib/redis.ts
import { Redis } from "@upstash/redis";

let _redis: Redis | null | undefined; // undefined => not initialized yet

/** Lazy getter. Only creates the client when first asked for it. */
export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;

  const url = process.env.REDIS_URL;
  const token = process.env.REDIS_TOKEN;

  // No console.warn here to keep builds quiet
  _redis = url && token ? new Redis({ url, token }) : null;
  return _redis;
}

/** Convenience helper to check availability. */
export function hasRedis(): boolean {
  return !!(process.env.REDIS_URL && process.env.REDIS_TOKEN);
}

/**
 * Back-compat export so old code that did:
 *   import { redis } from "@/lib/redis"
 * still works. Consider switching to getRedis() in new code.
 */
export const redis = getRedis();
