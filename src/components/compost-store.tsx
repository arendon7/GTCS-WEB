"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useOpsStore } from "@/components/ops-store";
import type { CompostMeasurement, CompostPile } from "@/lib/compost-domain";
import { seedCompostMeasurements, seedCompostPiles } from "@/lib/compost-data";
import {
  closeRemoteCompostPile,
  createRemoteCompostPile,
  loadRemoteCompost,
  recordRemoteCompostMeasurement,
  startRemoteCompostMaturation,
} from "@/lib/supabase/compost-repository";
import { bogotaDateKey, compactBogotaDate } from "@/lib/time";

const STORAGE_KEY = "greenatics-ops-compost-mvp-004";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string; code: string } | { ok: false; error: string };
type NewPilePayload = { plantId: string; location: string; sourceReceiptIds: string[]; initialWeightKg: number };
type NewMeasurementPayload = { pileId: string; temperaturePointsC: number[]; humidityPct?: number; notes?: string };

type CompostStore = {
  piles: CompostPile[];
  measurements: CompostMeasurement[];
  ready: boolean;
  error?: string;
  createPile: (payload: NewPilePayload) => Promise<CreateResult>;
  recordMeasurement: (payload: NewMeasurementPayload) => Promise<Result>;
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

export function CompostStoreProvider({ children }: { children: ReactNode }) {
  const { backend, access } = useOpsStore();
  const remoteMode = backend.mode === "supabase";
  const [piles, setPiles] = useState<CompostPile[]>(() => remoteMode ? [] : seedCompostPiles);
  const [measurements, setMeasurements] = useState<CompostMeasurement[]>(() => remoteMode ? [] : seedCompostMeasurements);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();

  const hydrateRemote = useCallback(async () => {
    if (backend.status !== "ready") return;
    const snapshot = await loadRemoteCompost(access);
    setPiles(snapshot.piles);
    setMeasurements(snapshot.measurements);
    setError(undefined);
    setReady(true);
  }, [access, backend.status]);

  const refreshCompost = useCallback(async () => {
    if (!remoteMode) return;
    setReady(false);
    try {
      await hydrateRemote();
    } catch (caught) {
      setPiles([]);
      setMeasurements([]);
      setError(caught instanceof Error ? caught.message : "No fue posible cargar compostaje remoto.");
      setReady(true);
      throw caught;
    }
  }, [hydrateRemote, remoteMode]);

  useEffect(() => {
    if (remoteMode) {
      if (backend.status !== "ready") {
        const timer = window.setTimeout(() => {
          setPiles([]);
          setMeasurements([]);
          setError(backend.status === "error" ? backend.error : undefined);
          setReady(backend.status === "error");
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
          const parsed = JSON.parse(raw) as { piles?: CompostPile[]; measurements?: CompostMeasurement[] };
          if (parsed.piles) setPiles(parsed.piles);
          if (parsed.measurements) setMeasurements(parsed.measurements);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setError(undefined);
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [backend.error, backend.status, refreshCompost, remoteMode]);

  useEffect(() => {
    if (!ready || remoteMode) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ piles, measurements }));
  }, [piles, measurements, ready, remoteMode]);

  const reloadRemote = useCallback(async () => {
    try {
      await hydrateRemote();
    } catch (caught) {
      setError(caught instanceof Error ? `El cambio se guardó, pero no fue posible refrescar compostaje: ${caught.message}` : "El cambio se guardó, pero no fue posible refrescar compostaje.");
    }
  }, [hydrateRemote]);

  const value = useMemo<CompostStore>(() => ({
    piles,
    measurements,
    ready,
    error,
    async createPile(payload) {
      if (!payload.location.trim()) return { ok: false, error: "Indica la ubicación de la pila." };
      if (!payload.sourceReceiptIds.length) return { ok: false, error: "Selecciona al menos un lote de origen." };
      if (new Set(payload.sourceReceiptIds).size !== payload.sourceReceiptIds.length) return { ok: false, error: "Los lotes de origen contienen duplicados." };
      if (!Number.isFinite(payload.initialWeightKg) || payload.initialWeightKg <= 0) return { ok: false, error: "El peso inicial medido debe ser mayor que cero." };

      if (remoteMode) {
        try {
          const result = await createRemoteCompostPile(access, payload);
          await reloadRemote();
          return { ok: true, ...result };
        } catch (caught) {
          return failure(caught, "No fue posible crear la pila.");
        }
      }

      const startedAt = new Date().toISOString();
      const code = createPileCode(piles, payload.plantId, startedAt);
      const id = crypto.randomUUID();
      const plant = payload.plantId === "yarumal" ? "Yarumal" : "Támesis";
      const pile: CompostPile = { id, plantId: payload.plantId, plant, code, location: payload.location.trim(), sourceReceiptIds: payload.sourceReceiptIds, initialWeightKg: payload.initialWeightKg, startedAt, status: "active" };
      setPiles((current) => [pile, ...current]);
      return { ok: true, id, code };
    },
    async recordMeasurement(payload) {
      const pile = piles.find((item) => item.id === payload.pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status === "closed") return { ok: false, error: "No se pueden registrar controles en una pila cerrada." };
      if (payload.temperaturePointsC.length < 3 || payload.temperaturePointsC.length > 5) return { ok: false, error: "Registra entre 3 y 5 puntos de temperatura." };
      if (payload.temperaturePointsC.some((value) => !Number.isFinite(value))) return { ok: false, error: "Todas las temperaturas deben ser numéricas." };
      if (payload.humidityPct !== undefined && (!Number.isFinite(payload.humidityPct) || payload.humidityPct < 0 || payload.humidityPct > 100)) return { ok: false, error: "La humedad debe estar entre 0 y 100 %." };

      if (remoteMode) {
        try {
          await recordRemoteCompostMeasurement(payload);
          await reloadRemote();
          return { ok: true };
        } catch (caught) {
          return failure(caught, "No fue posible registrar el control.");
        }
      }

      const measurement: CompostMeasurement = { id: crypto.randomUUID(), pileId: pile.id, recordedAt: new Date().toISOString(), temperaturePointsC: payload.temperaturePointsC, humidityPct: payload.humidityPct, notes: payload.notes?.trim() || undefined };
      setMeasurements((current) => [measurement, ...current]);
      return { ok: true };
    },
    async startMaturation(pileId) {
      const pile = piles.find((item) => item.id === pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status !== "active") return { ok: false, error: pile.status === "closed" ? "La pila ya está cerrada." : "La pila ya está en maduración." };

      if (remoteMode) {
        try {
          await startRemoteCompostMaturation(pileId);
          await reloadRemote();
          return { ok: true };
        } catch (caught) {
          return failure(caught, "No fue posible iniciar la maduración.");
        }
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
        try {
          await closeRemoteCompostPile(pileId, finalWeightKg);
          await reloadRemote();
          return { ok: true };
        } catch (caught) {
          return failure(caught, "No fue posible cerrar la pila.");
        }
      }

      const closedAt = new Date().toISOString();
      setPiles((current) => current.map((item) => item.id === pileId ? { ...item, finalWeightKg, closedAt, status: "closed" } : item));
      return { ok: true };
    },
    refreshCompost,
    resetCompostDemo() {
      if (remoteMode) {
        void refreshCompost().catch(() => undefined);
        return;
      }
      setPiles(seedCompostPiles);
      setMeasurements(seedCompostMeasurements);
      setError(undefined);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [access, error, measurements, piles, ready, refreshCompost, reloadRemote, remoteMode]);

  return <CompostContext.Provider value={value}>{children}</CompostContext.Provider>;
}

export function useCompostStore() {
  const context = useContext(CompostContext);
  if (!context) throw new Error("useCompostStore debe usarse dentro de CompostStoreProvider");
  return context;
}
