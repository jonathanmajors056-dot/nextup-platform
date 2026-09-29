import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Opportunity, OpportunityDraft, Submission } from "@/lib/types";
import { fallbackState, persistFallbackState } from "./fallback";
import { fromOpportunityDb, toOpportunityDb } from "./serializers";

const PUBLIC_LIST_FIELDS = "id,title,summary,category,organizer,official_url,source_url,source_type,format,location,event_start_date,event_end_date,registration_deadline,eligibility,fees,benefit,skills,tags,verification_status,ai_confidence,status,last_verified_at,published_at,created_at,updated_at";
const PUBLIC_DETAIL_FIELDS = `${PUBLIC_LIST_FIELDS},description`;

export type PublishedFilters = {
  q?: string;
  category?: string;
  format?: string;
  cursor?: string;
  limit?: number;
};

export type OpportunityPage = {
  data: Opportunity[];
  nextCursor: string | null;
};

type Cursor = { createdAt: string; id: string };

function pageSize(value?: number) {
  return Math.min(Math.max(Number.isFinite(value) ? Number(value) : 24, 1), 50);
}

function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(value?: string): Cursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<Cursor>;
    if (typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") return null;
    return { createdAt: parsed.createdAt, id: parsed.id };
  } catch {
    return null;
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&").trim().slice(0, 120);
}

function matchesSearch(item: Opportunity, q?: string) {
  const query = q?.trim().toLowerCase();
  if (!query) return true;
  return [item.title, item.organizer, item.summary, item.description, ...item.tags, ...item.skills]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesFilters(item: Opportunity, filters: PublishedFilters) {
  const active = !item.registrationDeadline || new Date(item.registrationDeadline) >= new Date();
  return active && matchesSearch(item, filters.q) && (!filters.category || filters.category === "All" || item.category === filters.category) && (!filters.format || filters.format === "All" || item.format === filters.format);
}

function sortPublished(items: Opportunity[]) {
  return [...items].sort((a, b) => {
    const createdDifference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return createdDifference || b.id.localeCompare(a.id);
  });
}

export async function listPublished(filters: PublishedFilters = {}): Promise<OpportunityPage> {
  const size = pageSize(filters.limit);
  const cursor = decodeCursor(filters.cursor);
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;

  if (client) {
    let query = client.from("opportunities").select(PUBLIC_LIST_FIELDS).eq("status", "published");
    if (filters.category && filters.category !== "All") query = query.eq("category", filters.category);
    if (filters.format && filters.format !== "All") query = query.eq("format", filters.format);
    if (filters.q?.trim()) query = query.ilike("search_text", `%${escapeLike(filters.q)}%`);
    if (cursor) query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`);

    const { data, error } = await query.order("created_at", { ascending: false }).order("id", { ascending: false }).limit(size + 1);
    if (error) throw error;
    const rows = (data ?? []).map((row) => fromOpportunityDb(row as Record<string, unknown>));
    const hasMore = rows.length > size;
    const items = hasMore ? rows.slice(0, size) : rows;
    const last = items.at(-1);
    return { data: items, nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null };
  }

  const filtered = sortPublished(fallbackState.opportunities.filter((item) => item.status === "published" && matchesFilters(item, filters)));
  const start = cursor ? Math.max(0, filtered.findIndex((item) => item.createdAt === cursor.createdAt && item.id === cursor.id) + 1) : 0;
  const items = filtered.slice(start, start + size);
  const hasMore = start + size < filtered.length;
  const last = items.at(-1);
  return { data: items, nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null };
}

export async function getOpportunity(id: string, options: { includePrivate?: boolean } = {}) {
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client.from("opportunities").select(options.includePrivate ? "*" : PUBLIC_DETAIL_FIELDS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromOpportunityDb(data as unknown as Record<string, unknown>) : null;
  }
  return fallbackState.opportunities.find((item) => item.id === id) ?? null;
}

export async function createSubmission(input: { rawText: string; sourceType: Submission["sourceType"]; sourceUrl: string; draft: OpportunityDraft }) {
  const now = new Date().toISOString();
  const opportunity: Opportunity = { ...input.draft, id: crypto.randomUUID(), status: "draft", verificationStatus: "awaiting_review", rawSource: input.rawText, createdAt: now, updatedAt: now };
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client.from("opportunities").insert(toOpportunityDb(opportunity)).select("*").single();
    if (error) throw error;
    return fromOpportunityDb(data as Record<string, unknown>);
  }
  fallbackState.opportunities.unshift(opportunity);
  fallbackState.submissions.push({ id: crypto.randomUUID(), rawText: input.rawText, sourceType: input.sourceType, sourceUrl: input.sourceUrl, createdAt: now, opportunityId: opportunity.id });
  persistFallbackState();
  return opportunity;
}

export async function listReview() {
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client.from("opportunities").select("*").eq("status", "draft").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => fromOpportunityDb(row as Record<string, unknown>));
  }
  return fallbackState.opportunities.filter((item) => item.status === "draft");
}

export async function updateOpportunity(id: string, patch: Partial<Opportunity>) {
  const current = await getOpportunity(id, { includePrivate: true });
  if (!current) return null;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client.from("opportunities").update(toOpportunityDb(updated)).eq("id", id).select("*").single();
    if (error) throw error;
    return fromOpportunityDb(data as Record<string, unknown>);
  }
  const index = fallbackState.opportunities.findIndex((item) => item.id === id);
  if (index < 0) return null;
  fallbackState.opportunities[index] = updated;
  persistFallbackState();
  return updated;
}
