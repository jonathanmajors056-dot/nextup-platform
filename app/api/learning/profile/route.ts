import { NextResponse } from "next/server";
import { deriveLearningProfile, type LearningEvent } from "@/lib/learning-engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const events = Array.isArray(body.events) ? body.events.filter((event: unknown): event is LearningEvent => Boolean(event) && typeof event === "object" && typeof (event as LearningEvent).timestamp === "string" && typeof (event as LearningEvent).type === "string").slice(-80) : [];
  return NextResponse.json({ profile: deriveLearningProfile(events), accepted: events.length, mode: "local-learning-loop", modelVersion: "adaptive-v1.1" });
}
