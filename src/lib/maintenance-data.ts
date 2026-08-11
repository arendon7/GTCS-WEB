import type { EquipmentRecord, MaintenanceTicket } from "@/lib/maintenance-domain";

export const seedEquipment: EquipmentRecord[] = [
  { id: "eq-tam-m01", plantId: "tamesis", plant: "Támesis", code: "M-01", name: "Molino", area: "Pretratamiento", status: "available" },
  { id: "eq-tam-bp01", plantId: "tamesis", plant: "Támesis", code: "BP-01", name: "Bomba peristáltica", area: "Digestión", status: "stopped" },
  { id: "eq-tam-r02", plantId: "tamesis", plant: "Támesis", code: "R-02", name: "Biodigestor", area: "Digestión", status: "available" },
  { id: "eq-yar-m01", plantId: "yarumal", plant: "Yarumal", code: "M-01", name: "Molino", area: "Pretratamiento", status: "available" },
  { id: "eq-yar-t01", plantId: "yarumal", plant: "Yarumal", code: "T-01", name: "Tamiz", area: "Compostaje", status: "attention" },
];

export const seedMaintenanceTickets: MaintenanceTicket[] = [
  { id: "mnt-001", equipmentId: "eq-tam-bp01", plantId: "tamesis", plant: "Támesis", severity: "high", title: "Obstrucción recurrente", description: "La bomba se detuvo durante la recirculación y requiere revisión antes de volver a operar.", openedAt: "2026-08-11T10:14:00-05:00", status: "open" },
];
