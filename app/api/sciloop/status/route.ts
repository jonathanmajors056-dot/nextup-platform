import { NextResponse } from "next/server";
import { readSciloopStatus } from "@/lib/sciloop-adapter";

export async function GET() {
  return NextResponse.json(await readSciloopStatus());
}
