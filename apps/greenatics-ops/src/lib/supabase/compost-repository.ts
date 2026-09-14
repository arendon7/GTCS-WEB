import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CompostControlRange,
  CompostEvent,
  CompostEventType,
  CompostIntakeLot,
  CompostMeasurement,
  CompostPile,
  CompostSourceAllocation,
} from "@/lib/compost-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type PileRow = {
  id: string; plant_id: string; code: string; location: string; status: CompostPile["status"];
  initial_weight_kg: number | string; started_at: string; maturation_started_at?: string | null;
  closed_at?: string | null; final_weight_kg?: number | string | null;
};
type LegacySourceRow = { pile_id: string; material_receipt_id: string };
type IntakeSourceRow = { pile_id: string; intake_lot_id: string; allocated_mass_kg?: number | string | null; allocation_confirmed: boolean };
type IntakeLotRow = {
  id: string; plant_id: string; receipt_id: string; lot_code: string; received_at: string;
  initial_mass_kg: number | string; available_mass_kg: number | string; status: CompostIntakeLot["status"];
};
type MeasurementRow = {
  id: string; pile_id: string; temperature_points_c: Array<number | string>; ambient_temperature_c?: number | string | null;
  temperature_avg_c?: number | string | null; humidity_pct?: number | string | null;
  temperature_range_status?: CompostMeasurement["temperatureRangeStatus"] | null;
  humidity_range_status?: CompostMeasurement["humidityRangeStatus"] | null; notes?: string | null; recorded_at: string;
};
type EventRow = {
  id: string; pile_id: string; activity_id?: string | null; event_type: CompostEventType; started_at: string; ended_at: string;
  volume_m3?: number | string | null; notes?: string | null;
};
type EventWorkerRow = { event_id: string; employee_id: string };
type RangeRow = {
  plant_id: string; temperature_avg_min_c?: number | string | null; temperature_avg_max_c?: number | string | null;
  humidity_min_pct?: number | string | null; humidity_max_pct?: number | string | null; active: boolean;
};

export type RemoteCreatePilePayload = {
  plantId: string;
  location: string;
  sourceAllocations: Array<{ intakeLotId: string; massKg: number }>;
  formationStartedAt: string;
  formationEndedAt: string;
  formationVolumeM3: number;
  workerIds: string[];
  notes?: string;
};
export type RemoteEventPayload = {
  pileId: string; type: Exclude<CompostEventType, "formation">; startedAt: string; endedAt: string;
  volumeM3?: number; workerIds: string[]; notes?: string;
};
export type RemoteMeasurementPayload = {
  pileId: string; temperaturePointsC: number[]; ambientTemperatureC: number; humidityPct?: number; notes?: string; recordedAt?: string;
};
export type RemoteRangePayload = {
  plantId: string; temperatureAvgMinC?: number; temperatureAvgMaxC?: number; humidityMinPct?: number; humidityMaxPct?: number; active: boolean;
};

