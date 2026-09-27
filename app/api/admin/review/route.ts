import { listReview } from "@/lib/store";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  return Response.json({ data: await listReview() });
}
