import type { AlertSeverity } from "@/lib/domain";

export type EquipmentStatus = "available" | "attention" | "stopped" | "maintenance";
export type MaintenanceStatus = "open" | "repairing" | "closed";
export type MaintenanceFailureType =
  | "mechanical"
  | "electrical"
  | "hydraulic"
  | "pneumatic"
  | "blockage"
  | "instrumentation"
  | "structural"
  | "other";

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
  failureType: MaintenanceFailureType;
  title: string;
  description: string;
  failedAt: string;
  openedAt: string;
  repairStartedAt?: string;
  closedAt?: string;
  cause?: string;
  resolution?: string;
  failureEvidenceRefs: string[];
  repairEvidenceRefs: string[];
  status: MaintenanceStatus;
};

export const maintenanceFailureTypeLabels: Record<MaintenanceFailureType, string> = {
  mechanical: "Mecánica",
  electrical: "Eléctrica",
  hydraulic: "Hidráulica",
  pneumatic: "Neumática",
  blockage: "Obstrucción",
  instrumentation: "Instrumentación",
  structural: "Estructural",
  other: "Otra",
};

export function getDowntimeMinutes(ticket: MaintenanceTicket, nowIso?: string) {
  const end = ticket.closedAt ?? nowIso;
  if (!end) return 0;
  // Runtime fallback protects local pre-R2.4A snapshots without redefining the
  // canonical contract: hosted V2 tickets always carry failedAt.
  const start = ticket.failedAt || ticket.openedAt;
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60000);
}
