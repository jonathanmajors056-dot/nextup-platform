import { NextResponse } from "next/server";
import { readSciloopSignals } from "@/lib/sciloop-adapter";

export async function GET() {
  return NextResponse.json(await readSciloopSignals());
}
