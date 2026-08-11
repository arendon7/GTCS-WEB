import type { ActivityRecord, IncidentRecord, PlantSummary, ReceptionRecord, Worker } from "@/lib/domain";

export const employees: Worker[] = [
  { id: "w-alejandro", name: "Alejandro", plantId: "tamesis" },
  { id: "w-gabriel", name: "Gabriel", plantId: "tamesis" },
  { id: "w-juan", name: "Juan", plantId: "tamesis" },
  { id: "w-jonathan", name: "Jonathan", plantId: "yarumal" },
  { id: "w-camilo", name: "Camilo", plantId: "yarumal" },
];

export const seedActivities: ActivityRecord[] = [
  { id: "act-001", plantId: "tamesis", plant: "Támesis", title: "Apertura y EPP", process: "Inicio de jornada", plannedStart: "2026-08-11T07:00:00-05:00", plannedEnd: "2026-08-11T07:30:00-05:00", actualStart: "2026-08-11T07:02:00-05:00", actualEnd: "2026-08-11T07:24:00-05:00", workerIds: ["w-gabriel"], status: "done", source: "scheduled" },
  { id: "act-002", plantId: "tamesis", plant: "Támesis", title: "Inspección de equipos", process: "Mantenimiento", plannedStart: "2026-08-11T07:30:00-05:00", plannedEnd: "2026-08-11T08:00:00-05:00", actualStart: "2026-08-11T07:31:00-05:00", actualEnd: "2026-08-11T07:58:00-05:00", workerIds: ["w-alejandro"], status: "done", source: "scheduled" },
  { id: "act-003", plantId: "tamesis", plant: "Támesis", title: "Recirculación biodigestor", process: "Digestión", plannedStart: "2026-08-11T08:00:00-05:00", plannedEnd: "2026-08-11T08:30:00-05:00", actualStart: "2026-08-11T08:04:00-05:00", actualEnd: "2026-08-11T08:29:00-05:00", workerIds: ["w-juan"], status: "done", source: "scheduled" },
  { id: "act-004", plantId: "tamesis", plant: "Támesis", title: "Molienda", process: "Pretratamiento", plannedStart: "2026-08-11T08:30:00-05:00", plannedEnd: "2026-08-11T11:00:00-05:00", actualStart: "2026-08-11T09:12:00-05:00", workerIds: ["w-alejandro", "w-gabriel"], equipment: "Molino M-01", status: "running", source: "scheduled" },
  { id: "act-005", plantId: "tamesis", plant: "Támesis", title: "Recepción ruta selectiva", process: "Recepción", plannedStart: "2026-08-11T10:30:00-05:00", plannedEnd: "2026-08-11T11:30:00-05:00", workerIds: ["w-juan"], status: "delayed", source: "scheduled" },
  { id: "act-006", plantId: "tamesis", plant: "Támesis", title: "Volteo TAM-COMP-260811-001", process: "Compostaje", plannedStart: "2026-08-11T13:00:00-05:00", plannedEnd: "2026-08-11T14:00:00-05:00", workerIds: [], status: "planned", source: "scheduled" },
  { id: "act-007", plantId: "tamesis", plant: "Támesis", title: "Aseo zona de recepción", process: "Aseo", plannedStart: "2026-08-11T15:00:00-05:00", plannedEnd: "2026-08-11T15:45:00-05:00", workerIds: [], status: "planned", source: "scheduled" },
  { id: "act-008", plantId: "yarumal", plant: "Yarumal", title: "Control de temperatura pilas", process: "Compostaje", plannedStart: "2026-08-11T08:00:00-05:00", plannedEnd: "2026-08-11T09:00:00-05:00", actualStart: "2026-08-11T08:05:00-05:00", actualEnd: "2026-08-11T08:52:00-05:00", workerIds: ["w-jonathan"], status: "done", source: "scheduled" },
  { id: "act-009", plantId: "yarumal", plant: "Yarumal", title: "Tamizaje", process: "Compostaje", plannedStart: "2026-08-11T09:00:00-05:00", plannedEnd: "2026-08-11T12:00:00-05:00", actualStart: "2026-08-11T09:18:00-05:00", workerIds: ["w-camilo"], equipment: "Tamiz T-01", status: "running", source: "scheduled" },
];

export const seedIncidents: IncidentRecord[] = [];

export const seedReceptions: ReceptionRecord[] = [
  { id: "rec-001", plantId: "yarumal", plant: "Yarumal", generator: "Aguas del Norte", route: "Ruta selectiva", wasteType: "FORSU", netWeightKg: 1840, rejectionKg: 85, acceptance: "accepted", observation: "Recepción normal.", startedAt: "2026-08-11T09:48:00-05:00", endedAt: "2026-08-11T10:11:00-05:00", lotCode: "YAR-FORSU-260811-001", source: "demo" },
  { id: "rec-002", plantId: "tamesis", plant: "Támesis", generator: "Ruta municipal", route: "Orgánicos centro", wasteType: "FORSU", netWeightKg: 2100, rejectionKg: 126, acceptance: "conditioned", observation: "Se observan impropios; se acepta con observación.", startedAt: "2026-08-11T10:36:00-05:00", endedAt: "2026-08-11T11:04:00-05:00", lotCode: "TAM-FORSU-260811-001", source: "demo" },
];

export const plantBaselines: PlantSummary[] = [
  { id: "yarumal", name: "Yarumal", status: "normal", receivedT: 0, processedT: 2.8, planCompliancePct: 91 },
  { id: "tamesis", name: "Támesis", status: "attention", receivedT: 0, processedT: 1.47, planCompliancePct: 76 },
];
