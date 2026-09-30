import { requireAdmin } from "@/lib/admin-auth";
import { publishNews } from "@/lib/news";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const denied = requireAdmin(request); if (denied) return denied; const { id } = await context.params; const item = await publishNews(id); return item ? Response.json(item) : Response.json({ error: "News story not found" }, { status: 404 }); }
