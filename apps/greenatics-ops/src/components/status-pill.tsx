import type { ActivityStatus, AlertSeverity, PlantStatus } from "@/lib/domain";

type Status = ActivityStatus | AlertSeverity | PlantStatus;
const labels: Record<Status, string> = { normal: "Normal", attention: "Atención", stopped: "Detenido", running: "En curso", planned: "Programada", done: "Realizada", delayed: "Retrasada", missed: "No realizada", high: "Alta", medium: "Media", low: "Baja" };

export function StatusPill({ status }: { status: Status }) {
  return <span className={`status-pill status-${status}`}>{labels[status]}</span>;
}
