import { extractOpportunity } from "@/lib/ai";
import { createSubmission } from "@/lib/store";
import { submissionSchema } from "@/lib/validation";
import { AuthError, authErrorResponse, requireAdmin } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { writeAuditLogBestEffort } from "@/lib/audit";
import { createQueuedSubmission } from "@/lib/repositories/submissions";
import { enqueueSubmission, isQueueConfigured } from "@/lib/jobs/queue";
import { processQueuedSubmission } from "@/lib/jobs/process-submission";
import { withRequestLogging } from "@/lib/logging";

export async function POST(request: Request) {
  return withRequestLogging(request, "/api/submissions", async () => {
    try {
      const admin = hasSupabaseConfig() ? await requireAdmin() : null;
      const limited = await enforceRateLimit(request, { name: "submission-write", limit: 10, window: "1m", userId: admin?.id });
      if (limited) return limited;
      const body = submissionSchema.parse(await request.json());

      // Keep the local fallback fast and self-contained. Production Supabase traffic uses the durable queue below.
      if (!hasSupabaseConfig()) {
        const draft = await extractOpportunity(body.rawText, body.sourceUrl ?? "", body.sourceType);
        const opportunity = await createSubmission({ rawText: body.rawText, sourceType: body.sourceType, sourceUrl: body.sourceUrl ?? "", draft });
        await writeAuditLogBestEffort({ action: "submission_completed", opportunityId: opportunity.id, metadata: { mode: "local-fallback" } });
        return Response.json({ opportunity }, { status: 201 });
      }

      const idempotencyKey = request.headers.get("Idempotency-Key")?.trim().slice(0, 200) || null;
      const submission = await createQueuedSubmission({ rawText: body.rawText, sourceType: body.sourceType, sourceUrl: body.sourceUrl ?? "", submittedBy: admin?.id, idempotencyKey });
      await writeAuditLogBestEffort({ action: "submission_queued", actorId: admin?.id, metadata: { submissionId: submission.id }, privileged: true });

      if (!isQueueConfigured()) {
        if (process.env.NODE_ENV !== "production") {
          const opportunity = await processQueuedSubmission(submission.id);
          return Response.json({ opportunity, submission }, { status: 201 });
        }
        return Response.json({ error: "Submission queue is not configured." }, { status: 503 });
      }

      const queued = await enqueueSubmission(submission.id, submission.idempotencyKey);
      return Response.json({ submission: { ...submission, status: "queued" }, messageId: queued.messageId }, { status: 202 });
    } catch (error) {
      if (error instanceof AuthError) return authErrorResponse(error);
      return Response.json({ error: error instanceof Error ? error.message : "Invalid submission" }, { status: 400 });
    }
  });
}
