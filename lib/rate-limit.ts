import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

type LimitName = "submissions" | "adminSession" | "saves" | "locations" | "adminSync";

const limits: Record<LimitName, { requests: number; window: Parameters<typeof Ratelimit.slidingWindow>[1] }> = {
  submissions: { requests: 10, window: "1 h" },
  adminSession: { requests: 5, window: "15 m" },
  saves: { requests: 60, window: "1 h" },
  locations: { requests: 30, window: "1 h" },
  adminSync: { requests: 5, window: "1 h" },
};

function configured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
}

function identity(request: Request, suffix: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown-ip";
  return `nextup:${suffix}:${ip}`;
}

export function rateLimitingConfigured() { return configured(); }

export async function enforceRateLimit(request: Request, name: LimitName, suffix?: string, protectedRoute = false) {
  if (!configured()) {
    if (protectedRoute && process.env.NODE_ENV === "production") {
      return Response.json({ error: "Rate limiting is not configured." }, { status: 503 });
    }
    return null;
  }
  try {
    const redis = Redis.fromEnv();
    const config = limits[name];
    const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(config.requests, config.window), analytics: true, prefix: `nextup:${name}` });
    const result = await limiter.limit(identity(request, suffix ?? name));
    if (result.success) return null;
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  } catch (error) {
    console.error(JSON.stringify({ event: "rate_limit_error", route: new URL(request.url).pathname, error: error instanceof Error ? error.message : "provider_error" }));
    if (protectedRoute) return Response.json({ error: "Rate limiting is temporarily unavailable." }, { status: 503 });
    return null;
  }
}
