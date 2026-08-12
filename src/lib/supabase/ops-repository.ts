import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityUnit, NoveltyType } from "@/lib/domain";
import type { OpsIdentity } from "@/lib/ops-session";
import { createClient } from "@/lib/supabase/client";
import {
  canonicalPlantId,
  mapRemoteActivities,
  mapRemoteEmployee,
  mapRemoteReceipt,
  type OpsAccessRole,
  type PlantAccess,
  type RemoteActivityRow,
  type RemoteActivityWorkerRow,
  type RemoteEmployeeRow,
  type RemoteOpsSnapshot,
  type RemoteReceiptRow,
  type RemoteScheduledActivityRow,
} from "@/lib/ops-data-contract";

type MembershipRow = {
  plant_id: string;
  role: OpsAccessRole;
  active: boolean;
  plants: { id: string; code: string; name: string; active: boolean } | { id: string; code: string; name: string; active: boolean }[] | null;
};

type ProfileRow = { display_name: string; active: boolean };

export type RemoteCreateActivityPayload = {
  plantId: string;
  title: string;
  process: string;
  workerIds: string[];
  equipment?: string;
};

export type RemoteFinishActivityPayload = {
  quantity?: number;
  unit?: ActivityUnit;
  noveltyType?: NoveltyType;
  novelty?: string;
  openIncident?: boolean;
};

export type RemoteReceptionPayload = {
  plantId: string;
  generator: string;
  route: string;
  wasteType: RemoteReceiptRow["waste_type"];
  netWeightKg: number;
  rejectionKg: number;
  acceptance: Exclude<RemoteReceiptRow["acceptance_status"], "unknown">;
  observation?: string;
  startedAt: string;
};

