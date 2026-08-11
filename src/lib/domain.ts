export type PlantStatus = "normal" | "attention" | "stopped";
export type ActivityStatus = "running" | "planned" | "done" | "delayed" | "missed";
export type AlertSeverity = "high" | "medium" | "low";
export type ActivityUnit = "kg" | "t" | "L" | "unidades" | "m3";
export type NoveltyType = "equipment_failure" | "delay" | "quality" | "safety" | "other";

export type PlantSummary = { id: string; name: string; status: PlantStatus; receivedT: number; processedT: number; planCompliancePct: number };
export type Worker = { id: string; name: string; plantId: string };
export type OpsAlert = { id: string; severity: AlertSeverity; title: string; detail: string; plant: string };

export type ActivityRecord = {
  id: string;
  plantId: string;
  plant: string;
  title: string;
  process: string;
  plannedStart: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  workerIds: string[];
  equipment?: string;
  status: ActivityStatus;
  quantity?: number;
  unit?: ActivityUnit;
  noveltyType?: NoveltyType;
  novelty?: string;
  source: "scheduled" | "unplanned";
};

export type IncidentRecord = {
  id: string;
  activityId: string;
  plantId: string;
  plant: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  equipment?: string;
  openedAt: string;
  status: "open" | "closed";
};

export function getDurationMinutes(activity: ActivityRecord, nowIso?: string) {
  if (!activity.actualStart) return 0;
  const end = activity.actualEnd ?? nowIso;
  if (!end) return 0;
  return Math.max(0, (new Date(end).getTime() - new Date(activity.actualStart).getTime()) / 60000);
}

export function getLaborHours(activity: ActivityRecord, nowIso?: string) {
  return (getDurationMinutes(activity, nowIso) * activity.workerIds.length) / 60;
}
