import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { ApplicationStatus } from "@/lib/types";
import { fallbackState, persistFallbackState } from "./fallback";

export async function getApplicationStatus(userId: string | null, opportunityId: string): Promise<ApplicationStatus | null> {
  if (!userId) return null;
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { data, error } = await client
      .from("opportunity_progress")
      .select("status")
      .eq("user_id", userId)
      .eq("opportunity_id", opportunityId)
      .maybeSingle();
    if (error) throw error;
    return (data?.status as ApplicationStatus | undefined) ?? null;
  }
  return fallbackState.progress[userId]?.[opportunityId] ?? null;
}

export async function setApplicationStatus(userId: string, opportunityId: string, status: ApplicationStatus) {
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const { error } = await client.from("opportunity_progress").upsert({
      user_id: userId,
      opportunity_id: opportunityId,
      status,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return;
  }
  fallbackState.progress[userId] ??= {};
  fallbackState.progress[userId][opportunityId] = status;
  persistFallbackState();
}
