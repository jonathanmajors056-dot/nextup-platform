import { getNews, saveNews } from "@/lib/news";
import { attachViewerCookie, viewerIdFromRequest } from "@/lib/identity";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; if (!await getNews(id)) return Response.json({ error: "News story not found" }, { status: 404 }); const viewerId = viewerIdFromRequest(request); const response = Response.json({ saved: true }); await saveNews(viewerId, id); return attachViewerCookie(response, viewerId, request); }
