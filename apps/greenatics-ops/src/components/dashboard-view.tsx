"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useOpsStore } from "@/components/ops-store";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { useCompostStore } from "@/components/compost-store";
import { buildOperationalAnalytics, analyticsCsv, type DashboardPreset, type RankedValue } from "@/lib/analytics";
import { bogotaDateKey, bogotaTime } from "@/lib/time";

function formatTons(kg: number) { return `${(kg / 1000).toFixed(2)} t`; }
function formatHours(hours: number) { return `${hours.toFixed(1)} h`; }
function formatDowntime(minutes: number) { return minutes >= 60 ? `${(minutes / 60).toFixed(1)} h` : `${Math.round(minutes)} min`; }

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="border-b border-[var(--line)] py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0"><span className="quiet">{label}</span><strong className="mt-1 block text-2xl tracking-tight">{value}</strong><span className="mt-1 block text-[11px] text-[var(--muted)]">{note}</span></div>;
}

function RankedBars({ rows, formatter, empty }: { rows: RankedValue[]; formatter: (value: number) => string; empty: string }) {
  const max = Math.max(...rows.map((row) => row.value), 0);
  if (!rows.length) return <p className="quiet rounded-lg bg-[var(--surface-soft)] p-3">{empty}</p>;
  return <div className="grid gap-3">{rows.slice(0, 7).map((row) => <div key={row.id}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span><strong>{row.label}</strong>{row.detail && <span className="ml-2 text-[var(--muted)]">{row.detail}</span>}</span><strong>{formatter(row.value)}</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--green)]" style={{ width: `${max ? Math.max(4, row.value / max * 100) : 0}%` }} /></div></div>)}</div>;
}

function ExportCsvButton({ csv, filename }: { csv: string; filename: string }) {
  const download = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };
  return <button className="button secondary" type="button" onClick={download}>Exportar CSV</button>;
}

