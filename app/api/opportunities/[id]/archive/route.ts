import { getOpportunity, updateOpportunity } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request); if (denied) return denied;
  const { id } = await params;
  if (!(await getOpportunity(id))) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  return Response.json({ opportunity: await updateOpportunity(id, { status: "archived", verificationStatus: "expired" }) });
}
