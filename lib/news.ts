import { createHash } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoNews } from "./news-demo";
import type { NewsCandidate, NewsCategory, NewsItem, NewsProvider } from "./news-types";
import { enrichNewsCandidate } from "./news-ai";

type NewsState = { items: NewsItem[]; saved: Record<string, string[]> };
const globalStore = globalThis as typeof globalThis & { __nextUpNewsStore?: NewsState };
const state = globalStore.__nextUpNewsStore ?? { items: [...demoNews], saved: {} };
globalStore.__nextUpNewsStore = state;
const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
function supabase(): SupabaseClient | null { return hasSupabase ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } }) : null; }
function fromDb(row: Record<string, unknown>): NewsItem { return { id: String(row.id), headline: String(row.headline ?? ""), summary: String(row.summary ?? ""), publisher: String(row.publisher ?? ""), canonicalUrl: String(row.canonical_url ?? ""), sourceUrl: String(row.source_url ?? ""), sourceType: row.source_type as NewsItem["sourceType"], author: String(row.author ?? ""), publishedAt: String(row.published_at), updatedAt: row.updated_at ? String(row.updated_at) : null, imageUrl: row.image_url ? String(row.image_url) : null, videoUrl: row.video_url ? String(row.video_url) : null, category: row.category as NewsCategory, tags: (row.tags as string[]) ?? [], topics: (row.topics as string[]) ?? [], geography: row.geography as NewsItem["geography"], entities: (row.entities as string[]) ?? [], language: String(row.language ?? "en"), readingMinutes: Number(row.reading_minutes ?? 1), fingerprint: String(row.fingerprint ?? ""), verificationStatus: row.verification_status as NewsItem["verificationStatus"], status: row.status as NewsItem["status"], ingestedAt: String(row.ingested_at), freshUntil: String(row.fresh_until), isBreaking: Boolean(row.is_breaking), isSponsored: Boolean(row.is_sponsored) }; }
function toDb(item: NewsItem) { return { id: item.id.match(/^[0-9a-f-]{36}$/i) ? item.id : undefined, headline: item.headline, summary: item.summary, publisher: item.publisher, canonical_url: item.canonicalUrl, source_url: item.sourceUrl, source_type: item.sourceType, author: item.author, published_at: item.publishedAt, updated_at: item.updatedAt, image_url: item.imageUrl, video_url: item.videoUrl, category: item.category, tags: item.tags, topics: item.topics, geography: item.geography, entities: item.entities, language: item.language, reading_minutes: item.readingMinutes, fingerprint: item.fingerprint, verification_status: item.verificationStatus, status: item.status, ingested_at: item.ingestedAt, fresh_until: item.freshUntil, is_breaking: item.isBreaking, is_sponsored: item.isSponsored }; }

const providers: NewsProvider[] = [
  { id: "manual-news", name: "Manual newsroom intake", kind: "manual", regions: ["India", "Global"], status: "configured" },
  { id: "approved-news-rss", name: "Approved RSS / Atom feeds", kind: "rss", regions: ["India", "Global"], status: process.env.NEWS_RSS_URLS ? "configured" : "needs_configuration" },
  { id: "licensed-news-api", name: "Licensed news API", kind: "official_api", regions: ["India", "Global"], status: process.env.NEWS_API_URLS ? "configured" : "needs_configuration" },
  { id: "video-publisher-feed", name: "Publisher video feeds", kind: "video", regions: ["India", "Global"], status: process.env.NEWS_VIDEO_RSS_URLS ? "configured" : "needs_configuration" },
];

function normalizeUrl(value: string) {
  try { const url = new URL(value); url.hash = ""; ["utm_source", "utm_medium", "utm_campaign", "ref"].forEach((key) => url.searchParams.delete(key)); return url.toString(); } catch { return value.trim(); }
}

function fingerprint(candidate: Pick<NewsCandidate, "headline" | "publisher" | "canonicalUrl">) {
  return createHash("sha256").update(`${normalizeUrl(candidate.canonicalUrl)}|${candidate.headline.trim().toLowerCase()}|${candidate.publisher.trim().toLowerCase()}`).digest("hex");
}

function categoryFrom(candidate: NewsCandidate): NewsCategory {
  if (candidate.category) return candidate.category;
  const text = `${candidate.headline} ${candidate.summary ?? ""} ${candidate.tags?.join(" ") ?? ""}`.toLowerCase();
  if (text.includes("cyber") || text.includes("security")) return "Cybersecurity";
  if (text.includes("startup") || text.includes("funding")) return "Startups";
  if (text.includes("cloud")) return "Cloud";
  if (text.includes("hardware") || text.includes("device")) return "Hardware";
  if (text.includes("developer") || text.includes("code")) return "Developer tools";
  if (text.includes("india")) return "India tech";
  return "AI";
}

