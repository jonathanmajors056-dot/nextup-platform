import { getOpportunity, isPubliclySourceBacked } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity || opportunity.status !== "published" || !isPubliclySourceBacked(opportunity)) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  return Response.json({ opportunity });
}
