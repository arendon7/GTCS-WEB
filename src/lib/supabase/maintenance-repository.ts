import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertSeverity } from "@/lib/domain";
import type { EquipmentRecord, MaintenanceTicket } from "@/lib/maintenance-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type EquipmentRow = {
  id: string;
  plant_id: string;
  code: string;
  name: string;
  area?: string | null;
  status: EquipmentRecord["status"];
};

type TicketRow = {
  id: string;
  equipment_id: string;
  plant_id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: MaintenanceTicket["status"];
  opened_at: string;
  repair_started_at?: string | null;
  closed_at?: string | null;
  cause?: string | null;
  resolution?: string | null;
};

export type RemoteFailurePayload = {
  equipmentId: string;
  plantId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
};

function errorMessage(scope: string, error: { message?: string; code?: string } | null) {
  if (error?.code === "23505") return `${scope}: el equipo ya tiene una falla o reparación abierta.`;
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function plantByDbId(access: PlantAccess[]) {
  return new Map(access.map((plant) => [plant.dbId, plant]));
}

function remotePlantId(access: PlantAccess[], plantId: string) {
  const plant = access.find((item) => item.plantId === plantId);
  if (!plant) throw new Error(`No tienes acceso a la planta ${plantId}.`);
  return plant.dbId;
}

export async function loadRemoteMaintenance(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<{ equipment: EquipmentRecord[]; tickets: MaintenanceTicket[] }> {
  if (access.length === 0) return { equipment: [], tickets: [] };
  const plantIds = access.map((plant) => plant.dbId);
  const [equipmentResult, ticketResult] = await Promise.all([
    client.from("equipment").select("id,plant_id,code,name,area,status").in("plant_id", plantIds).order("code"),
    client.from("maintenance_tickets").select("id,equipment_id,plant_id,severity,title,description,status,opened_at,repair_started_at,closed_at,cause,resolution").in("plant_id", plantIds).order("opened_at", { ascending: false }),
  ]);
  if (equipmentResult.error) throw new Error(errorMessage("No fue posible cargar equipos", equipmentResult.error));
  if (ticketResult.error) throw new Error(errorMessage("No fue posible cargar mantenimiento", ticketResult.error));

  const plants = plantByDbId(access);
  const equipment = ((equipmentResult.data ?? []) as unknown as EquipmentRow[]).map((row): EquipmentRecord => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Equipo ${row.id} pertenece a una planta no visible.`);
    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      code: row.code,
      name: row.name,
      area: row.area?.trim() || "Sin área",
      status: row.status,
    };
  });
  const tickets = ((ticketResult.data ?? []) as unknown as TicketRow[]).map((row): MaintenanceTicket => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Ticket ${row.id} pertenece a una planta no visible.`);
    return {
      id: row.id,
      equipmentId: row.equipment_id,
      plantId: plant.plantId,
      plant: plant.name,
      severity: row.severity,
      title: row.title,
      description: row.description,
      openedAt: row.opened_at,
      repairStartedAt: row.repair_started_at || undefined,
      closedAt: row.closed_at || undefined,
      cause: row.cause || undefined,
      resolution: row.resolution || undefined,
      status: row.status,
    };
  });
  return { equipment, tickets };
}

export async function reportRemoteFailure(
  access: PlantAccess[],
  payload: RemoteFailurePayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.from("maintenance_tickets").insert({
    equipment_id: payload.equipmentId,
    plant_id: remotePlantId(access, payload.plantId),
    severity: payload.severity,
    title: payload.title.trim(),
    description: payload.description.trim(),
  }).select("id").single();
  if (error) throw new Error(errorMessage("No fue posible reportar la falla", error));
  if (!data?.id) throw new Error("La falla fue registrada pero el servidor no devolvió su identificador.");
  return data.id as string;
}

export async function startRemoteRepair(ticketId: string, client: SupabaseClient = createClient()) {
  const { data, error } = await client.from("maintenance_tickets")
    .update({ status: "repairing", repair_started_at: new Date().toISOString() })
    .eq("id", ticketId)
    .eq("status", "open")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(errorMessage("No fue posible iniciar la reparación", error));
  if (!data?.id) throw new Error("El ticket cambió de estado antes de iniciar la reparación. Actualiza la vista.");
}

export async function closeRemoteMaintenanceTicket(
  ticketId: string,
  cause: string,
  resolution: string,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.from("maintenance_tickets")
    .update({
      status: "closed",
      cause: cause.trim(),
      resolution: resolution.trim(),
      closed_at: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .eq("status", "repairing")
    .select("id")
    .maybeSingle();
  if (error) throw new Error(errorMessage("No fue posible cerrar la reparación", error));
  if (!data?.id) throw new Error("El ticket cambió de estado antes del cierre. Actualiza la vista.");
}
