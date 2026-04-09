// PURPOSE: Lightweight in-memory rate limiting for auth-sensitive flows.

interface RateLimitState {
  count: number;
  resetAt: number;
  blockedUntil: number;
}

const buckets = new Map<string, RateLimitState>();

export function consumeRateLimit(
  key: string,
  opts: { max: number; windowMs: number; blockMs: number }
) {
  const now = Date.now();
  const current = buckets.get(key);

  if (current?.blockedUntil && current.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterMs: current.blockedUntil - now,
    };
  }

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + opts.windowMs,
      blockedUntil: 0,
    });
    return { allowed: true, retryAfterMs: 0 };
  }

  current.count += 1;
  if (current.count > opts.max) {
    current.blockedUntil = now + opts.blockMs;
    return {
      allowed: false,
      retryAfterMs: current.blockedUntil - now,
    };
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
