import { requireAdmin } from "@/lib/admin-auth";
import { fetchApprovedSource } from "@/lib/fetch-source";
import { createNewsDraft, listNewsProviders } from "@/lib/news";
import { parseNewsRssFeed } from "@/lib/news-rss";

function urls(value: string | undefined) { return (value ?? "").split(",").map((item) => item.trim()).filter((item) => /^https:\/\//i.test(item)); }
export async function POST(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  const sources = urls(process.env.NEWS_RSS_URLS); const results: Array<{ url: string; added: number; duplicates: number; error?: string }> = [];
  for (const url of sources.slice(0, 20)) { try { const { body } = await fetchApprovedSource(url); const publisher = new URL(url).hostname.replace(/^www\./, ""); const candidates = parseNewsRssFeed(body, `rss:${publisher}`, publisher).slice(0, 100); let added = 0; let duplicates = 0; for (const candidate of candidates) { const result = await createNewsDraft(candidate); result.duplicate ? duplicates += 1 : added += 1; } results.push({ url, added, duplicates }); } catch (error) { results.push({ url, added: 0, duplicates: 0, error: error instanceof Error ? error.message : "Source failed" }); } }
  return Response.json({ synced: results.reduce((sum, item) => sum + item.added, 0), sources: results, configuredProviders: listNewsProviders().filter((provider) => provider.status === "configured").length });
}
