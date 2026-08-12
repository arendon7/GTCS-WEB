import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value:string|null){return value&&value.startsWith("/")&&!value.startsWith("//")?value:"/account/setup";}

export async function GET(request:NextRequest){
  const tokenHash=request.nextUrl.searchParams.get("token_hash");
  const type=request.nextUrl.searchParams.get("type") as EmailOtpType|null;
  const next=safeNext(request.nextUrl.searchParams.get("next"));
  const redirectTo=request.nextUrl.clone();
  redirectTo.pathname=next;
  redirectTo.search="";

  if(tokenHash&&type){
    const supabase=await createClient();
    const {error}=await supabase.auth.verifyOtp({type,token_hash:tokenHash});
    if(!error){
      const response=NextResponse.redirect(redirectTo);
      response.headers.set("Cache-Control","private, no-store");
      return response;
    }
  }

  redirectTo.pathname="/login";
  redirectTo.searchParams.set("auth_error","invalid-or-expired-link");
  const response=NextResponse.redirect(redirectTo);
  response.headers.set("Cache-Control","private, no-store");
  return response;
}
