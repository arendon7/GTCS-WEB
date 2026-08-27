"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useOpsStore } from "@/components/ops-store";
import type { IncidentRecord } from "@/lib/domain";

const dateTime = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

type StatusFilter = "all" | IncidentRecord["status"];

function formatDate(value?: string) {
  return value ? dateTime.format(new Date(value)) : "—";
}

export function IncidentHistoryView() {
  const { incidents, ready } = useOpsStore();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [plantId, setPlantId] = useState("all");

  const openCount = incidents.filter((incident) => incident.status === "open").length;
  const closedCount = incidents.filter((incident) => incident.status === "closed").length;
  const plants = useMemo(() => [...new Map(incidents.map((incident) => [incident.plantId, incident.plant])).entries()].sort((a, b) => a[1].localeCompare(b[1], "es")), [incidents]);
  const visible = useMemo(() => incidents
    .filter((incident) => status === "all" || incident.status === status)
    .filter((incident) => plantId === "all" || incident.plantId === plantId)
    .sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()), [incidents, plantId, status]);

  return <>
    <header className="page-header">
      <div><p className="eyebrow">Trazabilidad operacional</p><h1>Incidentes y excepciones</h1><p className="lede">Consulta qué se abrió, qué sigue pendiente y cómo quedó resuelta cada novedad operacional.</p></div>
      <div className="header-actions"><Link className="button secondary" href="/app#alertas">Volver a atención</Link><Link className="button primary" href="/dashboard">Ver dashboard</Link></div>
    </header>

    <section className="metrics-grid" aria-label="Resumen de incidentes">
      <div className="metric-block"><span>Abiertos</span><strong>{openCount}</strong><small>requieren atención</small></div>
      <div className="metric-block"><span>Resueltos</span><strong>{closedCount}</strong><small>conservan trazabilidad</small></div>
      <div className="metric-block"><span>Total</span><strong>{incidents.length}</strong><small>en el snapshot visible</small></div>
    </section>

    <section className="panel mb-4">
      <div className="section-head"><div><p className="eyebrow">Filtros</p><h2>Historial visible</h2></div><span className="quiet">{visible.length} registro{visible.length === 1 ? "" : "s"}</span></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Estado<select aria-label="Filtrar por estado" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="all">Todos</option><option value="open">Abiertos</option><option value="closed">Resueltos</option></select></label>
        <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Planta<select aria-label="Filtrar por planta" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(event) => setPlantId(event.target.value)}><option value="all">Todas</option>{plants.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      </div>
    </section>

    <section className="panel">
      <div className="section-head"><div><p className="eyebrow">Expediente</p><h2>Aperturas y resoluciones</h2></div><span className="quiet">fuente: incidentes canónicos</span></div>
      {!ready ? <p className="quiet">Cargando incidentes…</p> : visible.length ? <div className="grid gap-3">{visible.map((incident) => <article className="rounded-xl border border-[var(--line)] p-4" data-incident-id={incident.id} key={incident.id}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-2"><StatusPill status={incident.severity}/><strong className="text-sm">{incident.title}</strong></div><span className={`status-pill ${incident.status === "open" ? "status-medium" : "status-normal"}`}>{incident.status === "open" ? "Abierto" : "Resuelto"}</span></div>
        <p className="mt-3 text-sm text-[var(--ink)]">{incident.detail}</p>
        <div className="mt-3 grid gap-1 text-xs text-[var(--muted)] sm:grid-cols-2"><span><strong>Planta:</strong> {incident.plant}</span><span><strong>Apertura:</strong> {formatDate(incident.openedAt)}</span>{incident.status === "closed" ? <span><strong>Cierre:</strong> {formatDate(incident.closedAt)}</span> : null}{incident.equipment ? <span><strong>Equipo:</strong> {incident.equipment}</span> : null}</div>
        {incident.status === "closed" ? <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-3"><span className="quiet">Resolución</span><p className="mt-1 text-sm">{incident.resolutionNote?.trim() || "Resolución registrada sin nota visible en este snapshot."}</p></div> : null}
        {incident.activityId ? <Link className="mt-3 inline-block text-xs font-semibold text-[var(--green)] underline underline-offset-4" href={`/activities/${incident.activityId}`}>Ver actividad relacionada</Link> : null}
      </article>)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] p-8 text-center"><strong className="block text-sm">Sin incidentes para estos filtros</strong><p className="quiet mt-2">Cambia el estado o la planta para ampliar la consulta.</p></div>}
    </section>
  </>;
}
