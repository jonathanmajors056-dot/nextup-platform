import { send } from "@vercel/queue";

export const SUBMISSION_TOPIC = "nextup-submissions";

export function isQueueConfigured() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL_QUEUE_API_TOKEN);
}

export async function enqueueSubmission(submissionId: string, idempotencyKey?: string | null) {
  return send(
    SUBMISSION_TOPIC,
    { submissionId },
    {
      idempotencyKey: idempotencyKey ? `submission:${idempotencyKey}` : `submission:${submissionId}`,
      retentionSeconds: 86400,
      headers: { "x-nextup-job": "submission-extraction" },
    },
  );
}
