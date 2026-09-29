import { extractOpportunity } from "@/lib/ai";
import { writeAuditLog } from "@/lib/audit";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import type { Opportunity, OpportunityDraft } from "@/lib/types";
import { fallbackState, persistFallbackState } from "@/lib/repositories/fallback";
import { fromOpportunityDb, toOpportunityDb } from "@/lib/repositories/serializers";
import { claimSubmission, completeSubmission, failSubmission, type SubmissionRecord } from "@/lib/repositories/submissions";
import { logError, logEvent } from "@/lib/logging";

const MAX_ATTEMPTS = 3;

async function safeAudit(input: Parameters<typeof writeAuditLog>[0]) {
  try {
    await writeAuditLog(input);
  } catch (error) {
    logError("audit.write_failed", error, { action: input.action, opportunityId: input.opportunityId ?? null });
  }
}

async function persistOpportunity(submission: SubmissionRecord, draft: OpportunityDraft): Promise<Opportunity> {
  const now = new Date().toISOString();
  const opportunity: Opportunity = {
    ...draft,
    id: crypto.randomUUID(),
    status: "draft",
    verificationStatus: "awaiting_review",
    rawSource: submission.rawText,
    createdAt: now,
    updatedAt: now,
  };

  if (hasSupabaseConfig()) {
    const { data, error } = await (getAdminSupabase() as any)
      .from("opportunities")
      .insert({ ...toOpportunityDb(opportunity), created_by: submission.submittedBy ?? null })
      .select("*")
      .single();
    if (error) throw error;
    return fromOpportunityDb(data as Record<string, unknown>);
  }

  fallbackState.opportunities.unshift(opportunity);
  persistFallbackState();
  return opportunity;
}

export async function processQueuedSubmission(submissionId: string) {
  const submission = await claimSubmission(submissionId, MAX_ATTEMPTS);
  if (!submission) return null;

  logEvent("info", "submission.processing", { submissionId, attempt: submission.attemptCount });
  await safeAudit({ action: "submission_processing", actorId: submission.submittedBy, metadata: { submissionId, attempt: submission.attemptCount }, privileged: hasSupabaseConfig() });

  try {
    const draft = await extractOpportunity(submission.rawText, submission.sourceUrl, submission.sourceType);
    const opportunity = await persistOpportunity(submission, draft);
    await completeSubmission(submissionId, opportunity.id);
    await safeAudit({ action: "submission_completed", opportunityId: opportunity.id, actorId: submission.submittedBy, metadata: { submissionId, attempt: submission.attemptCount }, privileged: hasSupabaseConfig() });
    logEvent("info", "submission.completed", { submissionId, opportunityId: opportunity.id, attempt: submission.attemptCount });
    return opportunity;
  } catch (error) {
    await failSubmission(submissionId, error instanceof Error ? error.message : String(error));
    await safeAudit({ action: "submission_failed", actorId: submission.submittedBy, metadata: { submissionId, attempt: submission.attemptCount }, privileged: hasSupabaseConfig() });
    logError("submission.failed", error, { submissionId, attempt: submission.attemptCount });
    throw error;
  }
}
