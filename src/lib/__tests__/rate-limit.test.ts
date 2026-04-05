/**
 * Tests for the in-memory rate limiter.
 */

import { rateLimit } from '../rate-limit';

describe('rateLimit', () => {
  const opts = { max: 3, windowSeconds: 60 };

  it('allows the first request', () => {
    const key = `test-${Date.now()}-first`;
    const result = rateLimit(key, opts);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('allows up to max requests', () => {
    const key = `test-${Date.now()}-max`;
    expect(rateLimit(key, opts).allowed).toBe(true);  // 1
    expect(rateLimit(key, opts).allowed).toBe(true);  // 2
    expect(rateLimit(key, opts).allowed).toBe(true);  // 3
  });

  it('blocks after max requests', () => {
    const key = `test-${Date.now()}-block`;
    rateLimit(key, opts); // 1
    rateLimit(key, opts); // 2
    rateLimit(key, opts); // 3
    const result = rateLimit(key, opts); // 4 — should be blocked
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks different keys independently', () => {
    const key1 = `test-${Date.now()}-a`;
    const key2 = `test-${Date.now()}-b`;
    rateLimit(key1, opts);
    rateLimit(key1, opts);
    rateLimit(key1, opts);
    expect(rateLimit(key1, opts).allowed).toBe(false); // key1 exhausted
    expect(rateLimit(key2, opts).allowed).toBe(true);   // key2 fresh
  });

  it('remaining count decreases correctly', () => {
    const key = `test-${Date.now()}-remain`;
    expect(rateLimit(key, opts).remaining).toBe(2);
    expect(rateLimit(key, opts).remaining).toBe(1);
    expect(rateLimit(key, opts).remaining).toBe(0);
  });

  it('uses different windows independently', () => {
    const key = `test-${Date.now()}-windows`;
    // 2 requests allowed per window
    const opts2 = { max: 2, windowSeconds: 60 };
    expect(rateLimit(key, opts2).allowed).toBe(true);
    expect(rateLimit(key, opts2).allowed).toBe(true);
    expect(rateLimit(key, opts2).allowed).toBe(false);
  });
});
