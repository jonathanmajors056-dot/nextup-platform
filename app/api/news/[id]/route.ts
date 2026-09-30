import { getNews } from "@/lib/news";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { const { id } = await context.params; const item = await getNews(id); return item ? Response.json(item) : Response.json({ error: "News story not found" }, { status: 404 }); }
