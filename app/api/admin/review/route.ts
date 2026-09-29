import { listReview } from "@/lib/store";
import { authErrorResponse, requireAdmin } from "@/lib/auth/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { enforceRateLimit } from "@/lib/rate-limit";
import { withRequestLogging } from "@/lib/logging";

export async function GET(request: Request) {
  return withRequestLogging(request, "/api/admin/review", async () => {
    try {
      const admin = hasSupabaseConfig() ? await requireAdmin() : null;
      const limited = await enforceRateLimit(request, { name: "admin-review-read", limit: 60, window: "1m", userId: admin?.id });
      if (limited) return limited;
    } catch (error) {
      return authErrorResponse(error);
    }
    return Response.json({ data: await listReview() });
  });
}
