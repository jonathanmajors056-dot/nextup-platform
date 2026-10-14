import { NextResponse } from "next/server";
import { opportunities } from "@/data/opportunities";

export function GET() {
  return NextResponse.json({ source: "nextup-local-adapter", opportunities });
}
