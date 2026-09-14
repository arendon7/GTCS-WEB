export type PlanningStatus = "planned" | "running" | "done" | "delayed" | "missed" | "rescheduled";

export type PlanningWorker = {
  id: string;
  plantId: string;
  name: string;
  active: boolean;
};

export type PlanningProcess = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  active: boolean;
};

export type PlanningTemplate = {
  id: string;
  plantId: string;
  processId: string;
  code: string;
  name: string;
  requiresEquipment: boolean;
  active: boolean;
};

export type PlanningEquipment = {
  id: string;
  plantId: string;
  code: string;
  name: string;
  status: "available" | "attention" | "stopped" | "maintenance";
  processIds: string[];
};

export type PlannedActivity = {
  id: string;
  plantId: string;
  title: string;
  processId?: string;
  processName?: string;
  templateId?: string;
  equipmentId?: string;
  equipmentLabel?: string;
  plannedStart: string;
  plannedEnd?: string;
  status: PlanningStatus;
  planningNote?: string;
  deviationReason?: string;
  rescheduledFromId?: string;
  rescheduleReason?: string;
  workerIds: string[];
};

export type PlanningSnapshot = {
  processes: PlanningProcess[];
  templates: PlanningTemplate[];
  workers: PlanningWorker[];
  equipment: PlanningEquipment[];
  schedules: PlannedActivity[];
};

export type CreateScheduleInput = {
  plantId: string;
  templateId: string;
  plannedStart: string;
  plannedEnd: string;
  workerIds: string[];
  equipmentId?: string;
  planningNote?: string;
};

export type ReviseScheduleInput = Omit<CreateScheduleInput, "plantId"> & {
  scheduleId: string;
  reason: string;
};

export type ScheduleDeviationInput = {
  scheduleId: string;
  status: "delayed" | "missed";
  reason: string;
};

export function isPlannerRole(role: string) {
  return role === "supervisor" || role === "technical" || role === "admin" || role === "director";
}

export function validateScheduleDraft(input: Pick<CreateScheduleInput, "templateId" | "plannedStart" | "plannedEnd" | "workerIds">) {
  if (!input.templateId) return { ok: false as const, error: "Selecciona una actividad." };
  if (!input.plannedStart || !input.plannedEnd) return { ok: false as const, error: "Define inicio y fin de la programación." };
  const start = new Date(input.plannedStart).getTime();
  const end = new Date(input.plannedEnd).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return { ok: false as const, error: "La fecha u hora programada no es válida." };
  if (end <= start) return { ok: false as const, error: "La hora final debe ser posterior al inicio." };
  const uniqueWorkers = new Set(input.workerIds.filter(Boolean));
  if (!uniqueWorkers.size) return { ok: false as const, error: "Asigna al menos un trabajador." };
  if (uniqueWorkers.size !== input.workerIds.length) return { ok: false as const, error: "Hay trabajadores repetidos en la programación." };
  return { ok: true as const };
}
