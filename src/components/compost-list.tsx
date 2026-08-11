"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCompostStore } from "@/components/compost-store";
import { CompostStatusPill } from "@/components/compost-status-pill";
import { averageTemperature, compostAgeDays, compostYieldPct } from "@/lib/compost-domain";
import { bogotaTime } from "@/lib/time";

export function CompostList() {
  const { piles, measurements, ready, resetCompostDemo } = useCompostStore();
  const [nowIso] = useState(() => new Date().toISOString());
  const active = piles.filter((pile)=>pile.status === "active").length;
  const maturing = piles.filter((pile)=>pile.status === "maturing").length;
  const closed = piles.filter((pile)=>pile.status === "closed");
  const sorted = useMemo(()=>[...piles].sort((a,b)=>new Date(b.startedAt).getTime()-new Date(a.startedAt).getTime()),[piles]);

  return <>
    <header className="page-header"><div><p className="eyebrow">Proceso productivo</p><h1>Compostaje</h1><p className="lede">Pilas, controles técnicos y trazabilidad desde los lotes de recepción.</p></div><div className="header-actions"><Link className="button secondary" href="/">Volver a hoy</Link><Link className="button primary" href="/compost/new">Nueva pila</Link></div></header>
    <section className="metrics-grid"><div className="metric-block"><span>Activas</span><strong>{active}</strong><small>en proceso</small></div><div className="metric-block"><span>Maduración</span><strong>{maturing}</strong><small>fase final</small></div><div className="metric-block"><span>Cerradas</span><strong>{closed.length}</strong><small>histórico local</small></div><div className="metric-block"><span>Rendimiento medio</span><strong>{closed.length ? `${(closed.reduce((sum,pile)=>sum+compostYieldPct(pile),0)/closed.length).toFixed(1)} %` : "—"}</strong><small>solo pilas cerradas</small></div></section>
    <section className="panel plant-panel"><div className="section-head"><div><p className="eyebrow">Pilas</p><h2>Estado del proceso</h2></div><div className="flex items-center gap-2"><span className="quiet">{ready ? "Persistencia local activa" : "Cargando…"}</span><button className="text-xs font-semibold text-[var(--green)] underline underline-offset-4" type="button" onClick={resetCompostDemo}>Restablecer demo</button></div></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{sorted.map((pile)=>{ const latest = measurements.filter((measurement)=>measurement.pileId===pile.id).sort((a,b)=>new Date(b.recordedAt).getTime()-new Date(a.recordedAt).getTime())[0]; return <Link className="rounded-xl border border-[var(--line)] p-4 no-underline hover:bg-[var(--surface-soft)]" href={`/compost/${pile.id}`} key={pile.id}><div className="flex items-start justify-between gap-3"><div><strong className="block text-sm">{pile.code}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{pile.plant} · {pile.location}</span></div><CompostStatusPill status={pile.status}/></div><div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-3 text-xs"><div><span className="quiet">Edad</span><strong className="mt-1 block">{Math.floor(compostAgeDays(pile,nowIso))} d</strong></div><div><span className="quiet">Peso inicial</span><strong className="mt-1 block">{pile.initialWeightKg.toLocaleString("es-CO")} kg</strong></div><div><span className="quiet">Temp. última</span><strong className="mt-1 block">{latest ? `${averageTemperature(latest).toFixed(1)} °C` : "—"}</strong></div></div>{latest && <span className="mt-3 block text-[11px] text-[var(--muted)]">Último control {bogotaTime.format(new Date(latest.recordedAt))}</span>}</Link>;})}</div></section>
  </>;
}
