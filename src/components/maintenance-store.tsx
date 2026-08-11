"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AlertSeverity } from "@/lib/domain";
import type { EquipmentRecord, MaintenanceTicket } from "@/lib/maintenance-domain";
import { seedEquipment, seedMaintenanceTickets } from "@/lib/maintenance-data";

const STORAGE_KEY = "greenatics-ops-maintenance-mvp-003";

type Result = { ok: true } | { ok: false; error: string };
type CreateResult = { ok: true; id: string } | { ok: false; error: string };
type FailurePayload = { equipmentId: string; severity: AlertSeverity; title: string; description: string };
type ClosePayload = { cause: string; resolution: string };

type MaintenanceStore = {
  equipment: EquipmentRecord[];
  tickets: MaintenanceTicket[];
  ready: boolean;
  reportFailure: (payload: FailurePayload) => CreateResult;
  startRepair: (ticketId: string) => Result;
  closeTicket: (ticketId: string, payload: ClosePayload) => Result;
  resetMaintenanceDemo: () => void;
};

const MaintenanceContext = createContext<MaintenanceStore | null>(null);

export function MaintenanceStoreProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState(seedEquipment);
  const [tickets, setTickets] = useState(seedMaintenanceTickets);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { equipment?: EquipmentRecord[]; tickets?: MaintenanceTicket[] };
          if (parsed.equipment?.length) setEquipment(parsed.equipment);
          if (parsed.tickets) setTickets(parsed.tickets);
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ equipment, tickets }));
  }, [equipment, tickets, ready]);

  const value = useMemo<MaintenanceStore>(() => ({
    equipment,
    tickets,
    ready,
    reportFailure(payload) {
      const asset = equipment.find((item) => item.id === payload.equipmentId);
      if (!asset) return { ok: false, error: "Equipo no encontrado." };
      if (!payload.title.trim()) return { ok: false, error: "Describe brevemente la falla." };
      if (!payload.description.trim()) return { ok: false, error: "Indica qué ocurrió o qué efecto tuvo." };
      if (tickets.some((ticket) => ticket.equipmentId === asset.id && ticket.status !== "closed")) return { ok: false, error: "Este equipo ya tiene una falla o reparación abierta." };
      const id = crypto.randomUUID();
      const openedAt = new Date().toISOString();
      const ticket: MaintenanceTicket = { id, equipmentId: asset.id, plantId: asset.plantId, plant: asset.plant, severity: payload.severity, title: payload.title.trim(), description: payload.description.trim(), openedAt, status: "open" };
      setTickets((current) => [ticket, ...current]);
      setEquipment((current) => current.map((item) => item.id === asset.id ? { ...item, status: "stopped" } : item));
      return { ok: true, id };
    },
    startRepair(ticketId) {
      const ticket = tickets.find((item) => item.id === ticketId);
      if (!ticket) return { ok: false, error: "Ticket no encontrado." };
      if (ticket.status !== "open") return { ok: false, error: ticket.status === "closed" ? "La reparación ya está cerrada." : "La reparación ya fue iniciada." };
      const repairStartedAt = new Date().toISOString();
      setTickets((current) => current.map((item) => item.id === ticketId ? { ...item, repairStartedAt, status: "repairing" } : item));
      setEquipment((current) => current.map((item) => item.id === ticket.equipmentId ? { ...item, status: "maintenance" } : item));
      return { ok: true };
    },
    closeTicket(ticketId, payload) {
      const ticket = tickets.find((item) => item.id === ticketId);
      if (!ticket) return { ok: false, error: "Ticket no encontrado." };
      if (ticket.status !== "repairing" || !ticket.repairStartedAt) return { ok: false, error: "Debes iniciar la reparación antes de cerrarla." };
      if (!payload.cause.trim()) return { ok: false, error: "Registra la causa encontrada." };
      if (!payload.resolution.trim()) return { ok: false, error: "Registra la acción realizada." };
      const closedAt = new Date().toISOString();
      setTickets((current) => current.map((item) => item.id === ticketId ? { ...item, cause: payload.cause.trim(), resolution: payload.resolution.trim(), closedAt, status: "closed" } : item));
      setEquipment((current) => current.map((item) => item.id === ticket.equipmentId ? { ...item, status: "available" } : item));
      return { ok: true };
    },
    resetMaintenanceDemo() {
      setEquipment(seedEquipment);
      setTickets(seedMaintenanceTickets);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }), [equipment, tickets, ready]);

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenanceStore() {
  const context = useContext(MaintenanceContext);
  if (!context) throw new Error("useMaintenanceStore debe usarse dentro de MaintenanceStoreProvider");
  return context;
}
