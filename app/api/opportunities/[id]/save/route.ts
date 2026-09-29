import { getOpportunity, saveOpportunity } from "@/lib/store";
import { authErrorResponse, requireUser } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withRequestLogging } from "@/lib/logging";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRequestLogging(request, "/api/opportunities/[id]/save", async () => {
    const { id } = await params;
    if (!(await getOpportunity(id))) return Response.json({ error: "Opportunity not found" }, { status: 404 });
    let userId = "demo-student";
    if (hasSupabaseConfig()) {
      try {
        userId = (await requireUser()).id;
        const limited = await enforceRateLimit(request, { name: "save-write", limit: 30, window: "1m", userId });
        if (limited) return limited;
      } catch (error) {
        return authErrorResponse(error);
      }
    } else {
      const limited = await enforceRateLimit(request, { name: "save-write", limit: 30, window: "1m" });
      if (limited) return limited;
    }
    await saveOpportunity(userId, id);
    return Response.json({ saved: true, opportunityId: id });
  });
}
