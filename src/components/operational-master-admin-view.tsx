"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOpsStore } from "@/components/ops-store";
import {
  canManageOperationalMasters,
  normalizeMasterCode,
  validateMasterIdentity,
  type ActivityTemplate,
  type MaterialSource,
  type MaterialSourceKind,
  type OperationalMasterSnapshot,
  type SimpleMasterKind,
} from "@/lib/operational-master-data";
import {
  createActivityTemplate,
  createMaterialSource,
  createSimpleOperationalMaster,
  loadOperationalMasterSnapshot,
  setEquipmentProcessAssignment,
  updateActivityTemplate,
  updateMaterialSource,
  updateSimpleOperationalMaster,
} from "@/lib/supabase/operational-master-repository";

type SimpleItem = { id: string; code: string; name: string; active: boolean };
type Feedback = { kind: "error" | "ok"; text: string } | null;
type TemplateFlag = "requiresQuantity" | "requiresLot" | "requiresEquipment" | "allowsUnplanned";

const emptySnapshot: OperationalMasterSnapshot = {
  units: [], processes: [], activityTemplates: [], sources: [], routes: [], materialTypes: [], equipment: [], equipmentProcesses: [],
};

const sourceKindLabel: Record<MaterialSourceKind, string> = {
  generator: "Generador", supplier: "Proveedor", internal: "Origen interno", other: "Otro",
};

const templateFlags: Array<[TemplateFlag, string]> = [
  ["requiresQuantity", "Requiere cantidad"],
  ["requiresLot", "Requiere lote"],
  ["requiresEquipment", "Requiere equipo"],
  ["allowsUnplanned", "Permite no programada"],
];

