import { archiveExpiredOpportunities } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) return Response.json({ error: "Cron authorization required" }, { status: 401 });
  } else {
    const denied = requireAdmin(request); if (denied) return denied;
  }
  const limited = await enforceRateLimit(request, "adminSync", "expiry", true); if (limited) return limited;
  return Response.json({ archived: await archiveExpiredOpportunities(), archivedAt: new Date().toISOString() });
}
