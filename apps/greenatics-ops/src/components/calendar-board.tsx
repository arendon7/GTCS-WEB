"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOpsStore } from "@/components/ops-store";
import { bogotaDateKey, bogotaTime } from "@/lib/time";
import {
  bogotaIsoToLocalInput,
  bogotaLocalInputToIso,
  movePlannerAnchor,
  plannerMonthCells,
  plannerRange,
  plannerWeekKeys,
  type PlannerView,
} from "@/lib/planning-calendar";
import {
  isPlannerRole,
  validateScheduleDraft,
  type PlannedActivity,
  type PlanningSnapshot,
} from "@/lib/planning-domain";
import {
  createScheduledActivity,
  loadPlanningSnapshot,
  recordScheduleDeviation,
  reviseScheduledActivity,
} from "@/lib/supabase/planning-repository";

const emptySnapshot: PlanningSnapshot = { processes: [], templates: [], workers: [], equipment: [], schedules: [] };
const dateLabel = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });
const monthLabel = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "America/Bogota" });
const weekdayLabel = new Intl.DateTimeFormat("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "America/Bogota" });

type PlannerFeedback = { kind: "error" | "ok"; text: string } | null;

function dateFromKey(key: string) {
  return new Date(`${key}T12:00:00-05:00`);
}

function PlannerStatus({ status }: { status: PlannedActivity["status"] }) {
  const labels: Record<PlannedActivity["status"], string> = {
    planned: "Programada",
    running: "En curso",
    done: "Realizada",
    delayed: "Retrasada",
    missed: "No realizada",
    rescheduled: "Reprogramada",
  };
  const visualStatus = status === "rescheduled" ? "planned" : status;
  return <span className={`status-pill status-${visualStatus}`}>{labels[status]}</span>;
}

function ScheduleCard({ item, workerNames, selected, onSelect }: {
  item: PlannedActivity;
  workerNames: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  return <button type="button" onClick={onSelect} className={`w-full rounded-xl border p-3 text-left ${selected ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)] bg-white"}`}>
    <div className="flex items-start justify-between gap-3"><div><strong className="block text-xs">{bogotaTime.format(new Date(item.plannedStart))} · {item.title}</strong><span className="mt-1 block text-[11px] text-[var(--muted)]">{item.processName || "Proceso legacy"}{item.equipmentLabel ? ` · ${item.equipmentLabel}` : ""}</span></div><PlannerStatus status={item.status} /></div>
    {workerNames.length ? <span className="mt-2 block text-[10px] text-[var(--muted)]">{workerNames.join(" · ")}</span> : null}
  </button>;
}

function ScheduleEditor({ plantId, anchorKey, snapshot, existing, onSaved, onCancel }: {
  plantId: string;
  anchorKey: string;
  snapshot: PlanningSnapshot;
  existing?: PlannedActivity;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const activeTemplates = snapshot.templates.filter((item) => item.active);
  const [templateId, setTemplateId] = useState(existing?.templateId ?? activeTemplates[0]?.id ?? "");
  const template = activeTemplates.find((item) => item.id === templateId) ?? activeTemplates[0];
  const [plannedStart, setPlannedStart] = useState(existing ? bogotaIsoToLocalInput(existing.plannedStart) : `${anchorKey}T08:00`);
  const [plannedEnd, setPlannedEnd] = useState(existing?.plannedEnd ? bogotaIsoToLocalInput(existing.plannedEnd) : `${anchorKey}T09:00`);
  const [workerIds, setWorkerIds] = useState<string[]>(existing?.workerIds ?? []);
  const [equipmentId, setEquipmentId] = useState(existing?.equipmentId ?? "");
  const [planningNote, setPlanningNote] = useState(existing?.planningNote ?? "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<PlannerFeedback>(null);
  const availableWorkers = snapshot.workers.filter((item) => item.active);
  const availableEquipment = template ? snapshot.equipment.filter((item) => item.processIds.includes(template.processId)) : [];

  function toggleWorker(workerId: string, checked: boolean) {
    setWorkerIds((current) => checked ? [...new Set([...current, workerId])] : current.filter((id) => id !== workerId));
  }

  async function save() {
    if (busy) return;
    let startIso = "";
    let endIso = "";
    try {
      startIso = bogotaLocalInputToIso(plannedStart);
      endIso = bogotaLocalInputToIso(plannedEnd);
    } catch (caught) {
      return setFeedback({ kind: "error", text: caught instanceof Error ? caught.message : "Fecha y hora inválidas." });
    }
    const validation = validateScheduleDraft({ templateId: template?.id ?? "", plannedStart: startIso, plannedEnd: endIso, workerIds });
    if (!validation.ok) return setFeedback({ kind: "error", text: validation.error });
    if (template?.requiresEquipment && !equipmentId) return setFeedback({ kind: "error", text: "Esta actividad requiere un equipo." });
    if (existing && !reason.trim()) return setFeedback({ kind: "error", text: "Indica el motivo de la reprogramación." });

    setBusy(true); setFeedback(null);
    try {
      if (existing) {
        await reviseScheduledActivity({
          scheduleId: existing.id,
          templateId: template!.id,
          plannedStart: startIso,
          plannedEnd: endIso,
          workerIds,
          equipmentId: equipmentId || undefined,
          planningNote: planningNote.trim() || undefined,
          reason: reason.trim(),
        });
      } else {
        await createScheduledActivity({
          plantId,
          templateId: template!.id,
          plannedStart: startIso,
          plannedEnd: endIso,
          workerIds,
          equipmentId: equipmentId || undefined,
          planningNote: planningNote.trim() || undefined,
        });
      }
      await onSaved();
      onCancel();
    } catch (caught) {
      setFeedback({ kind: "error", text: caught instanceof Error ? caught.message : "No fue posible guardar la programación." });
    } finally { setBusy(false); }
  }

  if (!activeTemplates.length) return <div className="rounded-xl border border-dashed border-[var(--line)] p-4"><strong className="text-sm">No hay plantillas activas</strong><p className="quiet mt-2">Crea procesos y plantillas en Maestros operacionales antes de programar.</p></div>;

  return <section className="rounded-xl border border-[var(--line)] bg-white p-4">
    <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{existing ? "Revisión trazable" : "Nueva programación"}</p><h3 className="text-lg">{existing ? existing.title : "Programar actividad"}</h3></div><button type="button" className="text-xs font-semibold text-[var(--muted)] underline" onClick={onCancel}>Cerrar</button></div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)] md:col-span-2">Actividad<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={template?.id ?? ""} onChange={(event) => { setTemplateId(event.target.value); setEquipmentId(""); }}>{activeTemplates.map((item) => <option key={item.id} value={item.id}>{snapshot.processes.find((process) => process.id === item.processId)?.name ?? "Proceso"} · {item.name}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Inicio<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" type="datetime-local" value={plannedStart} onChange={(event) => setPlannedStart(event.target.value)} /></label>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)]">Fin<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" type="datetime-local" value={plannedEnd} onChange={(event) => setPlannedEnd(event.target.value)} /></label>
      <fieldset className="rounded-xl bg-[var(--surface-soft)] p-3 md:col-span-2"><legend className="px-1 text-xs font-bold text-[var(--muted)]">Trabajadores programados</legend><div className="grid gap-2 sm:grid-cols-2">{availableWorkers.map((worker) => <label className="flex min-h-10 items-center gap-3 rounded-lg bg-white px-3 text-sm" key={worker.id}><input type="checkbox" checked={workerIds.includes(worker.id)} onChange={(event) => toggleWorker(worker.id, event.target.checked)} />{worker.name}</label>)}</div></fieldset>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)] md:col-span-2">Equipo {template?.requiresEquipment ? "· obligatorio" : "· opcional"}<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={equipmentId} onChange={(event) => setEquipmentId(event.target.value)}><option value="">Sin equipo</option>{availableEquipment.map((equipment) => <option value={equipment.id} key={equipment.id}>{equipment.code} · {equipment.name} · {equipment.status}</option>)}</select>{template && !availableEquipment.length ? <span className="font-normal text-[10px]">No hay equipos asociados a este proceso en Maestros operacionales.</span> : null}</label>
      <label className="grid gap-1 text-xs font-bold text-[var(--muted)] md:col-span-2">Nota de planeación <span className="font-normal">(opcional)</span><textarea className="min-h-20 rounded-lg border border-[var(--line)] p-3 text-sm" value={planningNote} onChange={(event) => setPlanningNote(event.target.value)} /></label>
      {existing ? <label className="grid gap-1 text-xs font-bold text-[var(--muted)] md:col-span-2">Motivo de reprogramación<textarea className="min-h-20 rounded-lg border border-[var(--line)] p-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Qué cambió y por qué" /></label> : null}
    </div>
    {feedback ? <p role="alert" className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]">{feedback.text}</p> : null}
    <div className="mt-5 flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : existing ? "Crear revisión" : "Guardar programación"}</button></div>
  </section>;
}

