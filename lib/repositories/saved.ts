import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Opportunity } from "@/lib/types";
import { fallbackState, persistFallbackState } from "./fallback";
import { fromOpportunityDb } from "./serializers";

export async function saveOpportunity(userId: string, opportunityId: string) {
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { error } = await client.from("saved_opportunities").upsert({ user_id: userId, opportunity_id: opportunityId });
    if (error) throw error;
    return true;
  }
  fallbackState.saved[userId] = Array.from(new Set([...(fallbackState.saved[userId] ?? []), opportunityId]));
  persistFallbackState();
  return true;
}

export async function listSaved(userId: string | null) {
  if (!userId) return [];
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client.from("saved_opportunities").select("opportunity_id").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((row) => String(row.opportunity_id));
  }
  return fallbackState.saved[userId] ?? [];
}

export async function listSavedOpportunities(userId: string | null): Promise<Opportunity[]> {
  if (!userId) return [];
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client
      .from("saved_opportunities")
      .select("created_at, opportunity:opportunities(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).flatMap((row) => {
      const relation = (row as unknown as { opportunity?: Record<string, unknown> | Record<string, unknown>[] | null }).opportunity;
      const opportunity = Array.isArray(relation) ? relation[0] : relation;
      return opportunity ? [fromOpportunityDb(opportunity)] : [];
    });
  }
  const ids = fallbackState.saved[userId] ?? [];
  return ids.map((id) => fallbackState.opportunities.find((item) => item.id === id)).filter((item): item is Opportunity => Boolean(item));
}
