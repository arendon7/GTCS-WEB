import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  canonicalPlantId,
  mapRemoteEmployee,
  mapRemoteReceipt,
  type OpsAccessRole,
  type PlantAccess,
  type RemoteEmployeeRow,
  type RemoteOpsSnapshot,
  type RemoteReceiptRow,
} from "@/lib/ops-data-contract";

type MembershipRow = {
  plant_id: string;
  role: OpsAccessRole;
  active: boolean;
  plants: { id: string; code: string; name: string; active: boolean } | { id: string; code: string; name: string; active: boolean }[] | null;
};

function errorMessage(scope: string, error: { message?: string } | null) {
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function onePlant(value: MembershipRow["plants"]) {
  return Array.isArray(value) ? value[0] : value;
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

  const [employeesResult, receiptsResult] = await Promise.all([
    client
      .from("employees")
      .select("id,plant_id,display_name,historical")
      .in("plant_id", plantDbIds)
      .eq("active", true)
      .order("display_name"),
    client
      .from("material_receipts")
      .select("id,plant_id,generator,route,waste_type,net_weight_kg,rejection_kg,rejection_known,acceptance_status,observation,started_at,ended_at,lot_code,source_kind,time_precision,import_run_id,source_row_ids")
      .in("plant_id", plantDbIds)
      .order("ended_at", { ascending: false }),
  ]);

  if (employeesResult.error) throw new Error(errorMessage("No fue posible cargar trabajadores", employeesResult.error));
  if (receiptsResult.error) throw new Error(errorMessage("No fue posible cargar recepciones", receiptsResult.error));

  return {
    workers: ((employeesResult.data ?? []) as unknown as RemoteEmployeeRow[]).map((row) => mapRemoteEmployee(row, access)),
    activities: [],
    receptions: ((receiptsResult.data ?? []) as unknown as RemoteReceiptRow[]).map((row) => mapRemoteReceipt(row, access)),
  };
}
