import { getOpportunity, isPubliclySourceBacked, updateOpportunity } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordOpportunityAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const limited = await enforceRateLimit(request, "adminSync", "opportunity-publish", true); if (limited) return limited;
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  if (!isPubliclySourceBacked(opportunity)) return Response.json({ error: "Add a real official source URL before publishing this opportunity." }, { status: 422 });
  const updated = await updateOpportunity(id, { status: "published", verificationStatus: opportunity.verificationStatus === "awaiting_review" ? "community_submitted" : opportunity.verificationStatus, lastVerifiedAt: new Date().toISOString() });
  await recordOpportunityAudit({ opportunityId: id, action: "publish", metadata: { verificationStatus: updated?.verificationStatus ?? null } });
  return Response.json({ opportunity: updated });
}
