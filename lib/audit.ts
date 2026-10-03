import { createClient } from "@supabase/supabase-js";

function client() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function recordOpportunityAudit(input: { opportunityId?: string; action: string; actorId?: string; metadata?: Record<string, unknown> }) {
  const supabase = client();
  if (!supabase || !input.opportunityId) return;
  const { error } = await supabase.from("opportunity_audit_log").insert({ opportunity_id: input.opportunityId, actor_id: input.actorId ?? null, action: input.action, metadata: input.metadata ?? {} });
  if (error) console.error(JSON.stringify({ event: "audit_write_error", resource: "opportunity", action: input.action, error: error.message }));
}

export async function recordNewsAudit(input: { newsId?: string; action: string; actorId?: string; metadata?: Record<string, unknown> }) {
  const supabase = client();
  if (!supabase || !input.newsId) return;
  const { error } = await supabase.from("news_audit_log").insert({ news_id: input.newsId, actor_id: input.actorId ?? null, action: input.action, metadata: input.metadata ?? {} });
  if (error) console.error(JSON.stringify({ event: "audit_write_error", resource: "news", action: input.action, error: error.message }));
}