function errorMessage(scope: string, error: { message?: string } | null) {
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}
function remotePlantId(access: PlantAccess[], plantId: string) {
  const plant = access.find((item) => item.plantId === plantId);
  if (!plant) throw new Error(`No tienes acceso a la planta ${plantId}.`);
  return plant.dbId;
}
function numberValue(value: number | string, scope: string, allowZero = false) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (allowZero ? parsed < 0 : parsed <= 0)) throw new Error(`${scope} tiene un valor numérico inválido.`);
  return parsed;
}
function optionalNumber(value: number | string | null | undefined, scope: string) {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${scope} tiene un valor numérico inválido.`);
  return parsed;
}

export async function loadRemoteCompost(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<{
  piles: CompostPile[];
  measurements: CompostMeasurement[];
  intakeLots: CompostIntakeLot[];
  sourceAllocations: CompostSourceAllocation[];
  events: CompostEvent[];
  controlRanges: CompostControlRange[];
}> {
  if (access.length === 0) return { piles: [], measurements: [], intakeLots: [], sourceAllocations: [], events: [], controlRanges: [] };
  const plantIds = access.map((plant) => plant.dbId);
  const [pileResult, legacySourceResult, intakeSourceResult, intakeLotResult, measurementResult, eventResult, eventWorkerResult, rangeResult] = await Promise.all([
    client.from("compost_piles").select("id,plant_id,code,location,status,initial_weight_kg,started_at,maturation_started_at,closed_at,final_weight_kg").in("plant_id", plantIds).order("started_at", { ascending: false }),
    client.from("compost_pile_sources").select("pile_id,material_receipt_id"),
    client.from("compost_pile_intake_sources").select("pile_id,intake_lot_id,allocated_mass_kg,allocation_confirmed"),
    client.from("material_intake_lots").select("id,plant_id,receipt_id,lot_code,received_at,initial_mass_kg,available_mass_kg,status").in("plant_id", plantIds).order("received_at", { ascending: false }),
    client.from("compost_measurements").select("id,pile_id,temperature_points_c,ambient_temperature_c,temperature_avg_c,humidity_pct,temperature_range_status,humidity_range_status,notes,recorded_at").order("recorded_at", { ascending: false }),
    client.from("compost_events").select("id,pile_id,activity_id,event_type,started_at,ended_at,volume_m3,notes").order("started_at", { ascending: false }),
    client.from("compost_event_workers").select("event_id,employee_id"),
    client.from("compost_control_ranges").select("plant_id,temperature_avg_min_c,temperature_avg_max_c,humidity_min_pct,humidity_max_pct,active"),
  ]);
  const results = [
    [pileResult, "No fue posible cargar pilas"], [legacySourceResult, "No fue posible cargar trazabilidad histórica"],
    [intakeSourceResult, "No fue posible cargar asignaciones físicas"], [intakeLotResult, "No fue posible cargar lotes físicos"],
    [measurementResult, "No fue posible cargar controles de compostaje"], [eventResult, "No fue posible cargar eventos de compostaje"],
    [eventWorkerResult, "No fue posible cargar trabajadores de eventos"], [rangeResult, "No fue posible cargar rangos técnicos"],
  ] as const;
  for (const [result, scope] of results) if (result.error) throw new Error(errorMessage(scope, result.error));

  const plants = new Map(access.map((plant) => [plant.dbId, plant]));
  const legacySources = (legacySourceResult.data ?? []) as unknown as LegacySourceRow[];
  const intakeLots = ((intakeLotResult.data ?? []) as unknown as IntakeLotRow[]).map((row): CompostIntakeLot => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Lote físico ${row.id} pertenece a una planta no visible.`);
    return {
      id: row.id, receiptId: row.receipt_id, plantId: plant.plantId, lotCode: row.lot_code,
      initialMassKg: numberValue(row.initial_mass_kg, `Lote ${row.lot_code}`),
      availableMassKg: numberValue(row.available_mass_kg, `Lote ${row.lot_code}`, true), status: row.status, receivedAt: row.received_at,
    };
  });
  const lotById = new Map(intakeLots.map((lot) => [lot.id, lot]));
  const piles = ((pileResult.data ?? []) as unknown as PileRow[]).map((row): CompostPile => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Pila ${row.id} pertenece a una planta no visible.`);
    return {
      id: row.id, plantId: plant.plantId, plant: plant.name, code: row.code, location: row.location,
      sourceReceiptIds: legacySources.filter((source) => source.pile_id === row.id).map((source) => source.material_receipt_id),
      initialWeightKg: numberValue(row.initial_weight_kg, `Pila ${row.id}`), startedAt: row.started_at,
      maturationStartedAt: row.maturation_started_at || undefined, closedAt: row.closed_at || undefined,
      finalWeightKg: optionalNumber(row.final_weight_kg, `Pila ${row.id}`), status: row.status,
    };
  });
  const visiblePileIds = new Set(piles.map((pile) => pile.id));
  const sourceAllocations = ((intakeSourceResult.data ?? []) as unknown as IntakeSourceRow[])
    .filter((row) => visiblePileIds.has(row.pile_id))
    .map((row): CompostSourceAllocation => ({
      pileId: row.pile_id, intakeLotId: row.intake_lot_id, lotCode: lotById.get(row.intake_lot_id)?.lotCode ?? "Lote histórico",
      allocatedMassKg: optionalNumber(row.allocated_mass_kg, `Asignación ${row.pile_id}`), allocationConfirmed: row.allocation_confirmed,
    }));
  const measurements = ((measurementResult.data ?? []) as unknown as MeasurementRow[])
    .filter((row) => visiblePileIds.has(row.pile_id))
    .map((row): CompostMeasurement => {
      const temperaturePointsC = row.temperature_points_c.map(Number);
      if (temperaturePointsC.length < 3 || temperaturePointsC.length > 5 || temperaturePointsC.some((value) => !Number.isFinite(value))) throw new Error(`Control ${row.id} tiene temperaturas remotas inválidas.`);
      const humidityPct = optionalNumber(row.humidity_pct, `Control ${row.id}`);
      if (humidityPct !== undefined && (humidityPct < 0 || humidityPct > 100)) throw new Error(`Control ${row.id} tiene humedad remota inválida.`);
      return {
        id: row.id, pileId: row.pile_id, recordedAt: row.recorded_at, temperaturePointsC,
        ambientTemperatureC: optionalNumber(row.ambient_temperature_c, `Control ${row.id}`),
        temperatureAvgC: optionalNumber(row.temperature_avg_c, `Control ${row.id}`), humidityPct,
        temperatureRangeStatus: row.temperature_range_status || undefined, humidityRangeStatus: row.humidity_range_status || undefined,
        notes: row.notes || undefined,
      };
    });
  const eventWorkers = new Map<string, string[]>();
  for (const row of (eventWorkerResult.data ?? []) as unknown as EventWorkerRow[]) eventWorkers.set(row.event_id, [...(eventWorkers.get(row.event_id) ?? []), row.employee_id]);
  const events = ((eventResult.data ?? []) as unknown as EventRow[])
    .filter((row) => visiblePileIds.has(row.pile_id))
    .map((row): CompostEvent => ({
      id: row.id, pileId: row.pile_id, activityId: row.activity_id || undefined, type: row.event_type, startedAt: row.started_at, endedAt: row.ended_at,
      volumeM3: optionalNumber(row.volume_m3, `Evento ${row.id}`), workerIds: eventWorkers.get(row.id) ?? [], notes: row.notes || undefined,
    }));
  const controlRanges = ((rangeResult.data ?? []) as unknown as RangeRow[]).map((row): CompostControlRange => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Rango técnico pertenece a una planta no visible: ${row.plant_id}.`);
    return {
      plantId: plant.plantId, temperatureAvgMinC: optionalNumber(row.temperature_avg_min_c, "Rango de temperatura"),
      temperatureAvgMaxC: optionalNumber(row.temperature_avg_max_c, "Rango de temperatura"), humidityMinPct: optionalNumber(row.humidity_min_pct, "Rango de humedad"),
      humidityMaxPct: optionalNumber(row.humidity_max_pct, "Rango de humedad"), active: row.active,
    };
  });
  return { piles, measurements, intakeLots, sourceAllocations, events, controlRanges };
}

