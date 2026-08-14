"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useOpsStore } from "@/components/ops-store";
import type {
  CompostControlRange,
  CompostEvent,
  CompostIntakeLot,
  CompostMeasurement,
  CompostPile,
  CompostSourceAllocation,
} from "@/lib/compost-domain";
import { averageTemperature } from "@/lib/compost-domain";
import { seedCompostMeasurements, seedCompostPiles } from "@/lib/compost-data";
import type { ReceptionRecord } from "@/lib/domain";
import {
  closeRemoteCompostPile,
  configureRemoteCompostRange,
  createRemoteCompostPileV2,
  loadRemoteCompost,
  recordRemoteCompostEventV2,
  recordRemoteCompostMeasurementV2,
  startRemoteCompostMaturation,
} from "@/lib/supabase/compost-repository";
import { bogotaDateKey, compactBogotaDate } from "@/lib/time";

const STORAGE_KEY = "greenatics-ops-compost-v2-005";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string; code: string } | { ok: false; error: string };
type NewPilePayload = {
  plantId: string; location: string; sourceAllocations: Array<{ intakeLotId: string; massKg: number }>;
  formationStartedAt: string; formationEndedAt: string; formationVolumeM3: number; workerIds: string[]; notes?: string;
};
type NewEventPayload = {
  pileId: string; type: "turning" | "hydration" | "other"; startedAt: string; endedAt: string; volumeM3?: number; workerIds: string[]; notes?: string;
};
type NewMeasurementPayload = {
  pileId: string; temperaturePointsC: number[]; ambientTemperatureC: number; humidityPct?: number; notes?: string; recordedAt?: string;
};
type RangePayload = {
  plantId: string; temperatureAvgMinC?: number; temperatureAvgMaxC?: number; humidityMinPct?: number; humidityMaxPct?: number; active: boolean;
};

type CompostStore = {
  piles: CompostPile[];
  measurements: CompostMeasurement[];
  intakeLots: CompostIntakeLot[];
  sourceAllocations: CompostSourceAllocation[];
  events: CompostEvent[];
  controlRanges: CompostControlRange[];
  ready: boolean;
  error?: string;
  createPile: (payload: NewPilePayload) => Promise<CreateResult>;
  recordEvent: (payload: NewEventPayload) => Promise<Result>;
  recordMeasurement: (payload: NewMeasurementPayload) => Promise<Result>;
  configureRange: (payload: RangePayload) => Promise<Result>;
  startMaturation: (pileId: string) => Promise<Result>;
  closePile: (pileId: string, finalWeightKg: number) => Promise<Result>;
  refreshCompost: () => Promise<void>;
  resetCompostDemo: () => void;
};

const CompostContext = createContext<CompostStore | null>(null);

function createPileCode(piles: CompostPile[], plantId: string, startedAt: string) {
  const date = bogotaDateKey(startedAt);
  const prefix = plantId === "yarumal" ? "YAR" : "TAM";
  const sequence = piles.filter((pile) => pile.plantId === plantId && bogotaDateKey(pile.startedAt) === date).length + 1;
  return `${prefix}-COMP-${compactBogotaDate(startedAt)}-${String(sequence).padStart(3, "0")}`;
}

function failure(error: unknown, fallback: string): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

function localIntakeLotId(receiptId: string) { return `local-intake-${receiptId}`; }
function intakeLotsFromReceptions(receptions: ReceptionRecord[]): CompostIntakeLot[] {
  return receptions.flatMap((reception) => {
    const acceptedMass = reception.netWeightKg - reception.rejectionKg;
    if (reception.acceptance === "rejected" || acceptedMass <= 0) return [];
    return [{
      id: localIntakeLotId(reception.id), receiptId: reception.id, plantId: reception.plantId, lotCode: reception.lotCode,
      initialMassKg: acceptedMass, availableMassKg: acceptedMass,
      status: reception.acceptance === "conditioned" ? "quarantined" as const : "available" as const, receivedAt: reception.endedAt,
    }];
  });
}

