/**
 * Minimal in-memory sliding-window rate limiter for Route Handlers.
 * Per-process memory is sufficient for a single Node instance; behind
 * multiple replicas use a shared store (Redis/Upstash) instead.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

function prune(now: number, bucket: Bucket, windowMs: number): void {
  while (bucket.hits.length > 0 && bucket.hits[0] <= now - windowMs) {
    bucket.hits.shift();
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): {
  allowed: boolean;
  remaining: number;
  resetAfterMs: number;
} {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  prune(now, bucket, windowMs);
  if (bucket.hits.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAfterMs: bucket.hits[0] + windowMs - now,
    };
  }
  bucket.hits.push(now);
  return {
    allowed: true,
    remaining: limit - bucket.hits.length,
    resetAfterMs: windowMs,
  };
}

export function clientKey(req: Request, route: string): string {
  const fwd = req.headers.get('x-forwarded-for');
  const ip = (fwd ? fwd.split(',')[0].trim() : null) || 'unknown';
  return `${route}:${ip}`;
}
