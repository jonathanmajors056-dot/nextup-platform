import { NextResponse } from "next/server";
import { LEARNING_MODEL_VERSION } from "@/lib/learning-engine";
import { attachViewerCookie, inspectLearningPersistence, viewerIdFromRequest } from "@/lib/learning-persistence";

function migrationUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) return null;
  try {
    const projectRef = new URL(configuredUrl).hostname.split(".")[0];
    return `https://supabase.com/dashboard/project/${projectRef}/sql/new`;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  const persistence = await inspectLearningPersistence(viewerId);
  const response = NextResponse.json({
    ...persistence,
    modelVersion: LEARNING_MODEL_VERSION,
    migration: persistence.ready ? "applied" : "apply supabase/learning.sql to enable shared profile memory",
    migrationUrl: persistence.ready ? null : migrationUrl(),
  });
  attachViewerCookie(response, viewerId, request);
  return response;
}
