import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { demoOpportunities } from "./demo-data";
import type { LocationPreference, Opportunity, OpportunityDraft, Submission } from "./types";

type StoreState = {
  opportunities: Opportunity[];
  submissions: Submission[];
  saved: Record<string, string[]>;
  locationPreferences: Record<string, LocationPreference>;
};

const globalStore = globalThis as typeof globalThis & { __opportunityStore?: StoreState };
const state: StoreState =
  globalStore.__opportunityStore ?? {
    opportunities: [...demoOpportunities],
    submissions: [],
    saved: {},
    locationPreferences: {},
  };
globalStore.__opportunityStore = state;

const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function supabase(): SupabaseClient | null {
  if (!hasSupabase) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function toDb(item: OpportunityDraft) {
  return {
    title: item.title,
    description: item.description,
    summary: item.summary,
    category: item.category,
    organizer: item.organizer,
    official_url: item.officialUrl,
    source_url: item.sourceUrl || null,
    source_type: item.sourceType,
    format: item.format,
    location: item.location,
    event_start_date: item.eventStartDate,
    event_end_date: item.eventEndDate,
    registration_deadline: item.registrationDeadline,
    eligibility: item.eligibility,
    fees: item.fees,
    benefit: item.benefit,
    skills: item.skills,
    tags: item.tags,
    verification_status: item.verificationStatus,
    ai_confidence: item.aiConfidence,
    status: item.status,
    raw_source: item.rawSource ?? null,
    last_verified_at: item.lastVerifiedAt,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
  };
}

function fromDb(row: Record<string, unknown>): Opportunity {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    summary: String(row.summary ?? ""),
    category: row.category as Opportunity["category"],
    organizer: String(row.organizer ?? ""),
    officialUrl: String(row.official_url ?? ""),
    sourceUrl: String(row.source_url ?? ""),
    sourceType: row.source_type as Opportunity["sourceType"],
    format: row.format as Opportunity["format"],
    location: String(row.location ?? ""),
    eventStartDate: (row.event_start_date as string | null) ?? null,
    eventEndDate: (row.event_end_date as string | null) ?? null,
    registrationDeadline: (row.registration_deadline as string | null) ?? null,
    eligibility: String(row.eligibility ?? ""),
    fees: String(row.fees ?? ""),
    benefit: String(row.benefit ?? ""),
    skills: (row.skills as string[]) ?? [],
    tags: (row.tags as string[]) ?? [],
    verificationStatus: row.verification_status as Opportunity["verificationStatus"],
    aiConfidence: Number(row.ai_confidence ?? 0),
    status: row.status as Opportunity["status"],
    rawSource: (row.raw_source as string | null) ?? undefined,
    lastVerifiedAt: (row.last_verified_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
  };
}

export async function listPublished(filters: { q?: string; category?: string; format?: string } = {}) {
  const client = supabase();
  if (client) {
    let query = client.from("opportunities").select("*").eq("status", "published").order("registration_deadline", { ascending: true, nullsFirst: false });
    if (filters.category && filters.category !== "All") query = query.eq("category", filters.category);
    if (filters.format && filters.format !== "All") query = query.eq("format", filters.format);
    const { data, error } = await query;
    if (error) throw error;
    const items = (data ?? []).map(fromDb);
    return applySearch(items, filters.q);
  }
  return applySearch(state.opportunities.filter((item) => item.status === "published"), filters.q, filters.category, filters.format);
}

export async function getLocationPreference(userId: string) {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("location_preferences").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return data ? fromLocationDb(data) : null;
  }
  return state.locationPreferences[userId] ?? null;
}

export async function saveLocationPreference(preference: Omit<LocationPreference, "updatedAt">) {
  const value: LocationPreference = { ...preference, updatedAt: new Date().toISOString() };
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("location_preferences").upsert({
      user_id: value.userId, label: value.label, city: value.city, region: value.region, country: value.country,
      latitude: value.latitude, longitude: value.longitude, precision: value.precision,
      consented_to_geolocation: value.consentedToGeolocation, updated_at: value.updatedAt,
    }).select("*").single();
    if (error) throw error;
    return fromLocationDb(data);
  }
  state.locationPreferences[value.userId] = value;
  return value;
}

