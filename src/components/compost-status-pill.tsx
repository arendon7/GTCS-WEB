import type { CompostStatus } from "@/lib/compost-domain";

const labels: Record<CompostStatus, string> = { active: "Activa", maturing: "Maduración", closed: "Cerrada" };
const classes: Record<CompostStatus, string> = {
  active: "bg-[var(--green-soft)] text-[var(--green-dark)]",
  maturing: "bg-[var(--amber-soft)] text-[var(--amber)]",
  closed: "bg-[var(--surface-soft)] text-[var(--muted)]",
};

export function CompostStatusPill({ status }: { status: CompostStatus }) {
  return <span className={`status-pill ${classes[status]}`}>{labels[status]}</span>;
}
