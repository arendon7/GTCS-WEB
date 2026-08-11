"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { useOpsStore } from "@/components/ops-store";
import { getLaborHours, getRejectionPct, type AcceptanceStatus } from "@/lib/domain";
import { employees, plantBaselines } from "@/lib/mock-data";
import { bogotaDateKey, bogotaTime } from "@/lib/time";

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="metric-block"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

const statusLabel: Record<AcceptanceStatus, string> = { accepted: "Aceptado", conditioned: "Condicionado", rejected: "Rechazado" };

function timeLabel(iso?: string) {
  if (!iso) return "—";
  return bogotaTime.format(new Date(iso));
}

export function TodayDashboard() {
  const { activities, incidents, receptions, ready, resetDemo } = useOpsStore();
  const [nowIso, setNowIso] = useState<string>();

  useEffect(() => {
    const update = () => setNowIso(new Date().toISOString());
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDateKey = bogotaDateKey(nowIso ?? "2026-08-11T12:00:00-05:00");
  const todayReceptions = receptions.filter((reception) => bogotaDateKey(reception.endedAt) === currentDateKey);
  const receivedKg = todayReceptions.reduce((sum,reception)=>sum+reception.netWeightKg,0);
  const running = activities.filter((activity) => activity.status === "running");
  const workerRows = running.flatMap((activity) => activity.workerIds.map((workerId) => ({ activity, worker: employees.find((item) => item.id === workerId) })));
  const scheduled = activities.filter((activity) => activity.source === "scheduled");
  const completedOrRunning = scheduled.filter((activity) => activity.status === "done" || activity.status === "running").length;
  const compliance = scheduled.length ? Math.round((completedOrRunning / scheduled.length) * 100) : 0;
  const laborHours = useMemo(() => activities.reduce((sum, activity) => sum + getLaborHours(activity, nowIso), 0), [activities, nowIso]);
  const delayed = activities.filter((activity) => activity.status === "delayed" || activity.status === "missed");
  const nonConforming = todayReceptions.filter((reception)=>reception.acceptance !== "accepted");
  const attentionCount = incidents.filter((incident) => incident.status === "open").length + delayed.length + nonConforming.length;

  return <>
    <header className="page-header">
      <div><p className="eyebrow">Martes · 11 agosto 2026</p><h1>Operación de hoy</h1><p className="lede">Qué se debía hacer, qué está ocurriendo y qué necesita atención.</p></div>
      <div className="header-actions"><Link className="button secondary" href="/calendar">Ver calendario</Link><Link className="button secondary" href="/receptions/new">Registrar recepción</Link><Link className="button primary" href="/activities/new">Registrar actividad</Link></div>
    </header>

    <section className="metrics-grid" aria-label="Indicadores de hoy">
      <Metric label="Recibido" value={`${(receivedKg/1000).toFixed(2)} t`} note={`${todayReceptions.length} recepciones registradas`} />
      <Metric label="Procesado" value={`${plantBaselines.reduce((sum,plant)=>sum+plant.processedT,0).toFixed(2)} t`} note="Producción: integración siguiente" />
      <Metric label="Horas-hombre" value={`${laborHours.toFixed(1)} h`} note="Calculadas desde actividades" />
      <Metric label="Cumplimiento" value={`${compliance} %`} note="Plan programado vs. ejecutado" />
    </section>

    <div className="content-grid">
      <section className="panel" id="operacion">
        <div className="section-head"><div><p className="eyebrow">Ahora</p><h2>Qué está haciendo el equipo</h2></div><span className="quiet">{workerRows.length} trabajadores activos</span></div>
        <div className="worker-list">{workerRows.length ? workerRows.map(({ activity, worker }) => <Link className="worker-row no-underline" href={`/activities/${activity.id}`} key={`${activity.id}-${worker?.id}`}><div className="avatar" aria-hidden="true">{worker?.name.slice(0, 1) ?? "?"}</div><div className="grow"><strong>{worker?.name ?? "Sin asignar"}</strong><span>{activity.title} · {activity.plant}</span></div><div className="right"><StatusPill status="running"/><small>desde {timeLabel(activity.actualStart)}</small></div></Link>) : <p className="quiet">No hay actividades en curso.</p>}</div>
      </section>

      <section className="panel" id="alertas">
        <div className="section-head"><div><p className="eyebrow">Atención</p><h2>Excepciones</h2></div><strong className="alert-count">{attentionCount}</strong></div>
        <div className="alert-list">
          {incidents.filter((incident) => incident.status === "open").map((incident) => <div className="alert-row" key={incident.id}><StatusPill status={incident.severity}/><strong>{incident.title}</strong><span>{incident.detail} · {incident.plant}</span></div>)}
          {nonConforming.map((reception)=><Link className="alert-row no-underline" href="/receptions" key={reception.id}><span className="status-pill status-medium">{statusLabel[reception.acceptance]}</span><strong>{reception.lotCode} · {getRejectionPct(reception).toFixed(1)} % rechazo</strong><span>{reception.generator} · {reception.plant}</span></Link>)}
          {delayed.map((activity) => <Link className="alert-row no-underline" href={`/activities/${activity.id}`} key={activity.id}><StatusPill status={activity.status}/><strong>{activity.title}</strong><span>Actividad programada pendiente · {activity.plant}</span></Link>)}
          {!attentionCount && <p className="quiet">Sin excepciones abiertas.</p>}
        </div>
      </section>
    </div>

    <section className="panel plant-panel" id="dashboard">
      <div className="section-head"><div><p className="eyebrow">Plantas</p><h2>Estado operativo</h2></div><div className="flex items-center gap-2"><span className="quiet">{ready ? "Persistencia local activa" : "Cargando estado…"}</span><button className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" type="button" onClick={resetDemo}>Restablecer demo</button></div></div>
      <div className="plant-table"><div className="plant-row plant-head"><span>Planta</span><span>Recibido</span><span>Procesado</span><span>Cumplimiento</span><span>Estado</span></div>{plantBaselines.map((plant)=>{ const plantReceived = todayReceptions.filter((r)=>r.plantId===plant.id).reduce((sum,r)=>sum+r.netWeightKg,0)/1000; return <div className="plant-row" key={plant.id}><strong>{plant.name}</strong><span>{plantReceived.toFixed(2)} t</span><span>{plant.processedT.toFixed(2)} t</span><span>{plant.planCompliancePct} %</span><span><StatusPill status={plant.status}/></span></div>; })}</div>
    </section>

    <section className="panel plant-panel mt-4"><div className="section-head"><div><p className="eyebrow">Recepciones de hoy</p><h2>Material que entró</h2></div><Link className="button secondary" href="/receptions">Ver todas</Link></div><div className="grid gap-2">{todayReceptions.slice(0,4).map((reception)=><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] py-3 first:border-t-0" key={reception.id}><div><strong className="block text-sm">{reception.lotCode}</strong><span className="text-xs text-[var(--muted)]">{reception.generator} · {reception.plant}</span></div><div className="text-right"><strong className="block text-sm">{reception.netWeightKg.toLocaleString("es-CO")} kg</strong><span className="text-[11px] text-[var(--muted)]">{getRejectionPct(reception).toFixed(1)} % rechazo</span></div></div>)}</div></section>
  </>;
}
