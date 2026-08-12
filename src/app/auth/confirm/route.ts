import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { safeOpsNext } from "@/lib/ops-routes";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeOpsNext(request.nextUrl.searchParams.get("next"), "/account/setup");
  const redirectTo = request.nextUrl.clone();
  const [pathname, query = ""] = next.split("?", 2);
  redirectTo.pathname = pathname;
  redirectTo.search = query ? `?${query}` : "";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const response = NextResponse.redirect(redirectTo);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.search = "";
  redirectTo.searchParams.set("auth_error", "invalid-or-expired-link");
  const response = NextResponse.redirect(redirectTo);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
