"use client";

import Link from "next/link";
import { useOpsStore } from "@/components/ops-store";
import { getReceptionDurationMinutes, getRejectionPct, type AcceptanceStatus } from "@/lib/domain";

const timeFmt = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" });
const statusLabel: Record<AcceptanceStatus, string> = { accepted: "Aceptado", conditioned: "Condicionado", rejected: "Rechazado" };
const statusClass: Record<AcceptanceStatus, string> = { accepted: "bg-[var(--green-soft)] text-[var(--green-dark)]", conditioned: "bg-[var(--amber-soft)] text-[var(--amber)]", rejected: "bg-[var(--red-soft)] text-[var(--red)]" };

export function ReceptionsView() {
  const { receptions } = useOpsStore();
  const ordered = [...receptions].sort((a,b)=>new Date(b.endedAt).getTime()-new Date(a.endedAt).getTime());
  const totalKg = ordered.reduce((sum,reception)=>sum+reception.netWeightKg,0);
  const rejectionKg = ordered.reduce((sum,reception)=>sum+reception.rejectionKg,0);

  return <>
    <header className="page-header"><div><p className="eyebrow">Operación · entradas</p><h1>Recepciones</h1><p className="lede">Material recibido, calidad de separación y lote creado desde el ingreso.</p></div><div className="header-actions"><Link className="button secondary" href="/">Volver a hoy</Link><Link className="button primary" href="/receptions/new">Nueva recepción</Link></div></header>
    <section className="metrics-grid" aria-label="Indicadores de recepciones"><div className="metric-block"><span>Total registrado</span><strong>{(totalKg/1000).toFixed(2)} t</strong><small>{ordered.length} recepciones</small></div><div className="metric-block"><span>Rechazo</span><strong>{rejectionKg.toFixed(0)} kg</strong><small>{totalKg ? ((rejectionKg/totalKg)*100).toFixed(1) : "0.0"} % ponderado</small></div><div className="metric-block"><span>Condicionadas</span><strong>{ordered.filter((r)=>r.acceptance==="conditioned").length}</strong><small>requieren seguimiento</small></div><div className="metric-block"><span>Rechazadas</span><strong>{ordered.filter((r)=>r.acceptance==="rejected").length}</strong><small>no ingresan a proceso</small></div></section>
    <section className="panel plant-panel"><div className="section-head"><div><p className="eyebrow">Historial inmediato</p><h2>Ingresos registrados</h2></div><span className="quiet">Más recientes primero</span></div><div className="grid gap-3">{ordered.map((reception)=><article className="rounded-xl border border-[var(--line)] p-4" key={reception.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm">{reception.lotCode}</strong><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${statusClass[reception.acceptance]}`}>{statusLabel[reception.acceptance]}</span></div><span className="mt-1 block text-xs text-[var(--muted)]">{reception.generator} · {reception.route} · {reception.plant}</span></div><div className="text-right"><strong className="block text-lg">{reception.netWeightKg.toLocaleString("es-CO")} kg</strong><span className="text-[11px] text-[var(--muted)]">{timeFmt.format(new Date(reception.endedAt))}</span></div></div><div className="mt-4 grid gap-3 border-t border-[var(--line)] pt-3 text-xs sm:grid-cols-4"><div><span className="quiet">Residuo</span><strong className="mt-1 block">{reception.wasteType}</strong></div><div><span className="quiet">Rechazo</span><strong className="mt-1 block">{reception.rejectionKg} kg · {getRejectionPct(reception).toFixed(1)} %</strong></div><div><span className="quiet">Duración</span><strong className="mt-1 block">{Math.round(getReceptionDurationMinutes(reception))} min</strong></div><div><span className="quiet">Origen dato</span><strong className="mt-1 block">{reception.source === "demo" ? "Demo inicial" : "Registrado en app"}</strong></div></div>{reception.observation && <p className="mt-3 rounded-lg bg-[var(--surface-soft)] p-3 text-xs text-[var(--muted)]">{reception.observation}</p>}</article>)}</div></section>
  </>;
}
