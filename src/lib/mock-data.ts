import type { CalendarItem, OpsAlert, PlantSummary, WorkerActivity } from "./domain";

export const todayMetrics = { receivedT: 5.94, processedT: 4.61, workedHours: 27.4, compliancePct: 86 };

export const plants: PlantSummary[] = [
  { id: "yar", name: "Yarumal", status: "normal", receivedT: 3.84, processedT: 2.91, planCompliancePct: 91 },
  { id: "tam", name: "Támesis", status: "attention", receivedT: 2.1, processedT: 1.7, planCompliancePct: 76 }
];

export const workers: WorkerActivity[] = [
  { worker: "Alejandro", activity: "Molienda", plant: "Támesis", since: "09:12", status: "running" },
  { worker: "Gabriel", activity: "Molienda", plant: "Támesis", since: "09:12", status: "running" },
  { worker: "Operario 3", activity: "Control de pila C-018", plant: "Yarumal", since: "10:03", status: "running" }
];

export const alerts: OpsAlert[] = [
  { id: "a1", severity: "high", title: "Molino M-01 detenido", detail: "43 min de parada acumulada", plant: "Támesis" },
  { id: "a2", severity: "medium", title: "Volteo C-018 atrasado", detail: "1 h frente al plan", plant: "Yarumal" },
  { id: "a3", severity: "medium", title: "Recepción #182 sin evidencia", detail: "Falta fotografía o tiquete", plant: "Yarumal" }
];

export const calendarItems: CalendarItem[] = [
  { time: "07:00", activity: "Apertura / EPP", process: "Operación", workers: ["Alejandro", "Gabriel"], status: "done", actual: "07:02–07:18" },
  { time: "07:30", activity: "Inspección de equipos", process: "Mantenimiento", workers: ["Alejandro"], status: "done", actual: "07:31–07:52" },
  { time: "08:00", activity: "Recirculación", process: "Digestión", workers: ["Gabriel"], status: "done", actual: "08:03–08:44" },
  { time: "09:00", activity: "Molienda", process: "Pretratamiento", workers: ["Alejandro", "Gabriel"], status: "running", actual: "09:12–ahora" },
  { time: "11:30", activity: "Recepción ruta selectiva", process: "Recepción", workers: ["Alejandro"], status: "planned" },
  { time: "13:00", activity: "Volteo pila C-018", process: "Compostaje", workers: ["Gabriel"], status: "delayed" },
  { time: "15:00", activity: "Aseo zona recepción", process: "Aseo", workers: ["Alejandro", "Gabriel"], status: "planned" }
];
