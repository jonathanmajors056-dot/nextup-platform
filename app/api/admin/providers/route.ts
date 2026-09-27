import { listProviders } from "@/lib/providers";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const denied = requireAdmin(request); if (denied) return denied;
  return Response.json({ providers: listProviders(), generatedAt: new Date().toISOString() });
}
