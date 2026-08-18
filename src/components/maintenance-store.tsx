"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useOpsStore } from "@/components/ops-store";
import type { AlertSeverity } from "@/lib/domain";
import type { EquipmentRecord, MaintenanceFailureType, MaintenanceSpareUse, MaintenanceTicket } from "@/lib/maintenance-domain";
import { seedEquipment, seedMaintenanceTickets } from "@/lib/maintenance-data";
import {
  closeRemoteMaintenanceTicket,
  loadRemoteMaintenance,
  reportRemoteFailure,
  startRemoteRepair,
} from "@/lib/supabase/maintenance-repository";

const STORAGE_KEY = "greenatics-ops-maintenance-mvp-005";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type FailurePayload = {
  equipmentId: string;
  failureType: MaintenanceFailureType;
  failedAt: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidenceRefs: string[];
};
type ClosePayload = {
  cause: string;
  resolution: string;
  evidenceRefs: string[];
  workerIds: string[];
  spares: MaintenanceSpareUse[];
};
type LegacyStoredTicket = Omit<MaintenanceTicket, "failedAt" | "failureType" | "failureEvidenceRefs" | "repairEvidenceRefs"> & {
  failedAt?: string;
  failureType?: MaintenanceFailureType;
  failureEvidenceRefs?: string[];
  repairEvidenceRefs?: string[];
};

type MaintenanceStore = {
  equipment: EquipmentRecord[];
  tickets: MaintenanceTicket[];
  ready: boolean;
  error?: string;
  reportFailure: (payload: FailurePayload) => Promise<CreateResult>;
  startRepair: (ticketId: string) => Promise<Result>;
  closeTicket: (ticketId: string, payload: ClosePayload) => Promise<Result>;
  refreshMaintenance: () => Promise<void>;
  resetMaintenanceDemo: () => void;
};

const MaintenanceContext = createContext<MaintenanceStore | null>(null);

function failure(error: unknown, fallback: string): { ok: false; error: string } {
  return { ok: false, error: error instanceof Error ? error.message : fallback };
}

function normalizeStoredTicket(ticket: LegacyStoredTicket): MaintenanceTicket {
  return {
    ...ticket,
    failedAt: ticket.failedAt || ticket.openedAt,
    failureType: ticket.failureType || "other",
    failureEvidenceRefs: ticket.failureEvidenceRefs ?? [],
    repairEvidenceRefs: ticket.repairEvidenceRefs ?? [],
  };
}

