import { extractOpportunity } from "@/lib/ai";
import { createSubmission } from "@/lib/store";
import { submissionSchema } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "submissions"); if (limited) return limited;
  try {
    const body = submissionSchema.parse(await request.json());
    const draft = await extractOpportunity(body.rawText, body.sourceUrl ?? "", body.sourceType);
    const opportunity = await createSubmission({ rawText: body.rawText, sourceType: body.sourceType, sourceUrl: body.sourceUrl ?? "", draft });
    return Response.json({ opportunity }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid submission" }, { status: 400 });
  }
}
