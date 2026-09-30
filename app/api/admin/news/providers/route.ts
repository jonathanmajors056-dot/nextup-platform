import { requireAdmin } from "@/lib/admin-auth";
import { listNewsProviders } from "@/lib/news";
export async function GET(request: Request) { const denied = requireAdmin(request); if (denied) return denied; return Response.json({ providers: listNewsProviders(), checkedAt: new Date().toISOString() }); }
