"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { useOpsStore } from "@/components/ops-store";
import { EquipmentStatusPill, MaintenanceStatusPill } from "@/components/equipment-status-pill";
import { getDowntimeMinutes, getRepairMinutes, maintenanceFailureTypeLabels } from "@/lib/maintenance-domain";
import { bogotaTime } from "@/lib/time";

function parseEvidenceRefs(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function EvidenceList({ refs }: { refs: string[] }) {
  if (refs.length === 0) return <span className="text-[var(--muted)]">Sin referencias</span>;
  return <ul className="mt-1 grid gap-1">{refs.map((ref)=><li className="break-all" key={ref}>{ref}</li>)}</ul>;
}

export function EquipmentDetail({ equipmentId }: { equipmentId: string }) {
  const { workers } = useOpsStore();
  const { equipment, tickets, startRepair, closeTicket } = useMaintenanceStore();
  const asset = equipment.find((item) => item.id === equipmentId);
  const assetTickets = useMemo(() => tickets.filter((ticket) => ticket.equipmentId === equipmentId).sort((a,b)=>new Date(b.openedAt).getTime()-new Date(a.openedAt).getTime()), [tickets, equipmentId]);
  const active = assetTickets.find((ticket) => ticket.status !== "closed");
  const plantWorkers = asset ? workers.filter((worker) => worker.plantId === asset.plantId && !worker.historical) : [];
  const [cause, setCause] = useState("");
  const [resolution, setResolution] = useState("");
  const [repairEvidence, setRepairEvidence] = useState("");
  const [repairWorkerIds, setRepairWorkerIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  if (!asset) return <section className="panel mx-auto max-w-3xl"><h1 className="text-2xl">Equipo no encontrado</h1><Link className="button secondary mt-5" href="/equipment">Volver</Link></section>;

  const beginRepair = async () => {
    if (!active || busy) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = await startRepair(active.id);
      setFeedback(result.ok ? "Reparación iniciada." : result.error);
    } finally {
      setBusy(false);
    }
  };
  const close = async () => {
    if (!active || busy) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = await closeTicket(active.id, { cause, resolution, evidenceRefs: parseEvidenceRefs(repairEvidence), workerIds: repairWorkerIds });
      if (!result.ok) return setFeedback(result.error);
      setCause("");
      setResolution("");
      setRepairEvidence("");
      setRepairWorkerIds([]);
      setFeedback("Reparación cerrada, equipo disponible y trabajo enviado a Bitácora operacional.");
    } finally {
      setBusy(false);
    }
  };
  const toggleRepairWorker = (id: string, checked: boolean) => setRepairWorkerIds((current) => checked ? [...current, id] : current.filter((value) => value !== id));

  return <>
    <header className="page-header"><div><p className="eyebrow">{asset.plant} · {asset.area}</p><h1>{asset.code} · {asset.name}</h1><p className="lede">Ficha operacional, cronología real, intervención, horas-hombre e historial de mantenimiento.</p></div><div className="header-actions"><Link className="button secondary" href="/equipment">Volver</Link>{!active && <Link className="button primary" href={`/equipment/${asset.id}/report`}>Reportar falla</Link>}</div></header>
    <section className="panel mx-auto max-w-4xl"><div className="section-head"><div><p className="eyebrow">Estado</p><h2>Situación actual</h2></div><EquipmentStatusPill status={asset.status}/></div>{active ? <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="block text-sm">{active.title}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{active.description}</span></div><MaintenanceStatusPill status={active.status}/></div><div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-3 sm:grid-cols-2 lg:grid-cols-4"><div><span className="quiet">Ocurrió</span><strong className="mt-1 block text-xs">{bogotaTime.format(new Date(active.failedAt || active.openedAt))}</strong></div><div><span className="quiet">Reportada</span><strong className="mt-1 block text-xs">{bogotaTime.format(new Date(active.openedAt))}</strong></div><div><span className="quiet">Fuera de servicio</span><strong className="mt-1 block text-xs">{Math.round(getDowntimeMinutes(active, new Date().toISOString()))} min</strong></div><div><span className="quiet">Tipo · severidad</span><strong className="mt-1 block text-xs">{maintenanceFailureTypeLabels[active.failureType ?? "other"]} · <span className="capitalize">{active.severity}</span></strong></div></div>{active.repairStartedAt && <div className="mt-3 border-t border-[var(--line)] pt-3 text-xs"><span className="quiet">Intervención en curso</span><strong className="mt-1 block">{Math.round(getRepairMinutes(active, new Date().toISOString()))} min desde {bogotaTime.format(new Date(active.repairStartedAt))}</strong></div>}<div className="mt-3 border-t border-[var(--line)] pt-3 text-xs"><span className="quiet">Evidencia de falla</span><EvidenceList refs={active.failureEvidenceRefs ?? []}/></div>{active.status === "open" && <div className="mt-4 flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={beginRepair}>{busy ? "Iniciando…" : "Iniciar reparación"}</button></div>}{active.status === "repairing" && <div className="mt-5 grid gap-4"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Causa encontrada<textarea className="min-h-20 rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]" value={cause} onChange={(e)=>setCause(e.target.value)} placeholder="Qué originó la falla"/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Acción realizada<textarea className="min-h-20 rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]" value={resolution} onChange={(e)=>setResolution(e.target.value)} placeholder="Qué se reparó o ajustó"/></label><fieldset className="grid gap-2"><legend className="mb-1 text-xs font-bold text-[var(--muted)]">Trabajadores que ejecutaron la reparación</legend><div className="grid gap-2 sm:grid-cols-2">{plantWorkers.map((worker) => <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3 text-xs" key={worker.id}><input type="checkbox" checked={repairWorkerIds.includes(worker.id)} onChange={(event)=>toggleRepairWorker(worker.id,event.target.checked)}/>{worker.name}</label>)}</div>{plantWorkers.length===0 && <span className="text-xs text-[var(--red)]">No hay trabajadores activos disponibles para esta planta.</span>}</fieldset><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Evidencia de reparación <span className="font-normal">(opcional, una referencia por línea)</span><textarea className="min-h-20 rounded-lg border border-[var(--line)] bg-white p-3 text-sm text-[var(--ink)]" value={repairEvidence} onChange={(e)=>setRepairEvidence(e.target.value)} placeholder="URL, código documental o referencia verificable"/></label><p className="rounded-lg bg-white p-3 text-xs text-[var(--muted)]">Al cerrar, la intervención se registra una sola vez en la Bitácora operacional con este intervalo y estos trabajadores. No dupliques la actividad manualmente.</p><div className="flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={close}>{busy ? "Cerrando…" : "Cerrar reparación"}</button></div></div>}</div> : <div className="rounded-xl bg-[var(--green-soft)] p-4 text-sm text-[var(--green-dark)]">No hay fallas o reparaciones abiertas para este equipo.</div>}{feedback && <p className="mt-4 rounded-lg bg-[var(--blue-soft)] p-3 text-sm font-semibold text-[var(--blue)]" role="status">{feedback}</p>}</section>
    <section className="panel mx-auto mt-4 max-w-4xl"><div className="section-head"><div><p className="eyebrow">Historial</p><h2>Tickets registrados</h2></div><span className="quiet">{assetTickets.length} eventos</span></div><div className="grid gap-3">{assetTickets.map((ticket)=><article className="rounded-xl border border-[var(--line)] p-4" key={ticket.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="text-sm">{ticket.title}</strong><span className="mt-1 block text-xs text-[var(--muted)]">Falla: {bogotaTime.format(new Date(ticket.failedAt || ticket.openedAt))} · Reporte: {bogotaTime.format(new Date(ticket.openedAt))} · {maintenanceFailureTypeLabels[ticket.failureType ?? "other"]}</span><span className="mt-1 block text-xs text-[var(--muted)]">{ticket.description}</span></div><MaintenanceStatusPill status={ticket.status}/></div>{ticket.status === "closed" && <div className="mt-3 grid gap-3 border-t border-[var(--line)] pt-3 text-xs sm:grid-cols-2 lg:grid-cols-5"><div><span className="quiet">Parada total</span><strong className="mt-1 block">{Math.round(getDowntimeMinutes(ticket))} min</strong></div><div><span className="quiet">Intervención</span><strong className="mt-1 block">{Math.round(getRepairMinutes(ticket))} min</strong></div><div><span className="quiet">Causa</span><strong className="mt-1 block">{ticket.cause}</strong></div><div><span className="quiet">Acción</span><strong className="mt-1 block">{ticket.resolution}</strong></div><div><span className="quiet">Bitácora</span><strong className="mt-1 block">{ticket.repairActivityId ? "Actividad enlazada" : "Ticket previo sin vínculo canónico"}</strong></div><div className="sm:col-span-2 lg:col-span-5"><span className="quiet">Evidencia reparación</span><EvidenceList refs={ticket.repairEvidenceRefs ?? []}/></div></div>}</article>)}</div></section>
  </>;
}