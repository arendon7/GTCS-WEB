import { NextResponse } from "next/server";
import { getDataMode,isSupabaseConfigured } from "@/lib/data-mode";
import { createAdminClient,isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic="force-dynamic";

export async function GET(){
  const mode=getDataMode();
  const checks:{backend:"ok"|"missing"|"error";admin:"ok"|"missing"|"error"}={
    backend:isSupabaseConfigured()?"ok":"missing",
    admin:isSupabaseAdminConfigured()?"ok":"missing",
  };

  if(mode==="supabase"&&isSupabaseAdminConfigured()){
    try{
      const admin=createAdminClient();
      const {error}=await admin.from("plants").select("id",{head:true,count:"exact"}).limit(1);
      if(error)checks.backend="error";
      const {error:authError}=await admin.auth.admin.listUsers({page:1,perPage:1});
      if(authError)checks.admin="error";
    }catch{
      checks.backend="error";
      checks.admin="error";
    }
  }

  const ready=mode==="local"||(checks.backend==="ok"&&checks.admin==="ok");
  const response=NextResponse.json({status:ready?"ready":"degraded",mode,checks,runtime:process.env.VERCEL_ENV||process.env.NODE_ENV||"unknown"},{status:ready?200:503});
  response.headers.set("Cache-Control","no-store");
  return response;
}
