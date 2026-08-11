export type PlantStatus = "normal" | "attention" | "stopped";
export type ActivityStatus = "running" | "planned" | "done" | "delayed" | "missed";
export type AlertSeverity = "high" | "medium" | "low";
export type ActivityUnit = "kg" | "t" | "L" | "unidades" | "m3";
export type NoveltyType = "equipment_failure" | "delay" | "quality" | "safety" | "other";
export type AcceptanceStatus = "accepted" | "conditioned" | "rejected" | "unknown";
export type WasteType = "FORSU" | "PODA" | "GALLINAZA" | "MATERIA_PRIMA" | "OTRO";
export type HistoricalProvenance = { importRunId: string; sourceName: string; sourceRowIds: string[] };

export type PlantSummary = { id: string; name: string; status: PlantStatus; receivedT: number; processedT: number; planCompliancePct: number };
export type Worker = { id: string; name: string; plantId: string; historical?: boolean };
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
  source: "scheduled" | "unplanned" | "historical";
  provenance?: HistoricalProvenance;
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

export type ReceptionRecord = {
  id: string;
  plantId: string;
  plant: string;
  generator: string;
  route: string;
  wasteType: WasteType;
  netWeightKg: number;
  rejectionKg: number;
  acceptance: AcceptanceStatus;
  observation?: string;
  startedAt: string;
  endedAt: string;
  lotCode: string;
  source: "demo" | "local" | "historical";
  timePrecision?: "datetime" | "date_only";
  provenance?: HistoricalProvenance;
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

export function getRejectionPct(reception: Pick<ReceptionRecord, "netWeightKg" | "rejectionKg">) {
  if (reception.netWeightKg <= 0) return 0;
  return (reception.rejectionKg / reception.netWeightKg) * 100;
}

export function getReceptionDurationMinutes(reception: Pick<ReceptionRecord, "startedAt" | "endedAt">) {
  return Math.max(0, (new Date(reception.endedAt).getTime() - new Date(reception.startedAt).getTime()) / 60000);
}
