"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AlertSeverity } from "@/lib/domain";
import { maintenanceFailureTypeLabels, type MaintenanceFailureType } from "@/lib/maintenance-domain";
import { useMaintenanceStore } from "@/components/maintenance-store";
import { EquipmentStatusPill } from "@/components/equipment-status-pill";

function localDateTimeValue(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function evidenceRefs(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function EquipmentReportForm({ equipmentId }: { equipmentId: string }) {
  const router = useRouter();
  const { equipment, reportFailure } = useMaintenanceStore();
  const asset = equipment.find((item) => item.id === equipmentId);
  const [severity, setSeverity] = useState<AlertSeverity>("medium");
  const [failureType, setFailureType] = useState<MaintenanceFailureType>("other");
  const [failedAt, setFailedAt] = useState(() => localDateTimeValue());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  if (!asset) return <section className="panel mx-auto max-w-3xl"><h1 className="text-2xl">Equipo no encontrado</h1><Link className="button secondary mt-5" href="/equipment">Volver</Link></section>;

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = await reportFailure({
        equipmentId: asset.id,
        failureType,
        failedAt: failedAt ? new Date(failedAt).toISOString() : "",
        severity,
        title,
        description,
        evidenceRefs: evidenceRefs(evidence),
      });
      if (!result.ok) return setFeedback(result.error);
      router.push(`/equipment/${asset.id}`);
    } finally {
      setBusy(false);
    }
  };

  return <section className="panel mx-auto max-w-3xl">
    <div className="section-head"><div><p className="eyebrow">{asset.plant} · {asset.area}</p><h1 className="text-3xl">Reportar falla</h1><p className="lede">{asset.code} · {asset.name}. Registra cuándo ocurrió realmente; al guardar, el equipo quedará detenido de forma transaccional.</p></div><EquipmentStatusPill status={asset.status}/></div>
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Tipo de falla<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={failureType} onChange={(e)=>setFailureType(e.target.value as MaintenanceFailureType)}>{Object.entries(maintenanceFailureTypeLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Severidad<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={severity} onChange={(e)=>setSeverity(e.target.value as AlertSeverity)}><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option></select></label>
      </div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Momento real de la falla<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="datetime-local" value={failedAt} onChange={(e)=>setFailedAt(e.target.value)}/><span className="font-normal">El tiempo fuera de servicio se calculará desde este momento, no desde la hora del reporte.</span></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">¿Qué falló?<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ej. Bomba obstruida"/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Qué ocurrió / impacto<textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Ej. Se detuvo la recirculación; no se debe operar hasta revisar."/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Referencias de evidencia <span className="font-normal">(opcional, una por línea)</span><textarea className="min-h-20 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={evidence} onChange={(e)=>setEvidence(e.target.value)} placeholder="URL, código documental o referencia verificable"/><span className="font-normal">Las referencias quedan asociadas al ticket y separadas de la evidencia de reparación.</span></label>
    </div>
    {feedback && <p className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}
    <div className="mt-6 flex items-center justify-between gap-3"><Link className="button secondary" href={`/equipment/${asset.id}`}>Cancelar</Link><button className="button primary" type="button" disabled={busy} onClick={save}>{busy ? "Reportando…" : "Reportar y detener equipo"}</button></div>
  </section>;
}
