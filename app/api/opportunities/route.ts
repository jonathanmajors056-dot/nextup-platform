import { listPublished } from "@/lib/store";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withRequestLogging } from "@/lib/logging";

export async function GET(request: Request) {
  return withRequestLogging(request, "/api/opportunities", async () => {
    const limited = await enforceRateLimit(request, { name: "opportunities-read", limit: 120, window: "1m" });
    if (limited) return limited;
    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get("limit") ?? 24);
    const page = await listPublished({ q: searchParams.get("q") ?? undefined, category: searchParams.get("category") ?? undefined, format: searchParams.get("format") ?? undefined, cursor: searchParams.get("cursor") ?? undefined, limit: Number.isFinite(rawLimit) ? rawLimit : 24 });
    return Response.json(page);
  });
}
