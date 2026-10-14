import { NextResponse } from "next/server";
import { deriveLearningProfile, learningEventKey, LEARNING_MODEL_VERSION, normalizeLearningEvent, type LearningEvent } from "@/lib/learning-engine";
import { attachCookieLearning, attachViewerCookie, clearPersistedLearning, loadCookieLearning, loadPersistedLearning, persistLearning, viewerIdFromRequest } from "@/lib/learning-persistence";

function parseEvents(body: unknown) {
  const values = body && typeof body === "object" && "events" in body ? (body as { events?: unknown }).events : [];
  return Array.isArray(values) ? values.map(normalizeLearningEvent).filter((event): event is LearningEvent => Boolean(event)).slice(-80) : [];
}

export async function GET(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  const cookieEvents = loadCookieLearning(request);
  try {
    const persisted = await loadPersistedLearning(viewerId);
    const events = persisted ?? cookieEvents;
    const response = NextResponse.json({ profile: deriveLearningProfile(events), events, accepted: events.length, mode: persisted ? "persistent-learning-loop" : cookieEvents.length ? "cookie-learning-loop" : "local-learning-loop", modelVersion: LEARNING_MODEL_VERSION });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, events);
  } catch {
    const response = NextResponse.json({ profile: deriveLearningProfile(cookieEvents), events: cookieEvents, accepted: cookieEvents.length, mode: cookieEvents.length ? "cookie-learning-loop" : "local-learning-loop", modelVersion: LEARNING_MODEL_VERSION });
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
    const before = await loadPersistedLearning(viewerId);
    const known = new Set((before ?? cookieEvents).map(learningEventKey));
    const newEvents = events.filter((event) => !known.has(learningEventKey(event)));
    if (newEvents.length) await persistLearning(viewerId, newEvents);
    const stored = (await loadPersistedLearning(viewerId)) ?? before ?? merged;
    const response = NextResponse.json({ profile: deriveLearningProfile(stored), events: stored, accepted: newEvents.length, mode: before !== null ? "persistent-learning-loop" : "cookie-learning-loop", modelVersion: LEARNING_MODEL_VERSION });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, stored);
  } catch {
    const response = NextResponse.json({ profile: deriveLearningProfile(merged), events: merged, accepted: events.length, mode: "cookie-learning-loop", modelVersion: LEARNING_MODEL_VERSION });
    attachViewerCookie(response, viewerId, request);
    return attachCookieLearning(response, merged);
  }
}

export async function DELETE(request: Request) {
  const viewerId = viewerIdFromRequest(request);
  let mode: "persistent-learning-loop" | "cookie-learning-loop" = "cookie-learning-loop";
  try {
    if (await clearPersistedLearning(viewerId)) mode = "persistent-learning-loop";
  } catch {
    mode = "cookie-learning-loop";
  }
  const response = NextResponse.json({ profile: deriveLearningProfile([]), events: [], accepted: 0, mode, modelVersion: LEARNING_MODEL_VERSION, reset: true });
  attachViewerCookie(response, viewerId, request);
  return attachCookieLearning(response, []);
}
