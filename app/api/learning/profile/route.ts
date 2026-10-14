import { NextResponse } from "next/server";
import { deriveLearningProfile, type LearningEvent } from "@/lib/learning-engine";
import { attachViewerCookie, loadPersistedLearning, persistLearning, viewerIdFromRequest } from "@/lib/learning-persistence";

function parseEvents(body: unknown) {
  const values = body && typeof body === "object" && "events" in body ? (body as { events?: unknown }).events : [];
  return Array.isArray(values) ? values.filter((event: unknown): event is LearningEvent => Boolean(event) && typeof event === "object" && typeof (event as LearningEvent).timestamp === "string" && typeof (event as LearningEvent).type === "string").slice(-80) : [];
}

export async function GET(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  try {
    const persisted = await loadPersistedLearning(viewerId);
    const events = persisted ?? [];
    return attachViewerCookie(NextResponse.json({ profile: deriveLearningProfile(events), events, accepted: events.length, mode: persisted ? "persistent-learning-loop" : "local-learning-loop", modelVersion: "adaptive-v1.1" }), viewerId, request);
  } catch {
    return attachViewerCookie(NextResponse.json({ profile: deriveLearningProfile([]), events: [], accepted: 0, mode: "local-learning-loop", modelVersion: "adaptive-v1.1" }), viewerId, request);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const viewerId = viewerIdFromRequest(request);
  const events = parseEvents(body);
  try {
    const persisted = await persistLearning(viewerId, events.slice(-1));
    const stored = persisted ? (await loadPersistedLearning(viewerId)) ?? [] : events;
    return attachViewerCookie(NextResponse.json({ profile: deriveLearningProfile(stored), events: stored, accepted: events.length, mode: persisted ? "persistent-learning-loop" : "local-learning-loop", modelVersion: "adaptive-v1.1" }), viewerId, request);
  } catch {
    return attachViewerCookie(NextResponse.json({ profile: deriveLearningProfile(events), events, accepted: events.length, mode: "local-learning-loop", modelVersion: "adaptive-v1.1" }), viewerId, request);
  }
}