export async function createRemoteCompostPileV2(access: PlantAccess[], payload: RemoteCreatePilePayload, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_create_compost_pile_v2", {
    target_plant: remotePlantId(access, payload.plantId), pile_location: payload.location,
    intake_lot_ids: payload.sourceAllocations.map((source) => source.intakeLotId), intake_allocations_kg: payload.sourceAllocations.map((source) => source.massKg),
    formation_started_at: payload.formationStartedAt, formation_ended_at: payload.formationEndedAt, formation_volume_m3: payload.formationVolumeM3,
    employee_ids: payload.workerIds, formation_notes: payload.notes || null,
  });
  if (error) throw new Error(errorMessage("No fue posible crear la pila", error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.id !== "string" || typeof row.code !== "string") throw new Error("La pila fue creada pero el servidor no devolvió código e identificador válidos.");
  return { id: row.id as string, code: row.code as string };
}

export async function recordRemoteCompostEventV2(payload: RemoteEventPayload, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_record_compost_event_v2", {
    target_pile: payload.pileId, event_kind: payload.type, event_started_at: payload.startedAt, event_ended_at: payload.endedAt,
    event_volume_m3: payload.volumeM3 ?? null, employee_ids: payload.workerIds, event_notes: payload.notes || null,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar el evento de compostaje", error));
  if (typeof data !== "string") throw new Error("El evento fue registrado pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function recordRemoteCompostMeasurementV2(payload: RemoteMeasurementPayload, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_record_compost_measurement_v2", {
    target_pile: payload.pileId, temperature_points: payload.temperaturePointsC, ambient_temperature: payload.ambientTemperatureC,
    humidity: payload.humidityPct ?? null, measurement_notes: payload.notes || null, measurement_recorded_at: payload.recordedAt ?? new Date().toISOString(),
  });
  if (error) throw new Error(errorMessage("No fue posible registrar el control", error));
  if (typeof data !== "string") throw new Error("El control fue registrado pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function configureRemoteCompostRange(access: PlantAccess[], payload: RemoteRangePayload, client: SupabaseClient = createClient()) {
  const { error } = await client.rpc("ops_configure_compost_control_range", {
    target_plant: remotePlantId(access, payload.plantId), temperature_min: payload.temperatureAvgMinC ?? null,
    temperature_max: payload.temperatureAvgMaxC ?? null, humidity_min: payload.humidityMinPct ?? null,
    humidity_max: payload.humidityMaxPct ?? null, range_active: payload.active,
  });
  if (error) throw new Error(errorMessage("No fue posible configurar el rango técnico", error));
}

export async function startRemoteCompostMaturation(pileId: string, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_start_compost_maturation", { target_pile: pileId });
  if (error) throw new Error(errorMessage("No fue posible iniciar la maduración", error));
  if (typeof data !== "string") throw new Error("La maduración fue iniciada pero el servidor no devolvió una hora válida.");
  return data;
}

export async function closeRemoteCompostPile(pileId: string, finalWeightKg: number, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_close_compost_pile", { target_pile: pileId, final_weight: finalWeightKg });
  if (error) throw new Error(errorMessage("No fue posible cerrar la pila", error));
  if (typeof data !== "string") throw new Error("La pila fue cerrada pero el servidor no devolvió una hora válida.");
  return data;
}
