import { listProviders } from "@/lib/providers";

export async function GET(request: Request) {
  if (process.env.ADMIN_REVIEW_KEY && request.headers.get("x-admin-key") !== process.env.ADMIN_REVIEW_KEY) return Response.json({ error: "Admin authorization required" }, { status: 401 });
  return Response.json({ providers: listProviders(), generatedAt: new Date().toISOString() });
}
