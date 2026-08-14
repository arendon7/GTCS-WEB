"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompostStore } from "@/components/compost-store";
import { useOpsStore } from "@/components/ops-store";
import { bogotaDatetimeLocalToIso, bogotaDatetimeLocalValue } from "@/lib/time";

export function CompostCreateForm() {
  const router = useRouter();
  const { workers, access, backend } = useOpsStore();
  const { intakeLots, createPile } = useCompostStore();
  const [plantId, setPlantId] = useState("tamesis");
  const [location, setLocation] = useState("");
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [formationStartedAt, setFormationStartedAt] = useState(() => bogotaDatetimeLocalValue(new Date(Date.now() - 30 * 60_000)));
  const [formationEndedAt, setFormationEndedAt] = useState(() => bogotaDatetimeLocalValue());
  const [volumeM3, setVolumeM3] = useState("");
  const [workerIds, setWorkerIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  const plantOptions = useMemo(() => backend.mode === "supabase"
    ? access.map((plant) => ({ id: plant.plantId, name: plant.name }))
    : [{ id: "tamesis", name: "Támesis" }, { id: "yarumal", name: "Yarumal" }], [access, backend.mode]);
  const effectivePlantId = plantOptions.some((plant) => plant.id === plantId) ? plantId : plantOptions[0]?.id ?? plantId;
  const eligible = useMemo(() => intakeLots.filter((lot) => lot.plantId === effectivePlantId && ["available", "in_process"].includes(lot.status) && lot.availableMassKg > 0), [effectivePlantId, intakeLots]);
  const quarantined = useMemo(() => intakeLots.filter((lot) => lot.plantId === effectivePlantId && lot.status === "quarantined"), [effectivePlantId, intakeLots]);
  const plantWorkers = useMemo(() => workers.filter((worker) => worker.plantId === effectivePlantId && !worker.historical), [effectivePlantId, workers]);
  const allocatedMassKg = selectedLots.reduce((sum, id) => sum + (Number(allocations[id]) || 0), 0);

  const resetPlant = (nextPlant: string) => {
    setPlantId(nextPlant);
    setSelectedLots([]);
    setAllocations({});
    setWorkerIds([]);
  };

  const toggleLot = (id: string, checked: boolean) => {
    setSelectedLots((current) => checked ? [...current, id] : current.filter((value) => value !== id));
    if (!checked) setAllocations((current) => { const next = { ...current }; delete next[id]; return next; });
  };

  const toggleWorker = (id: string, checked: boolean) => setWorkerIds((current) => checked ? [...current, id] : current.filter((value) => value !== id));

  const save = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback("");
    try {
      const sourceAllocations = selectedLots.map((intakeLotId) => ({ intakeLotId, massKg: Number(allocations[intakeLotId]) }));
      const result = await createPile({
        plantId: effectivePlantId,
        location,
        sourceAllocations,
        formationStartedAt: bogotaDatetimeLocalToIso(formationStartedAt),
        formationEndedAt: bogotaDatetimeLocalToIso(formationEndedAt),
        formationVolumeM3: Number(volumeM3),
        workerIds,
        notes,
      });
      if (!result.ok) return setFeedback(result.error);
      router.push(`/compost/${result.id}`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No fue posible interpretar la fecha de conformación.");
    } finally {
      setBusy(false);
    }
  };

  return <section className="panel mx-auto max-w-4xl">
    <div className="section-head"><div><p className="eyebrow">Compostaje 2.0</p><h1 className="text-3xl">Conformar pila</h1><p className="lede">Asigna masa física disponible, responsables y variables reales de conformación. La suma de las asignaciones define el peso inicial de la pila.</p></div><Link className="button secondary" href="/compost">Cancelar</Link></div>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Planta<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={effectivePlantId} disabled={plantOptions.length === 0} onChange={(event) => resetPlant(event.target.value)}>{plantOptions.map((plant) => <option value={plant.id} key={plant.id}>{plant.name}</option>)}</select></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Ubicación<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ej. Zona compostaje A" /></label>

      <fieldset className="grid gap-2 md:col-span-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Lotes físicos y masa asignada</legend>
        {eligible.length ? eligible.map((lot) => {
          const checked = selectedLots.includes(lot.id);
          return <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-white p-3 sm:grid-cols-[1fr_180px] sm:items-center" key={lot.id}>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input checked={checked} type="checkbox" onChange={(event) => toggleLot(lot.id, event.target.checked)} /><span><strong className="block text-xs">{lot.lotCode}</strong><span className="text-[11px] text-[var(--muted)]">Disponible: {lot.availableMassKg.toLocaleString("es-CO")} kg · {lot.status === "in_process" ? "En proceso" : "Disponible"}</span></span></label>
            {checked && <label className="grid gap-1 text-[11px] font-bold text-[var(--muted)]">Asignar (kg)<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={allocations[lot.id] ?? ""} onChange={(event) => setAllocations((current) => ({ ...current, [lot.id]: event.target.value }))} placeholder={`Máx. ${lot.availableMassKg}`} /></label>}
          </div>;
        }) : <p className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs text-[var(--muted)]">No hay lotes físicos disponibles para proceso en esta planta. Registra primero una recepción aceptada.</p>}
        {quarantined.length > 0 && <p className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs text-[var(--muted)]">{quarantined.length} lote(s) condicionado(s) permanecen en cuarentena y no pueden asignarse a compostaje hasta que exista una liberación técnica explícita.</p>}
      </fieldset>

      <div className="rounded-xl bg-[var(--surface-soft)] p-4"><span className="quiet">Peso inicial trazable</span><strong className="mt-1 block text-2xl">{allocatedMassKg.toLocaleString("es-CO")} kg</strong><span className="mt-1 block text-[11px] text-[var(--muted)]">Se deriva de los kg asignados; no se digita por separado.</span></div>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Volumen conformado (m³)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={volumeM3} onChange={(event) => setVolumeM3(event.target.value)} placeholder="Ej. 8" /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Inicio de conformación · hora Colombia<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="datetime-local" value={formationStartedAt} onChange={(event) => setFormationStartedAt(event.target.value)} /></label>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Fin de conformación · hora Colombia<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="datetime-local" value={formationEndedAt} onChange={(event) => setFormationEndedAt(event.target.value)} /></label>

      <fieldset className="grid gap-2 md:col-span-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Trabajadores de conformación</legend><div className="grid gap-2 sm:grid-cols-2">{plantWorkers.length ? plantWorkers.map((worker) => <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" key={worker.id}><input type="checkbox" checked={workerIds.includes(worker.id)} onChange={(event) => toggleWorker(worker.id, event.target.checked)} /><span>{worker.name}</span></label>) : <p className="text-xs text-[var(--muted)]">No hay trabajadores operacionales disponibles en esta planta.</p>}</div></fieldset>
      <label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación de conformación <span className="font-normal">(opcional)</span><textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm text-[var(--ink)]" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Novedades relevantes del armado de la pila" /></label>
    </div>
    {feedback && <p className="mt-4 rounded-lg bg-[var(--red-soft)] p-3 text-sm font-semibold text-[var(--red)]" role="alert">{feedback}</p>}
    <div className="mt-6 flex justify-end"><button className="button primary" type="button" disabled={busy || plantOptions.length === 0} onClick={save}>{busy ? "Conformando…" : "Conformar pila"}</button></div>
  </section>;
}
