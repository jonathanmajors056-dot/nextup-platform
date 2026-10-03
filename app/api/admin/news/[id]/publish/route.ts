import { requireAdmin } from "@/lib/admin-auth";
import { publishNews } from "@/lib/news";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordNewsAudit } from "@/lib/audit";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const denied = requireAdmin(request); if (denied) return denied; const limited = await enforceRateLimit(request, "adminSync", "news-publish", true); if (limited) return limited; const { id } = await context.params; const item = await publishNews(id); if (item) await recordNewsAudit({ newsId: id, action: "publish" }); return item ? Response.json(item) : Response.json({ error: "News story not found" }, { status: 404 }); }
