"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOpsStore } from "@/components/ops-store";
import type { AcceptanceStatus, WasteType } from "@/lib/domain";

type ManualAcceptanceStatus = Exclude<AcceptanceStatus, "unknown">;

export function ReceptionForm() {
  const router = useRouter();
  const { createReception } = useOpsStore();
  const [startedAt] = useState(() => new Date().toISOString());
  const [plantId, setPlantId] = useState("tamesis");
  const [generator, setGenerator] = useState("");
  const [route, setRoute] = useState("");
  const [wasteType, setWasteType] = useState<WasteType>("FORSU");
  const [netWeightKg, setNetWeightKg] = useState("");
  const [rejectionKg, setRejectionKg] = useState("0");
  const [acceptance, setAcceptance] = useState<ManualAcceptanceStatus>("accepted");
  const [observation, setObservation] = useState("");
  const [feedback, setFeedback] = useState("");

  const rejectionPct = useMemo(() => {
    const net = Number(netWeightKg);
    const rejection = Number(rejectionKg);
    if (!Number.isFinite(net) || net <= 0 || !Number.isFinite(rejection) || rejection < 0) return null;
    return (rejection / net) * 100;
  }, [netWeightKg, rejectionKg]);

  const save = () => {
    const result = createReception({ plantId, generator, route, wasteType, netWeightKg: Number(netWeightKg), rejectionKg: Number(rejectionKg), acceptance, observation, startedAt });
    if (!result.ok) return setFeedback(result.error);
    router.push("/receptions");
  };

  return <section className="panel mx-auto max-w-3xl">
    <div className="section-head"><div><p className="eyebrow">Recepción en curso</p><h1 className="text-3xl">Registrar ingreso</h1><p className="lede">El tiempo de recepción se inició al abrir esta pantalla. Peso, rechazo y lote se controlan en una sola operación.</p></div><Link className="button secondary" href="/receptions">Cancelar</Link></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={plantId} onChange={(e)=>setPlantId(e.target.value)}><option value="tamesis">Támesis</option><option value="yarumal">Yarumal</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Tipo de residuo<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={wasteType} onChange={(e)=>setWasteType(e.target.value as WasteType)}><option value="FORSU">FORSU</option><option value="PODA">Poda</option><option value="GALLINAZA">Gallinaza</option><option value="MATERIA_PRIMA">Materia prima</option><option value="OTRO">Otro</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Generador / proveedor<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={generator} onChange={(e)=>setGenerator(e.target.value)} placeholder="Ej. Aguas del Norte"/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Ruta / origen<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={route} onChange={(e)=>setRoute(e.target.value)} placeholder="Ej. Ruta selectiva martes"/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Peso neto (kg)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={netWeightKg} onChange={(e)=>setNetWeightKg(e.target.value)} placeholder="Ej. 1840"/></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Rechazo (kg)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={rejectionKg} onChange={(e)=>setRejectionKg(e.target.value)} placeholder="0"/></label>
      <div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Calidad de separación</span><strong className="mt-1 block text-2xl">{rejectionPct === null ? "—" : `${rejectionPct.toFixed(1)} %`}</strong><span className="mt-1 block text-xs text-[var(--muted)]">rechazo sobre peso neto</span></div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Estado de aceptación<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={acceptance} onChange={(e)=>setAcceptance(e.target.value as ManualAcceptanceStatus)}><option value="accepted">Aceptado</option><option value="conditioned">Aceptado condicionado</option><option value="rejected">Rechazado</option></select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación <span className="font-normal">(opcional)</span><textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={observation} onChange={(e)=>setObservation(e.target.value)} placeholder="Solo si hay algo relevante para trazabilidad"/></label>
    </div>
    <div className="mt-5 rounded-xl border border-dashed border-[var(--line)] p-4 text-xs text-[var(--muted)]"><strong className="text-[var(--ink)]">Evidencia:</strong> el adapter de fotografía/tiquete se conectará a SharePoint o Storage en la siguiente capa de persistencia; este MVP no simula una carga de archivos.</div>
    {feedback && <p className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}
    <div className="mt-6 flex justify-end"><button className="button primary" type="button" onClick={save}>Guardar recepción y crear lote</button></div>
  </section>;
}
