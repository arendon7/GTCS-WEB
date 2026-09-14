import type { EquipmentStatus, MaintenanceStatus } from "@/lib/maintenance-domain";

const equipmentLabels: Record<EquipmentStatus, string> = { available: "Disponible", attention: "Atención", stopped: "Detenido", maintenance: "Mantenimiento" };
const maintenanceLabels: Record<MaintenanceStatus, string> = { open: "Falla abierta", repairing: "En reparación", closed: "Cerrado" };
const classes: Record<EquipmentStatus | MaintenanceStatus, string> = {
  available: "bg-[var(--green-soft)] text-[var(--green-dark)]",
  attention: "bg-[var(--amber-soft)] text-[var(--amber)]",
  stopped: "bg-[var(--red-soft)] text-[var(--red)]",
  maintenance: "bg-[var(--blue-soft)] text-[var(--blue)]",
  open: "bg-[var(--red-soft)] text-[var(--red)]",
  repairing: "bg-[var(--blue-soft)] text-[var(--blue)]",
  closed: "bg-[var(--green-soft)] text-[var(--green-dark)]",
};

export function EquipmentStatusPill({ status }: { status: EquipmentStatus }) {
  return <span className={`status-pill ${classes[status]}`}>{equipmentLabels[status]}</span>;
}

export function MaintenanceStatusPill({ status }: { status: MaintenanceStatus }) {
  return <span className={`status-pill ${classes[status]}`}>{maintenanceLabels[status]}</span>;
}