function fromLocationDb(row: Record<string, unknown>): LocationPreference {
  return {
    userId: String(row.user_id), label: String(row.label ?? ""), city: String(row.city ?? ""), region: String(row.region ?? ""), country: String(row.country ?? ""),
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude), longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    precision: row.precision === "approximate" || row.precision === "country" ? row.precision : "city",
    consentedToGeolocation: Boolean(row.consented_to_geolocation), updatedAt: String(row.updated_at),
  };
}

function applySearch(items: Opportunity[], q?: string, category?: string, format?: string) {
  const query = q?.trim().toLowerCase();
  return items.filter((item) => {
    const matchesQuery = !query || [item.title, item.organizer, item.summary, item.description, ...item.tags, ...item.skills].join(" ").toLowerCase().includes(query);
    const matchesCategory = !category || category === "All" || item.category === category;
    const matchesFormat = !format || format === "All" || item.format === format;
    const active = !item.registrationDeadline || new Date(item.registrationDeadline) >= new Date();
    return matchesQuery && matchesCategory && matchesFormat && active;
  });
}

export async function getOpportunity(id: string) {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("opportunities").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromDb(data) : null;
  }
  return state.opportunities.find((item) => item.id === id) ?? null;
}

export async function findOpportunityDuplicate(input: { officialUrl: string; title: string; organizer?: string; registrationDeadline?: string | null }) {
  const client = supabase();
  if (client) {
    const byUrl = await client.from("opportunities").select("*").eq("official_url", input.officialUrl).limit(1);
    if (byUrl.error) throw byUrl.error;
    if (byUrl.data?.[0]) return fromDb(byUrl.data[0]);
    return null;
  }
  const normalizedUrl = input.officialUrl.toLowerCase();
  const normalizedTitle = input.title.trim().toLowerCase();
  return state.opportunities.find((item) => item.officialUrl.toLowerCase() === normalizedUrl || (item.title.trim().toLowerCase() === normalizedTitle && item.organizer.trim().toLowerCase() === (input.organizer ?? "").trim().toLowerCase() && item.registrationDeadline === (input.registrationDeadline ?? null))) ?? null;
}

export async function createSubmission(input: { rawText: string; sourceType: Submission["sourceType"]; sourceUrl: string; draft: OpportunityDraft }) {
  const now = new Date().toISOString();
  const opportunity: Opportunity = {
    ...input.draft,
    id: crypto.randomUUID(),
    status: "draft",
    verificationStatus: "awaiting_review",
    rawSource: input.rawText,
    createdAt: now,
    updatedAt: now,
  };
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("opportunities").insert(toDb(opportunity)).select("*").single();
    if (error) throw error;
    return fromDb(data);
  }
  state.opportunities.unshift(opportunity);
  state.submissions.push({ id: crypto.randomUUID(), rawText: input.rawText, sourceType: input.sourceType, sourceUrl: input.sourceUrl, createdAt: now, opportunityId: opportunity.id });
  return opportunity;
}

export async function listReview() {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("opportunities").select("*").eq("status", "draft").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(fromDb);
  }
  return state.opportunities.filter((item) => item.status === "draft");
}

export async function updateOpportunity(id: string, patch: Partial<Opportunity>) {
  const current = await getOpportunity(id);
  if (!current) return null;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("opportunities").update(toDb(updated)).eq("id", id).select("*").single();
    if (error) throw error;
    return fromDb(data);
  }
  const index = state.opportunities.findIndex((item) => item.id === id);
  state.opportunities[index] = updated;
  return updated;
}

export async function saveOpportunity(userId: string, opportunityId: string) {
  const client = supabase();
  if (client) {
    const { error } = await client.from("saved_opportunities").upsert({ user_id: userId, opportunity_id: opportunityId });
    if (error) throw error;
    return true;
  }
  state.saved[userId] = Array.from(new Set([...(state.saved[userId] ?? []), opportunityId]));
  return true;
}

export async function listSaved(userId: string) {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("saved_opportunities").select("opportunity_id").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => String(row.opportunity_id));
  }
  return state.saved[userId] ?? [];
}
