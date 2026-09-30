import { listNews } from "@/lib/news";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const items = await listNews({ q: url.searchParams.get("q") ?? undefined, category: url.searchParams.get("category") ?? undefined, geography: url.searchParams.get("geography") ?? undefined, publisher: url.searchParams.get("publisher") ?? undefined, videoOnly: url.searchParams.get("videoOnly") === "true" });
  return Response.json({ items, total: items.length, updatedAt: new Date().toISOString() });
}
