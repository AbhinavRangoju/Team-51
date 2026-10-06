/**
 * Fixed-window rate limiting, per client, in process memory.
 *
 * The same shape as the limiter already in src/lib/hubby/ask.ts, generalised so
 * auth can share it. Login is the endpoint that needs it most: without a limit,
 * a leaked credential list can be replayed against /login as fast as the server
 * will answer, and scrypt's cost becomes a denial-of-service lever rather than
 * a defence.
 *
 * Resets on restart and is not shared between instances. If MarketHub is ever
 * scaled past one process this has to move to Redis or a durable counter.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export type Limit = { max: number; windowMs: number };

export const LOGIN_LIMIT: Limit = { max: 10, windowMs: 10 * 60 * 1000 };
export const SIGNUP_LIMIT: Limit = { max: 5, windowMs: 60 * 60 * 1000 };
export const CHECKOUT_LIMIT: Limit = { max: 30, windowMs: 10 * 60 * 1000 };

export function rateLimited(key: string, limit: Limit): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + limit.windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > limit.max;
}

/** Called after a successful login so one good sign-in clears the penalty. */
export function resetLimit(key: string): void {
  buckets.delete(key);
}

export async function clientKey(scope: string): Promise<string> {
  const { getRequestIP } = await import("@tanstack/react-start/server");
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
  return `${scope}:${ip}`;
}
