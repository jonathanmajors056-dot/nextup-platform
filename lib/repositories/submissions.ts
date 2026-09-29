import { getAdminSupabase } from "@/lib/supabase/admin";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Submission } from "@/lib/types";
import { fallbackState, persistFallbackState } from "./fallback";

export type SubmissionRecord = Submission & {
  status: NonNullable<Submission["status"]>;
  updatedAt: string;
  attemptCount: number;
};

type CreateSubmissionInput = {
  rawText: string;
  sourceType: Submission["sourceType"];
  sourceUrl: string;
  submittedBy?: string | null;
  idempotencyKey?: string | null;
};

function fromDb(row: Record<string, unknown>): SubmissionRecord {
  return {
    id: String(row.id),
    rawText: String(row.raw_text ?? ""),
    sourceType: row.source_type as Submission["sourceType"],
    sourceUrl: String(row.source_url ?? ""),
    submittedBy: (row.submitted_by as string | null) ?? null,
    status: row.status as SubmissionRecord["status"],
    opportunityId: (row.opportunity_id as string | null) ?? null,
    idempotencyKey: (row.idempotency_key as string | null) ?? null,
    attemptCount: Number(row.attempt_count ?? 0),
    errorMessage: (row.error_message as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at ?? row.created_at),
    processedAt: (row.processed_at as string | null) ?? null,
  };
}

export async function createQueuedSubmission(input: CreateSubmissionInput): Promise<SubmissionRecord> {
  const client = hasSupabaseConfig() ? await getServerSupabase() : null;
  if (client) {
    const db = client as any;
    if (input.idempotencyKey) {
      const existing = await db.from("submissions").select("*").eq("idempotency_key", input.idempotencyKey).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data) return fromDb(existing.data as Record<string, unknown>);
    }

    const { data, error } = await db
      .from("submissions")
      .insert({
        raw_text: input.rawText,
        source_url: input.sourceUrl || null,
        source_type: input.sourceType,
        submitted_by: input.submittedBy ?? null,
        idempotency_key: input.idempotencyKey ?? null,
        status: "queued",
      })
      .select("*")
      .single();
    if (error) throw error;
    return fromDb(data as Record<string, unknown>);
  }

  const now = new Date().toISOString();
  const record: SubmissionRecord = {
    id: crypto.randomUUID(),
    rawText: input.rawText,
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    submittedBy: input.submittedBy ?? null,
    status: "queued",
    opportunityId: null,
    idempotencyKey: input.idempotencyKey ?? null,
    attemptCount: 0,
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    processedAt: null,
  };
  fallbackState.submissions.unshift(record);
  persistFallbackState();
  return record;
}

export async function getSubmission(id: string, privileged = false): Promise<SubmissionRecord | null> {
  const client = hasSupabaseConfig() ? (privileged ? (getAdminSupabase() as any) : await getServerSupabase()) : null;
  if (client) {
    const { data, error } = await (client as any).from("submissions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? fromDb(data as Record<string, unknown>) : null;
  }
  return (fallbackState.submissions.find((item) => item.id === id) as SubmissionRecord | undefined) ?? null;
}

export async function claimSubmission(id: string, maxAttempts = 3): Promise<SubmissionRecord | null> {
  const current = await getSubmission(id, true);
  if (!current || current.status === "completed" || current.status === "processing" || current.attemptCount >= maxAttempts) return null;

  const nextAttempt = current.attemptCount + 1;
  const client = hasSupabaseConfig() ? (getAdminSupabase() as any) : null;
  if (client) {
    const { data, error } = await (client as any)
      .from("submissions")
      .update({ status: "processing", attempt_count: nextAttempt, error_message: null })
      .eq("id", id)
      .in("status", ["queued", "failed"])
      .lt("attempt_count", maxAttempts)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? fromDb(data as Record<string, unknown>) : null;
  }

  const item = fallbackState.submissions.find((entry) => entry.id === id) as SubmissionRecord | undefined;
  if (!item || item.status === "processing" || item.status === "completed") return null;
  item.status = "processing";
  item.attemptCount = nextAttempt;
  item.errorMessage = null;
  item.updatedAt = new Date().toISOString();
  persistFallbackState();
  return item;
}

export async function completeSubmission(id: string, opportunityId: string) {
  const client = hasSupabaseConfig() ? (getAdminSupabase() as any) : null;
  const processedAt = new Date().toISOString();
  if (client) {
    const { error } = await (client as any).from("submissions").update({ status: "completed", opportunity_id: opportunityId, processed_at: processedAt, error_message: null }).eq("id", id);
    if (error) throw error;
    return;
  }
  const item = fallbackState.submissions.find((entry) => entry.id === id) as SubmissionRecord | undefined;
  if (!item) return;
  item.status = "completed";
  item.opportunityId = opportunityId;
  item.processedAt = processedAt;
  item.updatedAt = processedAt;
  persistFallbackState();
}

export async function failSubmission(id: string, errorMessage: string) {
  const safeMessage = errorMessage.slice(0, 1000);
  const client = hasSupabaseConfig() ? (getAdminSupabase() as any) : null;
  if (client) {
    const { error } = await (client as any).from("submissions").update({ status: "failed", error_message: safeMessage }).eq("id", id);
    if (error) throw error;
    return;
  }
  const item = fallbackState.submissions.find((entry) => entry.id === id) as SubmissionRecord | undefined;
  if (!item) return;
  item.status = "failed";
  item.errorMessage = safeMessage;
  item.updatedAt = new Date().toISOString();
  persistFallbackState();
}
