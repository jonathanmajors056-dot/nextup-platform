import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!hasSupabaseConfig() || !code) return NextResponse.redirect(new URL("/login?error=invalid_link", url.origin));

  const supabase = await getServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=sign_in_failed", url.origin));

  return NextResponse.redirect(new URL(next, url.origin));
}
