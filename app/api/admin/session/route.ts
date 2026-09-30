import { ADMIN_SESSION_COOKIE, adminSessionToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const configuredKey = process.env.ADMIN_REVIEW_KEY;
  if (!configuredKey) return Response.json({ error: "Admin access is not configured." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.key !== "string" || body.key !== configuredKey) return Response.json({ error: "Invalid admin key." }, { status: 401 });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const response = Response.json({ ok: true });
  response.headers.set("Set-Cookie", `${ADMIN_SESSION_COOKIE}=${adminSessionToken(configuredKey)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secure}`);
  return response;
}
