import type { AcceptanceStatus, ActivityRecord, ReceptionRecord, Worker } from "@/lib/domain";

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
