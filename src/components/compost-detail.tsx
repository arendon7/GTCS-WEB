"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CompostStatusPill } from "@/components/compost-status-pill";
import { useCompostStore } from "@/components/compost-store";
import { useOpsStore } from "@/components/ops-store";
import {
  averageTemperature,
  compostAgeDays,
  compostEventDurationHours,
  compostEventProductivity,
  compostYieldPct,
  maturationDays,
  rangeStatusLabel,
  type CompostRangeStatus,
} from "@/lib/compost-domain";
import { bogotaDatetimeLocalToIso, bogotaDatetimeLocalValue, bogotaTime } from "@/lib/time";

const eventLabels = { formation: "Conformación", turning: "Volteo", hydration: "Hidratación", other: "Otro" } as const;

function optionalNumber(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return undefined;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function statusClass(status?: CompostRangeStatus) {
  if (status === "out_of_range") return "text-[var(--red)]";
  if (status === "within_range") return "text-[var(--green)]";
  return "text-[var(--muted)]";
}

export function CompostDetail({ pileId }: { pileId: string }) {
  const { workers, access, backend } = useOpsStore();
  const { piles, measurements, sourceAllocations, events, controlRanges, recordEvent, recordMeasurement, configureRange, startMaturation, closePile } = useCompostStore();
  const pile = piles.find((item) => item.id === pileId);
  const pileMeasurements = useMemo(() => measurements.filter((item) => item.pileId === pileId).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()), [measurements, pileId]);
  const pileEvents = useMemo(() => events.filter((item) => item.pileId === pileId).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()), [events, pileId]);
  const pileSources = useMemo(() => sourceAllocations.filter((item) => item.pileId === pileId), [pileId, sourceAllocations]);
  const controlRange = pile ? controlRanges.find((item) => item.plantId === pile.plantId) : undefined;
  const plantWorkers = pile ? workers.filter((worker) => worker.plantId === pile.plantId && !worker.historical) : [];
  const workerNames = new Map(workers.map((worker) => [worker.id, worker.name]));
  const plantAccess = pile ? access.find((item) => item.plantId === pile.plantId) : undefined;
  const canConfigureRange = backend.mode !== "supabase" || Boolean(plantAccess && ["technical", "admin", "director"].includes(plantAccess.role));
  const rangeFormRef = useRef<HTMLFormElement>(null);
  const rangeFormKey = [
    controlRange?.temperatureAvgMinC ?? "",
    controlRange?.temperatureAvgMaxC ?? "",
    controlRange?.humidityMinPct ?? "",
    controlRange?.humidityMaxPct ?? "",
    controlRange?.active ?? false,
  ].join("|");

  const [temps, setTemps] = useState(["", "", ""]);
  const [ambient, setAmbient] = useState("");
  const [humidity, setHumidity] = useState("");
  const [notes, setNotes] = useState("");
  const [eventType, setEventType] = useState<"turning" | "hydration" | "other">("turning");
  const [eventStartedAt, setEventStartedAt] = useState(() => bogotaDatetimeLocalValue(new Date(Date.now() - 15 * 60_000)));
  const [eventEndedAt, setEventEndedAt] = useState(() => bogotaDatetimeLocalValue());
  const [eventVolume, setEventVolume] = useState("");
  const [eventWorkerIds, setEventWorkerIds] = useState<string[]>([]);
  const [eventNotes, setEventNotes] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [nowIso] = useState(() => new Date().toISOString());

  if (!pile) return <section className="panel mx-auto max-w-4xl"><h1 className="text-2xl">Pila no encontrada</h1><Link className="button secondary mt-5" href="/compost">Volver</Link></section>;

  const latest = pileMeasurements[0];
  const saveMeasurement = async () => {
    if (busy) return;
    setBusy(true); setFeedback("");
    try {
      const result = await recordMeasurement({
        pileId: pile.id,
        temperaturePointsC: temps.map((value) => value.trim() === "" ? Number.NaN : Number(value)),
        ambientTemperatureC: ambient.trim() === "" ? Number.NaN : Number(ambient),
        humidityPct: humidity.trim() ? Number(humidity) : undefined,
        notes,
      });
      if (!result.ok) return setFeedback(result.error);
      setTemps(["", "", ""]); setAmbient(""); setHumidity(""); setNotes(""); setFeedback("Control registrado.");
    } finally { setBusy(false); }
  };

  const saveEvent = async () => {
    if (busy) return;
    setBusy(true); setFeedback("");
    try {
      const result = await recordEvent({
        pileId: pile.id, type: eventType, startedAt: bogotaDatetimeLocalToIso(eventStartedAt), endedAt: bogotaDatetimeLocalToIso(eventEndedAt),
        volumeM3: eventVolume.trim() ? Number(eventVolume) : undefined, workerIds: eventWorkerIds, notes: eventNotes,
      });
      if (!result.ok) return setFeedback(result.error);
      setEventVolume(""); setEventWorkerIds([]); setEventNotes("");
      setFeedback(`${eventLabels[eventType]} registrado.`);
    } catch (error) { setFeedback(error instanceof Error ? error.message : "No fue posible interpretar la hora del evento."); }
    finally { setBusy(false); }
  };

  const saveRange = async (active: boolean) => {
    if (busy) return;
    const form = rangeFormRef.current;
    if (!form) return;
    const data = new FormData(form);
    setBusy(true); setFeedback("");
    try {
      const result = await configureRange({
        plantId: pile.plantId,
        temperatureAvgMinC: optionalNumber(data.get("temperatureMin")),
        temperatureAvgMaxC: optionalNumber(data.get("temperatureMax")),
        humidityMinPct: optionalNumber(data.get("humidityMin")),
        humidityMaxPct: optionalNumber(data.get("humidityMax")),
        active,
      });
      setFeedback(result.ok ? (active ? "Rango técnico guardado." : "Evaluación automática de rangos desactivada.") : result.error);
    } finally { setBusy(false); }
  };

  const mature = async () => {
    if (busy) return;
    setBusy(true); setFeedback("");
    try { const result = await startMaturation(pile.id); setFeedback(result.ok ? "Pila pasada a maduración." : result.error); }
    finally { setBusy(false); }
  };
  const close = async () => {
    if (busy) return;
    setBusy(true); setFeedback("");
    try {
      const result = await closePile(pile.id, Number(finalWeight));
      if (!result.ok) return setFeedback(result.error);
      setFinalWeight(""); setFeedback("Pila cerrada y rendimiento calculado.");
    } finally { setBusy(false); }
  };
  const changeTemp = (index: number, value: string) => setTemps((current) => current.map((item, i) => i === index ? value : item));
  const toggleEventWorker = (id: string, checked: boolean) => setEventWorkerIds((current) => checked ? [...current, id] : current.filter((value) => value !== id));

  return <>
    <header className="page-header"><div><p className="eyebrow">{pile.plant} · {pile.location}</p><h1>{pile.code}</h1><p className="lede">Trazabilidad física, eventos operacionales, controles técnicos y rendimiento.</p></div><div className="header-actions"><Link className="button secondary" href="/compost">Volver</Link><CompostStatusPill status={pile.status} /></div></header>

    <section className="panel mx-auto max-w-5xl">
      <div className="grid gap-4 md:grid-cols-4"><div><span className="quiet">Peso inicial</span><strong className="mt-1 block text-xl">{pile.initialWeightKg.toLocaleString("es-CO")} kg</strong></div><div><span className="quiet">Edad</span><strong className="mt-1 block text-xl">{Math.floor(compostAgeDays(pile, nowIso))} días</strong></div><div><span className="quiet">Última temperatura</span><strong className="mt-1 block text-xl">{latest ? `${averageTemperature(latest).toFixed(1)} °C` : "—"}</strong></div><div><span className="quiet">Última humedad</span><strong className="mt-1 block text-xl">{latest?.humidityPct !== undefined ? `${latest.humidityPct.toFixed(1)} %` : "—"}</strong></div></div>
      <div className="mt-5 border-t border-[var(--line)] pt-4"><span className="quiet">Origen físico asignado</span><div className="mt-2 grid gap-2 sm:grid-cols-2">{pileSources.length ? pileSources.map((source) => <div className="rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-xs" key={source.intakeLotId}><strong>{source.lotCode}</strong><span className="ml-2 text-[var(--muted)]">{source.allocationConfirmed && source.allocatedMassKg !== undefined ? `${source.allocatedMassKg.toLocaleString("es-CO")} kg` : "Vínculo histórico · masa no inferida"}</span></div>) : <span className="text-xs text-[var(--muted)]">Sin asignación física v2; conserva trazabilidad histórica.</span>}</div></div>
    </section>

    {pile.status !== "closed" && <section className="panel mx-auto mt-4 max-w-5xl">
      <div className="section-head"><div><p className="eyebrow">Evento operativo</p><h2>Volteo, hidratación u otra intervención</h2></div><span className="quiet">Responsables + tiempo + volumen</span></div>
      <div className="grid gap-4 md:grid-cols-3"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Tipo<select className="min-h-11 rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)]" value={eventType} onChange={(event) => setEventType(event.target.value as typeof eventType)}><option value="turning">Volteo</option><option value="hydration">Hidratación</option><option value="other">Otro</option></select></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Inicio · hora Colombia<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="datetime-local" value={eventStartedAt} onChange={(event) => setEventStartedAt(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Fin · hora Colombia<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" type="datetime-local" value={eventEndedAt} onChange={(event) => setEventEndedAt(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Volumen operado (m³) {eventType !== "turning" && <span className="font-normal">(opcional)</span>}<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={eventVolume} onChange={(event) => setEventVolume(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)] md:col-span-2">Observación <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={eventNotes} onChange={(event) => setEventNotes(event.target.value)} /></label></div>
      <fieldset className="mt-4 grid gap-2"><legend className="mb-2 text-xs font-bold text-[var(--muted)]">Trabajadores</legend><div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">{plantWorkers.map((worker) => <label className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--line)] px-3 text-xs" key={worker.id}><input type="checkbox" checked={eventWorkerIds.includes(worker.id)} onChange={(event) => toggleEventWorker(worker.id, event.target.checked)} />{worker.name}</label>)}</div></fieldset>
      <div className="mt-5 flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={saveEvent}>{busy ? "Guardando…" : "Registrar evento"}</button></div>
    </section>}

    {pile.status !== "closed" && <section className="panel mx-auto mt-4 max-w-5xl">
      <div className="section-head"><div><p className="eyebrow">Control técnico</p><h2>Temperatura y humedad</h2></div><span className="quiet">3–5 puntos + ambiente</span></div>
      <div className="grid gap-3 sm:grid-cols-3">{temps.map((value, index) => <label className="grid gap-2 text-xs font-bold text-[var(--muted)]" key={index}>Temperatura punto {index + 1} (°C)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={value} onChange={(event) => changeTemp(index, event.target.value)} /></label>)}</div>
      <div className="mt-3 flex gap-2">{temps.length < 5 && <button className="button secondary" type="button" disabled={busy} onClick={() => setTemps((current) => [...current, ""])}>+ Punto</button>}{temps.length > 3 && <button className="button secondary" type="button" disabled={busy} onClick={() => setTemps((current) => current.slice(0, -1))}>Quitar punto</button>}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-3"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Temperatura ambiente (°C)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={ambient} onChange={(event) => setAmbient(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Humedad (%) <span className="font-normal">(si se mide)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={humidity} onChange={(event) => setHumidity(event.target.value)} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Observación <span className="font-normal">(opcional)</span><input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" value={notes} onChange={(event) => setNotes(event.target.value)} /></label></div>
      <div className="mt-5 flex justify-end"><button className="button primary" type="button" disabled={busy} onClick={saveMeasurement}>{busy ? "Guardando…" : "Guardar control"}</button></div>
    </section>}

    {canConfigureRange && <section className="panel mx-auto mt-4 max-w-5xl">
      <div className="section-head"><div><p className="eyebrow">Configuración técnica</p><h2>Rangos de control de {pile.plant}</h2><p className="quiet">No existen valores por defecto: solo se evalúa lo que Dirección/Técnica haya validado.</p></div><span className="quiet">{controlRange?.active ? "Evaluación activa" : "Sin evaluación activa"}</span></div>
      <form key={rangeFormKey} ref={rangeFormRef} onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4"><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Temp. promedio mín. (°C)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" name="temperatureMin" inputMode="decimal" defaultValue={controlRange?.temperatureAvgMinC ?? ""} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Temp. promedio máx. (°C)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" name="temperatureMax" inputMode="decimal" defaultValue={controlRange?.temperatureAvgMaxC ?? ""} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Humedad mín. (%)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" name="humidityMin" inputMode="decimal" defaultValue={controlRange?.humidityMinPct ?? ""} /></label><label className="grid gap-2 text-xs font-bold text-[var(--muted)]">Humedad máx. (%)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm" name="humidityMax" inputMode="decimal" defaultValue={controlRange?.humidityMaxPct ?? ""} /></label></div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><button className="button secondary" type="button" disabled={busy} onClick={() => saveRange(false)}>Desactivar evaluación</button><button className="button primary" type="button" disabled={busy} onClick={() => saveRange(true)}>Guardar rangos</button></div>
      </form>
    </section>}

    {pile.status !== "closed" && <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Etapa</p><h2>{pile.status === "active" ? "Proceso activo" : "Maduración"}</h2></div>{pile.status === "active" ? <button className="button secondary" type="button" disabled={busy} onClick={mature}>{busy ? "Actualizando…" : "Pasar a maduración"}</button> : <span className="quiet">{Math.floor(maturationDays(pile, nowIso))} días en maduración</span>}</div>{pile.status === "maturing" && <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="grid grow gap-2 text-xs font-bold text-[var(--muted)]">Peso final medido (kg)<input className="min-h-11 rounded-lg border border-[var(--line)] px-3 text-sm text-[var(--ink)]" inputMode="decimal" value={finalWeight} onChange={(event) => setFinalWeight(event.target.value)} /></label><button className="button primary" type="button" disabled={busy} onClick={close}>{busy ? "Cerrando…" : "Cerrar pila"}</button></div>}</section>}

    {feedback && <p className="panel mx-auto mt-4 max-w-5xl bg-[var(--blue-soft)] text-sm font-semibold text-[var(--blue)]" role="status">{feedback}</p>}

    <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Eventos</p><h2>Histórico operacional</h2></div><span className="quiet">{pileEvents.length} eventos</span></div><div className="grid gap-3">{pileEvents.length ? pileEvents.map((event) => <article className="rounded-xl border border-[var(--line)] p-4" key={event.id}><div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-sm">{eventLabels[event.type]}</strong><span className="text-xs text-[var(--muted)]">{bogotaTime.format(new Date(event.startedAt))}–{bogotaTime.format(new Date(event.endedAt))}</span></div><div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--muted)]"><span>{(compostEventDurationHours(event) * 60).toFixed(0)} min</span>{event.volumeM3 !== undefined && <span>{event.volumeM3.toFixed(2)} m³</span>}<span>{event.workerIds.length} trabajador(es)</span>{compostEventProductivity(event) > 0 && <span>{compostEventProductivity(event).toFixed(2)} m³/trab·h</span>}</div><div className="mt-2 text-xs text-[var(--muted)]">{event.workerIds.map((id) => workerNames.get(id) ?? "Trabajador histórico").join(" · ")}</div>{event.notes && <p className="mt-2 text-xs text-[var(--muted)]">{event.notes}</p>}</article>) : <p className="text-xs text-[var(--muted)]">Las pilas creadas antes de Compostaje 2.0 pueden no tener eventos operacionales estructurados.</p>}</div></section>

    <section className="panel mx-auto mt-4 max-w-5xl"><div className="section-head"><div><p className="eyebrow">Controles</p><h2>Histórico técnico</h2></div><span className="quiet">{pileMeasurements.length} controles</span></div>{pile.status === "closed" && <div className="mb-4 grid gap-3 rounded-xl bg-[var(--green-soft)] p-4 sm:grid-cols-3"><div><span className="quiet">Peso final</span><strong className="mt-1 block">{pile.finalWeightKg?.toLocaleString("es-CO")} kg</strong></div><div><span className="quiet">Rendimiento</span><strong className="mt-1 block">{compostYieldPct(pile).toFixed(1)} %</strong></div><div><span className="quiet">Proceso total</span><strong className="mt-1 block">{Math.floor(compostAgeDays(pile))} días</strong></div></div>}<div className="grid gap-3">{pileMeasurements.map((measurement) => <article className="rounded-xl border border-[var(--line)] p-4" key={measurement.id}><div className="flex flex-wrap items-center justify-between gap-3"><strong className="text-sm">{averageTemperature(measurement).toFixed(1)} °C promedio</strong><span className="text-xs text-[var(--muted)]">{bogotaTime.format(new Date(measurement.recordedAt))}</span></div><div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]">{measurement.temperaturePointsC.map((temp, index) => <span key={index}>P{index + 1}: {temp.toFixed(1)} °C</span>)}{measurement.ambientTemperatureC !== undefined && <span>Ambiente: {measurement.ambientTemperatureC.toFixed(1)} °C</span>}{measurement.humidityPct !== undefined && <span>Humedad: {measurement.humidityPct.toFixed(1)} %</span>}</div><div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold"><span className={statusClass(measurement.temperatureRangeStatus)}>{rangeStatusLabel(measurement.temperatureRangeStatus)}</span>{measurement.humidityRangeStatus && <span className={statusClass(measurement.humidityRangeStatus)}>Humedad: {rangeStatusLabel(measurement.humidityRangeStatus)}</span>}</div>{measurement.notes && <p className="mt-2 text-xs text-[var(--muted)]">{measurement.notes}</p>}</article>)}</div></section>
  </>;
}
