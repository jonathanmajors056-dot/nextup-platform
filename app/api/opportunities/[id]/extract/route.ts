import { extractOpportunity } from "@/lib/ai";
import { getOpportunity, updateOpportunity } from "@/lib/store";
import { authErrorResponse, requireAdmin } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { writeAuditLogBestEffort } from "@/lib/audit";
import { withRequestLogging } from "@/lib/logging";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRequestLogging(request, "/api/opportunities/[id]/extract", async () => {
    let adminId: string | undefined;
    try {
      const admin = hasSupabaseConfig() ? await requireAdmin() : null;
      adminId = admin?.id;
      const limited = await enforceRateLimit(request, { name: "ai-extraction", limit: 10, window: "1m", userId: adminId });
      if (limited) return limited;
    } catch (error) {
      return authErrorResponse(error);
    }
    const { id } = await params;
    const opportunity = await getOpportunity(id, { includePrivate: true });
    if (!opportunity) return Response.json({ error: "Opportunity not found" }, { status: 404 });
    const draft = await extractOpportunity(opportunity.rawSource ?? opportunity.description, opportunity.sourceUrl, opportunity.sourceType);
    const updated = await updateOpportunity(id, draft);
    await writeAuditLogBestEffort({ action: "opportunity_extracted", opportunityId: id, actorId: adminId, metadata: { aiConfidence: draft.aiConfidence } });
    return Response.json({ opportunity: updated });
  });
}
