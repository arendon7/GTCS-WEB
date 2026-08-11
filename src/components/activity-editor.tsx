"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { useOpsStore } from "@/components/ops-store";
import { getDurationMinutes, getLaborHours, type ActivityUnit, type NoveltyType } from "@/lib/domain";
import { employees } from "@/lib/mock-data";

const timeFmt = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" });

function WorkerChecks({ plantId, selected, onChange }: { plantId: string; selected: string[]; onChange: (ids: string[]) => void }) {
  const available = employees.filter((worker) => worker.plantId === plantId);
  return <fieldset className="grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Trabajadores</legend>{available.map((worker) => <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" key={worker.id}><input checked={selected.includes(worker.id)} type="checkbox" onChange={(event) => onChange(event.target.checked ? [...selected, worker.id] : selected.filter((id) => id !== worker.id))}/><span>{worker.name}</span></label>)}</fieldset>;
}

export function ActivityEditor({ activityId, createMode = false }: { activityId?: string; createMode?: boolean }) {
  const router = useRouter();
  const { activities, startActivity, finishActivity, createActivity } = useOpsStore();
  const activity = activities.find((item) => item.id === activityId);
  const [feedback, setFeedback] = useState("");
  const [plantId, setPlantId] = useState(activity?.plantId ?? "tamesis");
  const [title, setTitle] = useState(activity?.title ?? "");
  const [process, setProcess] = useState(activity?.process ?? "");
  const [equipment, setEquipment] = useState(activity?.equipment ?? "");
  const [workerIds, setWorkerIds] = useState(activity?.workerIds ?? []);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<ActivityUnit>("kg");
  const [noveltyType, setNoveltyType] = useState<NoveltyType | "">("");
  const [novelty, setNovelty] = useState("");
  const [openIncident, setOpenIncident] = useState(false);

  const workerNames = useMemo(() => (activity?.workerIds ?? []).map((id) => employees.find((worker) => worker.id === id)?.name).filter(Boolean).join(" + "), [activity]);

  if (!createMode && !activity) return <section className="panel max-w-3xl mx-auto"><h1 className="text-2xl">Actividad no encontrada</h1><p className="lede">El registro puede haber sido restablecido en esta demo local.</p><Link className="button secondary mt-5" href="/calendar">Volver al calendario</Link></section>;

  if (createMode) {
    const submit = () => {
      const result = createActivity({ plantId, title, process, workerIds, equipment });
      if (!result.ok) return setFeedback(result.error);
      router.push(`/activities/${result.id}`);
    };
    return <section className="panel mx-auto max-w-3xl"><div className="section-head"><div><p className="eyebrow">Actividad no programada</p><h1 className="text-3xl">Registrar e iniciar</h1><p className="lede">Solo para trabajo que no estaba en la programación. Se inicia al guardar.</p></div><Link className="button secondary" href="/">Cancelar</Link></div><div className="grid gap-5 md:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(e)=>{setPlantId(e.target.value);setWorkerIds([])}}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Proceso<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={process} onChange={(e)=>setProcess(e.target.value)} placeholder="Ej. Compostaje"/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Actividad<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ej. Limpieza extraordinaria"/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Equipo relacionado <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={equipment} onChange={(e)=>setEquipment(e.target.value)} placeholder="Ej. Molino M-01"/></label><div className="md:col-span-2"><WorkerChecks plantId={plantId} selected={workerIds} onChange={setWorkerIds}/></div></div>{feedback && <p className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}<div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={submit}>Iniciar actividad</button></div></section>;
  }

  if (!activity) return null;
  const start = () => { const result = startActivity(activity.id, workerIds); if (!result.ok) setFeedback(result.error); else setFeedback("Actividad iniciada correctamente."); };
  const finish = () => { const parsed = quantity.trim() ? Number(quantity) : undefined; const result = finishActivity(activity.id, { quantity: parsed, unit: parsed ? unit : undefined, noveltyType: noveltyType || undefined, novelty: novelty.trim() || undefined, openIncident }); if (!result.ok) return setFeedback(result.error); router.push("/"); };

  return <section className="panel mx-auto max-w-3xl"><div className="section-head"><div><p className="eyebrow">{activity.plant} · {activity.process}</p><h1 className="text-3xl">{activity.title}</h1><p className="lede">Programada {timeFmt.format(new Date(activity.plannedStart))}{activity.plannedEnd ? `–${timeFmt.format(new Date(activity.plannedEnd))}` : ""}</p></div><StatusPill status={activity.status}/></div>
    {activity.status === "done" ? <div className="grid gap-4"><div className="grid gap-3 rounded-xl bg-[var(--surface-soft)] p-4 md:grid-cols-3"><div><span className="quiet">Duración</span><strong className="mt-1 block">{Math.round(getDurationMinutes(activity))} min</strong></div><div><span className="quiet">Horas-hombre</span><strong className="mt-1 block">{getLaborHours(activity).toFixed(1)} h</strong></div><div><span className="quiet">Participantes</span><strong className="mt-1 block">{workerNames || "—"}</strong></div></div>{activity.quantity && <p className="text-sm"><strong>Resultado:</strong> {activity.quantity} {activity.unit}</p>}{activity.novelty && <p className="rounded-lg bg-[var(--amber-soft)] p-3 text-sm"><strong>Novedad:</strong> {activity.novelty}</p>}<Link className="button secondary w-fit" href="/calendar">Volver al calendario</Link></div> : activity.status === "running" ? <div className="grid gap-5"><div className="rounded-xl bg-[var(--blue-soft)] p-4"><span className="quiet">En curso desde</span><strong className="mt-1 block">{timeFmt.format(new Date(activity.actualStart!))} · {workerNames}</strong>{activity.equipment && <span className="mt-1 block text-xs text-[var(--muted)]">Equipo: {activity.equipment}</span>}</div><div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Cantidad procesada <span className="font-normal">(si aplica)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={quantity} onChange={(e)=>setQuantity(e.target.value)} placeholder="Ej. 1720"/></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Unidad<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={unit} onChange={(e)=>setUnit(e.target.value as ActivityUnit)}><option>kg</option><option>t</option><option>L</option><option>unidades</option><option>m3</option></select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">¿Hubo novedad?<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={noveltyType} onChange={(e)=>setNoveltyType(e.target.value as NoveltyType | "")}><option value="">No</option><option value="equipment_failure">Falla de equipo</option><option value="delay">Retraso / interrupción</option><option value="quality">Calidad</option><option value="safety">Seguridad</option><option value="other">Otra</option></select></label>{noveltyType && <><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Describe brevemente<textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={novelty} onChange={(e)=>setNovelty(e.target.value)} placeholder="Qué ocurrió y qué impacto tuvo"/></label><label className="flex min-h-11 items-center gap-3 text-sm md:col-span-2"><input type="checkbox" checked={openIncident} onChange={(e)=>setOpenIncident(e.target.checked)}/><span>Abrir incidencia para seguimiento</span></label></>}</div>{feedback && <p className="rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}<div className="flex justify-end"><button className="button primary" type="button" onClick={finish}>Finalizar actividad</button></div></div> : <div className="grid gap-5"><div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Contexto precargado</span><strong className="mt-1 block">{activity.plant} · {activity.process}</strong>{activity.equipment && <span className="mt-1 block text-xs text-[var(--muted)]">Equipo: {activity.equipment}</span>}</div><WorkerChecks plantId={activity.plantId} selected={workerIds} onChange={setWorkerIds}/>{feedback && <p className="rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}<div className="flex items-center justify-between gap-3"><Link className="button secondary" href="/calendar">Volver</Link><button className="button primary" type="button" onClick={start}>Iniciar actividad</button></div></div>}
  </section>;
}
