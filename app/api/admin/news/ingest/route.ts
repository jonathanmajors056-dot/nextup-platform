import { requireAdmin } from "@/lib/admin-auth";
import { createNewsDraft } from "@/lib/news";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { NewsCandidate } from "@/lib/news-types";
export async function POST(request: Request) { const denied = requireAdmin(request); if (denied) return denied; const limited = await enforceRateLimit(request, "adminSync", "news-ingest", true); if (limited) return limited; const body = await request.json() as Partial<NewsCandidate>; if (!body.headline || !body.publisher || !body.canonicalUrl) return Response.json({ error: "headline, publisher, and canonicalUrl are required" }, { status: 400 }); const result = await createNewsDraft({ ...body, providerId: body.providerId ?? "manual-news" } as NewsCandidate); return Response.json(result, { status: result.duplicate ? 200 : 201 }); }
