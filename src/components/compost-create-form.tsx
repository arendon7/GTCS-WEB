"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompostStore } from "@/components/compost-store";
import { useOpsStore } from "@/components/ops-store";

export function CompostCreateForm() {
  const router = useRouter();
  const { receptions } = useOpsStore();
  const { createPile } = useCompostStore();
  const [plantId, setPlantId] = useState("tamesis");
  const [location, setLocation] = useState("");
  const [sourceReceiptIds, setSourceReceiptIds] = useState<string[]>([]);
  const [initialWeightKg, setInitialWeightKg] = useState("");
  const [feedback, setFeedback] = useState("");

  const eligible = useMemo(()=>receptions.filter((reception)=>reception.plantId===plantId && reception.acceptance!=="rejected"),[receptions,plantId]);
  const selectedAvailableKg = eligible.filter((reception)=>sourceReceiptIds.includes(reception.id)).reduce((sum,reception)=>sum+reception.netWeightKg-reception.rejectionKg,0);

  const save = () => {
    const result = createPile({ plantId, location, sourceReceiptIds, initialWeightKg: Number(initialWeightKg) });
    if (!result.ok) return setFeedback(result.error);
    router.push(`/compost/${result.id}`);
  };

  return <section className="panel mx-auto max-w-3xl"><div className="section-head"><div><p className="eyebrow">Compostaje</p><h1 className="text-3xl">Crear pila</h1><p className="lede">Relaciona el material de origen y registra el peso inicial realmente medido.</p></div><Link className="button secondary" href="/compost">Cancelar</Link></div><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(event)=>{setPlantId(event.target.value);setSourceReceiptIds([])}}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Ubicación<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={location} onChange={(event)=>setLocation(event.target.value)} placeholder="Ej. Zona compostaje A"/></label><fieldset className="grid gap-2 md:col-span-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Lotes de origen</legend>{eligible.length ? eligible.map((reception)=>{ const usable = reception.netWeightKg-reception.rejectionKg; return <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" key={reception.id}><span className="flex items-center gap-3"><input checked={sourceReceiptIds.includes(reception.id)} type="checkbox" onChange={(event)=>setSourceReceiptIds(event.target.checked ? [...sourceReceiptIds,reception.id] : sourceReceiptIds.filter((id)=>id!==reception.id))}/><span><strong className="block text-xs">{reception.lotCode}</strong><span className="text-[11px] text-[var(--muted)]">{reception.generator}</span></span></span><span className="text-xs font-semibold">{usable.toLocaleString("es-CO")} kg disp.</span></label>}) : <p className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs text-[var(--muted)]">No hay recepciones aceptadas/condicionadas en esta planta.</p>}</fieldset><div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Masa aprovechable de lotes seleccionados</span><strong className="mt-1 block text-2xl">{selectedAvailableKg.toLocaleString("es-CO")} kg</strong><span className="mt-1 block text-[11px] text-[var(--muted)]">Referencia; no sustituye el pesaje de conformación.</span></div><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Peso inicial medido (kg)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={initialWeightKg} onChange={(event)=>setInitialWeightKg(event.target.value)} placeholder="Ej. 1800"/></label></div>{feedback && <p className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}<div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={save}>Crear pila</button></div></section>;
}
