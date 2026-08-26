import { NextResponse } from "next/server";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

async function canReadPublicLeads() {
  if (!isSupabaseAdminConfigured()) return false;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("plant_memberships")
    .select("id")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["admin", "director"])
    .limit(1);
  if (error) return false;
  return Boolean(data?.length);
}

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return noStoreJson({ error: "Admin backend no configurado." }, 503);
  }
  if (!(await canReadPublicLeads())) {
    return noStoreJson({ error: "No autorizado." }, 403);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("public_leads")
    .select("id,status,name,email,phone,organization,role_title,audience,need,location,service,product,crop,context,details,consent_at,created_at,retention_expires_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return noStoreJson({ error: "No fue posible consultar las solicitudes." }, 500);
  return noStoreJson({ leads: data ?? [] });
}
