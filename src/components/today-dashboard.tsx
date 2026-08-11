"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useOpsStore } from "@/components/ops-store";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { useCompostStore } from "@/components/compost-store";
import { buildOperationalAnalytics } from "@/lib/analytics";
import { getRejectionPct, type AcceptanceStatus } from "@/lib/domain";
import { bogotaDateKey, bogotaTime } from "@/lib/time";

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-block"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

const statusLabel: Record<AcceptanceStatus, string> = { accepted: "Aceptado", conditioned: "Condicionado", rejected: "Rechazado", unknown: "Sin dato histórico" };
const dayFormatter = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });

function timeLabel(iso?: string) {
  if (!iso) return "—";
  return bogotaTime.format(new Date(iso));
}

export function TodayDashboard() {
  const { activities, incidents, receptions, workers, ready, resetDemo } = useOpsStore();
  const { equipment, tickets } = useMaintenanceStore();
  const { piles, measurements } = useCompostStore();
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());

  useEffect(() => {
    const update = () => setNowIso(new Date().toISOString());
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDateKey = bogotaDateKey(nowIso);
  const analytics = useMemo(() => buildOperationalAnalytics({ activities, receptions, incidents, tickets, equipment, piles, measurements, workers, preset: "day", anchorKey: currentDateKey, plantId: "all", nowIso }), [activities, receptions, incidents, tickets, equipment, piles, measurements, workers, currentDateKey, nowIso]);
  const todayReceptions = receptions.filter((reception) => bogotaDateKey(reception.endedAt) === currentDateKey);
  const running = activities.filter((activity) => activity.status === "running");
  const workerRows = running.flatMap((activity) => activity.workerIds.map((workerId) => ({ activity, worker: workers.find((item) => item.id === workerId) })));
  const delayed = activities.filter((activity) => (activity.status === "delayed" || activity.status === "missed") && bogotaDateKey(activity.plannedStart) === currentDateKey);
  const nonConforming = todayReceptions.filter((reception)=>reception.acceptance === "conditioned" || reception.acceptance === "rejected");
  const openIncidents = incidents.filter((incident) => incident.status === "open");
  const activeMaintenance = tickets.filter((ticket) => ticket.status !== "closed");
  const currentAttentionCount = activeMaintenance.length + openIncidents.length + nonConforming.length + delayed.length;
  const dayLabel = dayFormatter.format(new Date(nowIso));

  return <>
    <header className="page-header">
      <div><p className="eyebrow capitalize">{dayLabel}</p><h1>Operación de hoy</h1><p className="lede">Qué se debía hacer, qué está ocurriendo y qué necesita atención.</p></div>
      <div className="header-actions"><Link className="button secondary" href="/calendar">Ver calendario</Link><Link className="button secondary" href="/receptions/new">Registrar recepción</Link><Link className="button primary" href="/activities/new">Registrar actividad</Link></div>
    </header>

    <section className="metrics-grid" aria-label="Indicadores de hoy">
      <Metric label="Recibido" value={`${(analytics.receivedKg/1000).toFixed(2)} t`} note={`${analytics.dataCounts.receptions} recepciones`} />
      <Metric label="Rechazo" value={`${analytics.rejectionPct.toFixed(1)} %`} note={`${analytics.rejectionKg.toFixed(0)} kg`} />
      <Metric label="Horas-hombre" value={`${analytics.laborHours.toFixed(1)} h`} note="actividad ejecutada" />
      <Metric label="Cumplimiento" value={`${analytics.compliancePct.toFixed(0)} %`} note={`${analytics.executedScheduledCount}/${analytics.scheduledCount} programadas`} />
    </section>

    <div className="content-grid">
      <section className="panel" id="operacion">
        <div className="section-head"><div><p className="eyebrow">Ahora</p><h2>Qué está haciendo el equipo</h2></div><span className="quiet">{workerRows.length} trabajadores activos</span></div>
        <div className="worker-list">{workerRows.length ? workerRows.map(({ activity, worker }) => <Link className="worker-row no-underline" href={`/activities/${activity.id}`} key={`${activity.id}-${worker?.id}`}><div className="avatar" aria-hidden="true">{worker?.name.slice(0, 1) ?? "?"}</div><div className="grow"><strong>{worker?.name ?? "Sin asignar"}</strong><span>{activity.title} · {activity.plant}</span></div><div className="right"><StatusPill status="running"/><small>desde {timeLabel(activity.actualStart)}</small></div></Link>) : <p className="quiet">No hay actividades en curso.</p>}</div>
      </section>

      <section className="panel" id="alertas">
        <div className="section-head"><div><p className="eyebrow">Atención</p><h2>Excepciones</h2></div><strong className="alert-count">{currentAttentionCount}</strong></div>
        <div className="alert-list">
          {activeMaintenance.map((ticket) => { const asset = equipment.find((item) => item.id === ticket.equipmentId); return <Link className="alert-row no-underline" href={`/equipment/${ticket.equipmentId}`} key={`maintenance-${ticket.id}`}><StatusPill status={ticket.severity}/><strong>{asset ? `${asset.code} · ${asset.name}` : "Equipo"} · {ticket.title}</strong><span>{ticket.status === "repairing" ? "En reparación" : "Detenido"} · {ticket.plant}</span></Link>; })}
          {openIncidents.map((incident) => <div className="alert-row" key={incident.id}><StatusPill status={incident.severity}/><strong>{incident.title}</strong><span>{incident.detail} · {incident.plant}</span></div>)}
          {nonConforming.map((reception)=><Link className="alert-row no-underline" href="/receptions" key={reception.id}><span className="status-pill status-medium">{statusLabel[reception.acceptance]}</span><strong>{reception.lotCode} · {getRejectionPct(reception).toFixed(1)} % rechazo</strong><span>{reception.generator} · {reception.plant}</span></Link>)}
          {delayed.map((activity) => <Link className="alert-row no-underline" href={`/activities/${activity.id}`} key={activity.id}><StatusPill status={activity.status}/><strong>{activity.title}</strong><span>Actividad programada pendiente · {activity.plant}</span></Link>)}
          {!currentAttentionCount && <p className="quiet">Sin excepciones abiertas.</p>}
        </div>
      </section>
    </div>

    <section className="panel plant-panel" id="estado-plantas">
      <div className="section-head"><div><p className="eyebrow">Plantas</p><h2>Estado operativo</h2></div><div className="flex items-center gap-3"><Link className="text-xs font-semibold text-[var(--green)]" href="/dashboard">Abrir dashboard</Link><span className="quiet">{ready ? "Persistencia local activa" : "Cargando estado…"}</span><button className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" type="button" onClick={resetDemo}>Restablecer demo</button></div></div>
      <div className="plant-table"><div className="plant-row plant-head"><span>Planta</span><span>Recibido</span><span>Rechazo</span><span>Plan</span><span>Atención</span></div>{analytics.plantComparison.map((plant)=><div className="plant-row" key={plant.plantId}><strong>{plant.plant}</strong><span>{(plant.receivedKg/1000).toFixed(2)} t</span><span>{plant.rejectionPct.toFixed(1)} %</span><span>{plant.compliancePct.toFixed(0)} %</span><strong className={plant.attention ? "text-[var(--red)]" : "text-[var(--green)]"}>{plant.attention}</strong></div>)}</div>
    </section>

    <section className="panel plant-panel mt-4"><div className="section-head"><div><p className="eyebrow">Recepciones de hoy</p><h2>Material que entró</h2></div><Link className="button secondary" href="/receptions">Ver todas</Link></div><div className="grid gap-2">{todayReceptions.slice(0,4).map((reception)=><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] py-3 first:border-t-0" key={reception.id}><div><strong className="block text-sm">{reception.lotCode}</strong><span className="text-xs text-[var(--muted)]">{reception.generator} · {reception.plant}</span></div><div className="text-right"><strong className="block text-sm">{reception.netWeightKg.toLocaleString("es-CO")} kg</strong><span className="text-[11px] text-[var(--muted)]">{getRejectionPct(reception).toFixed(1)} % rechazo</span></div></div>)}{!todayReceptions.length && <p className="quiet">Aún no hay recepciones registradas hoy.</p>}</div></section>
  </>;
}
