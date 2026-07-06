/**
 * lib/rate-limit.ts
 *
 * Factory helpers that create Upstash Ratelimit instances.
 * All limits are tunable via env vars so you can tighten/loosen
 * before the event without a code deploy.
 *
 * Limits (defaults — tune via env vars):
 *   LOGIN_LIMIT:  10 requests / 60 s  per IP
 *   SUBMIT_LIMIT:  5 requests / 60 s  per team_id
 *   HINT_LIMIT:    5 requests / 60 s  per team_id
 *
 * Returns null when Redis is not configured so the app degrades
 * gracefully (no rate limiting) rather than crashing.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

function makeRatelimit(requests: number, windowSeconds: number) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    analytics: false, // keep it lightweight
  });
}

// Login: 10 attempts per IP per 60 s (prevents brute-force during the rush)
export const loginRatelimit = makeRatelimit(
  parseInt(process.env.RATE_LOGIN_MAX ?? "10"),
  parseInt(process.env.RATE_LOGIN_WINDOW_S ?? "60")
);

// Flag submission: 5 per team per 60 s
export const submitRatelimit = makeRatelimit(
  parseInt(process.env.RATE_SUBMIT_MAX ?? "5"),
  parseInt(process.env.RATE_SUBMIT_WINDOW_S ?? "60")
);

// Hint requests: 5 per team per 60 s
export const hintRatelimit = makeRatelimit(
  parseInt(process.env.RATE_HINT_MAX ?? "5"),
  parseInt(process.env.RATE_HINT_WINDOW_S ?? "60")
);

/**
 * Helper: run a rate-limit check and return a 429 Response if exceeded.
 * Returns null if the request is allowed (or if Redis is not configured).
 *
 * @param limiter  - result of makeRatelimit()
 * @param key      - discriminator string (IP address, team_id, etc.)
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<Response | null> {
  if (!limiter) return null; // Redis not configured — allow everything

  try {
    const { success, limit, remaining, reset } = await limiter.limit(key);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please wait before trying again.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }
  } catch (err) {
    console.error(`[rate-limit] Upstash Redis error for key=${key}:`, err);
    // Fail-open: allow request to proceed if Redis fails
  }

  return null; // allowed
}
