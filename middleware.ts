import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { isValidAccessToken } from "@/lib/access-gate";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessPath = pathname === "/access" || pathname === "/api/access";
  const publicPath = pathname.startsWith("/_next") || pathname === "/favicon.ico" || /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname);
  const accessCode = process.env.MEASURESURE_ACCESS_CODE;
  if (accessCode && !accessPath && !publicPath && !(await isValidAccessToken(request.cookies.get("measuresure_access")?.value, accessCode))) {
    const url = request.nextUrl.clone();
    url.pathname = "/access";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const config = getSupabaseConfig();
  if (!config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
