import { extractOpportunity } from "@/lib/ai";
import { getOpportunity, updateOpportunity } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { recordOpportunityAudit } from "@/lib/audit";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const limited = await enforceRateLimit(request, "adminSync", "opportunity-extract", true); if (limited) return limited;
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  if (!opportunity) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  const draft = await extractOpportunity(opportunity.rawSource ?? opportunity.description, opportunity.sourceUrl, opportunity.sourceType);
  const updated = await updateOpportunity(id, draft);
  await recordOpportunityAudit({ opportunityId: id, action: "ai_extraction", metadata: { model: process.env.OPENAI_MODEL ?? "default", aiConfidence: updated?.aiConfidence ?? null } });
  return Response.json({ opportunity: updated });
}
