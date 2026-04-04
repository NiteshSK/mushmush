/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests by key (IP, email, etc.) within a sliding window.
 *
 * For production at scale, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Max requests allowed in the window */
  max: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check if a request is within rate limits.
 *
 * @param key Unique identifier (e.g., `forgot-password:${email}` or `coupon:${ip}`)
 * @param options Rate limit configuration
 * @returns Whether the request is allowed
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start fresh
    store.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
    return { allowed: true, remaining: options.max - 1, retryAfterSeconds: 0 };
  }

  if (entry.count >= options.max) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count++;
  return { allowed: true, remaining: options.max - entry.count, retryAfterSeconds: 0 };
}
