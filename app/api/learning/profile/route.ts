import { NextResponse } from "next/server";
import { deriveLearningProfile, type LearningEvent } from "@/lib/learning-engine";
import { attachCookieLearning, attachViewerCookie, loadCookieLearning, loadPersistedLearning, persistLearning, viewerIdFromRequest } from "@/lib/learning-persistence";

function parseEvents(body: unknown) {
  const values = body && typeof body === "object" && "events" in body ? (body as { events?: unknown }).events : [];
  return Array.isArray(values) ? values.filter((event: unknown): event is LearningEvent => Boolean(event) && typeof event === "object" && typeof (event as LearningEvent).timestamp === "string" && typeof (event as LearningEvent).type === "string").slice(-80) : [];
}

export async function GET(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  const cookieEvents = loadCookieLearning(request);
  try {
    const persisted = await loadPersistedLearning(viewerId);
    const events = persisted ?? cookieEvents;
    const response = NextResponse.json({ profile: deriveLearningProfile(events), events, accepted: events.length, mode: persisted ? "persistent-learning-loop" : cookieEvents.length ? "cookie-learning-loop" : "local-learning-loop", modelVersion: "adaptive-v1.1" });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, events);
  } catch {
    const response = NextResponse.json({ profile: deriveLearningProfile(cookieEvents), events: cookieEvents, accepted: cookieEvents.length, mode: cookieEvents.length ? "cookie-learning-loop" : "local-learning-loop", modelVersion: "adaptive-v1.1" });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, cookieEvents);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const viewerId = viewerIdFromRequest(request);
  const events = parseEvents(body);
  const cookieEvents = loadCookieLearning(request);
  const merged = [...cookieEvents, ...events].filter((event, index, all) => all.findIndex((candidate) => candidate.type === event.type && candidate.opportunityId === event.opportunityId && candidate.timestamp === event.timestamp) === index).slice(-80);
  try {
    const persisted = await persistLearning(viewerId, events.slice(-1));
    const stored = persisted ? (await loadPersistedLearning(viewerId)) ?? [] : merged;
    const response = NextResponse.json({ profile: deriveLearningProfile(stored), events: stored, accepted: events.length, mode: persisted ? "persistent-learning-loop" : "cookie-learning-loop", modelVersion: "adaptive-v1.1" });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, stored);
  } catch {
    const response = NextResponse.json({ profile: deriveLearningProfile(merged), events: merged, accepted: events.length, mode: "cookie-learning-loop", modelVersion: "adaptive-v1.1" });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, merged);
  }
}
