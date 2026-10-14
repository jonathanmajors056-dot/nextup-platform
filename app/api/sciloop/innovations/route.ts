import { NextResponse } from "next/server";
import { listSciloopSignals } from "@/lib/sciloop-adapter";

export function GET() {
  return NextResponse.json({ source: "sciloop-innovation-adapter", signals: listSciloopSignals() });
}