export function normalizeNewsCandidate(candidate: NewsCandidate): NewsItem {
  const publishedAt = candidate.publishedAt && !Number.isNaN(new Date(candidate.publishedAt).getTime()) ? new Date(candidate.publishedAt).toISOString() : new Date().toISOString();
  const ingestedAt = new Date().toISOString();
  return {
    id: candidate.externalId ? `${candidate.providerId}-${candidate.externalId}`.replace(/[^a-zA-Z0-9-_]/g, "-") : crypto.randomUUID(),
    headline: candidate.headline.trim(), summary: (candidate.summary ?? candidate.description ?? "Read the original story for the full report.").trim(),
    publisher: candidate.publisher.trim(), canonicalUrl: normalizeUrl(candidate.canonicalUrl), sourceUrl: normalizeUrl(candidate.sourceUrl ?? candidate.canonicalUrl), sourceType: candidate.videoUrl ? "video" : "rss", author: candidate.author ?? "",
    publishedAt, updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt).toISOString() : null, imageUrl: candidate.imageUrl ?? null, videoUrl: candidate.videoUrl ?? null,
    category: categoryFrom(candidate), tags: candidate.tags ?? [], topics: candidate.topics ?? [], geography: candidate.geography ?? "Global", entities: candidate.entities ?? [], language: candidate.language ?? "en", readingMinutes: Math.max(1, Math.ceil((candidate.summary ?? candidate.description ?? "").split(/\s+/).length / 180)), fingerprint: fingerprint(candidate), verificationStatus: "awaiting_review", status: "draft", ingestedAt, freshUntil: new Date(new Date(publishedAt).getTime() + 7 * 86400000).toISOString(), isBreaking: Boolean(candidate.isBreaking), isSponsored: Boolean(candidate.isSponsored),
  };
}

function isFresh(item: NewsItem) { return new Date(item.freshUntil).getTime() >= Date.now() && item.status === "published"; }

export async function listNews(filters: { q?: string; category?: string; geography?: string; videoOnly?: boolean; publisher?: string } = {}) {
  const client = supabase();
  if (client) {
    let query = client.from("news_items").select("*").eq("status", "published").gte("fresh_until", new Date().toISOString()).order("published_at", { ascending: false });
    if (filters.category && filters.category !== "All") query = query.eq("category", filters.category);
    if (filters.geography && filters.geography !== "All") query = query.ilike("geography", `%${filters.geography}%`);
    if (filters.publisher && filters.publisher !== "All") query = query.eq("publisher", filters.publisher);
    if (filters.videoOnly) query = query.not("video_url", "is", null);
    const { data, error } = await query; if (error) throw error;
    const items = (data ?? []).map(fromDb); const q = filters.q?.trim().toLowerCase(); return items.filter((item) => !q || [item.headline, item.summary, item.publisher, ...item.tags, ...item.topics, ...item.entities].join(" ").toLowerCase().includes(q));
  }
  const query = filters.q?.trim().toLowerCase();
  return state.items.filter((item) => isFresh(item) && (!query || [item.headline, item.summary, item.publisher, ...item.tags, ...item.topics, ...item.entities].join(" ").toLowerCase().includes(query)) && (!filters.category || filters.category === "All" || item.category === filters.category) && (!filters.geography || filters.geography === "All" || item.geography.includes(filters.geography)) && (!filters.publisher || filters.publisher === "All" || item.publisher === filters.publisher) && (!filters.videoOnly || Boolean(item.videoUrl))).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getNews(id: string) { const client = supabase(); if (client) { const { data, error } = await client.from("news_items").select("*").eq("id", id).maybeSingle(); if (error) throw error; return data ? fromDb(data) : null; } return state.items.find((item) => item.id === id && item.status !== "archived") ?? null; }
export async function listSavedNews(viewerId: string) { const client = supabase(); if (client) { const { data, error } = await client.from("saved_news").select("news_id").eq("user_id", viewerId); if (error) throw error; return (data ?? []).map((row) => String(row.news_id)); } return state.saved[viewerId] ?? []; }
export async function saveNews(viewerId: string, id: string) { const client = supabase(); if (client) { const { error } = await client.from("saved_news").upsert({ user_id: viewerId, news_id: id }); if (error) throw error; return true; } state.saved[viewerId] = Array.from(new Set([...(state.saved[viewerId] ?? []), id])); return true; }
export async function createNewsDraft(candidate: NewsCandidate) { const enriched = await enrichNewsCandidate(candidate); const item = normalizeNewsCandidate(enriched); const client = supabase(); if (client) { const duplicate = await client.from("news_items").select("*").or(`canonical_url.eq.${item.canonicalUrl},fingerprint.eq.${item.fingerprint}`).maybeSingle(); if (duplicate.error) throw duplicate.error; if (duplicate.data) return { item: fromDb(duplicate.data), duplicate: true }; const { data, error } = await client.from("news_items").insert(toDb(item)).select("*").single(); if (error) throw error; return { item: fromDb(data), duplicate: false }; } const duplicate = state.items.find((existing) => existing.fingerprint === item.fingerprint || existing.canonicalUrl === item.canonicalUrl); if (duplicate) return { item: duplicate, duplicate: true }; state.items.unshift(item); return { item, duplicate: false }; }
export async function publishNews(id: string) { const client = supabase(); if (client) { const { data, error } = await client.from("news_items").update({ status: "published", verification_status: "officially_verified" }).eq("id", id).select("*").maybeSingle(); if (error) throw error; return data ? fromDb(data) : null; } const item = await getNews(id); if (!item) return null; item.status = "published"; item.verificationStatus = "officially_verified"; return item; }
export async function archiveNews(id: string) { const client = supabase(); if (client) { const { data, error } = await client.from("news_items").update({ status: "archived", verification_status: "expired" }).eq("id", id).select("*").maybeSingle(); if (error) throw error; return data ? fromDb(data) : null; } const item = await getNews(id); if (!item) return null; item.status = "archived"; item.verificationStatus = "expired"; return item; }
export async function listNewsReview() { const client = supabase(); if (client) { const { data, error } = await client.from("news_items").select("*").eq("status", "draft").order("ingested_at", { ascending: false }); if (error) throw error; return (data ?? []).map(fromDb); } return state.items.filter((item) => item.status === "draft"); }
export function listNewsProviders() { return providers; }
