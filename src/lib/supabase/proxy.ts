import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { shouldUseSupabase } from "@/lib/data-mode";
import { isProtectedOpsPath, safeOpsNext } from "@/lib/ops-routes";

export async function updateSession(request: NextRequest) {
  if (!shouldUseSupabase()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  if (!isAuthenticated && isProtectedOpsPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${path}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && path === "/login") {
    const url = request.nextUrl.clone();
    const next = safeOpsNext(request.nextUrl.searchParams.get("next"));
    const [pathname, query = ""] = next.split("?", 2);
    url.pathname = pathname;
    url.search = query ? `?${query}` : "";
    return NextResponse.redirect(url);
  }

  return response;
}
