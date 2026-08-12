import type {
  AcceptanceStatus,
  ActivityRecord,
  ActivityUnit,
  NoveltyType,
  ReceptionRecord,
  Worker,
} from "@/lib/domain";

export type OpsAccessRole = "operator" | "supervisor" | "technical" | "maintenance" | "admin" | "director";
export type OpsBackendStatus = "booting" | "ready" | "error";

export type PlantAccess = {
  dbId: string;
  plantId: string;
  code: string;
  name: string;
  role: OpsAccessRole;
};

export type RemoteOpsSnapshot = {
  workers: Worker[];
  activities: ActivityRecord[];
  receptions: ReceptionRecord[];
};

export type OpsBackendState = {
  mode: "local" | "supabase";
  status: OpsBackendStatus;
  error?: string;
};

export type RemoteEmployeeRow = {
  id: string;
  plant_id: string;
  display_name: string;
  historical?: boolean | null;
};

export type RemoteScheduledActivityRow = {
  id: string;
  plant_id: string;
  title: string;
  process?: string | null;
  planned_start: string;
  planned_end?: string | null;
  status: "planned" | "running" | "done" | "delayed" | "missed" | "rescheduled";
  equipment_ref?: string | null;
};

export type RemoteActivityRow = {
  id: string;
  plant_id: string;
  scheduled_activity_id?: string | null;
  title: string;
  process?: string | null;
  started_at: string;
  ended_at?: string | null;
  quantity?: number | string | null;
  unit?: string | null;
  notes?: string | null;
  equipment_ref?: string | null;
  novelty_type?: NoveltyType | null;
  source_kind?: "app" | "historical" | null;
  import_run_id?: string | null;
  source_row_ids?: string[] | null;
};

export type RemoteActivityWorkerRow = {
  activity_id: string;
  employee_id: string;
};

export type RemoteReceiptRow = {
  id: string;
  plant_id: string;
  generator: string;
  route: string;
  waste_type: ReceptionRecord["wasteType"];
  net_weight_kg: number | string;
  rejection_kg: number | string;
  rejection_known?: boolean | null;
  acceptance_status: AcceptanceStatus;
  observation?: string | null;
  started_at: string;
  ended_at: string;
  lot_code: string;
  source_kind?: "app" | "historical" | null;
  time_precision?: "datetime" | "date_only" | null;
  import_run_id?: string | null;
  source_row_ids?: string[] | null;
};

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

