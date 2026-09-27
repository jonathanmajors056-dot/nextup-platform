import { archiveExpiredOpportunities } from "@/lib/store";

function authorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) return request.headers.get("authorization") === `Bearer ${cronSecret}`;
  return !process.env.ADMIN_REVIEW_KEY || request.headers.get("x-admin-key") === process.env.ADMIN_REVIEW_KEY;
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Admin authorization required" }, { status: 401 });
  return Response.json({ archived: await archiveExpiredOpportunities(), archivedAt: new Date().toISOString() });
}
