import { NextResponse } from "next/server";
import { createAccessToken } from "@/lib/access-gate";

export async function POST(request: Request) {
  const { code } = await request.json().catch(() => ({ code: "" }));
  const secret = process.env.MEASURESURE_ACCESS_CODE ?? "";

  if (!secret || typeof code !== "string" || code !== secret) {
    return NextResponse.json({ ok: false, message: "That access code is not valid." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("measuresure_access", await createAccessToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
