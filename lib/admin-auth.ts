import { createHmac } from "node:crypto";

const ADMIN_SESSION_COOKIE = "nextup_admin_session";

export function adminSessionToken(key = process.env.ADMIN_REVIEW_KEY) {
  if (!key) return "";
  return createHmac("sha256", key).update("nextup-admin-session-v1").digest("hex");
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  return cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? "";
}

export function requireAdmin(request: Request) {
  const configuredKey = process.env.ADMIN_REVIEW_KEY;
  if (!configuredKey) {
    return process.env.NODE_ENV === "production"
      ? Response.json({ error: "Admin access is unavailable until ADMIN_REVIEW_KEY is configured." }, { status: 503 })
      : null;
  }
  return request.headers.get("x-admin-key") === configuredKey || cookieValue(request, ADMIN_SESSION_COOKIE) === adminSessionToken(configuredKey)
    ? null
    : Response.json({ error: "Admin authorization required" }, { status: 401 });
}

export { ADMIN_SESSION_COOKIE };