export function DashboardView() {
  const { activities, receptions, incidents, workers } = useOpsStore();
  const { equipment, tickets } = useMaintenanceStore();
  const { piles, measurements } = useCompostStore();
  const [nowIso, setNowIso] = useState(() => new Date().toISOString());
  const [preset, setPreset] = useState<DashboardPreset>("day");
  const [anchorKey, setAnchorKey] = useState(() => bogotaDateKey(new Date()));
  const [plantId, setPlantId] = useState("all");

  useEffect(() => {
    const timer = window.setInterval(() => setNowIso(new Date().toISOString()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const analytics = useMemo(() => buildOperationalAnalytics({ activities, receptions, incidents, tickets, equipment, piles, measurements, workers, preset, anchorKey, plantId, nowIso }), [activities, receptions, incidents, tickets, equipment, piles, measurements, workers, preset, anchorKey, plantId, nowIso]);
  const maxReceived = Math.max(...analytics.trend.map((point) => point.receivedKg), 0);
  const maxLabor = Math.max(...analytics.trend.map((point) => point.laborHours), 0);
  const csv = useMemo(() => analyticsCsv(analytics), [analytics]);

  return <>
    <header className="page-header"><div><p className="eyebrow">Control operacional</p><h1>Dashboard</h1><p className="lede">Día, semana, mes e histórico con la misma semántica de operación.</p></div><div className="header-actions"><Link className="button secondary" href="/">Volver a hoy</Link><ExportCsvButton csv={csv} filename={`greenatics-ops-${analytics.period.startKey}-${analytics.period.endKey}.csv`} /></div></header>

    <section className="panel mb-4"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="eyebrow">Periodo</p><strong className="mt-1 block text-lg capitalize">{analytics.period.label}</strong></div><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="segmented" aria-label="Horizonte del dashboard">{(["day","week","month","history"] as DashboardPreset[]).map((item) => <button className={preset === item ? "active" : ""} key={item} type="button" onClick={() => setPreset(item)}>{{ day: "Día", week: "Semana", month: "Mes", history: "Histórico" }[item]}</button>)}</div>{preset !== "history" && <label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Fecha<input className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm normal-case text-[var(--ink)]" type="date" value={anchorKey} onChange={(event) => setAnchorKey(event.target.value)} /></label>}<label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Planta<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm normal-case text-[var(--ink)]" value={plantId} onChange={(event) => setPlantId(event.target.value)}><option value="all">Todas</option><option value="yarumal">Yarumal</option><option value="tamesis">Támesis</option></select></label></div></div></section>

    <section className="panel mb-4" aria-label="Indicadores operativos"><div className="grid sm:grid-cols-2 xl:grid-cols-6"><Kpi label="Recibido" value={formatTons(analytics.receivedKg)} note={`${analytics.dataCounts.receptions} recepciones`} /><Kpi label="Rechazo" value={`${analytics.rejectionPct.toFixed(1)} %`} note={`${analytics.rejectionKg.toFixed(0)} kg`} /><Kpi label="Horas-hombre" value={formatHours(analytics.laborHours)} note="actividad ejecutada" /><Kpi label="Cumplimiento" value={`${analytics.compliancePct.toFixed(0)} %`} note={`${analytics.executedScheduledCount}/${analytics.scheduledCount} programadas`} /><Kpi label="Paradas" value={formatDowntime(analytics.downtimeMinutes)} note={`${analytics.maintenanceTickets} tickets en periodo`} /><Kpi label="Excepciones" value={String(analytics.exceptionsCount)} note="requieren lectura" /></div></section>

    <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
      <section className="panel"><div className="section-head"><div><p className="eyebrow">Tendencia</p><h2>Material y trabajo</h2></div><span className="quiet">{analytics.trend.length} periodos</span></div><div className="grid gap-3">{analytics.trend.length ? analytics.trend.map((point) => <div className="grid grid-cols-[72px_1fr] gap-3" key={point.key}><span className="pt-1 text-[11px] font-semibold text-[var(--muted)]">{point.label}</span><div className="grid gap-1"><div className="flex items-center gap-2"><div className="h-2 grow overflow-hidden rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--green)]" style={{ width: `${maxReceived ? point.receivedKg / maxReceived * 100 : 0}%` }} /></div><strong className="w-16 text-right text-[11px]">{(point.receivedKg/1000).toFixed(2)} t</strong></div><div className="flex items-center gap-2"><div className="h-1.5 grow overflow-hidden rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--blue)]" style={{ width: `${maxLabor ? point.laborHours / maxLabor * 100 : 0}%` }} /></div><span className="w-16 text-right text-[10px] text-[var(--muted)]">{point.laborHours.toFixed(1)} hh</span></div>{point.downtimeMinutes > 0 && <span className="text-[10px] text-[var(--red)]">Parada: {formatDowntime(point.downtimeMinutes)}</span>}</div></div>) : <p className="quiet">Sin datos para el periodo.</p>}</div></section>

      <section className="panel"><div className="section-head"><div><p className="eyebrow">Plan vs. real</p><h2>Cumplimiento</h2></div><strong className="text-2xl">{analytics.compliancePct.toFixed(0)} %</strong></div><div className="h-3 overflow-hidden rounded-full bg-[var(--surface-soft)]"><div className="h-full rounded-full bg-[var(--green)]" style={{ width: `${Math.min(100, analytics.compliancePct)}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><span className="quiet">Programadas</span><strong className="mt-1 block text-lg">{analytics.scheduledCount}</strong></div><div><span className="quiet">Ejecutadas</span><strong className="mt-1 block text-lg">{analytics.executedScheduledCount}</strong></div><div><span className="quiet">Retrasadas/omitidas</span><strong className="mt-1 block text-lg">{analytics.delayedCount}</strong></div><div><span className="quiet">No programadas</span><strong className="mt-1 block text-lg">{analytics.unplannedCount}</strong></div></div></section>
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-2"><section className="panel"><div className="section-head"><div><p className="eyebrow">Trabajo</p><h2>Horas-hombre por proceso</h2></div></div><RankedBars rows={analytics.processHours} formatter={formatHours} empty="Sin actividad ejecutada en el periodo." /></section><section className="panel"><div className="section-head"><div><p className="eyebrow">Personas</p><h2>Horas por trabajador</h2></div></div><RankedBars rows={analytics.workerHours} formatter={formatHours} empty="Sin horas registradas en el periodo." /></section></div>

    <div className="mt-4 grid gap-4 xl:grid-cols-2"><section className="panel"><div className="section-head"><div><p className="eyebrow">Mantenimiento</p><h2>Tiempo fuera de servicio</h2></div><Link className="text-xs font-semibold text-[var(--green)]" href="/equipment">Ver equipos</Link></div><RankedBars rows={analytics.equipmentDowntime} formatter={formatDowntime} empty="Sin paradas registradas en el periodo." /></section><section className="panel"><div className="section-head"><div><p className="eyebrow">Compostaje</p><h2>Estado del proceso</h2></div><Link className="text-xs font-semibold text-[var(--green)]" href="/compost">Ver pilas</Link></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div><span className="quiet">Activas</span><strong className="mt-1 block text-xl">{analytics.activePiles}</strong></div><div><span className="quiet">Maduración</span><strong className="mt-1 block text-xl">{analytics.maturingPiles}</strong></div><div><span className="quiet">Cerradas periodo</span><strong className="mt-1 block text-xl">{analytics.closedPilesInPeriod}</strong></div><div><span className="quiet">Rendimiento</span><strong className="mt-1 block text-xl">{analytics.closedPilesInPeriod ? `${analytics.averageClosedYieldPct.toFixed(1)} %` : "—"}</strong></div></div><div className="mt-5 grid gap-2">{analytics.latestCompost.map((pile) => <Link className="flex items-center justify-between gap-3 rounded-lg bg-[var(--surface-soft)] p-3 no-underline" href={`/compost/${pile.pileId}`} key={pile.pileId}><span><strong className="block text-xs">{pile.code}</strong><span className="text-[10px] text-[var(--muted)]">{pile.plant} · {pile.status === "maturing" ? "Maduración" : "Activa"}</span></span><span className="text-right text-xs font-semibold">{pile.temperatureC !== undefined ? `${pile.temperatureC.toFixed(1)} °C` : "Sin control"}{pile.humidityPct !== undefined && <small className="block font-normal text-[var(--muted)]">{pile.humidityPct.toFixed(0)} % humedad</small>}</span></Link>)}</div></section></div>

    <section className="panel mt-4"><div className="section-head"><div><p className="eyebrow">Plantas</p><h2>Comparación operacional</h2></div><span className="quiet">Misma semántica y periodo</span></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left text-xs"><thead><tr className="border-b border-[var(--line)] text-[10px] uppercase tracking-wide text-[var(--muted)]"><th className="py-3 pr-4">Planta</th><th className="px-3 py-3">Recibido</th><th className="px-3 py-3">Rechazo</th><th className="px-3 py-3">Horas-hombre</th><th className="px-3 py-3">Plan</th><th className="px-3 py-3">Paradas</th><th className="py-3 pl-3">Atención</th></tr></thead><tbody>{analytics.plantComparison.map((row) => <tr className="border-b border-[var(--line)] last:border-b-0" key={row.plantId}><th className="py-3 pr-4 text-sm">{row.plant}</th><td className="px-3 py-3">{formatTons(row.receivedKg)}</td><td className="px-3 py-3">{row.rejectionPct.toFixed(1)} %</td><td className="px-3 py-3">{formatHours(row.laborHours)}</td><td className="px-3 py-3">{row.compliancePct.toFixed(0)} %</td><td className="px-3 py-3">{formatDowntime(row.downtimeMinutes)}</td><td className="py-3 pl-3 font-semibold">{row.attention}</td></tr>)}</tbody></table></div></section>

    <section className="panel mt-4"><div className="section-head"><div><p className="eyebrow">Historial del periodo</p><h2>Eventos operativos recientes</h2></div><span className="quiet">{analytics.events.length} mostrados</span></div><div className="grid gap-1">{analytics.events.length ? analytics.events.map((event) => <div className="grid grid-cols-[62px_1fr] gap-3 border-t border-[var(--line)] py-3 first:border-t-0" key={event.id}><time className="text-[11px] font-semibold text-[var(--muted)]">{bogotaTime.format(new Date(event.at))}</time><div><div className="flex flex-wrap items-center gap-2"><strong className="text-xs">{event.title}</strong><span className="rounded-full bg-[var(--surface-soft)] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">{event.plant}</span></div><span className="mt-1 block text-[11px] text-[var(--muted)]">{event.detail}</span></div></div>) : <p className="quiet">Sin eventos para el periodo seleccionado.</p>}</div></section>

    <p className="mt-4 text-[11px] text-[var(--muted)]">Este dashboard solo muestra métricas soportadas por transacciones actuales. Producción/procesado, inventarios, ventas y costos se incorporarán cuando exista su registro canónico.</p>
  </>;
}
