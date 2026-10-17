import { getAIStatus } from "@/lib/ai-client";

export async function GET() {
  return Response.json(getAIStatus(), {
    headers: { "Cache-Control": "no-store" },
  });
}
