/**
 * lib/redis.ts
 *
 * Single shared Upstash Redis client for the entire app.
 * Module-scope singleton — safe in Next.js serverless because the SDK
 * communicates over HTTPS (fetch), not a persistent TCP connection.
 *
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL   — from Upstash console
 *   UPSTASH_REDIS_REST_TOKEN — from Upstash console
 */
import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    "[redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not set. " +
    "Cache and rate-limiting will be DISABLED. Set these env vars before the event."
  );
}

// Redis client — gracefully returns null if env vars are missing so the
// app doesn't crash in local dev without Upstash configured.
export const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// TTLs — easy to tune without touching logic
export const TTL = {
  LEADERBOARD: parseInt(process.env.CACHE_TTL_LEADERBOARD ?? "10"),  // seconds
  DASHBOARD_SHARED: parseInt(process.env.CACHE_TTL_DASHBOARD ?? "15"), // seconds
} as const;

// Cache keys
export const CK = {
  leaderboard: "v1:leaderboard",
  dashboardAgents: "v1:dashboard:agents",
  dashboardFeed: "v1:dashboard:feed",
} as const;
