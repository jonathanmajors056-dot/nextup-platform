import { NextResponse } from "next/server";
import { deriveLearningProfile, type LearningEvent } from "@/lib/learning-engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const events = Array.isArray(body.events) ? body.events as LearningEvent[] : [];
  return NextResponse.json({ profile: deriveLearningProfile(events), accepted: events.length, mode: "local-learning-loop" });
}
