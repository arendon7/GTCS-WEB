export type PlantStatus = "normal" | "attention" | "stopped";
export type ActivityStatus = "running" | "planned" | "done" | "delayed" | "missed";
export type AlertSeverity = "high" | "medium" | "low";

export type PlantSummary = { id: string; name: string; status: PlantStatus; receivedT: number; processedT: number; planCompliancePct: number };
export type WorkerActivity = { worker: string; activity: string; plant: string; since: string; status: ActivityStatus };
export type OpsAlert = { id: string; severity: AlertSeverity; title: string; detail: string; plant: string };
export type CalendarItem = { time: string; activity: string; process: string; workers: string[]; status: ActivityStatus; actual?: string };
