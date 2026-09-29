import { getOpportunity, updateOpportunity } from "@/lib/store";
import { authErrorResponse, requireAdmin } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { writeAuditLogBestEffort } from "@/lib/audit";
import { withRequestLogging } from "@/lib/logging";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRequestLogging(request, "/api/opportunities/[id]/archive", async () => {
    let adminId: string | undefined;
    try {
      const admin = hasSupabaseConfig() ? await requireAdmin() : null;
      adminId = admin?.id;
      const limited = await enforceRateLimit(request, { name: "admin-mutation", limit: 60, window: "1m", userId: adminId });
      if (limited) return limited;
    } catch (error) {
      return authErrorResponse(error);
    }
    const { id } = await params;
    const opportunity = await getOpportunity(id);
    if (!opportunity) return Response.json({ error: "Opportunity not found" }, { status: 404 });
    const updated = await updateOpportunity(id, { status: "archived", verificationStatus: "expired" });
    await writeAuditLogBestEffort({ action: "opportunity_archived", opportunityId: id, actorId: adminId, metadata: { previousStatus: opportunity.status } });
    return Response.json({ opportunity: updated });
  });
}
