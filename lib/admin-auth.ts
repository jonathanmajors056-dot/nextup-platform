export function requireAdmin(request: Request) {
  const configuredKey = process.env.ADMIN_REVIEW_KEY;
  if (!configuredKey) {
    return process.env.NODE_ENV === "production"
      ? Response.json({ error: "Admin access is unavailable until ADMIN_REVIEW_KEY is configured." }, { status: 503 })
      : null;
  }
  return request.headers.get("x-admin-key") === configuredKey
    ? null
    : Response.json({ error: "Admin authorization required" }, { status: 401 });
}
