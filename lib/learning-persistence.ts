import type { LearningEvent } from "./learning-engine";

const VIEWER_COOKIE = "nextup-viewer";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function viewerIdFromRequest(request: Request) {
  const cookie = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${VIEWER_COOKIE}=([^;]+)`))?.[1];
  return cookie && UUID.test(cookie) ? cookie : crypto.randomUUID();
}

export function attachViewerCookie(response: Response, viewerId: string, request: Request) {
  if (!request.headers.get("cookie")?.includes(`${VIEWER_COOKIE}=`)) response.headers.append("Set-Cookie", `${VIEWER_COOKIE}=${viewerId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

function row(viewerId: string, event: LearningEvent) {
  return { viewer_id: viewerId, event_type: event.type, opportunity_id: event.opportunityId ?? null, category: event.category ?? null, format: event.format ?? null, tags: event.tags ?? [], value: event.value ?? null, occurred_at: event.timestamp };
}

function eventFromRow(value: Record<string, unknown>): LearningEvent {
  return { type: value.event_type as LearningEvent["type"], opportunityId: value.opportunity_id ? String(value.opportunity_id) : undefined, category: value.category ? String(value.category) : undefined, format: value.format ? String(value.format) : undefined, tags: Array.isArray(value.tags) ? value.tags.map(String) : [], value: value.value === "useful" || value.value === "not-useful" ? value.value : undefined, timestamp: String(value.occurred_at ?? value.created_at ?? new Date().toISOString()) };
}

export async function loadPersistedLearning(viewerId: string) {
  const config = supabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/student_learning_events?viewer_id=eq.${encodeURIComponent(viewerId)}&order=occurred_at.desc&limit=80`, { headers: { apikey: config.key, Authorization: `Bearer ${config.key}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Learning store read failed: ${response.status}`);
  const data = await response.json() as Record<string, unknown>[];
  return data.reverse().map(eventFromRow);
}

export async function persistLearning(viewerId: string, events: LearningEvent[]) {
  const config = supabaseConfig();
  if (!config || !events.length) return false;
  const response = await fetch(`${config.url}/rest/v1/student_learning_events`, { method: "POST", headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(events.slice(-20).map((event) => row(viewerId, event))) });
  if (!response.ok) throw new Error(`Learning store write failed: ${response.status}`);
  return true;
}
