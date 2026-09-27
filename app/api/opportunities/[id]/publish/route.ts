import { getOpportunity, updateOpportunity } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  const updated = await updateOpportunity(id, { status: "published", verificationStatus: opportunity.verificationStatus === "awaiting_review" ? "community_submitted" : opportunity.verificationStatus, lastVerifiedAt: new Date().toISOString() });
  return Response.json({ opportunity: updated });
}
