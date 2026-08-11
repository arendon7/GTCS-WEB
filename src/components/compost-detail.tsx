"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CompostStatusPill } from "@/components/compost-status-pill";
import { useCompostStore } from "@/components/compost-store";
import { useOpsStore } from "@/components/ops-store";
import { averageTemperature, compostAgeDays, compostYieldPct, maturationDays } from "@/lib/compost-domain";
import { bogotaTime } from "@/lib/time";

export function CompostDetail({ pileId }: { pileId: string }) {
  const { receptions } = useOpsStore();
  const { piles, measurements, recordMeasurement, startMaturation, closePile } = useCompostStore();
  const pile = piles.find((item)=>item.id===pileId);
  const pileMeasurements = useMemo(()=>measurements.filter((item)=>item.pileId===pileId).sort((a,b)=>new Date(b.recordedAt).getTime()-new Date(a.recordedAt).getTime()),[measurements,pileId]);
  const [temps, setTemps] = useState(["","",""]);
  const [humidity, setHumidity] = useState("");
  const [notes, setNotes] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [feedback, setFeedback] = useState("");
  const [nowIso] = useState(()=>new Date().toISOString());

  if (!pile) return <section className="panel mx-auto max-w-4xl"><h1 className="text-2xl">Pila no encontrada</h1><Link className="button secondary mt-5" href="/compost">Volver</Link></section>;

  const sourceReceipts = receptions.filter((reception)=>pile.sourceReceiptIds.includes(reception.id));
  const latest = pileMeasurements[0];
  const saveMeasurement = () => { const parsedTemps = temps.map(Number); const humidityValue = humidity.trim() ? Number(humidity) : undefined; const result = recordMeasurement({ pileId: pile.id, temperaturePointsC: parsedTemps, humidityPct: humidityValue, notes }); if (!result.ok) return setFeedback(result.error); setTemps(["","",""]); setHumidity(""); setNotes(""); setFeedback("Control registrado."); };
  const mature = () => { const result = startMaturation(pile.id); setFeedback(result.ok ? "Pila pasada a maduración." : result.error); };
  const close = () => { const result = closePile(pile.id, Number(finalWeight)); if (!result.ok) return setFeedback(result.error); setFinalWeight(""); setFeedback("Pila cerrada y rendimiento calculado."); };
  const changeTemp = (index:number,value:string) => setTemps((current)=>current.map((item,i)=>i===index?value:item));

  return <>
    <header className="page-header"><div><p className="eyebrow">{pile.plant} · {pile.location}</p><h1>{pile.code}</h1><p className="lede">Trazabilidad de origen, controles y cierre de la pila.</p></div><div className="header-actions"><Link className="button secondary" href="/compost">Volver</Link><CompostStatusPill status={pile.status}/></div></header>
    <section className="panel mx-auto max-w-5xl"><div className="grid gap-4 md:grid-cols-4"><div><span className="quiet">Peso inicial</span><strong className="mt-1 block text-xl">{pile.initialWeightKg.toLocaleString("es-CO")} kg</strong></div><div><span className="quiet">Edad</span><strong className="mt-1 block text-xl">{Math.floor(compostAgeDays(pile,nowIso))} días</strong></div><div><span className="quiet">Última temperatura</span><strong className="mt-1 block text-xl">{latest ? `${averageTemperature(latest).toFixed(1)} °C` : "—"}</strong></div><div><span className="quiet">Última humedad</span><strong className="mt-1 block text-xl">{latest?.humidityPct !== undefined ? `${latest.humidityPct.toFixed(1)} %` : "—"}</strong></div></div><div className="mt-5 border-t border-[var(--line)] pt-4"><span className="quiet">Lotes de origen</span><div className="mt-2 flex flex-wrap gap-2">{sourceReceipts.map((reception)=><span className="rounded-full bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold" key={reception.id}>{reception.lotCode}</span>)}</div></div></section>

    {pile.status !== "closed" && <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Control técnico</p><h2>Temperatura y humedad</h2></div><span className="quiet">3–5 puntos por control</span></div><div className="grid gap-3 sm:grid-cols-3">{temps.map((value,index)=><label className="grid gap-2 text-xs font-bold text-[var(--muted)]" key={index}>Temperatura punto {index+1} (°C)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={value} onChange={(event)=>changeTemp(index,event.target.value)}/></label>)}</div><div className="mt-3 flex gap-2">{temps.length < 5 && <button className="button secondary" type="button" onClick={()=>setTemps((current)=>[...current,""])}>+ Punto</button>}{temps.length > 3 && <button className="button secondary" type="button" onClick={()=>setTemps((current)=>current.slice(0,-1))}>Quitar punto</button>}</div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Humedad (%) <span className="font-normal">(si se mide)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={humidity} onChange={(event)=>setHumidity(event.target.value)}/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Observación <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={notes} onChange={(event)=>setNotes(event.target.value)}/></label></div><div className="mt-5 flex justify-end"><button className="button primary" type="button" onClick={saveMeasurement}>Guardar control</button></div></section>}

    {pile.status !== "closed" && <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Etapa</p><h2>{pile.status === "active" ? "Proceso activo" : "Maduración"}</h2></div>{pile.status === "active" ? <button className="button secondary" type="button" onClick={mature}>Pasar a maduración</button> : <span className="quiet">{Math.floor(maturationDays(pile,nowIso))} días en maduración</span>}</div>{pile.status === "maturing" && <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="grid grow gap-2 text-xs font-bold text-[var(--muted)]">Peso final medido (kg)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={finalWeight} onChange={(event)=>setFinalWeight(event.target.value)}/></label><button className="button primary" type="button" onClick={close}>Cerrar pila</button></div>}</section>}

    {feedback && <p className="panel mx-auto mt-4 max-w-5xl bg-[var(--blue-soft)] text-sm font-semibold text-[var(--blue)]" role="status">{feedback}</p>}

    <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Histórico</p><h2>Controles registrados</h2></div><span className="quiet">{pileMeasurements.length} controles</span></div>{pile.status === "closed" && <div className="mb-4 grid gap-3 rounded-xl bg-[var(--green-soft)] p-4 sm:grid-cols-3"><div><span className="quiet">Peso final</span><strong className="mt-1 block">{pile.finalWeightKg?.toLocaleString("es-CO")} kg</strong></div><div><span className="quiet">Rendimiento</span><strong className="mt-1 block">{compostYieldPct(pile).toFixed(1)} %</strong></div><div><span className="quiet">Proceso total</span><strong className="mt-1 block">{Math.floor(compostAgeDays(pile))} días</strong></div></div>}<div className="grid gap-3">{pileMeasurements.map((measurement)=><article className="rounded-xl border border-[var(--line)] p-4" key={measurement.id}><div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-sm">{averageTemperature(measurement).toFixed(1)} °C promedio</strong><span className="text-xs text-[var(--muted)]">{bogotaTime.format(new Date(measurement.recordedAt))}</span></div><div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">{measurement.temperaturePointsC.map((temp,index)=><span key={index}>P{index+1}: {temp.toFixed(1)} °C</span>)}{measurement.humidityPct !== undefined && <span>Humedad: {measurement.humidityPct.toFixed(1)} %</span>}</div>{measurement.notes && <p className="mt-2 text-xs text-[var(--muted)]">{measurement.notes}</p>}</article>)}</div></section>
  </>;
}
