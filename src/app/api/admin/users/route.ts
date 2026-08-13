import { NextRequest, NextResponse } from "next/server";
import type { OpsAccessRole } from "@/lib/ops-data-contract";
import { validateInviteUserInput, validateUpdateUserInput, type UserMembershipAssignment } from "@/lib/admin-users";
import { INVITE_ACCEPTANCE_PATH } from "@/lib/invite-acceptance";
import { createAdminClient, getAppBaseUrl, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type ManagedPlant = { plantId: string; code: string; name: string; managerRole: "admin" | "director" };
type MembershipRow = { user_id: string; display_name: string; plant_id: string; plant_name: string; role: OpsAccessRole; active: boolean };
type JoinedPlant = { id: string; code: string; name: string; active: boolean };
type OwnMembershipRow = { plant_id: string; role: "admin" | "director"; plants: JoinedPlant | JoinedPlant[] | null };

function noStoreJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, { status });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
function onePlant(value: OwnMembershipRow["plants"]) {
  return Array.isArray(value) ? value[0] : value;
}

async function adminContext() {
  if (!isSupabaseAdminConfigured()) return { ok: false as const, status: 503, error: "Administración de usuarios no configurada en este entorno." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false as const, status: 401, error: "Sesión requerida." };

  const { data, error } = await supabase
    .from("plant_memberships")
    .select("plant_id,role,plants!inner(id,code,name,active)")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["admin", "director"]);
  if (error) return { ok: false as const, status: 500, error: "No fue posible validar permisos administrativos." };

  const managedPlants = ((data ?? []) as unknown as OwnMembershipRow[]).flatMap((row) => {
    const plant = onePlant(row.plants);
    if (!plant || !plant.active) return [];
    return [{ plantId: plant.id, code: plant.code, name: plant.name, managerRole: row.role } satisfies ManagedPlant];
  });
  if (!managedPlants.length) return { ok: false as const, status: 403, error: "No tienes plantas administrables." };
  return { ok: true as const, supabase, managedPlants };
}

function authorizeAssignments(assignments: UserMembershipAssignment[], managedPlants: ManagedPlant[]) {
  const byId = new Map(managedPlants.map((plant) => [plant.plantId, plant]));
  for (const assignment of assignments) {
    const plant = byId.get(assignment.plantId);
    if (!plant) return `No administras la planta ${assignment.plantId}.`;
    if (assignment.role === "director" && plant.managerRole !== "director") return `Solo un director puede asignar otro director en ${plant.name}.`;
  }
  return undefined;
}

export async function GET() {
  const context = await adminContext();
  if (!context.ok) return noStoreJson({ ok: false, error: context.error }, context.status);

  const { data, error } = await context.supabase.rpc("admin_memberships_for_managed_plants");
  if (error) return noStoreJson({ ok: false, error: "No fue posible cargar membresías." }, 500);
  const memberships = (data ?? []) as unknown as MembershipRow[];
  const userIds = new Set(memberships.map((row) => row.user_id));

  const admin = createAdminClient();
  const { data: userData, error: userError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (userError) return noStoreJson({ ok: false, error: "No fue posible cargar usuarios de Auth." }, 500);
  const emailById = new Map(userData.users.filter((user) => userIds.has(user.id)).map((user) => [user.id, user.email ?? ""]));
  const users = new Map<string, { id: string; email: string; displayName: string; memberships: Array<{ plantId: string; plantName: string; role: OpsAccessRole; active: boolean }> }>();

  for (const row of memberships) {
    const current = users.get(row.user_id) ?? { id: row.user_id, email: emailById.get(row.user_id) ?? "", displayName: row.display_name, memberships: [] };
    current.memberships.push({ plantId: row.plant_id, plantName: row.plant_name, role: row.role, active: row.active });
    users.set(row.user_id, current);
  }
  return noStoreJson({ ok: true, managedPlants: context.managedPlants, users: [...users.values()] });
}

export async function POST(request: NextRequest) {
  const context = await adminContext();
  if (!context.ok) return noStoreJson({ ok: false, error: context.error }, context.status);
  const baseUrl = getAppBaseUrl();
  if (!baseUrl) return noStoreJson({ ok: false, error: "APP_BASE_URL no está configurado con un origen válido." }, 503);

  let raw: unknown;
  try { raw = await request.json(); } catch { return noStoreJson({ ok: false, error: "JSON inválido." }, 400); }
  const parsed = validateInviteUserInput(raw);
  if (!parsed.ok) return noStoreJson(parsed, 400);
  const authorizationError = authorizeAssignments(parsed.value.assignments, context.managedPlants);
  if (authorizationError) return noStoreJson({ ok: false, error: authorizationError }, 403);

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.value.email, {
    data: { display_name: parsed.value.displayName },
    redirectTo: `${baseUrl}${INVITE_ACCEPTANCE_PATH}`,
  });
  if (error) {
    const alreadyExists = error.message.toLowerCase().includes("already");
    return noStoreJson({ ok: false, error: alreadyExists ? "Ese correo ya pertenece a un usuario. Edita sus membresías en lugar de invitarlo de nuevo." : "No fue posible enviar la invitación." }, alreadyExists ? 409 : 502);
  }
  const invitedUserId = data.user?.id;
  if (!invitedUserId) return noStoreJson({ ok: false, error: "Supabase no devolvió el usuario invitado." }, 502);

  const { error: membershipError } = await context.supabase.rpc("admin_set_user_memberships", {
    target_user: invitedUserId,
    target_display_name: parsed.value.displayName,
    assignments: parsed.value.assignments,
  });
  if (membershipError) {
    await admin.auth.admin.deleteUser(invitedUserId);
    return noStoreJson({ ok: false, error: "La invitación se revirtió porque no fue posible asignar las membresías." }, 500);
  }
  return noStoreJson({ ok: true, userId: invitedUserId }, 201);
}

export async function PATCH(request: NextRequest) {
  const context = await adminContext();
  if (!context.ok) return noStoreJson({ ok: false, error: context.error }, context.status);

  let raw: unknown;
  try { raw = await request.json(); } catch { return noStoreJson({ ok: false, error: "JSON inválido." }, 400); }
  const parsed = validateUpdateUserInput(raw);
  if (!parsed.ok) return noStoreJson(parsed, 400);
  const authorizationError = authorizeAssignments(parsed.value.assignments, context.managedPlants);
  if (authorizationError) return noStoreJson({ ok: false, error: authorizationError }, 403);

  const { error } = await context.supabase.rpc("admin_set_user_memberships", {
    target_user: parsed.value.userId,
    target_display_name: parsed.value.displayName,
    assignments: parsed.value.assignments,
  });
  if (error) return noStoreJson({ ok: false, error: "No fue posible actualizar las membresías." }, 500);
  return noStoreJson({ ok: true });
}