export function canonicalPlantId(code: string, name = "") {
  const candidate = normalizeText(`${code} ${name}`);
  if (candidate.includes("yarumal") || candidate.includes("yar")) return "yarumal";
  if (candidate.includes("tamesis") || candidate.includes("tam")) return "tamesis";
  return normalizeText(code).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function plantAccessByDbId(access: PlantAccess[]) {
  return new Map(access.map((plant) => [plant.dbId, plant]));
}

export function mapRemoteEmployee(row: RemoteEmployeeRow, access: PlantAccess[]): Worker {
  const plant = plantAccessByDbId(access).get(row.plant_id);
  if (!plant) throw new Error(`Sin membresía visible para la planta remota ${row.plant_id}.`);
  return { id: row.id, name: row.display_name, plantId: plant.plantId, historical: Boolean(row.historical) || undefined };
}

const activityUnits = new Set<ActivityUnit>(["kg", "t", "L", "unidades", "m3"]);

function mapActivityUnit(unit?: string | null) {
  if (!unit) return undefined;
  if (!activityUnits.has(unit as ActivityUnit)) throw new Error(`Unidad remota de actividad no soportada: ${unit}.`);
  return unit as ActivityUnit;
}

function numberOrUndefined(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Valor numérico remoto inválido: ${value}.`);
  return parsed;
}

function scheduledStatus(row: RemoteScheduledActivityRow): ActivityRecord["status"] {
  if (row.status === "planned" || row.status === "delayed" || row.status === "missed") return row.status;
  throw new Error(`Actividad programada ${row.id} está ${row.status} pero no tiene ejecución enlazada.`);
}

export function mapRemoteActivities(
  scheduledRows: RemoteScheduledActivityRow[],
  activityRows: RemoteActivityRow[],
  workerRows: RemoteActivityWorkerRow[],
  access: PlantAccess[],
): ActivityRecord[] {
  const plants = plantAccessByDbId(access);
  const scheduledById = new Map(scheduledRows.map((row) => [row.id, row]));
  const actualScheduledIds = new Set(activityRows.flatMap((row) => row.scheduled_activity_id ? [row.scheduled_activity_id] : []));
  const workerIdsByActivity = new Map<string, string[]>();

  for (const worker of workerRows) {
    const current = workerIdsByActivity.get(worker.activity_id) ?? [];
    if (!current.includes(worker.employee_id)) current.push(worker.employee_id);
    workerIdsByActivity.set(worker.activity_id, current);
  }

  const actual = activityRows.map((row): ActivityRecord => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Sin membresía visible para la planta remota ${row.plant_id}.`);
    const scheduled = row.scheduled_activity_id ? scheduledById.get(row.scheduled_activity_id) : undefined;
    if (row.scheduled_activity_id && !scheduled) throw new Error(`La ejecución ${row.id} referencia una programación no visible.`);
    if (scheduled && scheduled.plant_id !== row.plant_id) throw new Error(`La ejecución ${row.id} no coincide con la planta de su programación.`);

    const quantity = numberOrUndefined(row.quantity);
    if (quantity !== undefined && quantity <= 0) throw new Error(`La ejecución ${row.id} tiene cantidad inválida.`);

    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      title: row.title,
      process: row.process?.trim() || scheduled?.process?.trim() || "Sin proceso",
      plannedStart: scheduled?.planned_start ?? row.started_at,
      plannedEnd: scheduled?.planned_end || undefined,
      actualStart: row.started_at,
      actualEnd: row.ended_at || undefined,
      workerIds: workerIdsByActivity.get(row.id) ?? [],
      equipment: row.equipment_ref?.trim() || scheduled?.equipment_ref?.trim() || undefined,
      status: row.ended_at ? "done" : "running",
      quantity,
      unit: quantity === undefined ? undefined : mapActivityUnit(row.unit),
      noveltyType: row.novelty_type || undefined,
      novelty: row.novelty_type ? row.notes?.trim() || undefined : undefined,
      source: row.source_kind === "historical" ? "historical" : scheduled ? "scheduled" : "unplanned",
      provenance: row.source_kind === "historical" && row.import_run_id ? {
        importRunId: row.import_run_id,
        sourceName: "Supabase histórico",
        sourceRowIds: row.source_row_ids ?? [],
      } : undefined,
    };
  });

  const pending = scheduledRows
    .filter((row) => row.status !== "rescheduled" && !actualScheduledIds.has(row.id))
    .map((row): ActivityRecord => {
      const plant = plants.get(row.plant_id);
      if (!plant) throw new Error(`Sin membresía visible para la planta remota ${row.plant_id}.`);
      return {
        id: row.id,
        plantId: plant.plantId,
        plant: plant.name,
        title: row.title,
        process: row.process?.trim() || "Sin proceso",
        plannedStart: row.planned_start,
        plannedEnd: row.planned_end || undefined,
        workerIds: [],
        equipment: row.equipment_ref?.trim() || undefined,
        status: scheduledStatus(row),
        source: "scheduled",
      };
    });

  return [...actual, ...pending].sort((a, b) => new Date(b.plannedStart).getTime() - new Date(a.plannedStart).getTime());
}

export function mapRemoteReceipt(row: RemoteReceiptRow, access: PlantAccess[]): ReceptionRecord {
  const plant = plantAccessByDbId(access).get(row.plant_id);
  if (!plant) throw new Error(`Sin membresía visible para la planta remota ${row.plant_id}.`);
  const netWeightKg = Number(row.net_weight_kg);
  const rejectionKg = Number(row.rejection_kg);
  if (!Number.isFinite(netWeightKg) || netWeightKg <= 0) throw new Error(`Recepción remota ${row.id} tiene peso neto inválido.`);
  if (!Number.isFinite(rejectionKg) || rejectionKg < 0 || rejectionKg > netWeightKg) throw new Error(`Recepción remota ${row.id} tiene rechazo inválido.`);

  return {
    id: row.id,
    plantId: plant.plantId,
    plant: plant.name,
    generator: row.generator,
    route: row.route,
    wasteType: row.waste_type,
    netWeightKg,
    rejectionKg,
    rejectionKnown: row.rejection_known ?? true,
    acceptance: row.acceptance_status,
    observation: row.observation || undefined,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    lotCode: row.lot_code,
    source: row.source_kind === "historical" ? "historical" : "local",
    timePrecision: row.time_precision ?? "datetime",
    provenance: row.source_kind === "historical" && row.import_run_id ? {
      importRunId: row.import_run_id,
      sourceName: "Supabase histórico",
      sourceRowIds: row.source_row_ids ?? [],
    } : undefined,
  };
}
