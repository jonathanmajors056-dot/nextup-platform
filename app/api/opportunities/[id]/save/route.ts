import { getOpportunity, saveOpportunity } from "@/lib/store";
import { createViewerId, getAuthenticatedViewerId, VIEWER_COOKIE } from "@/lib/identity";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await getOpportunity(id))) return Response.json({ error: "Opportunity not found" }, { status: 404 });
  const authenticatedViewer = await getAuthenticatedViewerId();
  const existingViewer = request.headers.get("cookie")?.match(new RegExp(`(?:^|;\\s*)${VIEWER_COOKIE}=([^;]+)`))?.[1];
  const userId = authenticatedViewer ?? (existingViewer && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existingViewer)
    ? existingViewer
    : createViewerId());
  await saveOpportunity(userId, id);
  const response = Response.json({ saved: true, opportunityId: id });
  if (!authenticatedViewer && !existingViewer) response.headers.append("Set-Cookie", `${VIEWER_COOKIE}=${userId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
  return response;
}