function DeviationPanel({ item, onSaved }: { item: PlannedActivity; onSaved: () => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<PlannerFeedback>(null);

  async function save(status: "delayed" | "missed") {
    if (!reason.trim()) return setFeedback({ kind: "error", text: "Indica el motivo de la desviación." });
    setBusy(true); setFeedback(null);
    try {
      await recordScheduleDeviation({ scheduleId: item.id, status, reason: reason.trim() });
      setReason(""); await onSaved();
    } catch (caught) {
      setFeedback({ kind: "error", text: caught instanceof Error ? caught.message : "No fue posible registrar la desviación." });
    } finally { setBusy(false); }
  }

  return <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-4"><strong className="text-xs">Desviación del plan</strong><textarea className="mt-3 min-h-20 w-full rounded-lg border border-[var(--line)] p-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo verificable" /><div className="mt-3 flex flex-wrap gap-2"><button className="button secondary" type="button" disabled={busy || item.status === "missed"} onClick={() => void save("delayed")}>Marcar retrasada</button><button className="button secondary" type="button" disabled={busy} onClick={() => void save("missed")}>Marcar no realizada</button></div>{feedback ? <p role="alert" className="mt-3 text-xs font-semibold text-[var(--red)]">{feedback.text}</p> : null}</div>;
}

export function CalendarBoard() {
  const { activities, access, backend } = useOpsStore();
  const [view, setView] = useState<PlannerView>("week");
  const [anchorKey, setAnchorKey] = useState(() => bogotaDateKey(new Date()));
  const [plantId, setPlantId] = useState("");
  const selectedAccess = access.find((plant) => plant.plantId === plantId) ?? access[0];
  const effectivePlantId = selectedAccess?.plantId ?? "";
  const range = useMemo(() => plannerRange(view, anchorKey), [view, anchorKey]);
  const [snapshot, setSnapshot] = useState<PlanningSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<PlannerFeedback>(null);
  const [selectedId, setSelectedId] = useState("");
  const [editorMode, setEditorMode] = useState<"closed" | "new" | "revise">("closed");
  const remoteMode = backend.mode === "supabase";
  const canPlan = Boolean(remoteMode && selectedAccess && isPlannerRole(selectedAccess.role));

  const load = useCallback(async () => {
    if (!remoteMode || !selectedAccess) { setSnapshot(emptySnapshot); return; }
    setLoading(true); setFeedback(null);
    try { setSnapshot(await loadPlanningSnapshot(selectedAccess.dbId, range.startIso, range.endIso)); }
    catch (caught) { setFeedback({ kind: "error", text: caught instanceof Error ? caught.message : "No fue posible cargar la planeación." }); }
    finally { setLoading(false); }
  }, [remoteMode, selectedAccess, range.startIso, range.endIso]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const localItems = useMemo<PlannedActivity[]>(() => activities.map((item) => ({
    id: item.id,
    plantId: item.plantId,
    title: item.title,
    processName: item.process,
    equipmentLabel: item.equipment,
    plannedStart: item.plannedStart,
    plannedEnd: item.plannedEnd,
    status: item.status,
    workerIds: item.workerIds,
  })), [activities]);
  const items = remoteMode ? snapshot.schedules : localItems.filter((item) => {
    const key = bogotaDateKey(item.plannedStart);
    return key >= range.startKey && key < range.endKey;
  });
  const ordered = useMemo(() => [...items].sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime()), [items]);
  const selected = ordered.find((item) => item.id === selectedId);
  const workerName = useMemo(() => new Map(snapshot.workers.map((worker) => [worker.id, worker.name])), [snapshot.workers]);
  const workerNamesFor = (item: PlannedActivity) => item.workerIds.map((id) => workerName.get(id)).filter((name): name is string => Boolean(name));
  const dayItems = (key: string) => ordered.filter((activity) => bogotaDateKey(activity.plannedStart) === key);
  const weekKeys = plannerWeekKeys(anchorKey);
  const monthCells = plannerMonthCells(anchorKey);
  const heading = view === "month" ? monthLabel.format(dateFromKey(anchorKey)) : view === "week" ? `${dateLabel.format(dateFromKey(weekKeys[0]))} – ${dateLabel.format(dateFromKey(weekKeys[6]))}` : dateLabel.format(dateFromKey(anchorKey));

  function move(direction: -1 | 1) { setAnchorKey((current) => movePlannerAnchor(view, current, direction)); setSelectedId(""); setEditorMode("closed"); }
  function chooseDay(key: string) { setAnchorKey(key); setView("day"); setSelectedId(""); setEditorMode("closed"); }

  return <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
    <section className="panel calendar-panel">
      <div className="calendar-toolbar"><div className="flex flex-wrap items-center gap-3"><div className="segmented" aria-label="Vista de calendario">{(["month", "week", "day"] as PlannerView[]).map((item) => <button className={view === item ? "active" : ""} key={item} type="button" onClick={() => { setView(item); setSelectedId(""); setEditorMode("closed"); }}>{{ month: "Mes", week: "Semana", day: "Día" }[item]}</button>)}</div>{remoteMode && access.length ? <select aria-label="Planta del planificador" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={effectivePlantId} onChange={(event) => { setPlantId(event.target.value); setSelectedId(""); setEditorMode("closed"); }}>{access.map((plant) => <option value={plant.plantId} key={plant.plantId}>{plant.name}</option>)}</select> : null}</div><div className="legend"><span><i className="legend-dot done" />Realizada</span><span><i className="legend-dot running" />En curso</span><span><i className="legend-dot delayed" />Retrasada</span><span><i className="legend-dot planned" />Programada</span></div></div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4"><div><p className="eyebrow">Periodo</p><strong className="capitalize">{heading}</strong></div><div className="flex gap-2"><button className="button secondary" type="button" onClick={() => move(-1)}>Anterior</button><button className="button secondary" type="button" onClick={() => { setAnchorKey(bogotaDateKey(new Date())); setSelectedId(""); setEditorMode("closed"); }}>Hoy</button><button className="button secondary" type="button" onClick={() => move(1)}>Siguiente</button></div></div>
      {loading ? <p className="quiet rounded-xl bg-[var(--surface-soft)] p-4">Cargando planeación…</p> : null}
      {feedback ? <p role="alert" className="mb-4 rounded-xl bg-[var(--red-soft)] p-4 text-sm font-semibold text-[var(--red)]">{feedback.text}</p> : null}

      {view === "day" ? <div><div className="mb-3 flex items-center justify-between"><strong className="text-sm capitalize">{weekdayLabel.format(dateFromKey(anchorKey))}</strong><span className="quiet">{dayItems(anchorKey).length} actividades</span></div><div className="grid gap-2">{dayItems(anchorKey).length ? dayItems(anchorKey).map((item) => <ScheduleCard key={item.id} item={item} workerNames={workerNamesFor(item)} selected={selectedId === item.id} onSelect={() => { setSelectedId(item.id); setEditorMode("closed"); }} />) : <p className="quiet rounded-xl border border-dashed border-[var(--line)] p-6 text-center">Sin programación para este día.</p>}</div></div> : null}

      {view === "week" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{weekKeys.map((key) => <div className={`rounded-xl border p-4 ${key === bogotaDateKey(new Date()) ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)] bg-[var(--surface-soft)]"}`} key={key}><button type="button" className="mb-3 flex w-full items-center justify-between text-left" onClick={() => chooseDay(key)}><strong className="text-sm capitalize">{weekdayLabel.format(dateFromKey(key))}</strong><span className="quiet">{dayItems(key).length}</span></button><div className="grid gap-2">{dayItems(key).length ? dayItems(key).map((item) => <ScheduleCard key={item.id} item={item} workerNames={workerNamesFor(item)} selected={selectedId === item.id} onSelect={() => { setSelectedId(item.id); setEditorMode("closed"); }} />) : <span className="text-xs text-[var(--muted)]">Sin programación.</span>}</div></div>)}</div> : null}

      {view === "month" ? <div><div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">{["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => <span key={day}>{day}</span>)}</div><div className="grid grid-cols-7 gap-1">{monthCells.map((cell) => { const count = dayItems(cell.key).length; const today = cell.key === bogotaDateKey(new Date()); return <button type="button" onClick={() => chooseDay(cell.key)} className={`min-h-20 rounded-lg border p-2 text-left ${today ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-[var(--line)] bg-white"} ${cell.inMonth ? "" : "opacity-40"}`} key={cell.key}><strong className="text-xs">{Number(cell.key.slice(-2))}</strong>{count ? <span className="mt-3 block text-[11px] font-semibold text-[var(--green-dark)]">{count} actividad{count === 1 ? "" : "es"}</span> : null}</button>; })}</div></div> : null}
    </section>

    <aside className="grid content-start gap-4">
      <section className="panel"><div className="section-head"><div><p className="eyebrow">Planificación</p><h2>{remoteMode ? selectedAccess?.name ?? "Planta" : "Modo local"}</h2></div>{canPlan ? <button className="button primary" type="button" onClick={() => { setEditorMode("new"); setSelectedId(""); }}>Programar</button> : null}</div>{remoteMode ? <p className="quiet">{canPlan ? "La escritura usa validación transaccional y conserva revisiones." : "Tu rol puede consultar el plan, pero no modificarlo."}</p> : <p className="quiet">Vista dinámica de los datos locales. Los catálogos y la programación corporativa se administran con Supabase.</p>}</section>

      {editorMode === "new" && canPlan && selectedAccess ? <ScheduleEditor key={`new:${selectedAccess.dbId}:${anchorKey}`} plantId={selectedAccess.dbId} anchorKey={anchorKey} snapshot={snapshot} onSaved={load} onCancel={() => setEditorMode("closed")} /> : null}

      {selected ? <section className="panel"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Detalle del plan</p><h2>{selected.title}</h2></div><PlannerStatus status={selected.status} /></div><div className="mt-4 grid gap-3 text-xs"><div><span className="quiet">Horario</span><strong className="mt-1 block">{dateLabel.format(new Date(selected.plannedStart))} · {bogotaTime.format(new Date(selected.plannedStart))}{selected.plannedEnd ? `–${bogotaTime.format(new Date(selected.plannedEnd))}` : ""}</strong></div><div><span className="quiet">Proceso</span><strong className="mt-1 block">{selected.processName || "Sin proceso canónico"}</strong></div><div><span className="quiet">Trabajadores</span><strong className="mt-1 block">{workerNamesFor(selected).join(" · ") || (remoteMode ? "Sin asignación canónica" : `${selected.workerIds.length} asignado(s)`)}</strong></div>{selected.equipmentLabel ? <div><span className="quiet">Equipo</span><strong className="mt-1 block">{selected.equipmentLabel}</strong></div> : null}{selected.planningNote ? <div><span className="quiet">Nota</span><strong className="mt-1 block">{selected.planningNote}</strong></div> : null}{selected.deviationReason ? <div><span className="quiet">Desviación</span><strong className="mt-1 block text-[var(--red)]">{selected.deviationReason}</strong></div> : null}{selected.rescheduleReason ? <div><span className="quiet">Motivo de revisión</span><strong className="mt-1 block">{selected.rescheduleReason}</strong></div> : null}</div>
        {canPlan && selected.templateId && ["planned", "delayed", "missed"].includes(selected.status) ? <div className="mt-5 flex flex-wrap gap-2"><button className="button secondary" type="button" onClick={() => setEditorMode("revise")}>Reprogramar</button></div> : null}
        {canPlan && selected.templateId && ["planned", "delayed", "missed"].includes(selected.status) ? <DeviationPanel key={`${selected.id}:${selected.status}`} item={selected} onSaved={load} /> : null}
        {remoteMode && !selected.templateId ? <p className="mt-4 rounded-xl border border-dashed border-[var(--line)] p-3 text-xs text-[var(--muted)]">Registro legacy: permanece visible y de solo lectura hasta la reconciliación 2A.5.</p> : null}
      </section> : null}

      {editorMode === "revise" && canPlan && selectedAccess && selected?.templateId ? <ScheduleEditor key={`revise:${selected.id}`} plantId={selectedAccess.dbId} anchorKey={bogotaDateKey(selected.plannedStart)} snapshot={snapshot} existing={selected} onSaved={load} onCancel={() => setEditorMode("closed")} /> : null}
    </aside>
  </div>;
}
