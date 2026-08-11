"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ActivityRecord, ActivityUnit, IncidentRecord, NoveltyType } from "@/lib/domain";
import { employees, seedActivities, seedIncidents } from "@/lib/mock-data";

const STORAGE_KEY = "greenatics-ops-mvp-001";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type FinishPayload = { quantity?: number; unit?: ActivityUnit; noveltyType?: NoveltyType; novelty?: string; openIncident?: boolean };
type NewActivityPayload = { plantId: string; title: string; process: string; workerIds: string[]; equipment?: string };

type OpsStore = {
  activities: ActivityRecord[];
  incidents: IncidentRecord[];
  ready: boolean;
  startActivity: (id: string, workerIds: string[]) => Result;
  finishActivity: (id: string, payload: FinishPayload) => Result;
  createActivity: (payload: NewActivityPayload) => CreateResult;
  resetDemo: () => void;
};

const OpsStoreContext = createContext<OpsStore | null>(null);

function workerConflict(activities: ActivityRecord[], workerIds: string[], activityId?: string) {
  return workerIds.find((workerId) => activities.some((activity) => activity.id !== activityId && activity.status === "running" && activity.workerIds.includes(workerId)));
}

export function OpsStoreProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityRecord[]>(seedActivities);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(seedIncidents);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { activities?: ActivityRecord[]; incidents?: IncidentRecord[] };
        if (parsed.activities?.length) setActivities(parsed.activities);
        if (parsed.incidents) setIncidents(parsed.incidents);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities, incidents }));
  }, [activities, incidents, ready]);

  const value = useMemo<OpsStore>(() => ({
    activities,
    incidents,
    ready,
    startActivity(id, workerIds) {
      const activity = activities.find((item) => item.id === id);
      if (!activity) return { ok: false, error: "Actividad no encontrada." };
      if (activity.status === "done") return { ok: false, error: "La actividad ya está finalizada." };
      if (workerIds.length === 0) return { ok: false, error: "Selecciona al menos un trabajador." };
      const conflict = workerConflict(activities, workerIds, id);
      if (conflict) {
        const name = employees.find((worker) => worker.id === conflict)?.name ?? "Un trabajador";
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
      setActivities((current) => current.map((item) => item.id === id ? { ...item, ...payload, actualEnd, status: "done" } : item));
      if (payload.openIncident && payload.noveltyType) {
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
        const name = employees.find((worker) => worker.id === conflict)?.name ?? "Un trabajador";
        return { ok: false, error: `${name} ya está en otra actividad en curso.` };
      }
      const plant = payload.plantId === "yarumal" ? "Yarumal" : "Támesis";
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const activity: ActivityRecord = { id, plantId: payload.plantId, plant, title: payload.title.trim(), process: payload.process.trim(), plannedStart: now, actualStart: now, workerIds: payload.workerIds, equipment: payload.equipment?.trim() || undefined, status: "running", source: "unplanned" };
      setActivities((current) => [activity, ...current]);
      return { ok: true, id };
    },
    resetDemo() {
      setActivities(seedActivities);
      setIncidents(seedIncidents);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [activities, incidents, ready]);

  return <OpsStoreContext.Provider value={value}>{children}</OpsStoreContext.Provider>;
}

export function useOpsStore() {
  const context = useContext(OpsStoreContext);
  if (!context) throw new Error("useOpsStore debe usarse dentro de OpsStoreProvider");
  return context;
}