function FeedbackBox({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return <p role="status" className={`mt-3 rounded-lg p-3 text-xs font-semibold ${feedback.kind === "error" ? "bg-[var(--red-soft)] text-[var(--red)]" : "bg-[var(--surface-soft)] text-[var(--green)]"}`}>{feedback.text}</p>;
}

function SimpleMasterSection({ plantId, title, description, kind, items, onChanged }: {
  plantId: string;
  title: string;
  description: string;
  kind: SimpleMasterKind;
  items: SimpleItem[];
  onChanged: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => setDraftNames(Object.fromEntries(items.map((item) => [item.id, item.name]))), [items]);

  async function create() {
    if (busyId) return;
    const identity = validateMasterIdentity(code || name, name);
    if (!identity.ok) return setFeedback({ kind: "error", text: identity.error });
    setBusyId("new"); setFeedback(null);
    try {
      const result = await createSimpleOperationalMaster({ kind, plantId, code: identity.code, name: identity.name });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      setCode(""); setName(""); await onChanged(); setFeedback({ kind: "ok", text: "Registro creado." });
    } finally { setBusyId(""); }
  }

  async function save(item: SimpleItem, active = item.active) {
    if (busyId) return;
    const nextName = (draftNames[item.id] ?? item.name).trim();
    if (!nextName) return setFeedback({ kind: "error", text: "El nombre no puede quedar vacío." });
    setBusyId(item.id); setFeedback(null);
    try {
      const result = await updateSimpleOperationalMaster({ kind, id: item.id, name: nextName, active });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      await onChanged(); setFeedback({ kind: "ok", text: "Maestro actualizado." });
    } finally { setBusyId(""); }
  }

  return <section className="panel">
    <div className="section-head"><div><p className="eyebrow">Maestro operacional</p><h2>{title}</h2><p className="quiet mt-1">{description}</p></div><span className="quiet">{items.filter((item) => item.active).length} activos</span></div>
    <div className="grid gap-2">{items.map((item) => <div className="grid gap-2 rounded-xl border border-[var(--line)] p-3 md:grid-cols-[110px_1fr_auto_auto] md:items-center" key={item.id}>
      <strong className="text-xs text-[var(--green)]">{item.code}</strong>
      <input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={draftNames[item.id] ?? item.name} onChange={(event) => setDraftNames((current) => ({ ...current, [item.id]: event.target.value }))} disabled={busyId === item.id} aria-label={`Nombre ${item.code}`} />
      <span className={`status-pill ${item.active ? "status-normal" : "status-planned"}`}>{item.active ? "Activo" : "Inactivo"}</span>
      <div className="flex gap-2"><button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={() => void save(item)}>{busyId === item.id ? "Guardando…" : "Guardar"}</button><button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={() => void save(item, !item.active)}>{item.active ? "Desactivar" : "Activar"}</button></div>
    </div>)}</div>
    <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-4"><strong className="text-xs">Crear nuevo</strong><div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr_auto]"><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={code} onChange={(event) => setCode(normalizeMasterCode(event.target.value))} placeholder="CÓDIGO" aria-label={`Código nuevo ${title}`} /><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre visible" aria-label={`Nombre nuevo ${title}`} /><button className="button primary" type="button" disabled={Boolean(busyId)} onClick={() => void create()}>{busyId === "new" ? "Creando…" : "Crear"}</button></div></div>
    <FeedbackBox feedback={feedback} />
  </section>;
}

function SourcesSection({ plantId, items, onChanged }: { plantId: string; items: MaterialSource[]; onChanged: () => Promise<void> }) {
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [sourceKind, setSourceKind] = useState<MaterialSourceKind>("generator");
  const [draft, setDraft] = useState<Record<string, { name: string; sourceKind: MaterialSourceKind }>>({});
  const [busyId, setBusyId] = useState(""); const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => setDraft(Object.fromEntries(items.map((item) => [item.id, { name: item.name, sourceKind: item.sourceKind }]))), [items]);

  async function create() {
    const identity = validateMasterIdentity(code || name, name);
    if (!identity.ok) return setFeedback({ kind: "error", text: identity.error });
    setBusyId("new"); setFeedback(null);
    try {
      const result = await createMaterialSource({ plantId, code: identity.code, name: identity.name, sourceKind });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      setCode(""); setName(""); setSourceKind("generator"); await onChanged(); setFeedback({ kind: "ok", text: "Origen creado." });
    } finally { setBusyId(""); }
  }

  async function save(item: MaterialSource, active = item.active) {
    const value = draft[item.id] ?? { name: item.name, sourceKind: item.sourceKind };
    if (!value.name.trim()) return setFeedback({ kind: "error", text: "El nombre no puede quedar vacío." });
    setBusyId(item.id); setFeedback(null);
    try {
      const result = await updateMaterialSource({ id: item.id, name: value.name.trim(), sourceKind: value.sourceKind, active });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      await onChanged(); setFeedback({ kind: "ok", text: "Origen actualizado." });
    } finally { setBusyId(""); }
  }

  return <section className="panel"><div className="section-head"><div><p className="eyebrow">Recepción · futuro 2B</p><h2>Orígenes y generadores</h2><p className="quiet mt-1">Generadores, proveedores y orígenes internos con identidad estable.</p></div></div>
    <div className="grid gap-2">{items.map((item) => { const value = draft[item.id] ?? { name: item.name, sourceKind: item.sourceKind }; return <div className="grid gap-2 rounded-xl border border-[var(--line)] p-3 lg:grid-cols-[110px_1fr_170px_auto_auto] lg:items-center" key={item.id}><strong className="text-xs text-[var(--green)]">{item.code}</strong><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={value.name} onChange={(event) => setDraft((current) => ({ ...current, [item.id]: { ...value, name: event.target.value } }))} /><select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={value.sourceKind} onChange={(event) => setDraft((current) => ({ ...current, [item.id]: { ...value, sourceKind: event.target.value as MaterialSourceKind } }))}>{Object.entries(sourceKindLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><span className={`status-pill ${item.active ? "status-normal" : "status-planned"}`}>{item.active ? "Activo" : "Inactivo"}</span><div className="flex gap-2"><button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={() => void save(item)}>Guardar</button><button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={() => void save(item, !item.active)}>{item.active ? "Desactivar" : "Activar"}</button></div></div>; })}</div>
    <div className="mt-4 grid gap-3 rounded-xl bg-[var(--surface-soft)] p-4 md:grid-cols-[160px_1fr_170px_auto]"><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={code} onChange={(event) => setCode(normalizeMasterCode(event.target.value))} placeholder="CÓDIGO" /><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre visible" /><select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={sourceKind} onChange={(event) => setSourceKind(event.target.value as MaterialSourceKind)}>{Object.entries(sourceKindLabel).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="button primary" type="button" disabled={Boolean(busyId)} onClick={() => void create()}>{busyId === "new" ? "Creando…" : "Crear origen"}</button></div><FeedbackBox feedback={feedback} />
  </section>;
}

function TemplatesSection({ plantId, snapshot, onChanged }: { plantId: string; snapshot: OperationalMasterSnapshot; onChanged: () => Promise<void> }) {
  const activeProcesses = snapshot.processes.filter((item) => item.active);
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [processId, setProcessId] = useState(""); const [unitCode, setUnitCode] = useState("");
  const [requiresQuantity, setRequiresQuantity] = useState(false); const [requiresLot, setRequiresLot] = useState(false); const [requiresEquipment, setRequiresEquipment] = useState(false); const [allowsUnplanned, setAllowsUnplanned] = useState(true);
  const [draft, setDraft] = useState<Record<string, ActivityTemplate>>({}); const [busyId, setBusyId] = useState(""); const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => setDraft(Object.fromEntries(snapshot.activityTemplates.map((item) => [item.id, item]))), [snapshot.activityTemplates]);
  const effectiveProcessId = activeProcesses.some((item) => item.id === processId) ? processId : activeProcesses[0]?.id ?? "";

  function patch(id: string, changes: Partial<ActivityTemplate>) {
    const base = draft[id] ?? snapshot.activityTemplates.find((item) => item.id === id);
    if (!base) return;
    setDraft((current) => ({ ...current, [id]: { ...base, ...changes } }));
  }

  async function create() {
    const identity = validateMasterIdentity(code || name, name);
    if (!identity.ok) return setFeedback({ kind: "error", text: identity.error });
    if (!effectiveProcessId) return setFeedback({ kind: "error", text: "Crea o activa un proceso antes de crear plantillas." });
    setBusyId("new"); setFeedback(null);
    try {
      const result = await createActivityTemplate({ plantId, processId: effectiveProcessId, code: identity.code, name: identity.name, defaultUnitCode: unitCode || undefined, requiresQuantity, requiresLot, requiresEquipment, allowsUnplanned });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      setCode(""); setName(""); setUnitCode(""); setRequiresQuantity(false); setRequiresLot(false); setRequiresEquipment(false); setAllowsUnplanned(true); await onChanged(); setFeedback({ kind: "ok", text: "Plantilla creada." });
    } finally { setBusyId(""); }
  }

  async function save(item: ActivityTemplate, active = item.active) {
    const value = draft[item.id] ?? item;
    if (!value.name.trim()) return setFeedback({ kind: "error", text: "El nombre no puede quedar vacío." });
    setBusyId(item.id); setFeedback(null);
    try {
      const result = await updateActivityTemplate({ id: item.id, processId: value.processId, name: value.name.trim(), defaultUnitCode: value.defaultUnitCode, requiresQuantity: value.requiresQuantity, requiresLot: value.requiresLot, requiresEquipment: value.requiresEquipment, allowsUnplanned: value.allowsUnplanned, active });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      await onChanged(); setFeedback({ kind: "ok", text: "Plantilla actualizada." });
    } finally { setBusyId(""); }
  }

  return <section className="panel"><div className="section-head"><div><p className="eyebrow">Planeación</p><h2>Plantillas de actividad</h2><p className="quiet mt-1">Definen qué exige una tarea y serán la fuente del planificador y de Bitácora 2.0.</p></div><span className="quiet">{snapshot.activityTemplates.filter((item) => item.active).length} activas</span></div>
    <div className="grid gap-3">{snapshot.activityTemplates.map((item) => { const value = draft[item.id] ?? item; return <article className="rounded-xl border border-[var(--line)] p-4" key={item.id}><div className="grid gap-3 lg:grid-cols-[110px_1fr_220px_130px_auto] lg:items-center"><strong className="text-xs text-[var(--green)]">{item.code}</strong><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={value.name} onChange={(event) => patch(item.id, { name: event.target.value })} /><select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={value.processId} onChange={(event) => patch(item.id, { processId: event.target.value })}>{snapshot.processes.map((process) => <option value={process.id} key={process.id}>{process.name}{process.active ? "" : " · inactivo"}</option>)}</select><select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={value.defaultUnitCode ?? ""} onChange={(event) => patch(item.id, { defaultUnitCode: event.target.value || undefined })}><option value="">Sin unidad</option>{snapshot.units.map((unit) => <option value={unit.code} key={unit.code}>{unit.symbol} · {unit.name}</option>)}</select><span className={`status-pill ${item.active ? "status-normal" : "status-planned"}`}>{item.active ? "Activa" : "Inactiva"}</span></div><div className="mt-3 flex flex-wrap gap-4 text-xs">{templateFlags.map(([key, label]) => <label className="flex items-center gap-2" key={key}><input type="checkbox" checked={value[key]} onChange={(event) => patch(item.id, { [key]: event.target.checked })} />{label}</label>)}</div><div className="mt-4 flex justify-end gap-2"><button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={() => void save(item)}>Guardar</button><button className="button secondary" type="button" disabled={Boolean(busyId)} onClick={() => void save(item, !item.active)}>{item.active ? "Desactivar" : "Activar"}</button></div></article>; })}</div>
    <div className="mt-5 rounded-xl bg-[var(--surface-soft)] p-4"><strong className="text-xs">Nueva plantilla</strong><div className="mt-3 grid gap-3 lg:grid-cols-4"><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={code} onChange={(event) => setCode(normalizeMasterCode(event.target.value))} placeholder="CÓDIGO" /><input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de actividad" /><select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={effectiveProcessId} onChange={(event) => setProcessId(event.target.value)}>{activeProcesses.map((process) => <option value={process.id} key={process.id}>{process.name}</option>)}</select><select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={unitCode} onChange={(event) => setUnitCode(event.target.value)}><option value="">Sin unidad</option>{snapshot.units.map((unit) => <option value={unit.code} key={unit.code}>{unit.symbol} · {unit.name}</option>)}</select></div><div className="mt-3 flex flex-wrap gap-4 text-xs"><label className="flex items-center gap-2"><input type="checkbox" checked={requiresQuantity} onChange={(event) => setRequiresQuantity(event.target.checked)} />Requiere cantidad</label><label className="flex items-center gap-2"><input type="checkbox" checked={requiresLot} onChange={(event) => setRequiresLot(event.target.checked)} />Requiere lote</label><label className="flex items-center gap-2"><input type="checkbox" checked={requiresEquipment} onChange={(event) => setRequiresEquipment(event.target.checked)} />Requiere equipo</label><label className="flex items-center gap-2"><input type="checkbox" checked={allowsUnplanned} onChange={(event) => setAllowsUnplanned(event.target.checked)} />Permite ejecución no programada</label></div><div className="mt-4 flex justify-end"><button className="button primary" type="button" disabled={Boolean(busyId) || !activeProcesses.length} onClick={() => void create()}>{busyId === "new" ? "Creando…" : "Crear plantilla"}</button></div></div><FeedbackBox feedback={feedback} />
  </section>;
}

function EquipmentProcessesSection({ plantId, snapshot, onChanged }: { plantId: string; snapshot: OperationalMasterSnapshot; onChanged: () => Promise<void> }) {
  const [busyKey, setBusyKey] = useState(""); const [feedback, setFeedback] = useState<Feedback>(null);
  const activeProcesses = snapshot.processes.filter((item) => item.active);
  const assigned = useMemo(() => new Set(snapshot.equipmentProcesses.filter((item) => item.active).map((item) => `${item.equipmentId}|${item.processId}`)), [snapshot.equipmentProcesses]);

  async function toggle(equipmentId: string, processId: string, active: boolean) {
    const key = `${equipmentId}|${processId}`; setBusyKey(key); setFeedback(null);
    try {
      const result = await setEquipmentProcessAssignment({ plantId, equipmentId, processId, active });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      await onChanged();
    } finally { setBusyKey(""); }
  }

  return <section className="panel"><div className="section-head"><div><p className="eyebrow">Capacidad operacional</p><h2>Equipos por proceso</h2><p className="quiet mt-1">Filtra los equipos pertinentes que el futuro planificador podrá asignar.</p></div></div>{snapshot.equipment.length ? <div className="grid gap-3">{snapshot.equipment.map((equipment) => <article className="rounded-xl border border-[var(--line)] p-4" key={equipment.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><strong>{equipment.code} · {equipment.name}</strong><span className="quiet mt-1 block">Estado actual: {equipment.status}</span></div><div className="flex flex-wrap gap-3">{activeProcesses.map((process) => { const key = `${equipment.id}|${process.id}`; return <label className="flex items-center gap-2 rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-xs" key={process.id}><input type="checkbox" checked={assigned.has(key)} disabled={Boolean(busyKey)} onChange={(event) => void toggle(equipment.id, process.id, event.target.checked)} />{process.name}</label>; })}</div></div></article>)}</div> : <p className="quiet">No hay equipos registrados en esta planta.</p>}<FeedbackBox feedback={feedback} /></section>;
}

export function OperationalMasterAdminView() {
  const { backend, access } = useOpsStore();
  const managedPlants = useMemo(() => access.filter((plant) => canManageOperationalMasters(plant.role)), [access]);
  const [plantId, setPlantId] = useState("");
  const effectivePlantId = managedPlants.some((plant) => plant.plantId === plantId) ? plantId : managedPlants[0]?.plantId ?? "";
  const [snapshot, setSnapshot] = useState<OperationalMasterSnapshot>(emptySnapshot);
  const [loading, setLoading] = useState(false); const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    if (backend.mode !== "supabase" || !effectivePlantId) { setSnapshot(emptySnapshot); return; }
    setLoading(true); setFeedback(null);
    try { setSnapshot(await loadOperationalMasterSnapshot(effectivePlantId)); }
    catch (caught) { setFeedback({ kind: "error", text: caught instanceof Error ? caught.message : "No fue posible cargar los maestros." }); }
    finally { setLoading(false); }
  }, [backend.mode, effectivePlantId]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  if (backend.mode !== "supabase") return <section className="panel mx-auto max-w-3xl"><p className="eyebrow">Administración</p><h1 className="text-3xl">Maestros operacionales</h1><p className="lede">Los catálogos corporativos se administran únicamente contra Supabase. El modo local conserva su función de desarrollo y demostración.</p></section>;
  if (!managedPlants.length) return <section className="panel mx-auto max-w-3xl"><p className="eyebrow">Administración</p><h1 className="text-3xl">Maestros operacionales</h1><p className="lede">Tu rol puede operar la planta, pero no administrar catálogos. Esta superficie requiere Supervisor, Técnico, Administrador o Dirección.</p></section>;

  return <><header className="page-header"><div><p className="eyebrow">Wave 2A · configuración operacional</p><h1>Maestros operacionales</h1><p className="lede">Una sola taxonomía por planta para que calendario, bitácora, recepción y analítica dejen de depender de texto libre.</p></div><div className="header-actions"><label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Planta<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm normal-case text-[var(--ink)]" value={effectivePlantId} onChange={(event) => setPlantId(event.target.value)}>{managedPlants.map((plant) => <option value={plant.plantId} key={plant.plantId}>{plant.name}</option>)}</select></label><button className="button secondary" type="button" disabled={loading} onClick={() => void load()}>{loading ? "Actualizando…" : "Actualizar"}</button></div></header>
    <FeedbackBox feedback={feedback} />
    {loading && !snapshot.processes.length ? <section className="panel"><p className="quiet">Cargando maestros de la planta…</p></section> : <div className="grid gap-4">
      <SimpleMasterSection plantId={effectivePlantId} title="Procesos" description="Eje principal para programación, ejecución y análisis." kind="process" items={snapshot.processes} onChanged={load} />
      <TemplatesSection plantId={effectivePlantId} snapshot={snapshot} onChanged={load} />
      <SimpleMasterSection plantId={effectivePlantId} title="Rutas" description="Circuitos logísticos que después usará Recepción 2.0." kind="route" items={snapshot.routes} onChanged={load} />
      <SourcesSection plantId={effectivePlantId} items={snapshot.sources} onChanged={load} />
      <SimpleMasterSection plantId={effectivePlantId} title="Tipos de material" description="Clasificación canónica del material recibido o utilizado." kind="materialType" items={snapshot.materialTypes} onChanged={load} />
      <EquipmentProcessesSection plantId={effectivePlantId} snapshot={snapshot} onChanged={load} />
    </div>}
  </>;
}
