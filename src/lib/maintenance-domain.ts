import type { AlertSeverity } from "@/lib/domain";

export type EquipmentStatus = "available" | "attention" | "stopped" | "maintenance";
export type MaintenanceStatus = "open" | "repairing" | "closed";

export type EquipmentRecord = {
  id: string;
  plantId: string;
  plant: string;
  code: string;
  name: string;
  area: string;
  status: EquipmentStatus;
};

export type MaintenanceTicket = {
  id: string;
  equipmentId: string;
  plantId: string;
  plant: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  openedAt: string;
  repairStartedAt?: string;
  closedAt?: string;
  cause?: string;
  resolution?: string;
  status: MaintenanceStatus;
};

export function getDowntimeMinutes(ticket: MaintenanceTicket, nowIso?: string) {
  const end = ticket.closedAt ?? nowIso;
  if (!end) return 0;
  return Math.max(0, (new Date(end).getTime() - new Date(ticket.openedAt).getTime()) / 60000);
}