function evaluateRange(value: number, min?: number, max?: number): "not_configured" | "within_range" | "out_of_range" {
  if (min === undefined && max === undefined) return "not_configured";
  if ((min !== undefined && value < min) || (max !== undefined && value > max)) return "out_of_range";
  return "within_range";
}

export function CompostStoreProvider({ children }: { children: ReactNode }) {
  const { backend, access, receptions, workers } = useOpsStore();
  const remoteMode = backend.mode === "supabase";
  const [piles, setPiles] = useState<CompostPile[]>(() => remoteMode ? [] : seedCompostPiles);
  const [measurements, setMeasurements] = useState<CompostMeasurement[]>(() => remoteMode ? [] : seedCompostMeasurements);
  const [intakeLots, setIntakeLots] = useState<CompostIntakeLot[]>(() => remoteMode ? [] : intakeLotsFromReceptions(receptions));
  const [sourceAllocations, setSourceAllocations] = useState<CompostSourceAllocation[]>([]);
  const [events, setEvents] = useState<CompostEvent[]>([]);
  const [controlRanges, setControlRanges] = useState<CompostControlRange[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();

  const effectiveIntakeLots = useMemo(() => {
    if (remoteMode) return intakeLots;
    const currentIds = new Set(intakeLots.map((lot) => lot.id));
    const missing = intakeLotsFromReceptions(receptions).filter((lot) => !currentIds.has(lot.id));
    return missing.length ? [...missing, ...intakeLots] : intakeLots;
  }, [intakeLots, receptions, remoteMode]);

  const hydrateRemote = useCallback(async () => {
    if (backend.status !== "ready") return;
    const snapshot = await loadRemoteCompost(access);
    setPiles(snapshot.piles);
    setMeasurements(snapshot.measurements);
    setIntakeLots(snapshot.intakeLots);
    setSourceAllocations(snapshot.sourceAllocations);
    setEvents(snapshot.events);
    setControlRanges(snapshot.controlRanges);
    setError(undefined);
    setReady(true);
  }, [access, backend.status]);

  const refreshCompost = useCallback(async () => {
    if (!remoteMode) return;
    setReady(false);
    try {
      await hydrateRemote();
    } catch (caught) {
      setPiles([]); setMeasurements([]); setIntakeLots([]); setSourceAllocations([]); setEvents([]); setControlRanges([]);
      setError(caught instanceof Error ? caught.message : "No fue posible cargar compostaje remoto.");
      setReady(true);
      throw caught;
    }
  }, [hydrateRemote, remoteMode]);

  useEffect(() => {
    if (remoteMode) {
      if (backend.status !== "ready") {
        const timer = window.setTimeout(() => {
          setPiles([]); setMeasurements([]); setIntakeLots([]); setSourceAllocations([]); setEvents([]); setControlRanges([]);
          setError(backend.status === "error" ? backend.error : undefined); setReady(backend.status === "error");
        }, 0);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => { void refreshCompost().catch(() => undefined); }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Pick<CompostStore, "piles" | "measurements" | "intakeLots" | "sourceAllocations" | "events" | "controlRanges">>;
          if (parsed.piles) setPiles(parsed.piles);
          if (parsed.measurements) setMeasurements(parsed.measurements);
          if (parsed.intakeLots) setIntakeLots(parsed.intakeLots);
          if (parsed.sourceAllocations) setSourceAllocations(parsed.sourceAllocations);
          if (parsed.events) setEvents(parsed.events);
          if (parsed.controlRanges) setControlRanges(parsed.controlRanges);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setError(undefined); setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [backend.error, backend.status, refreshCompost, remoteMode]);

  useEffect(() => {
    if (!ready || remoteMode) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ piles, measurements, intakeLots: effectiveIntakeLots, sourceAllocations, events, controlRanges }));
  }, [controlRanges, effectiveIntakeLots, events, measurements, piles, ready, remoteMode, sourceAllocations]);

  const reloadRemote = useCallback(async () => {
    try { await hydrateRemote(); }
    catch (caught) { setError(caught instanceof Error ? `El cambio se guardó, pero no fue posible refrescar compostaje: ${caught.message}` : "El cambio se guardó, pero no fue posible refrescar compostaje."); }
  }, [hydrateRemote]);

  const value = useMemo<CompostStore>(() => ({
    piles, measurements, intakeLots: effectiveIntakeLots, sourceAllocations, events, controlRanges, ready, error,
    async createPile(payload) {
      if (!payload.location.trim()) return { ok: false, error: "Indica la ubicación de la pila." };
      if (!payload.sourceAllocations.length) return { ok: false, error: "Selecciona al menos un lote físico de origen." };
      if (new Set(payload.sourceAllocations.map((source) => source.intakeLotId)).size !== payload.sourceAllocations.length) return { ok: false, error: "Los lotes físicos contienen duplicados." };
      if (payload.sourceAllocations.some((source) => !Number.isFinite(source.massKg) || source.massKg <= 0)) return { ok: false, error: "Cada lote debe tener una masa asignada mayor que cero." };
      if (!payload.formationStartedAt || !payload.formationEndedAt || new Date(payload.formationEndedAt) < new Date(payload.formationStartedAt)) return { ok: false, error: "Revisa el inicio y fin de la conformación." };
      if (!Number.isFinite(payload.formationVolumeM3) || payload.formationVolumeM3 <= 0) return { ok: false, error: "Registra el volumen conformado en m3." };
      if (!payload.workerIds.length) return { ok: false, error: "Selecciona al menos un trabajador para la conformación." };
      if (new Set(payload.workerIds).size !== payload.workerIds.length) return { ok: false, error: "Los trabajadores de conformación contienen duplicados." };

      if (remoteMode) {
        try { const result = await createRemoteCompostPileV2(access, payload); await reloadRemote(); return { ok: true, ...result }; }
        catch (caught) { return failure(caught, "No fue posible crear la pila."); }
      }

      const selectedLots = payload.sourceAllocations.map((source) => ({ source, lot: effectiveIntakeLots.find((lot) => lot.id === source.intakeLotId) }));
      if (selectedLots.some(({ lot }) => !lot || lot.plantId !== payload.plantId || !["available", "in_process"].includes(lot.status))) return { ok: false, error: "Uno o más lotes no están disponibles para proceso." };
      for (const { source, lot } of selectedLots) if (!lot || source.massKg > lot.availableMassKg) return { ok: false, error: `La masa asignada supera lo disponible en ${lot?.lotCode ?? "un lote"}.` };
      if (payload.workerIds.some((id) => !workers.some((worker) => worker.id === id && worker.plantId === payload.plantId))) return { ok: false, error: "Uno o más trabajadores no pertenecen a la planta." };

      const initialWeightKg = payload.sourceAllocations.reduce((sum, source) => sum + source.massKg, 0);
      const code = createPileCode(piles, payload.plantId, payload.formationStartedAt);
      const id = crypto.randomUUID();
      const plant = payload.plantId === "yarumal" ? "Yarumal" : "Támesis";
      const pile: CompostPile = {
        id, plantId: payload.plantId, plant, code, location: payload.location.trim(),
        sourceReceiptIds: selectedLots.flatMap(({ lot }) => lot ? [lot.receiptId] : []), initialWeightKg,
        startedAt: payload.formationStartedAt, status: "active",
      };
      const formationId = crypto.randomUUID();
      setPiles((current) => [pile, ...current]);
      setSourceAllocations((current) => [...payload.sourceAllocations.map((source) => ({ pileId: id, intakeLotId: source.intakeLotId, lotCode: effectiveIntakeLots.find((lot) => lot.id === source.intakeLotId)?.lotCode ?? "Lote", allocatedMassKg: source.massKg, allocationConfirmed: true })), ...current]);
      setEvents((current) => [{ id: formationId, pileId: id, type: "formation", startedAt: payload.formationStartedAt, endedAt: payload.formationEndedAt, volumeM3: payload.formationVolumeM3, workerIds: payload.workerIds, notes: payload.notes?.trim() || undefined }, ...current]);
      setIntakeLots(effectiveIntakeLots.map((lot) => {
        const allocation = payload.sourceAllocations.find((source) => source.intakeLotId === lot.id);
        if (!allocation) return lot;
        const availableMassKg = Math.max(0, lot.availableMassKg - allocation.massKg);
        return { ...lot, availableMassKg, status: availableMassKg <= 0.001 ? "depleted" : "in_process" };
      }));
      return { ok: true, id, code };
    },
    async recordEvent(payload) {
      const pile = piles.find((item) => item.id === payload.pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status === "closed") return { ok: false, error: "No se pueden registrar eventos en una pila cerrada." };
      if (!payload.startedAt || !payload.endedAt || new Date(payload.endedAt) < new Date(payload.startedAt)) return { ok: false, error: "Revisa el inicio y fin del evento." };
      if (new Date(payload.startedAt) < new Date(pile.startedAt)) return { ok: false, error: "El evento no puede ocurrir antes de la conformación." };
      if (payload.type === "turning" && (!payload.volumeM3 || payload.volumeM3 <= 0)) return { ok: false, error: "Registra el volumen volteado en m3." };
      if (payload.volumeM3 !== undefined && (!Number.isFinite(payload.volumeM3) || payload.volumeM3 <= 0)) return { ok: false, error: "El volumen debe ser mayor que cero." };
      if (!payload.workerIds.length) return { ok: false, error: "Selecciona al menos un trabajador para el evento." };

      if (remoteMode) {
        try { await recordRemoteCompostEventV2(payload); await reloadRemote(); return { ok: true }; }
        catch (caught) { return failure(caught, "No fue posible registrar el evento."); }
      }
      setEvents((current) => [{ id: crypto.randomUUID(), pileId: payload.pileId, type: payload.type, startedAt: payload.startedAt, endedAt: payload.endedAt, volumeM3: payload.volumeM3, workerIds: payload.workerIds, notes: payload.notes?.trim() || undefined }, ...current]);
      return { ok: true };
    },
    async recordMeasurement(payload) {
      const pile = piles.find((item) => item.id === payload.pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status === "closed") return { ok: false, error: "No se pueden registrar controles en una pila cerrada." };
      if (payload.temperaturePointsC.length < 3 || payload.temperaturePointsC.length > 5) return { ok: false, error: "Registra entre 3 y 5 puntos de temperatura." };
      if (payload.temperaturePointsC.some((value) => !Number.isFinite(value))) return { ok: false, error: "Todas las temperaturas deben ser numéricas." };
      if (!Number.isFinite(payload.ambientTemperatureC)) return { ok: false, error: "Registra la temperatura ambiente." };
      if (payload.humidityPct !== undefined && (!Number.isFinite(payload.humidityPct) || payload.humidityPct < 0 || payload.humidityPct > 100)) return { ok: false, error: "La humedad debe estar entre 0 y 100 %." };

      if (remoteMode) {
        try { await recordRemoteCompostMeasurementV2(payload); await reloadRemote(); return { ok: true }; }
        catch (caught) { return failure(caught, "No fue posible registrar el control."); }
      }
      const range = controlRanges.find((item) => item.plantId === pile.plantId && item.active);
      const temperatureAvgC = averageTemperature({ temperaturePointsC: payload.temperaturePointsC });
      const temperatureRangeStatus = range ? evaluateRange(temperatureAvgC, range.temperatureAvgMinC, range.temperatureAvgMaxC) : "not_configured";
      const humidityConfigured = Boolean(range && (range.humidityMinPct !== undefined || range.humidityMaxPct !== undefined));
      const humidityRangeStatus = payload.humidityPct === undefined ? (humidityConfigured ? "not_recorded" : "not_configured") : range ? evaluateRange(payload.humidityPct, range.humidityMinPct, range.humidityMaxPct) : "not_configured";
      setMeasurements((current) => [{
        id: crypto.randomUUID(), pileId: pile.id, recordedAt: payload.recordedAt ?? new Date().toISOString(),
        temperaturePointsC: payload.temperaturePointsC, ambientTemperatureC: payload.ambientTemperatureC, temperatureAvgC,
        humidityPct: payload.humidityPct, temperatureRangeStatus, humidityRangeStatus, notes: payload.notes?.trim() || undefined,
      }, ...current]);
      return { ok: true };
    },
    async configureRange(payload) {
      if (payload.temperatureAvgMinC !== undefined && payload.temperatureAvgMaxC !== undefined && payload.temperatureAvgMinC > payload.temperatureAvgMaxC) return { ok: false, error: "El mínimo de temperatura no puede superar el máximo." };
      if ([payload.humidityMinPct, payload.humidityMaxPct].some((value) => value !== undefined && (!Number.isFinite(value) || value < 0 || value > 100))) return { ok: false, error: "Los límites de humedad deben estar entre 0 y 100 %." };
      if (payload.humidityMinPct !== undefined && payload.humidityMaxPct !== undefined && payload.humidityMinPct > payload.humidityMaxPct) return { ok: false, error: "El mínimo de humedad no puede superar el máximo." };
      if (payload.active && payload.temperatureAvgMinC === undefined && payload.temperatureAvgMaxC === undefined && payload.humidityMinPct === undefined && payload.humidityMaxPct === undefined) return { ok: false, error: "Define al menos un límite técnico o desactiva el rango." };
      if (remoteMode) {
        try { await configureRemoteCompostRange(access, payload); await reloadRemote(); return { ok: true }; }
        catch (caught) { return failure(caught, "No fue posible configurar el rango técnico."); }
      }
      setControlRanges((current) => [{ ...payload }, ...current.filter((item) => item.plantId !== payload.plantId)]);
      return { ok: true };
    },
    async startMaturation(pileId) {
      const pile = piles.find((item) => item.id === pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status !== "active") return { ok: false, error: pile.status === "closed" ? "La pila ya está cerrada." : "La pila ya está en maduración." };
      if (remoteMode) {
        try { await startRemoteCompostMaturation(pileId); await reloadRemote(); return { ok: true }; }
        catch (caught) { return failure(caught, "No fue posible iniciar la maduración."); }
      }
      const maturationStartedAt = new Date().toISOString();
      setPiles((current) => current.map((item) => item.id === pileId ? { ...item, maturationStartedAt, status: "maturing" } : item));
      return { ok: true };
    },
    async closePile(pileId, finalWeightKg) {
      const pile = piles.find((item) => item.id === pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status !== "maturing" || !pile.maturationStartedAt) return { ok: false, error: "La pila debe estar en maduración antes de cerrarse." };
      if (!Number.isFinite(finalWeightKg) || finalWeightKg <= 0) return { ok: false, error: "El peso final debe ser mayor que cero." };
      if (remoteMode) {
        try { await closeRemoteCompostPile(pileId, finalWeightKg); await reloadRemote(); return { ok: true }; }
        catch (caught) { return failure(caught, "No fue posible cerrar la pila."); }
      }
      const closedAt = new Date().toISOString();
      setPiles((current) => current.map((item) => item.id === pileId ? { ...item, finalWeightKg, closedAt, status: "closed" } : item));
      return { ok: true };
    },
    refreshCompost,
    resetCompostDemo() {
      if (remoteMode) { void refreshCompost().catch(() => undefined); return; }
      setPiles(seedCompostPiles); setMeasurements(seedCompostMeasurements); setIntakeLots(intakeLotsFromReceptions(receptions));
      setSourceAllocations([]); setEvents([]); setControlRanges([]); setError(undefined); window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [access, controlRanges, effectiveIntakeLots, error, events, measurements, piles, ready, receptions, refreshCompost, reloadRemote, remoteMode, sourceAllocations, workers]);

  return <CompostContext.Provider value={value}>{children}</CompostContext.Provider>;
}

export function useCompostStore() {
  const context = useContext(CompostContext);
  if (!context) throw new Error("useCompostStore debe usarse dentro de CompostStoreProvider");
  return context;
}
