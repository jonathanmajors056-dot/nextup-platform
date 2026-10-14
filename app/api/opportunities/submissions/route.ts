import { NextResponse } from "next/server";

type Submission = { title: string; sourceUrl: string; context: string };
const submissions: Array<Submission & { id: string; status: "queued" }> = [];

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Submission>;
  if (!body.title || !body.sourceUrl || !body.context) {
    return NextResponse.json({ ok: false, error: "Title, source URL, and student context are required." }, { status: 400 });
  }
  const submission = { id: `signal-${Date.now()}`, title: body.title, sourceUrl: body.sourceUrl, context: body.context, status: "queued" as const };
  submissions.push(submission);
  return NextResponse.json({ ok: true, submission }, { status: 202 });
}
