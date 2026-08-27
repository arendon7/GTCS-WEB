"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { useOpsStore } from "@/components/ops-store";
import { getDurationMinutes, getLaborHours, type ActivityUnit, type NoveltyType, type Worker } from "@/lib/domain";
import { canWriteOperationalRecord, operationalWritePlantOptions } from "@/lib/ops-write-access";
import { bogotaIsoToLocalInput, bogotaLocalInputToIso } from "@/lib/planning-calendar";
import type { OperationalMasterSnapshot } from "@/lib/operational-master-data";
import { loadOperationalMasterSnapshot } from "@/lib/supabase/operational-master-repository";
import { createRemoteUnplannedActivity, finishRemoteActivity } from "@/lib/supabase/ops-repository";

const timeFmt = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" });
const supportedUnits: ActivityUnit[] = ["kg", "t", "L", "unidades", "m3"];
const emptySnapshot: OperationalMasterSnapshot = { units: [], processes: [], activityTemplates: [], sources: [], routes: [], materialTypes: [], tools: [], equipment: [], equipmentProcesses: [] };

function WorkerChecks({ plantId, workers, selected, onChange }: { plantId: string; workers: Worker[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const available = workers.filter((worker) => worker.plantId === plantId);
  return <fieldset className="grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Trabajadores responsables</legend>{available.map((worker) => <label className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" key={worker.id}><input type="checkbox" checked={selected.includes(worker.id)} onChange={(event) => onChange(event.target.checked ? [...new Set([...selected, worker.id])] : selected.filter((id) => id !== worker.id))} />{worker.name}</label>)}</fieldset>;
}

