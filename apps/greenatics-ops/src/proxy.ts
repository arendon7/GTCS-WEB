import { NextResponse, type NextRequest } from "next/server";
import { getOpsAccessMode, isProtectedOpsPath } from "@/lib/ops-access-policy";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isProtected = isProtectedOpsPath(pathname);

  if (!isLogin && !isProtected) return NextResponse.next({ request });

  const mode = getOpsAccessMode();
  if (mode === "local-bypass") return NextResponse.next({ request });

  if (mode === "configuration-block") {
    if (isLogin) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("reason", "configuration");
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/login",
    "/account/:path*",
    "/admin/:path*",
    "/app/:path*",
    "/activities/:path*",
    "/calendar/:path*",
    "/cash/:path*",
    "/compost/:path*",
    "/dashboard/:path*",
    "/documents/:path*",
    "/equipment/:path*",
    "/expenses/:path*",
    "/finance/:path*",
    "/imports/:path*",
    "/inventory/:path*",
    "/production/:path*",
    "/purchases/:path*",
    "/receptions/:path*",
    "/sales/:path*",
    "/supplies/:path*",
  ],
};
