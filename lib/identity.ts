import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase/server";

export const VIEWER_COOKIE = "nextup-viewer";

function isUuid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

/**
 * Returns the browser's stable anonymous workspace id. This is deliberately
 * server-only: callers never need to send a user id from the browser.
 */
export async function getViewerId() {
  const authenticated = await getAuthenticatedViewerId();
  if (authenticated) return authenticated;
  const value = (await cookies()).get(VIEWER_COOKIE)?.value;
  return isUuid(value) ? value : "demo-student";
}

export async function getAuthenticatedViewerId() {
  const client = await createSupabaseServerClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}

export function createViewerId() {
  return crypto.randomUUID();
}

export function viewerIdFromRequest(request: Request) {
  const value = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${VIEWER_COOKIE}=([^;]+)`))?.[1];
  return isUuid(value) ? value : createViewerId();
}

export function attachViewerCookie(response: Response, viewerId: string, request: Request) {
  if (!request.headers.get("cookie")?.includes(`${VIEWER_COOKIE}=`)) {
    response.headers.append("Set-Cookie", `${VIEWER_COOKIE}=${viewerId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  }
  return response;
}
