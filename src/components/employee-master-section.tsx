"use client";

import { useCallback, useEffect, useState } from "react";
import { canManageEmployeeMaster, type EmployeeMaster } from "@/lib/employee-master";
import { normalizeMasterCode, validateMasterIdentity } from "@/lib/operational-master-data";
import { createEmployeeMaster, loadEmployeeMasters, updateEmployeeMaster } from "@/lib/supabase/employee-master-repository";

type Feedback = { kind: "error" | "ok"; text: string } | null;

function FeedbackBox({ feedback }: { feedback: Feedback }) {
  return feedback ? <p role="status" className={`mt-3 rounded-lg p-3 text-xs font-semibold ${feedback.kind === "error" ? "bg-[var(--red-soft)] text-[var(--red)]" : "bg-[var(--surface-soft)] text-[var(--green)]"}`}>{feedback.text}</p> : null;
}

function EmployeeRow({ item, busy, onSave }: { item: EmployeeMaster; busy: boolean; onSave: (item: EmployeeMaster, code: string, name: string, active: boolean) => Promise<void> }) {
  const [code, setCode] = useState(item.code ?? "");
  const [name, setName] = useState(item.name);
  return <div className="grid gap-2 rounded-xl border border-[var(--line)] p-3 lg:grid-cols-[150px_1fr_auto_auto] lg:items-center">
    <input aria-label={`Código de ${item.name}`} className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-xs font-semibold text-[var(--green)]" value={code} onChange={(event) => setCode(normalizeMasterCode(event.target.value))} disabled={busy} />
    <input aria-label={`Nombre de ${item.name}`} className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} disabled={busy} />
    <div className="flex flex-wrap gap-2"><span className={`status-pill ${item.active ? "status-normal" : "status-planned"}`}>{item.active ? "Activo" : "Retirado"}</span>{item.provisional ? <span className="status-pill status-medium">Provisional</span> : null}</div>
    <div className="flex flex-wrap gap-2"><button className="button secondary" type="button" disabled={busy || !name.trim()} onClick={() => void onSave(item, code, name, item.active)}>Guardar</button><button className="button secondary" type="button" disabled={busy} onClick={() => void onSave(item, code, name, !item.active)}>{item.active ? "Retirar" : "Reactivar"}</button></div>
  </div>;
}

export function EmployeeMasterSection({ plantId, role, onOpsRefresh }: { plantId: string; role: string; onOpsRefresh?: () => Promise<void> }) {
  const allowed = canManageEmployeeMaster(role);
  const [loaded, setLoaded] = useState<{ plantId: string; items: EmployeeMaster[] }>({ plantId: "", items: [] });
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const loading = allowed && loaded.plantId !== plantId;

  const reload = useCallback(async () => {
    if (!allowed || !plantId) return;
    const items = await loadEmployeeMasters(plantId);
    setLoaded({ plantId, items });
  }, [allowed, plantId]);

  useEffect(() => {
    if (!allowed || !plantId) return;
    let active = true;
    void loadEmployeeMasters(plantId)
      .then((items) => { if (active) { setLoaded({ plantId, items }); setFeedback(null); } })
      .catch((error) => { if (active) setFeedback({ kind: "error", text: error instanceof Error ? error.message : "No fue posible cargar los trabajadores." }); });
    return () => { active = false; };
  }, [allowed, plantId]);

  if (!allowed) return null;

  async function changed() {
    await reload();
    if (onOpsRefresh) await onOpsRefresh();
  }

  async function create() {
    const validation = validateMasterIdentity(code || name, name);
    if (!validation.ok) return setFeedback({ kind: "error", text: validation.error });
    setBusy(true);
    setFeedback(null);
    try {
      const result = await createEmployeeMaster({ plantId, code: validation.code, name: validation.name });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      setCode("");
      setName("");
      await changed();
      setFeedback({ kind: "ok", text: "Trabajador agregado a la planta." });
    } finally {
      setBusy(false);
    }
  }

  async function save(item: EmployeeMaster, nextCode: string, nextName: string, active: boolean) {
    const validation = validateMasterIdentity(nextCode || nextName, nextName);
    if (!validation.ok) return setFeedback({ kind: "error", text: validation.error });
    setBusy(true);
    setFeedback(null);
    try {
      const result = await updateEmployeeMaster({ id: item.id, code: validation.code, name: validation.name, active });
      if (!result.ok) return setFeedback({ kind: "error", text: result.error });
      await changed();
      setFeedback({ kind: "ok", text: active ? "Trabajador actualizado." : "Trabajador retirado de nuevas asignaciones; su historial permanece intacto." });
    } finally {
      setBusy(false);
    }
  }

  const items = loaded.plantId === plantId ? loaded.items : [];
  return <section className="panel">
    <div className="section-head"><div><p className="eyebrow">Equipo de planta</p><h2>Trabajadores</h2><p className="quiet mt-1">El administrador puede sumar, renombrar, retirar y reactivar personal. Retirar nunca borra bitácoras ni responsables históricos.</p></div><span className="quiet">{items.filter((item) => item.active).length} activos</span></div>
    {items.some((item) => item.provisional) ? <div className="mb-4 rounded-xl bg-[var(--amber-soft)] p-4 text-xs text-[var(--amber)]"><strong>Dotación inicial provisional.</strong> Reemplaza los nombres genéricos por los trabajadores reales antes del piloto. Al renombrar un registro provisional, queda confirmado automáticamente.</div> : null}
    {loading ? <p className="quiet">Cargando trabajadores…</p> : <div className="grid gap-2">{items.map((item) => <EmployeeRow key={`${item.id}:${item.code}:${item.name}:${item.active}:${item.provisional}`} item={item} busy={busy} onSave={save} />)}{!items.length ? <p className="quiet">No hay trabajadores operacionales configurados en esta planta.</p> : null}</div>}
    <div className="mt-4 grid gap-3 rounded-xl bg-[var(--surface-soft)] p-4 md:grid-cols-[180px_1fr_auto]"><input aria-label="Código del nuevo trabajador" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={code} onChange={(event) => setCode(normalizeMasterCode(event.target.value))} placeholder="CÓDIGO / se genera del nombre"/><input aria-label="Nombre del nuevo trabajador" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre completo del trabajador"/><button className="button primary" type="button" disabled={busy || loading} onClick={() => void create()}>{busy ? "Guardando…" : "Agregar trabajador"}</button></div>
    <p className="quiet mt-3">Si el trabajador tiene una actividad en curso o una programación futura pendiente, primero debes cerrarla o reasignarla antes de retirarlo.</p>
    <FeedbackBox feedback={feedback}/>
  </section>;
}