function ToolChecks({ items, selected, onChange }: { items: { id: string; name: string; active: boolean }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const active = items.filter((item) => item.active);
  return <fieldset className="grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Herramientas utilizadas</legend>{active.length ? <div className="grid gap-2 sm:grid-cols-2">{active.map((tool) => <label key={tool.id} className="flex min-h-10 items-center gap-2 rounded-lg bg-[var(--surface-soft)] px-3 text-sm"><input type="checkbox" checked={selected.includes(tool.id)} onChange={(event) => onChange(event.target.checked ? [...new Set([...selected, tool.id])] : selected.filter((id) => id !== tool.id))} />{tool.name}</label>)}</div> : <p className="quiet">No hay herramientas configuradas para esta planta.</p>}</fieldset>;
}

function nowLocal() { return bogotaIsoToLocalInput(new Date().toISOString()); }
function validUnit(value?: string): value is ActivityUnit { return supportedUnits.includes(value as ActivityUnit); }

export function ActivityEditor({ activityId, createMode = false }: { activityId?: string; createMode?: boolean }) {
  const router = useRouter();
  const { activities, workers, access, backend, startActivity, finishActivity, createActivity, refresh } = useOpsStore();
  const remoteMode=backend.mode === "supabase";
  const activity = activities.find((item) => item.id === activityId);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [plantId, setPlantId] = useState(activity?.plantId ?? "tamesis");
  const [workerIds, setWorkerIds] = useState(activity?.workerIds ?? []);
  const [snapshot, setSnapshot] = useState<OperationalMasterSnapshot>(emptySnapshot);
  const [processId, setProcessId] = useState(activity?.processId ?? "");
  const [templateId, setTemplateId] = useState(activity?.activityTemplateId ?? "");
  const [equipmentId, setEquipmentId] = useState(activity?.equipmentId ?? "");
  const [toolIds, setToolIds] = useState(activity?.toolIds ?? []);
  const [comment, setComment] = useState(activity?.comment ?? "");
  const [startedAt, setStartedAt] = useState(activity?.actualStart ? bogotaIsoToLocalInput(activity.actualStart) : nowLocal());
  const [endedAt, setEndedAt] = useState(activity?.actualEnd ? bogotaIsoToLocalInput(activity.actualEnd) : nowLocal());
  const [completed, setCompleted] = useState(false);
  const [quantity, setQuantity] = useState(activity?.quantity ? String(activity.quantity) : "");
  const [unit, setUnit] = useState<ActivityUnit | "">(activity?.unit ?? "");
  const [noveltyType, setNoveltyType] = useState<NoveltyType | "">(activity?.noveltyType ?? "");
  const [novelty, setNovelty] = useState(activity?.novelty ?? "");
  const [openIncident, setOpenIncident] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const [localProcess, setLocalProcess] = useState("");

  const plantOptions = useMemo(() => operationalWritePlantOptions(remoteMode,access).map((option)=>({id:option.id,name:option.name,dbId:remoteMode?(access.find((item)=>item.plantId===option.id)?.dbId??""):""})), [access, remoteMode]);
  const effectivePlant = plantOptions.find((plant) => plant.id === plantId) ?? plantOptions[0];

  useEffect(() => {
    if (!remoteMode || !effectivePlant?.dbId) return;
    let live = true;
    loadOperationalMasterSnapshot(effectivePlant.dbId)
      .then((next) => { if (live) setSnapshot(next); })
      .catch((caught) => { if (live) setFeedback(caught instanceof Error ? caught.message : "No fue posible cargar catálogos"); });
    return () => { live = false; };
  }, [remoteMode, effectivePlant?.dbId]);

  const activeProcesses = snapshot.processes.filter((process) => process.active);
  const effectiveProcessId = activeProcesses.some((process) => process.id === processId) ? processId : (snapshot.activityTemplates.find((template) => template.id === templateId)?.processId ?? activeProcesses[0]?.id ?? "");
  const templates = snapshot.activityTemplates.filter((template) => template.active && template.processId === effectiveProcessId && template.allowsUnplanned && !template.requiresLot);
  const effectiveTemplate = templates.find((template) => template.id === templateId) ?? templates[0];
  const availableEquipment = effectiveTemplate ? snapshot.equipment.filter((equipment) => snapshot.equipmentProcesses.some((assignment) => assignment.active && assignment.equipmentId === equipment.id && assignment.processId === effectiveTemplate.processId)) : [];
  const effectiveUnit: ActivityUnit = unit || (validUnit(effectiveTemplate?.defaultUnitCode) ? effectiveTemplate.defaultUnitCode : "kg");

  if (!createMode && !activity) return <section className="panel"><h1>Actividad no encontrada</h1></section>;

  if (createMode) {
    async function submit() {
      if (busy || !effectivePlant) return;
      setFeedback(""); setBusy(true);
      try {
        if (!remoteMode) {
          const result = await createActivity({ plantId: effectivePlant.id, title: localTitle, process: localProcess, workerIds, equipment: "" });
          if (!result.ok) return setFeedback(result.error);
          router.push(`/activities/${result.id}`); return;
        }
        if (!effectiveTemplate) return setFeedback("Selecciona una actividad canónica.");
        if (!workerIds.length) return setFeedback("Selecciona al menos un trabajador.");
        if (effectiveTemplate.requiresEquipment && !equipmentId) return setFeedback("Esta actividad requiere un equipo configurado.");
        const startIso = bogotaLocalInputToIso(startedAt);
        const endIso = completed ? bogotaLocalInputToIso(endedAt) : undefined;
        if (endIso && new Date(endIso) <= new Date(startIso)) return setFeedback("La hora final debe ser posterior al inicio.");
        const parsed = quantity.trim() ? Number(quantity) : undefined;
        if (parsed !== undefined && (!Number.isFinite(parsed) || parsed <= 0)) return setFeedback("La cantidad debe ser mayor que cero.");
        const id = await createRemoteUnplannedActivity(access, { plantId: effectivePlant.id, templateId: effectiveTemplate.id, workerIds, startedAt: startIso, endedAt: endIso, equipmentId: equipmentId || undefined, toolIds, comment: comment.trim() || undefined, quantity: completed ? parsed : undefined, unit: completed && parsed ? effectiveUnit : undefined });
        await refresh(); router.push(`/activities/${id}`);
      } catch (caught) { setFeedback(caught instanceof Error ? caught.message : "No fue posible registrar la actividad."); }
      finally { setBusy(false); }
    }

    if(remoteMode&&!plantOptions.length)return <section className="panel mx-auto max-w-4xl"><div className="section-head"><div><p className="eyebrow">Bitácora 2.0</p><h1 className="text-3xl">Registrar actividad</h1></div><Link className="button secondary" href="/app">Cancelar</Link></div><p className="rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">Modo solo lectura: esta sesión no tiene una planta autorizada para registrar o iniciar actividades.</p></section>;

    return <section className="panel mx-auto max-w-4xl"><div className="section-head"><div><p className="eyebrow">Bitácora 2.0</p><h1 className="text-3xl">Registrar actividad</h1><p className="lede">Fecha, actividad, responsable, horas, herramientas y observaciones quedan estructurados.</p></div><Link className="button secondary" href="/app">Cancelar</Link></div>{!remoteMode ? <div className="grid gap-4"><input aria-label="Proceso" className="min-h-11 rounded-lg border p-3" placeholder="Proceso" value={localProcess} onChange={(event) => setLocalProcess(event.target.value)} /><input aria-label="Actividad" className="min-h-11 rounded-lg border p-3" placeholder="Actividad" value={localTitle} onChange={(event) => setLocalTitle(event.target.value)} /><WorkerChecks plantId={effectivePlant?.id ?? ""} workers={workers} selected={workerIds} onChange={setWorkerIds} /></div> : <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={effectivePlant?.id ?? ""} onChange={(event) => { setPlantId(event.target.value); setSnapshot(emptySnapshot); setWorkerIds([]); setToolIds([]); setProcessId(""); setTemplateId(""); setEquipmentId(""); }} >{plantOptions.map((plant) => <option key={plant.id} value={plant.id}>{plant.name}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Proceso<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={effectiveProcessId} onChange={(event) => { setProcessId(event.target.value); setTemplateId(""); setEquipmentId(""); setUnit(""); }}>{activeProcesses.map((process) => <option key={process.id} value={process.id}>{process.name}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Actividad<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={effectiveTemplate?.id ?? ""} onChange={(event) => { setTemplateId(event.target.value); setEquipmentId(""); setUnit(""); }}>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>{!templates.length ? <span className="font-normal text-[10px]">No hay actividades de bitácora habilitadas en este proceso. Las que requieren lote usan su flujo técnico específico.</span> : null}</label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Inicio real<input type="datetime-local" className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} /></label>
      <label className="flex items-center gap-3 self-end pb-3 text-sm"><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />La actividad ya terminó</label>
      {completed ? <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Fin real<input type="datetime-local" className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" value={endedAt} onChange={(event) => setEndedAt(event.target.value)} /></label> : null}
      <div className="md:col-span-2"><WorkerChecks plantId={effectivePlant?.id ?? ""} workers={workers} selected={workerIds} onChange={setWorkerIds} /></div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Equipo {effectiveTemplate?.requiresEquipment ? "· obligatorio" : "· opcional"}<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)}><option value="">Sin equipo</option>{availableEquipment.map((equipment) => <option key={equipment.id} value={equipment.id}>{equipment.code} · {equipment.name}</option>)}</select>{!availableEquipment.length ? <span className="font-normal text-[10px]">No hay equipos habilitados para este proceso; no se reemplazan por texto libre.</span> : null}</label>
      <div className="md:col-span-2"><ToolChecks items={snapshot.tools} selected={toolIds} onChange={setToolIds} /></div>
      {completed ? <><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Cantidad {effectiveTemplate?.requiresQuantity ? "· obligatoria" : "· si aplica"}<input inputMode="decimal" className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Unidad<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={effectiveUnit} onChange={(event) => setUnit(event.target.value as ActivityUnit)}>{snapshot.units.map((item) => <option key={item.code} value={item.code}>{item.symbol} · {item.name}</option>)}</select></label></> : null}
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Comentarios / observaciones<textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Qué se hizo, condiciones relevantes o comentario final" /></label>
      <p className="quiet md:col-span-2">Los adjuntos no se simulan con enlaces de texto: se incorporarán mediante el repositorio documental seguro.</p>
    </div>}{feedback ? <p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p> : null}<div className="mt-6 flex justify-end"><button className="button primary" disabled={busy || !effectivePlant} onClick={() => void submit()}>{busy ? "Guardando…" : !remoteMode ? "Iniciar actividad" : completed ? "Registrar actividad finalizada" : "Registrar e iniciar"}</button></div></section>;
  }

  if (!activity) return null;
  const canWriteActivity=!remoteMode||canWriteOperationalRecord(access,activity.plantId);
  const workerNames = activity.workerIds.map((id) => workers.find((worker) => worker.id === id)?.name).filter(Boolean).join(" + ");
  async function start() { if(!canWriteActivity)return;setBusy(true); try { const result = await startActivity(activity!.id, workerIds); if (!result.ok) return setFeedback(result.error); if (result.id !== activity!.id) router.replace(`/activities/${result.id}`); else setFeedback("Actividad iniciada correctamente."); } finally { setBusy(false); } }
  async function finish() {
    if(!canWriteActivity)return;
    setBusy(true); setFeedback("");
    try {
      const parsed = quantity.trim() ? Number(quantity) : undefined;
      if (remoteMode) { await finishRemoteActivity(activity!.id, { quantity: parsed, unit: parsed ? effectiveUnit : undefined, noveltyType: noveltyType || undefined, novelty: novelty.trim() || undefined, openIncident, comment: comment.trim() || undefined, toolIds }); await refresh(); router.push("/app"); return; }
      const result = await finishActivity(activity!.id, { quantity: parsed, unit: parsed ? effectiveUnit : undefined, noveltyType: noveltyType || undefined, novelty: novelty.trim() || undefined, openIncident }); if (!result.ok) return setFeedback(result.error); router.push("/app");
    } catch (caught) { setFeedback(caught instanceof Error ? caught.message : "No fue posible finalizar la actividad."); }
    finally { setBusy(false); }
  }

  return <section className="panel mx-auto max-w-4xl"><div className="section-head"><div><p className="eyebrow">{activity.plant} · {activity.process}</p><h1 className="text-3xl">{activity.title}</h1><p className="lede">{activity.actualStart ? `Real ${timeFmt.format(new Date(activity.actualStart))}` : `Programada ${timeFmt.format(new Date(activity.plannedStart))}`}</p></div><StatusPill status={activity.status} /></div>{activity.status === "done" ? <div className="grid gap-4"><div className="grid gap-3 rounded-xl bg-[var(--surface-soft)] p-4 md:grid-cols-3"><div><span className="quiet">Duración</span><strong className="block">{Math.round(getDurationMinutes(activity))} min</strong></div><div><span className="quiet">Horas-hombre</span><strong className="block">{getLaborHours(activity).toFixed(1)} h</strong></div><div><span className="quiet">Participantes</span><strong className="block">{workerNames || "—"}</strong></div></div>{activity.tools?.length ? <p><strong>Herramientas:</strong> {activity.tools.join(" · ")}</p> : null}{activity.comment ? <p><strong>Comentario:</strong> {activity.comment}</p> : null}{activity.quantity ? <p><strong>Resultado:</strong> {activity.quantity} {activity.unit}</p> : null}{activity.novelty ? <p className="rounded-lg bg-[var(--amber-soft)] p-3"><strong>Novedad:</strong> {activity.novelty}</p> : null}<Link className="button secondary w-fit" href="/calendar">Volver</Link></div> : activity.status === "running" ? !canWriteActivity ? <div className="grid gap-4"><div className="rounded-xl bg-[var(--blue-soft)] p-4"><strong>En curso desde {timeFmt.format(new Date(activity.actualStart!))}</strong><span className="quiet mt-1 block">{workerNames}</span></div><p className="rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">Modo solo lectura: tu rol en esta planta no permite finalizar ni modificar la ejecución.</p><Link className="button secondary w-fit" href="/calendar">Volver</Link></div> : <div className="grid gap-5"><div className="rounded-xl bg-[var(--blue-soft)] p-4"><strong>En curso desde {timeFmt.format(new Date(activity.actualStart!))}</strong><span className="quiet mt-1 block">{workerNames}</span></div>{remoteMode ? <ToolChecks items={snapshot.tools} selected={toolIds} onChange={setToolIds} /> : null}<div className="grid gap-4 md:grid-cols-2"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Cantidad procesada<input className="min-h-11 rounded-lg border border-[var(--line)] px-3" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Unidad<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3" value={effectiveUnit} onChange={(event) => setUnit(event.target.value as ActivityUnit)}>{supportedUnits.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Comentario final<textarea className="min-h-20 rounded-lg border p-3" value={comment} onChange={(event) => setComment(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">¿Hubo novedad?<select className="min-h-11 rounded-lg border bg-white px-3" value={noveltyType} onChange={(event) => setNoveltyType(event.target.value as NoveltyType | "")}><option value="">No</option><option value="equipment_failure">Falla de equipo</option><option value="delay">Retraso / interrupción</option><option value="quality">Calidad</option><option value="safety">Seguridad</option><option value="other">Otra</option></select></label>{noveltyType ? <><textarea className="min-h-20 rounded-lg border p-3 md:col-span-2" value={novelty} onChange={(event) => setNovelty(event.target.value)} placeholder="Qué ocurrió" /><label className="flex items-center gap-3 md:col-span-2"><input type="checkbox" checked={openIncident} onChange={(event) => setOpenIncident(event.target.checked)} />Abrir incidencia para seguimiento</label></> : null}</div>{feedback ? <p role="alert" className="rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p> : null}<div className="flex justify-end"><button className="button primary" disabled={busy} onClick={() => void finish()}>{busy ? "Finalizando…" : "Finalizar actividad"}</button></div></div> : !canWriteActivity ? <div className="grid gap-4"><div className="rounded-xl bg-[var(--surface-soft)] p-4"><strong>{activity.plant} · {activity.process}</strong>{activity.equipment ? <span className="quiet block">Equipo: {activity.equipment}</span> : null}</div><p className="rounded-xl bg-[var(--surface-soft)] p-4 text-sm text-[var(--muted)]">Modo solo lectura: tu rol en esta planta no permite iniciar esta actividad.</p><Link className="button secondary w-fit" href="/calendar">Volver</Link></div> : <div className="grid gap-5"><div className="rounded-xl bg-[var(--surface-soft)] p-4"><strong>{activity.plant} · {activity.process}</strong>{activity.equipment ? <span className="quiet block">Equipo: {activity.equipment}</span> : null}</div><WorkerChecks plantId={activity.plantId} workers={workers} selected={workerIds} onChange={setWorkerIds} />{feedback ? <p role="alert" className="rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback}</p> : null}<div className="flex justify-between"><Link className="button secondary" href="/calendar">Volver</Link><button className="button primary" disabled={busy} onClick={() => void start()}>{busy ? "Iniciando…" : "Iniciar actividad"}</button></div></div>}</section>;
}
