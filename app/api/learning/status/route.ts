import { NextResponse } from "next/server";
import { attachViewerCookie, inspectLearningPersistence, viewerIdFromRequest } from "@/lib/learning-persistence";

export async function GET(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  const persistence = await inspectLearningPersistence(viewerId);
  const response = NextResponse.json({
    ...persistence,
    modelVersion: "adaptive-v1.2",
    migration: persistence.ready ? "applied" : "apply supabase/learning.sql to enable shared profile memory",
  });
  attachViewerCookie(response, viewerId, request);
  return response;
}
