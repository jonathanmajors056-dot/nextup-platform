import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { AuditAction } from "@/lib/types";
import { fallbackState, persistFallbackState } from "@/lib/repositories/fallback";
import { logError } from "@/lib/logging";

type AuditInput = {
  action: AuditAction | string;
  opportunityId?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
  privileged?: boolean;
};

export async function writeAuditLog(input: AuditInput) {
  const row = {
    opportunity_id: input.opportunityId ?? null,
    actor_id: input.actorId ?? null,
    action: input.action,
    metadata: input.metadata ?? {},
  };

  if (hasSupabaseConfig()) {
    const client = input.privileged ? getAdminSupabase() : await getServerSupabase();
    const { error } = await client.from("opportunity_audit_log").insert(row);
    if (error) throw error;
    return;
  }

  fallbackState.audit.unshift({
    id: crypto.randomUUID(),
    opportunityId: row.opportunity_id,
    actorId: row.actor_id,
    action: row.action,
    metadata: row.metadata,
    createdAt: new Date().toISOString(),
  });
  persistFallbackState();
}

export async function writeAuditLogBestEffort(input: AuditInput) {
  try {
    await writeAuditLog(input);
  } catch (error) {
    logError("audit.write_failed", error, { action: input.action, opportunityId: input.opportunityId ?? null });
  }
}
