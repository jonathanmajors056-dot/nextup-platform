import { handleCallback } from "@vercel/queue";
import { processQueuedSubmission } from "@/lib/jobs/process-submission";
import { logEvent } from "@/lib/logging";

const queueHandler = handleCallback(async (message, metadata) => {
  const payload = message as { submissionId?: string };
  if (!payload.submissionId) throw new Error("Queue message is missing submissionId");
  logEvent("info", "queue.message_received", { topic: metadata.topicName, messageId: metadata.messageId, deliveryCount: metadata.deliveryCount, submissionId: payload.submissionId });
  await processQueuedSubmission(payload.submissionId);
});

export async function POST(request: Request) {
  return queueHandler(request);
}
