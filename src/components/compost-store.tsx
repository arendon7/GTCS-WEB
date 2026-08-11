"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CompostMeasurement, CompostPile } from "@/lib/compost-domain";
import { seedCompostMeasurements, seedCompostPiles } from "@/lib/compost-data";
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
  createPile: (payload: NewPilePayload) => CreateResult;
  recordMeasurement: (payload: NewMeasurementPayload) => Result;
  startMaturation: (pileId: string) => Result;
  closePile: (pileId: string, finalWeightKg: number) => Result;
  resetCompostDemo: () => void;
};

const CompostContext = createContext<CompostStore | null>(null);

function createPileCode(piles: CompostPile[], plantId: string, startedAt: string) {
  const date = bogotaDateKey(startedAt);
  const prefix = plantId === "yarumal" ? "YAR" : "TAM";
  const sequence = piles.filter((pile) => pile.plantId === plantId && bogotaDateKey(pile.startedAt) === date).length + 1;
  return `${prefix}-COMP-${compactBogotaDate(startedAt)}-${String(sequence).padStart(3, "0")}`;
}

export function CompostStoreProvider({ children }: { children: ReactNode }) {
  const [piles, setPiles] = useState(seedCompostPiles);
  const [measurements, setMeasurements] = useState(seedCompostMeasurements);
  const [ready, setReady] = useState(false);

  useEffect(() => {
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
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ piles, measurements }));
  }, [piles, measurements, ready]);

  const value = useMemo<CompostStore>(() => ({
    piles,
    measurements,
    ready,
    createPile(payload) {
      if (!payload.location.trim()) return { ok: false, error: "Indica la ubicación de la pila." };
      if (!payload.sourceReceiptIds.length) return { ok: false, error: "Selecciona al menos un lote de origen." };
      if (!Number.isFinite(payload.initialWeightKg) || payload.initialWeightKg <= 0) return { ok: false, error: "El peso inicial medido debe ser mayor que cero." };
      const startedAt = new Date().toISOString();
      const code = createPileCode(piles, payload.plantId, startedAt);
      const id = crypto.randomUUID();
      const plant = payload.plantId === "yarumal" ? "Yarumal" : "Támesis";
      const pile: CompostPile = { id, plantId: payload.plantId, plant, code, location: payload.location.trim(), sourceReceiptIds: payload.sourceReceiptIds, initialWeightKg: payload.initialWeightKg, startedAt, status: "active" };
      setPiles((current) => [pile, ...current]);
      return { ok: true, id, code };
    },
    recordMeasurement(payload) {
      const pile = piles.find((item) => item.id === payload.pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status === "closed") return { ok: false, error: "No se pueden registrar controles en una pila cerrada." };
      if (payload.temperaturePointsC.length < 3 || payload.temperaturePointsC.length > 5) return { ok: false, error: "Registra entre 3 y 5 puntos de temperatura." };
      if (payload.temperaturePointsC.some((value) => !Number.isFinite(value))) return { ok: false, error: "Todas las temperaturas deben ser numéricas." };
      if (payload.humidityPct !== undefined && (!Number.isFinite(payload.humidityPct) || payload.humidityPct < 0 || payload.humidityPct > 100)) return { ok: false, error: "La humedad debe estar entre 0 y 100 %." };
      const measurement: CompostMeasurement = { id: crypto.randomUUID(), pileId: pile.id, recordedAt: new Date().toISOString(), temperaturePointsC: payload.temperaturePointsC, humidityPct: payload.humidityPct, notes: payload.notes?.trim() || undefined };
      setMeasurements((current) => [measurement, ...current]);
      return { ok: true };
    },
    startMaturation(pileId) {
      const pile = piles.find((item) => item.id === pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status !== "active") return { ok: false, error: pile.status === "closed" ? "La pila ya está cerrada." : "La pila ya está en maduración." };
      const maturationStartedAt = new Date().toISOString();
      setPiles((current) => current.map((item) => item.id === pileId ? { ...item, maturationStartedAt, status: "maturing" } : item));
      return { ok: true };
    },
    closePile(pileId, finalWeightKg) {
      const pile = piles.find((item) => item.id === pileId);
      if (!pile) return { ok: false, error: "Pila no encontrada." };
      if (pile.status !== "maturing" || !pile.maturationStartedAt) return { ok: false, error: "La pila debe estar en maduración antes de cerrarse." };
      if (!Number.isFinite(finalWeightKg) || finalWeightKg <= 0) return { ok: false, error: "El peso final debe ser mayor que cero." };
      const closedAt = new Date().toISOString();
      setPiles((current) => current.map((item) => item.id === pileId ? { ...item, finalWeightKg, closedAt, status: "closed" } : item));
      return { ok: true };
    },
    resetCompostDemo() {
      setPiles(seedCompostPiles);
      setMeasurements(seedCompostMeasurements);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [piles, measurements, ready]);

  return <CompostContext.Provider value={value}>{children}</CompostContext.Provider>;
}

export function useCompostStore() {
  const context = useContext(CompostContext);
  if (!context) throw new Error("useCompostStore debe usarse dentro de CompostStoreProvider");
  return context;
}
