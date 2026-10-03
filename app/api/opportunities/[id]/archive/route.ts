import { getOpportunity, updateOpportunity } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordOpportunityAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const limited = await enforceRateLimit(request, "adminSync", "opportunity-archive", true); if (limited) return limited;
  const { id } = await params;
  if (!(await getOpportunity(id))) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  const opportunity = await updateOpportunity(id, { status: "archived", verificationStatus: "expired" });
  await recordOpportunityAudit({ opportunityId: id, action: "archive", metadata: { reason: "admin" } });
  return Response.json({ opportunity });
}
