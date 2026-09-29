import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  name: string;
  limit: number;
  window: `${number}s` | `${number}m` | `${number}h`;
  userId?: string;
};

type Limiter = ReturnType<typeof Ratelimit.slidingWindow>;

const limiters = new Map<string, Ratelimit>();

function redisConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function requestIdentity(request: Request, userId?: string) {
  if (userId) return `user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `ip:${forwarded || realIp || "anonymous"}`;
}

function getLimiter(options: RateLimitOptions) {
  const key = `${options.name}:${options.limit}:${options.window}`;
  const existing = limiters.get(key);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(options.limit, options.window) as Limiter,
    prefix: "nextup:ratelimit",
    analytics: true,
  });
  limiters.set(key, limiter);
  return limiter;
}

export async function enforceRateLimit(request: Request, options: RateLimitOptions) {
  if (!redisConfigured()) return null;

  try {
    const result = await getLimiter(options).limit(`${options.name}:${requestIdentity(request, options.userId)}`);
    if (result.success) return null;

    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return Response.json(
      { error: "Too many requests. Please try again shortly.", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter), "X-RateLimit-Limit": String(result.limit), "X-RateLimit-Remaining": String(result.remaining) } },
    );
  } catch (error) {
    // Redis is a protection layer, not a reason to take the application down.
    // Observability can alert on this path while the request continues.
    console.error("NextUp rate limiter unavailable", error);
    return null;
  }
}
