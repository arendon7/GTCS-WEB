import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const allowedStatuses = new Set(["new", "contacted", "closed", "discarded"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

async function canManagePublicLeads() {
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

async function authorize() {
  if (!isSupabaseAdminConfigured()) return noStoreJson({ error: "Admin backend no configurado." }, 503);
  if (!(await canManagePublicLeads())) return noStoreJson({ error: "No autorizado." }, 403);
  return null;
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("public_leads")
    .select("id,status,name,email,phone,organization,role_title,audience,need,location,service,product,crop,context,details,consent_at,created_at,updated_at,retention_expires_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return noStoreJson({ error: "No fue posible consultar las solicitudes." }, 500);
  return noStoreJson({ leads: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Solicitud inválida." }, 400);
  }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const id = typeof input.id === "string" ? input.id : "";
  const status = typeof input.status === "string" ? input.status : "";
  if (!uuidPattern.test(id) || !allowedStatuses.has(status)) return noStoreJson({ error: "Solicitud inválida." }, 400);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("public_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,status,updated_at")
    .maybeSingle();
  if (error) return noStoreJson({ error: "No fue posible actualizar la solicitud." }, 500);
  if (!data) return noStoreJson({ error: "Solicitud no encontrada." }, 404);
  return noStoreJson({ lead: data });
}

export async function DELETE(request: NextRequest) {
  const denied = await authorize();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Solicitud inválida." }, 400);
  }
  const input = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const id = typeof input.id === "string" ? input.id : "";
  if (!uuidPattern.test(id)) return noStoreJson({ error: "Solicitud inválida." }, 400);

  const admin = createAdminClient();
  const { data, error } = await admin.from("public_leads").delete().eq("id", id).select("id").maybeSingle();
  if (error) return noStoreJson({ error: "No fue posible eliminar la solicitud." }, 500);
  if (!data) return noStoreJson({ error: "Solicitud no encontrada." }, 404);
  return noStoreJson({ ok: true });
}
