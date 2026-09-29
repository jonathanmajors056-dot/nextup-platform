import { getOpportunity } from "@/lib/store";
import { withRequestLogging } from "@/lib/logging";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRequestLogging(request, "/api/opportunities/[id]", async () => {
    const { id } = await params;
    const opportunity = await getOpportunity(id);
    if (!opportunity) return Response.json({ error: "Opportunity not found" }, { status: 404 });
    return Response.json({ opportunity });
  });
}
