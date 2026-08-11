"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AcceptanceStatus, ActivityRecord, ActivityUnit, IncidentRecord, NoveltyType, ReceptionRecord, WasteType, Worker } from "@/lib/domain";
import type { ImportRun } from "@/lib/importer";
import { buildCanonicalPromotion } from "@/lib/import-promotion";
import { employees, seedActivities, seedIncidents, seedReceptions } from "@/lib/mock-data";
import { bogotaDateKey, compactBogotaDate } from "@/lib/time";

const STORAGE_KEY = "greenatics-ops-mvp-001";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type CreateReceptionResult = { ok: true; id: string; lotCode: string } | { ok: false; error: string };
type PromotionResult = { ok: true; activities: number; receptions: number } | { ok: false; error: string };
type FinishPayload = { quantity?: number; unit?: ActivityUnit; noveltyType?: NoveltyType; novelty?: string; openIncident?: boolean };
type NewActivityPayload = { plantId: string; title: string; process: string; workerIds: string[]; equipment?: string };
type NewReceptionPayload = { plantId: string; generator: string; route: string; wasteType: WasteType; netWeightKg: number; rejectionKg: number; acceptance: Exclude<AcceptanceStatus, "unknown">; observation?: string; startedAt: string };

type OpsStore = {
  activities: ActivityRecord[];
  incidents: IncidentRecord[];
  receptions: ReceptionRecord[];
  workers: Worker[];
  ready: boolean;
  startActivity: (id: string, workerIds: string[]) => Result;
  finishActivity: (id: string, payload: FinishPayload) => Result;
  createActivity: (payload: NewActivityPayload) => CreateResult;
  createReception: (payload: NewReceptionPayload) => CreateReceptionResult;
  promoteHistoricalImport: (run: ImportRun) => PromotionResult;
  resetDemo: () => void;
};

const OpsStoreContext = createContext<OpsStore | null>(null);

function workerConflict(activities: ActivityRecord[], workerIds: string[], activityId?: string) {
  return workerIds.find((workerId) => activities.some((activity) => activity.id !== activityId && activity.status === "running" && activity.workerIds.includes(workerId)));
}

function wasteCode(wasteType: WasteType) {
  const codes: Record<WasteType, string> = { FORSU: "FORSU", PODA: "PODA", GALLINAZA: "GALL", MATERIA_PRIMA: "MP", OTRO: "OTRO" };
  return codes[wasteType];
}

function createLotCode(receptions: ReceptionRecord[], plantId: string, wasteType: WasteType, endedAt: string) {
  const date = bogotaDateKey(endedAt);
  const prefix = plantId === "yarumal" ? "YAR" : "TAM";
  const sequence = receptions.filter((reception) => reception.plantId === plantId && bogotaDateKey(reception.endedAt) === date).length + 1;
  return `${prefix}-${wasteCode(wasteType)}-${compactBogotaDate(endedAt)}-${String(sequence).padStart(3, "0")}`;
}

