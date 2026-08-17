import type { SupabaseClient } from "@supabase/supabase-js";
import type { AlertSeverity } from "@/lib/domain";
import type {
  EquipmentRecord,
  MaintenanceFailureType,
  MaintenanceTicket,
} from "@/lib/maintenance-domain";
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
  failure_type: MaintenanceFailureType;
  title: string;
  description: string;
  status: MaintenanceTicket["status"];
  failed_at: string;
  opened_at: string;
  repair_started_at?: string | null;
  closed_at?: string | null;
  cause?: string | null;
  resolution?: string | null;
};

type EvidenceRow = {
  ticket_id: string;
  plant_id: string;
  stage: "failure" | "repair";
  evidence_ref: string;
  created_at: string;
};

export type RemoteFailurePayload = {
  equipmentId: string;
  failureType: MaintenanceFailureType;
  failedAt: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidenceRefs: string[];
};

export type RemoteMaintenanceClosePayload = {
  cause: string;
  resolution: string;
  evidenceRefs: string[];
};

function errorMessage(scope: string, error: { message?: string; code?: string } | null) {
  if (error?.code === "23505") return `${scope}: el equipo ya tiene una falla o reparación abierta.`;
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function plantByDbId(access: PlantAccess[]) {
  return new Map(access.map((plant) => [plant.dbId, plant]));
}

export async function loadRemoteMaintenance(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<{ equipment: EquipmentRecord[]; tickets: MaintenanceTicket[] }> {
  if (access.length === 0) return { equipment: [], tickets: [] };
  const plantIds = access.map((plant) => plant.dbId);
  const [equipmentResult, ticketResult, evidenceResult] = await Promise.all([
    client.from("equipment").select("id,plant_id,code,name,area,status").in("plant_id", plantIds).order("code"),
    client.from("maintenance_tickets")
      .select("id,equipment_id,plant_id,severity,failure_type,title,description,status,failed_at,opened_at,repair_started_at,closed_at,cause,resolution")
      .in("plant_id", plantIds)
      .order("opened_at", { ascending: false }),
    client.from("maintenance_ticket_evidence")
      .select("ticket_id,plant_id,stage,evidence_ref,created_at")
      .in("plant_id", plantIds)
      .order("created_at", { ascending: true }),
  ]);
  if (equipmentResult.error) throw new Error(errorMessage("No fue posible cargar equipos", equipmentResult.error));
  if (ticketResult.error) throw new Error(errorMessage("No fue posible cargar mantenimiento", ticketResult.error));
  if (evidenceResult.error) throw new Error(errorMessage("No fue posible cargar evidencias de mantenimiento", evidenceResult.error));

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

  const evidenceByTicket = new Map<string, { failure: string[]; repair: string[] }>();
  for (const row of (evidenceResult.data ?? []) as unknown as EvidenceRow[]) {
    if (!plants.has(row.plant_id)) throw new Error(`Evidencia de mantenimiento ${row.ticket_id} pertenece a una planta no visible.`);
    const current = evidenceByTicket.get(row.ticket_id) ?? { failure: [], repair: [] };
    current[row.stage].push(row.evidence_ref);
    evidenceByTicket.set(row.ticket_id, current);
  }

  const tickets = ((ticketResult.data ?? []) as unknown as TicketRow[]).map((row): MaintenanceTicket => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Ticket ${row.id} pertenece a una planta no visible.`);
    const evidence = evidenceByTicket.get(row.id) ?? { failure: [], repair: [] };
    return {
      id: row.id,
      equipmentId: row.equipment_id,
      plantId: plant.plantId,
      plant: plant.name,
      severity: row.severity,
      failureType: row.failure_type,
      title: row.title,
      description: row.description,
      failedAt: row.failed_at,
      openedAt: row.opened_at,
      repairStartedAt: row.repair_started_at || undefined,
      closedAt: row.closed_at || undefined,
      cause: row.cause || undefined,
      resolution: row.resolution || undefined,
      failureEvidenceRefs: evidence.failure,
      repairEvidenceRefs: evidence.repair,
      status: row.status,
    };
  });
  return { equipment, tickets };
}

export async function reportRemoteFailure(
  payload: RemoteFailurePayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_report_equipment_failure_v2", {
    target_equipment: payload.equipmentId,
    failure_kind: payload.failureType,
    failure_occurred_at: payload.failedAt,
    failure_severity: payload.severity,
    failure_title: payload.title.trim(),
    failure_impact: payload.description.trim(),
    evidence_refs: payload.evidenceRefs,
  });
  if (error) throw new Error(errorMessage("No fue posible reportar la falla", error));
  if (!data) throw new Error("La falla fue registrada pero el servidor no devolvió su identificador.");
  return data as string;
}

export async function startRemoteRepair(ticketId: string, client: SupabaseClient = createClient()) {
  const { error } = await client.rpc("ops_start_equipment_repair_v2", {
    target_ticket: ticketId,
    repair_started: new Date().toISOString(),
  });
  if (error) throw new Error(errorMessage("No fue posible iniciar la reparación", error));
}

export async function closeRemoteMaintenanceTicket(
  ticketId: string,
  payload: RemoteMaintenanceClosePayload,
  client: SupabaseClient = createClient(),
) {
  const { error } = await client.rpc("ops_close_equipment_repair_v2", {
    target_ticket: ticketId,
    repair_ended: new Date().toISOString(),
    root_cause: payload.cause.trim(),
    repair_action: payload.resolution.trim(),
    spare_supply_ids: [],
    spare_lot_codes: [],
    spare_quantities: [],
    repair_evidence_refs: payload.evidenceRefs,
  });
  if (error) throw new Error(errorMessage("No fue posible cerrar la reparación", error));
}