function errorMessage(scope: string, error: { message?: string } | null) {
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function onePlant(value: MembershipRow["plants"]) {
  return Array.isArray(value) ? value[0] : value;
}

function remotePlantId(access: PlantAccess[], plantId: string) {
  const plant = access.find((item) => item.plantId === plantId);
  if (!plant) throw new Error(`No tienes acceso a la planta ${plantId}.`);
  return plant.dbId;
}

export async function loadRemoteIdentity(client: SupabaseClient = createClient()): Promise<OpsIdentity> {
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw new Error(errorMessage("No fue posible validar la sesión", authError));
  if (!authData.user) throw new Error("No hay una sesión autenticada para GREENATICS OPS.");

  const { data, error } = await client
    .from("profiles")
    .select("display_name,active")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (error) throw new Error(errorMessage("No fue posible cargar el perfil", error));
  const profile = data as ProfileRow | null;
  if (!profile) throw new Error("La cuenta autenticada todavía no tiene un perfil operativo creado.");
  if (!profile.active) throw new Error("El perfil de esta cuenta está inactivo.");

  return {
    userId: authData.user.id,
    displayName: profile.display_name,
    email: authData.user.email || undefined,
  };
}

export async function loadPlantAccess(client: SupabaseClient = createClient()): Promise<PlantAccess[]> {
  const { data: authData, error: authError } = await client.auth.getUser();
  if (authError) throw new Error(errorMessage("No fue posible validar la sesión", authError));
  if (!authData.user) throw new Error("No hay una sesión autenticada para GREENATICS OPS.");

  const { data, error } = await client
    .from("plant_memberships")
    .select("plant_id,role,active,plants!inner(id,code,name,active)")
    .eq("user_id", authData.user.id)
    .eq("active", true);
  if (error) throw new Error(errorMessage("No fue posible cargar las plantas autorizadas", error));

  return ((data ?? []) as unknown as MembershipRow[])
    .map((membership) => {
      const plant = onePlant(membership.plants);
      if (!plant || !plant.active) return null;
      return {
        dbId: plant.id,
        plantId: canonicalPlantId(plant.code, plant.name),
        code: plant.code,
        name: plant.name,
        role: membership.role,
      } satisfies PlantAccess;
    })
    .filter((plant): plant is PlantAccess => Boolean(plant));
}

export async function loadRemoteOpsSnapshot(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<RemoteOpsSnapshot> {
  if (access.length === 0) return { workers: [], activities: [], receptions: [] };
  const plantDbIds = access.map((plant) => plant.dbId);

  const [employeesResult, scheduledResult, activitiesResult, workersResult, receiptsResult] = await Promise.all([
    client
      .from("employees")
      .select("id,plant_id,display_name,historical")
      .in("plant_id", plantDbIds)
      .eq("active", true)
      .order("display_name"),
    client
      .from("scheduled_activities")
      .select("id,plant_id,title,process,planned_start,planned_end,status,equipment_ref")
      .in("plant_id", plantDbIds)
      .order("planned_start", { ascending: false }),
    client
      .from("activities")
      .select("id,plant_id,scheduled_activity_id,title,process,started_at,ended_at,quantity,unit,notes,equipment_ref,novelty_type,source_kind,import_run_id,source_row_ids")
      .in("plant_id", plantDbIds)
      .order("started_at", { ascending: false }),
    client
      .from("activity_workers")
      .select("activity_id,employee_id"),
    client
      .from("material_receipts")
      .select("id,plant_id,generator,route,waste_type,net_weight_kg,rejection_kg,rejection_known,acceptance_status,observation,started_at,ended_at,lot_code,source_kind,time_precision,import_run_id,source_row_ids")
      .in("plant_id", plantDbIds)
      .order("ended_at", { ascending: false }),
  ]);

  if (employeesResult.error) throw new Error(errorMessage("No fue posible cargar trabajadores", employeesResult.error));
  if (scheduledResult.error) throw new Error(errorMessage("No fue posible cargar la programación", scheduledResult.error));
  if (activitiesResult.error) throw new Error(errorMessage("No fue posible cargar actividades", activitiesResult.error));
  if (workersResult.error) throw new Error(errorMessage("No fue posible cargar participantes", workersResult.error));
  if (receiptsResult.error) throw new Error(errorMessage("No fue posible cargar recepciones", receiptsResult.error));

  return {
    workers: ((employeesResult.data ?? []) as unknown as RemoteEmployeeRow[]).map((row) => mapRemoteEmployee(row, access)),
    activities: mapRemoteActivities(
      (scheduledResult.data ?? []) as unknown as RemoteScheduledActivityRow[],
      (activitiesResult.data ?? []) as unknown as RemoteActivityRow[],
      (workersResult.data ?? []) as unknown as RemoteActivityWorkerRow[],
      access,
    ),
    receptions: ((receiptsResult.data ?? []) as unknown as RemoteReceiptRow[]).map((row) => mapRemoteReceipt(row, access)),
  };
}

export async function startRemoteScheduledActivity(
  scheduledActivityId: string,
  workerIds: string[],
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_start_scheduled_activity", {
    scheduled_id: scheduledActivityId,
    employee_ids: workerIds,
  });
  if (error) throw new Error(errorMessage("No fue posible iniciar la actividad", error));
  if (typeof data !== "string") throw new Error("La actividad fue iniciada pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function createRemoteUnplannedActivity(
  access: PlantAccess[],
  payload: RemoteCreateActivityPayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_create_unplanned_activity", {
    target_plant: remotePlantId(access, payload.plantId),
    activity_title: payload.title,
    activity_process: payload.process,
    employee_ids: payload.workerIds,
    equipment_ref: payload.equipment || null,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar la actividad", error));
  if (typeof data !== "string") throw new Error("La actividad fue creada pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function finishRemoteActivity(
  activityId: string,
  payload: RemoteFinishActivityPayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_finish_activity", {
    target_activity: activityId,
    result_quantity: payload.quantity ?? null,
    result_unit: payload.unit ?? null,
    novelty_kind: payload.noveltyType ?? null,
    activity_notes: payload.novelty || null,
    open_incident: payload.openIncident ?? false,
  });
  if (error) throw new Error(errorMessage("No fue posible finalizar la actividad", error));
  if (typeof data !== "string") throw new Error("La actividad fue finalizada pero el servidor no devolvió la hora de cierre.");
  return data;
}

export async function createRemoteReception(
  access: PlantAccess[],
  payload: RemoteReceptionPayload,
  client: SupabaseClient = createClient(),
) {
  const endedAt = new Date().toISOString();
  const { data, error } = await client.rpc("ops_record_material_receipt", {
    target_plant: remotePlantId(access, payload.plantId),
    generator_name: payload.generator,
    route_name: payload.route,
    waste_kind: payload.wasteType,
    net_weight: payload.netWeightKg,
    rejection_weight: payload.rejectionKg,
    acceptance_kind: payload.acceptance,
    receipt_started_at: payload.startedAt,
    receipt_ended_at: endedAt,
    observation_text: payload.observation || null,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar la recepción", error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.id !== "string" || typeof row.lot_code !== "string") {
    throw new Error("La recepción fue registrada pero el servidor no devolvió lote e identificador válidos.");
  }
  return { id: row.id as string, lotCode: row.lot_code as string };
}

export async function signOutRemote(client: SupabaseClient = createClient()) {
  const { error } = await client.auth.signOut();
  if (error) throw new Error(errorMessage("No fue posible cerrar la sesión", error));
}
