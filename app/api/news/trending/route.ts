import { listNews } from "@/lib/news";
export async function GET() { const items = (await listNews()).slice(0, 5); return Response.json({ items, updatedAt: new Date().toISOString() }); }
