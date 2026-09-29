import { z } from "zod";
import { getApplicationStatus, getOpportunity, setApplicationStatus } from "@/lib/store";
import { authErrorResponse, requireUser } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withRequestLogging } from "@/lib/logging";

const progressSchema = z.object({
  status: z.enum(["saved", "applying", "applied", "shortlisted", "won", "not_selected"]),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRequestLogging(request, "/api/opportunities/[id]/progress", async () => {
    const { id } = await params;
    if (!(await getOpportunity(id))) return Response.json({ error: "Opportunity not found" }, { status: 404 });
    let userId = "demo-student";
    if (hasSupabaseConfig()) {
      try {
        userId = (await requireUser()).id;
      } catch (error) {
        return authErrorResponse(error);
      }
    }
    return Response.json({ status: await getApplicationStatus(userId, id) });
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRequestLogging(request, "/api/opportunities/[id]/progress", async () => {
    const { id } = await params;
    if (!(await getOpportunity(id))) return Response.json({ error: "Opportunity not found" }, { status: 404 });
    let userId = "demo-student";
    if (hasSupabaseConfig()) {
      try {
        userId = (await requireUser()).id;
        const limited = await enforceRateLimit(request, { name: "progress-write", limit: 30, window: "1m", userId });
        if (limited) return limited;
      } catch (error) {
        return authErrorResponse(error);
      }
    } else {
      const limited = await enforceRateLimit(request, { name: "progress-write", limit: 30, window: "1m" });
      if (limited) return limited;
    }
    const parsed = progressSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ error: "Choose a valid application status" }, { status: 400 });
    await setApplicationStatus(userId, id, parsed.data.status);
    return Response.json({ status: parsed.data.status });
  });
}