export function OpsStoreProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityRecord[]>(seedActivities);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(seedIncidents);
  const [receptions, setReceptions] = useState<ReceptionRecord[]>(seedReceptions);
  const [workers, setWorkers] = useState<Worker[]>(employees);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { activities?: ActivityRecord[]; incidents?: IncidentRecord[]; receptions?: ReceptionRecord[]; workers?: Worker[] };
          if (parsed.activities?.length) setActivities(parsed.activities);
          if (parsed.incidents) setIncidents(parsed.incidents);
          if (parsed.receptions) setReceptions(parsed.receptions);
          if (parsed.workers?.length) setWorkers(parsed.workers);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities, incidents, receptions, workers }));
  }, [activities, incidents, receptions, workers, ready]);

  const value = useMemo<OpsStore>(() => ({
    activities,
    incidents,
    receptions,
    workers,
    ready,
    startActivity(id, workerIds) {
      const activity = activities.find((item) => item.id === id);
      if (!activity) return { ok: false, error: "Actividad no encontrada." };
      if (activity.status === "done") return { ok: false, error: "La actividad ya está finalizada." };
      if (workerIds.length === 0) return { ok: false, error: "Selecciona al menos un trabajador." };
      const conflict = workerConflict(activities, workerIds, id);
      if (conflict) {
        const name = workers.find((worker) => worker.id === conflict)?.name ?? "Un trabajador";
        return { ok: false, error: `${name} ya está en otra actividad en curso.` };
      }
      const actualStart = new Date().toISOString();
      setActivities((current) => current.map((item) => item.id === id ? { ...item, workerIds, actualStart, actualEnd: undefined, status: "running" } : item));
      return { ok: true };
    },
    finishActivity(id, payload) {
      const activity = activities.find((item) => item.id === id);
      if (!activity) return { ok: false, error: "Actividad no encontrada." };
      if (activity.status !== "running" || !activity.actualStart) return { ok: false, error: "Primero debes iniciar la actividad." };
      if (payload.quantity !== undefined && (!Number.isFinite(payload.quantity) || payload.quantity <= 0)) return { ok: false, error: "La cantidad debe ser mayor que cero." };
      const actualEnd = new Date().toISOString();
      if (new Date(actualEnd) < new Date(activity.actualStart)) return { ok: false, error: "La hora final no puede ser anterior al inicio." };
      const { openIncident, ...activityUpdates } = payload;
      setActivities((current) => current.map((item) => item.id === id ? { ...item, ...activityUpdates, actualEnd, status: "done" } : item));
      if (openIncident && payload.noveltyType) {
        const severity = payload.noveltyType === "safety" || payload.noveltyType === "equipment_failure" ? "high" : "medium";
        setIncidents((current) => [{ id: crypto.randomUUID(), activityId: activity.id, plantId: activity.plantId, plant: activity.plant, title: payload.noveltyType === "equipment_failure" ? `Falla reportada · ${activity.title}` : `Novedad · ${activity.title}`, detail: payload.novelty?.trim() || "Novedad reportada durante la actividad.", severity, equipment: activity.equipment, openedAt: actualEnd, status: "open" }, ...current]);
      }
      return { ok: true };
    },
    createActivity(payload) {
      if (!payload.title.trim()) return { ok: false, error: "Escribe el nombre de la actividad." };
      if (!payload.process.trim()) return { ok: false, error: "Selecciona o escribe el proceso." };
      if (payload.workerIds.length === 0) return { ok: false, error: "Selecciona al menos un trabajador." };
      const conflict = workerConflict(activities, payload.workerIds);
      if (conflict) {
        const name = workers.find((worker) => worker.id === conflict)?.name ?? "Un trabajador";
        return { ok: false, error: `${name} ya está en otra actividad en curso.` };
      }
      const plant = payload.plantId === "yarumal" ? "Yarumal" : "Támesis";
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const activity: ActivityRecord = { id, plantId: payload.plantId, plant, title: payload.title.trim(), process: payload.process.trim(), plannedStart: now, actualStart: now, workerIds: payload.workerIds, equipment: payload.equipment?.trim() || undefined, status: "running", source: "unplanned" };
      setActivities((current) => [activity, ...current]);
      return { ok: true, id };
    },
    createReception(payload) {
      if (!payload.generator.trim()) return { ok: false, error: "Indica el generador o proveedor." };
      if (!payload.route.trim()) return { ok: false, error: "Indica la ruta u origen." };
      if (!Number.isFinite(payload.netWeightKg) || payload.netWeightKg <= 0) return { ok: false, error: "El peso neto debe ser mayor que cero." };
      if (!Number.isFinite(payload.rejectionKg) || payload.rejectionKg < 0) return { ok: false, error: "El rechazo no puede ser negativo." };
      if (payload.rejectionKg > payload.netWeightKg) return { ok: false, error: "El rechazo no puede superar el peso neto." };
      const endedAt = new Date().toISOString();
      if (new Date(endedAt) < new Date(payload.startedAt)) return { ok: false, error: "La hora final no puede ser anterior al inicio." };
      const plant = payload.plantId === "yarumal" ? "Yarumal" : "Támesis";
      const lotCode = createLotCode(receptions, payload.plantId, payload.wasteType, endedAt);
      const id = crypto.randomUUID();
      const reception: ReceptionRecord = { id, plantId: payload.plantId, plant, generator: payload.generator.trim(), route: payload.route.trim(), wasteType: payload.wasteType, netWeightKg: payload.netWeightKg, rejectionKg: payload.rejectionKg, acceptance: payload.acceptance, observation: payload.observation?.trim() || undefined, startedAt: payload.startedAt, endedAt, lotCode, source: "local" };
      setReceptions((current) => [reception, ...current]);
      return { ok: true, id, lotCode };
    },
    promoteHistoricalImport(run) {
      if (activities.some((item) => item.provenance?.importRunId === run.id) || receptions.some((item) => item.provenance?.importRunId === run.id)) {
        return { ok: false, error: "Esta corrida ya fue promovida al modelo operacional." };
      }
      const promotion = buildCanonicalPromotion(run);
      if (promotion.errors.length) return { ok: false, error: promotion.errors.join(" ") };
      setWorkers((current) => [...current, ...promotion.workers.filter((worker) => !current.some((item) => item.id === worker.id))]);
      setActivities((current) => [...promotion.activities.filter((activity) => !current.some((item) => item.id === activity.id)), ...current]);
      setReceptions((current) => [...promotion.receptions.filter((reception) => !current.some((item) => item.id === reception.id)), ...current]);
      return { ok: true, activities: promotion.activities.length, receptions: promotion.receptions.length };
    },
    resetDemo() {
      setActivities(seedActivities);
      setIncidents(seedIncidents);
      setReceptions(seedReceptions);
      setWorkers(employees);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [activities, incidents, receptions, workers, ready]);

  return <OpsStoreContext.Provider value={value}>{children}</OpsStoreContext.Provider>;
}

export function useOpsStore() {
  const context = useContext(OpsStoreContext);
  if (!context) throw new Error("useOpsStore debe usarse dentro de OpsStoreProvider");
  return context;
}