export function MaintenanceStoreProvider({ children }: { children: ReactNode }) {
  const { backend, access, workers } = useOpsStore();
  const remoteMode = backend.mode === "supabase";
  const [equipment, setEquipment] = useState<EquipmentRecord[]>(() => remoteMode ? [] : seedEquipment);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => remoteMode ? [] : seedMaintenanceTickets);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();

  const hydrateRemote = useCallback(async () => {
    if (backend.status !== "ready") return;
    const snapshot = await loadRemoteMaintenance(access);
    setEquipment(snapshot.equipment);
    setTickets(snapshot.tickets);
    setError(undefined);
    setReady(true);
  }, [access, backend.status]);

  const refreshMaintenance = useCallback(async () => {
    if (!remoteMode) return;
    setReady(false);
    try {
      await hydrateRemote();
    } catch (caught) {
      setEquipment([]);
      setTickets([]);
      setError(caught instanceof Error ? caught.message : "No fue posible cargar mantenimiento remoto.");
      setReady(true);
      throw caught;
    }
  }, [hydrateRemote, remoteMode]);

  useEffect(() => {
    if (remoteMode) {
      if (backend.status !== "ready") {
        const timer = window.setTimeout(() => {
          setEquipment([]);
          setTickets([]);
          setError(backend.status === "error" ? backend.error : undefined);
          setReady(backend.status === "error");
        }, 0);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => { void refreshMaintenance().catch(() => undefined); }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { equipment?: EquipmentRecord[]; tickets?: LegacyStoredTicket[] };
          if (parsed.equipment?.length) setEquipment(parsed.equipment);
          if (parsed.tickets) setTickets(parsed.tickets.map(normalizeStoredTicket));
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setError(undefined);
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [backend.error, backend.status, refreshMaintenance, remoteMode]);

  useEffect(() => {
    if (!ready || remoteMode) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ equipment, tickets }));
  }, [equipment, tickets, ready, remoteMode]);

  const reloadRemote = useCallback(async () => {
    try {
      await hydrateRemote();
    } catch (caught) {
      setError(caught instanceof Error ? `El cambio se guardó, pero no fue posible refrescar mantenimiento: ${caught.message}` : "El cambio se guardó, pero no fue posible refrescar mantenimiento.");
    }
  }, [hydrateRemote]);

  const value = useMemo<MaintenanceStore>(() => ({
    equipment,
    tickets,
    ready,
    error,
    async reportFailure(payload) {
      const asset = equipment.find((item) => item.id === payload.equipmentId);
      if (!asset) return { ok: false, error: "Equipo no encontrado." };
      if (!payload.title.trim()) return { ok: false, error: "Describe brevemente la falla." };
      if (!payload.description.trim()) return { ok: false, error: "Indica qué ocurrió o qué efecto tuvo." };
      const failedAtMs = Date.parse(payload.failedAt);
      if (!Number.isFinite(failedAtMs)) return { ok: false, error: "Indica cuándo ocurrió la falla." };
      if (failedAtMs > Date.now() + 5 * 60_000) return { ok: false, error: "La hora de falla no puede estar en el futuro." };
      if (tickets.some((ticket) => ticket.equipmentId === asset.id && ticket.status !== "closed")) return { ok: false, error: "Este equipo ya tiene una falla o reparación abierta." };

      if (remoteMode) {
        try {
          const id = await reportRemoteFailure(payload);
          await reloadRemote();
          return { ok: true, id };
        } catch (caught) {
          return failure(caught, "No fue posible reportar la falla.");
        }
      }

      const id = crypto.randomUUID();
      const openedAt = new Date().toISOString();
      const ticket: MaintenanceTicket = {
        id,
        equipmentId: asset.id,
        plantId: asset.plantId,
        plant: asset.plant,
        severity: payload.severity,
        failureType: payload.failureType,
        title: payload.title.trim(),
        description: payload.description.trim(),
        failedAt: new Date(payload.failedAt).toISOString(),
        openedAt,
        failureEvidenceRefs: payload.evidenceRefs,
        repairEvidenceRefs: [],
        status: "open",
      };
      setTickets((current) => [ticket, ...current]);
      setEquipment((current) => current.map((item) => item.id === asset.id ? { ...item, status: "stopped" } : item));
      return { ok: true, id };
    },
    async startRepair(ticketId) {
      const ticket = tickets.find((item) => item.id === ticketId);
      if (!ticket) return { ok: false, error: "Ticket no encontrado." };
      if (ticket.status !== "open") return { ok: false, error: ticket.status === "closed" ? "La reparación ya está cerrada." : "La reparación ya fue iniciada." };

      if (remoteMode) {
        try {
          await startRemoteRepair(ticketId);
          await reloadRemote();
          return { ok: true };
        } catch (caught) {
          return failure(caught, "No fue posible iniciar la reparación.");
        }
      }

      const repairStartedAt = new Date().toISOString();
      setTickets((current) => current.map((item) => item.id === ticketId ? { ...item, repairStartedAt, status: "repairing" } : item));
      setEquipment((current) => current.map((item) => item.id === ticket.equipmentId ? { ...item, status: "maintenance" } : item));
      return { ok: true };
    },
    async closeTicket(ticketId, payload) {
      const ticket = tickets.find((item) => item.id === ticketId);
      if (!ticket) return { ok: false, error: "Ticket no encontrado." };
      if (ticket.status !== "repairing" || !ticket.repairStartedAt) return { ok: false, error: "Debes iniciar la reparación antes de cerrarla." };
      if (!payload.cause.trim()) return { ok: false, error: "Registra la causa encontrada." };
      if (!payload.resolution.trim()) return { ok: false, error: "Registra la acción realizada." };
      if (payload.workerIds.length === 0) return { ok: false, error: "Selecciona al menos un trabajador para cerrar la reparación." };
      if (new Set(payload.workerIds).size !== payload.workerIds.length) return { ok: false, error: "La lista de trabajadores contiene duplicados." };
      const activeWorkers = new Set(workers.filter((worker) => worker.plantId === ticket.plantId && !worker.historical).map((worker) => worker.id));
      if (payload.workerIds.some((id) => !activeWorkers.has(id))) return { ok: false, error: "Uno o más trabajadores no pertenecen a la planta o están inactivos." };
      if (payload.spares.some((spare) => !spare.supplyId || !spare.lotCode.trim() || !Number.isFinite(spare.quantity) || spare.quantity <= 0)) return { ok: false, error: "Cada repuesto debe incluir insumo, lote y una cantidad mayor que cero." };

      if (remoteMode) {
        try {
          await closeRemoteMaintenanceTicket(ticketId, payload);
          await reloadRemote();
          return { ok: true };
        } catch (caught) {
          return failure(caught, "No fue posible cerrar la reparación.");
        }
      }

      const closedAt = new Date().toISOString();
      setTickets((current) => current.map((item) => item.id === ticketId ? {
        ...item,
        cause: payload.cause.trim(),
        resolution: payload.resolution.trim(),
        repairEvidenceRefs: payload.evidenceRefs,
        closedAt,
        status: "closed",
      } : item));
      setEquipment((current) => current.map((item) => item.id === ticket.equipmentId ? { ...item, status: "available" } : item));
      return { ok: true };
    },
    refreshMaintenance,
    resetMaintenanceDemo() {
      if (remoteMode) {
        void refreshMaintenance().catch(() => undefined);
        return;
      }
      setEquipment(seedEquipment);
      setTickets(seedMaintenanceTickets);
      setError(undefined);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [equipment, error, ready, refreshMaintenance, reloadRemote, remoteMode, tickets, workers]);

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenanceStore() {
  const context = useContext(MaintenanceContext);
  if (!context) throw new Error("useMaintenanceStore debe usarse dentro de MaintenanceStoreProvider");
  return context;
}
