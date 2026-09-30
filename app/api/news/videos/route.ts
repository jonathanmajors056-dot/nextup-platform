import { listNews } from "@/lib/news";
export async function GET() { const items = await listNews({ videoOnly: true }); return Response.json({ items, total: items.length }); }
