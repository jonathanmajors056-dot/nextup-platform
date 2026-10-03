import { requireAdmin } from "@/lib/admin-auth";
import { archiveNews } from "@/lib/news";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordNewsAudit } from "@/lib/audit";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const denied = requireAdmin(request); if (denied) return denied; const limited = await enforceRateLimit(request, "adminSync", "news-archive", true); if (limited) return limited; const { id } = await context.params; const item = await archiveNews(id); if (item) await recordNewsAudit({ newsId: id, action: "archive" }); return item ? Response.json(item) : Response.json({ error: "News story not found" }, { status: 404 }); }
