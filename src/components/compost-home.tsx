"use client";

import Link from "next/link";
import { useCompostStore } from "@/components/compost-store";
import { CompostStatusPill } from "@/components/compost-status-pill";
import { averageTemperature } from "@/lib/compost-domain";

export function CompostHome() {
  const { piles, measurements } = useCompostStore();
  const visible = piles.filter((pile)=>pile.status!=="closed").slice(0,4);
  if (!visible.length) return null;
  return <section className="panel plant-panel mt-4"><div className="section-head"><div><p className="eyebrow">Compostaje</p><h2>Pilas en proceso</h2></div><Link className="button secondary" href="/compost">Ver compostaje</Link></div><div className="grid gap-3 md:grid-cols-2">{visible.map((pile)=>{ const latest = measurements.filter((item)=>item.pileId===pile.id).sort((a,b)=>new Date(b.recordedAt).getTime()-new Date(a.recordedAt).getTime())[0]; return <Link className="rounded-xl border border-[var(--line)] p-4 no-underline" href={`/compost/${pile.id}`} key={pile.id}><div className="flex items-start justify-between gap-3"><div><strong className="block text-sm">{pile.code}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{pile.plant} · {pile.location}</span></div><CompostStatusPill status={pile.status}/></div><div className="mt-3 border-t border-[var(--line)] pt-3 text-xs"><span className="quiet">Último control</span><strong className="mt-1 block">{latest ? `${averageTemperature(latest).toFixed(1)} °C${latest.humidityPct!==undefined ? ` · ${latest.humidityPct.toFixed(0)} % humedad` : ""}` : "Pendiente"}</strong></div></Link>;})}</div></section>;
}
