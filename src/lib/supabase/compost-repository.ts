import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompostMeasurement, CompostPile } from "@/lib/compost-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type PileRow = {
  id: string;
  plant_id: string;
  code: string;
  location: string;
  status: CompostPile["status"];
  initial_weight_kg: number | string;
  started_at: string;
  maturation_started_at?: string | null;
  closed_at?: string | null;
  final_weight_kg?: number | string | null;
};

type SourceRow = { pile_id: string; material_receipt_id: string };
type MeasurementRow = {
  id: string;
  pile_id: string;
  temperature_points_c: Array<number | string>;
  humidity_pct?: number | string | null;
  notes?: string | null;
  recorded_at: string;
};

export type RemoteCreatePilePayload = {
  plantId: string;
  location: string;
  sourceReceiptIds: string[];
  initialWeightKg: number;
};

export type RemoteMeasurementPayload = {
  pileId: string;
  temperaturePointsC: number[];
  humidityPct?: number;
  notes?: string;
};

function errorMessage(scope: string, error: { message?: string } | null) {
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function remotePlantId(access: PlantAccess[], plantId: string) {
  const plant = access.find((item) => item.plantId === plantId);
  if (!plant) throw new Error(`No tienes acceso a la planta ${plantId}.`);
  return plant.dbId;
}

function finitePositive(value: number | string, scope: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${scope} tiene un peso inválido.`);
  return parsed;
}

export async function loadRemoteCompost(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<{ piles: CompostPile[]; measurements: CompostMeasurement[] }> {
  if (access.length === 0) return { piles: [], measurements: [] };
  const plantIds = access.map((plant) => plant.dbId);
  const [pileResult, sourceResult, measurementResult] = await Promise.all([
    client.from("compost_piles").select("id,plant_id,code,location,status,initial_weight_kg,started_at,maturation_started_at,closed_at,final_weight_kg").in("plant_id", plantIds).order("started_at", { ascending: false }),
    client.from("compost_pile_sources").select("pile_id,material_receipt_id"),
    client.from("compost_measurements").select("id,pile_id,temperature_points_c,humidity_pct,notes,recorded_at").order("recorded_at", { ascending: false }),
  ]);
  if (pileResult.error) throw new Error(errorMessage("No fue posible cargar pilas", pileResult.error));
  if (sourceResult.error) throw new Error(errorMessage("No fue posible cargar trazabilidad de pilas", sourceResult.error));
  if (measurementResult.error) throw new Error(errorMessage("No fue posible cargar controles de compostaje", measurementResult.error));

  const plants = new Map(access.map((plant) => [plant.dbId, plant]));
  const sources = (sourceResult.data ?? []) as unknown as SourceRow[];
  const piles = ((pileResult.data ?? []) as unknown as PileRow[]).map((row): CompostPile => {
    const plant = plants.get(row.plant_id);
    if (!plant) throw new Error(`Pila ${row.id} pertenece a una planta no visible.`);
    const finalWeightKg = row.final_weight_kg === null || row.final_weight_kg === undefined ? undefined : finitePositive(row.final_weight_kg, `Pila ${row.id}`);
    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      code: row.code,
      location: row.location,
      sourceReceiptIds: sources.filter((source) => source.pile_id === row.id).map((source) => source.material_receipt_id),
      initialWeightKg: finitePositive(row.initial_weight_kg, `Pila ${row.id}`),
      startedAt: row.started_at,
      maturationStartedAt: row.maturation_started_at || undefined,
      closedAt: row.closed_at || undefined,
      finalWeightKg,
      status: row.status,
    };
  });
  const visiblePileIds = new Set(piles.map((pile) => pile.id));
  const measurements = ((measurementResult.data ?? []) as unknown as MeasurementRow[])
    .filter((row) => visiblePileIds.has(row.pile_id))
    .map((row): CompostMeasurement => {
      const temperaturePointsC = row.temperature_points_c.map(Number);
      if (temperaturePointsC.length < 3 || temperaturePointsC.length > 5 || temperaturePointsC.some((value) => !Number.isFinite(value))) {
        throw new Error(`Control ${row.id} tiene temperaturas remotas inválidas.`);
      }
      const humidityPct = row.humidity_pct === null || row.humidity_pct === undefined ? undefined : Number(row.humidity_pct);
      if (humidityPct !== undefined && (!Number.isFinite(humidityPct) || humidityPct < 0 || humidityPct > 100)) {
        throw new Error(`Control ${row.id} tiene humedad remota inválida.`);
      }
      return {
        id: row.id,
        pileId: row.pile_id,
        recordedAt: row.recorded_at,
        temperaturePointsC,
        humidityPct,
        notes: row.notes || undefined,
      };
    });
  return { piles, measurements };
}

export async function createRemoteCompostPile(
  access: PlantAccess[],
  payload: RemoteCreatePilePayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_create_compost_pile", {
    target_plant: remotePlantId(access, payload.plantId),
    pile_location: payload.location,
    source_receipt_ids: payload.sourceReceiptIds,
    initial_weight: payload.initialWeightKg,
  });
  if (error) throw new Error(errorMessage("No fue posible crear la pila", error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.id !== "string" || typeof row.code !== "string") throw new Error("La pila fue creada pero el servidor no devolvió código e identificador válidos.");
  return { id: row.id as string, code: row.code as string };
}

export async function recordRemoteCompostMeasurement(payload: RemoteMeasurementPayload, client: SupabaseClient = createClient()) {
  const { data, error } = await client.rpc("ops_record_compost_measurement", {
    target_pile: payload.pileId,
    temperature_points: payload.temperaturePointsC,
    humidity: payload.humidityPct ?? null,
    measurement_notes: payload.notes || null,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar el control", error));
  if (typeof data !== "string") throw new Error("El control fue registrado pero el servidor no devolvió un identificador válido.");
  return data;
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
