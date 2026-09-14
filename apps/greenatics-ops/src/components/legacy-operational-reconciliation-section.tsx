"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canCurateLegacyOperationalMappings,
  canonicalOptionsForLegacyKind,
  legacyFieldLabels,
  legacyResolutionLabels,
  reconciliationApplySummary,
  type LegacyOperationalFieldKind,
  type LegacyReconciliationMetric,
  type LegacyReconciliationRow,
} from "@/lib/legacy-operational-reconciliation";
import type { OperationalMasterSnapshot } from "@/lib/operational-master-data";
import {
  applyLegacyOperationalReconciliation,
  curateLegacyOperationalMapping,
  loadLegacyOperationalReconciliation,
  loadLegacyOperationalReconciliationMetrics,
} from "@/lib/supabase/legacy-operational-reconciliation-repository";

type Feedback = { kind: "error" | "ok"; text: string } | null;

type Props = {
  plantId: string;
  role: string;
  snapshot: OperationalMasterSnapshot;
};

const numberFormat = new Intl.NumberFormat("es-CO");
const fieldOrder: LegacyOperationalFieldKind[] = ["process", "activity", "equipment"];

function rowKey(row: LegacyReconciliationRow) {
  return `${row.fieldKind}:${row.normalizedValue}`;
}

function FeedbackBox({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return <p role="status" className={`mt-3 rounded-lg p-3 text-xs font-semibold ${feedback.kind === "error" ? "bg-[var(--red-soft)] text-[var(--red)]" : "bg-[var(--surface-soft)] text-[var(--green)]"}`}>{feedback.text}</p>;
}

function ResolutionPill({ method }: { method: LegacyReconciliationRow["resolutionMethod"] }) {
  const className = method === "unmapped" ? "status-planned" : "status-normal";
  return <span className={`status-pill ${className}`}>{legacyResolutionLabels[method]}</span>;
}

export function LegacyOperationalReconciliationSection({ plantId, role, snapshot }: Props) {
  const canCurate = canCurateLegacyOperationalMappings(role);
  const [rows, setRows] = useState<LegacyReconciliationRow[]>([]);
  const [metrics, setMetrics] = useState<LegacyReconciliationMetric[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | LegacyOperationalFieldKind>("all");
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  const load = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    setFeedback(null);
    try {
      const [nextRows, nextMetrics] = await Promise.all([
        loadLegacyOperationalReconciliation(plantId),
        loadLegacyOperationalReconciliationMetrics(plantId),
      ]);
      setRows(nextRows);
      setMetrics(nextMetrics);
      setSelectedTargets((current) => {
        const next: Record<string, string> = {};
        for (const row of nextRows) {
          const key = rowKey(row);
          next[key] = current[key] ?? row.targetId ?? "";
        }
        return next;
      });
    } catch (caught) {
      setFeedback({ kind: "error", text: caught instanceof Error ? caught.message : "No fue posible cargar la reconciliación histórica." });
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const filteredRows = useMemo(
    () => filter === "all" ? rows : rows.filter((row) => row.fieldKind === filter),
    [filter, rows],
  );

  const resolvableRows = useMemo(
    () => metrics.reduce((total, metric) => total + metric.resolvableRows, 0),
    [metrics],
  );

  async function curate(row: LegacyReconciliationRow, explicitUnmapped = false) {
    if (!canCurate || busyKey) return;
    const key = rowKey(row);
    const targetId = explicitUnmapped ? undefined : selectedTargets[key];
    if (!explicitUnmapped && !targetId) {
      setFeedback({ kind: "error", text: "Selecciona primero el registro canónico que corresponde al valor histórico." });
      return;
    }

    setBusyKey(key);
    setFeedback(null);
    try {
      const result = await curateLegacyOperationalMapping({
        plantId,
        fieldKind: row.fieldKind,
        legacyValue: row.legacyValue,
        targetId,
      });
      if (!result.ok) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      await load();
      setFeedback({
        kind: "ok",
        text: explicitUnmapped
          ? `“${row.legacyValue}” quedó marcado explícitamente sin equivalencia automática.`
          : `Equivalencia de “${row.legacyValue}” guardada con trazabilidad de versión.`,
      });
    } finally {
      setBusyKey("");
    }
  }

  async function apply() {
    if (!canCurate || busyKey) return;
    setBusyKey("apply");
    setFeedback(null);
    try {
      const result = await applyLegacyOperationalReconciliation(plantId);
      if (!result.ok) {
        setFeedback({ kind: "error", text: result.error });
        return;
      }
      await load();
      setFeedback({ kind: "ok", text: reconciliationApplySummary(result.data) });
    } finally {
      setBusyKey("");
    }
  }

  return <section className="panel">
    <div className="section-head">
      <div>
        <p className="eyebrow">Wave 2A.5 · trazabilidad histórica</p>
        <h2>Reconciliación legacy → maestros canónicos</h2>
        <p className="quiet mt-1 max-w-4xl">Vincula textos históricos de proceso, actividad y equipo con IDs canónicos sin reescribir la evidencia original. Solo una coincidencia normalizada exacta puede resolverse automáticamente; similitudes y ambigüedades permanecen pendientes hasta una decisión humana.</p>
      </div>
      <button className="button secondary" type="button" disabled={loading || Boolean(busyKey)} onClick={() => void load()}>{loading ? "Actualizando…" : "Actualizar cobertura"}</button>
    </div>

    <div className="grid gap-3 md:grid-cols-3">
      {fieldOrder.map((kind) => {
        const metric = metrics.find((item) => item.fieldKind === kind);
        return <article className="rounded-xl border border-[var(--line)] p-4" key={kind}>
          <div className="flex items-start justify-between gap-3"><div><span className="quiet text-xs">{legacyFieldLabels[kind]}</span><strong className="mt-1 block text-2xl text-[var(--green)]">{metric ? `${metric.coveragePercent.toFixed(2)}%` : "—"}</strong></div><span className="status-pill status-normal">{numberFormat.format(metric?.canonicalRows ?? 0)} canónicas</span></div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><span className="quiet block">Pendientes</span><strong>{numberFormat.format(metric?.pendingRows ?? 0)}</strong></div><div><span className="quiet block">Resolubles</span><strong>{numberFormat.format(metric?.resolvableRows ?? 0)}</strong></div><div><span className="quiet block">Sin mapa</span><strong>{numberFormat.format(metric?.unmappedRows ?? 0)}</strong></div></div>
        </article>;
      })}
    </div>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar reconciliación">
        {(["all", ...fieldOrder] as const).map((kind) => <button key={kind} className={`button secondary ${filter === kind ? "font-bold" : ""}`} type="button" onClick={() => setFilter(kind)}>{kind === "all" ? "Todos" : legacyFieldLabels[kind]}</button>)}
      </div>
      {canCurate ? <button className="button primary" type="button" disabled={loading || Boolean(busyKey) || resolvableRows === 0} onClick={() => void apply()}>{busyKey === "apply" ? "Aplicando…" : `Aplicar ${numberFormat.format(resolvableRows)} referencias seguras`}</button> : <span className="quiet text-xs">Solo Administración o Dirección puede curar y aplicar equivalencias.</span>}
    </div>

    {loading && !rows.length ? <p className="quiet mt-5">Calculando cobertura histórica…</p> : filteredRows.length ? <div className="mt-5 grid gap-3">
      {filteredRows.map((row) => {
        const key = rowKey(row);
        const options = canonicalOptionsForLegacyKind(snapshot, row.fieldKind);
        const selectedTarget = selectedTargets[key] ?? "";
        const rowBusy = busyKey === key;
        return <article className="rounded-xl border border-[var(--line)] p-4" key={key}>
          <div className="grid gap-4 xl:grid-cols-[150px_minmax(220px,1fr)_150px_minmax(260px,1.2fr)] xl:items-center">
            <div><span className="quiet block text-[10px] font-bold uppercase tracking-wide">Campo</span><strong>{legacyFieldLabels[row.fieldKind]}</strong></div>
            <div><span className="quiet block text-[10px] font-bold uppercase tracking-wide">Valor histórico preservado</span><strong className="break-words">{row.legacyValue}</strong><span className="quiet mt-1 block text-xs">{row.normalizedValue}</span></div>
            <div><span className="quiet block text-[10px] font-bold uppercase tracking-wide">Frecuencia</span><strong>{numberFormat.format(row.occurrenceCount)} fila{row.occurrenceCount === 1 ? "" : "s"}</strong><span className="quiet mt-1 block text-xs">{numberFormat.format(row.activityRows)} bitácora · {numberFormat.format(row.scheduledRows)} plan</span></div>
            <div><span className="quiet mb-1 block text-[10px] font-bold uppercase tracking-wide">Resolución</span><ResolutionPill method={row.resolutionMethod} />{row.targetName ? <span className="mt-2 block text-xs font-semibold">{row.targetCode} · {row.targetName}</span> : <span className="quiet mt-2 block text-xs">No existe una equivalencia única segura.</span>}</div>
          </div>

          {canCurate ? <div className="mt-4 grid gap-3 rounded-xl bg-[var(--surface-soft)] p-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <label className="grid gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Equivalencia canónica
              <select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm normal-case text-[var(--ink)]" value={selectedTarget} disabled={rowBusy || busyKey === "apply"} onChange={(event) => setSelectedTargets((current) => ({ ...current, [key]: event.target.value }))}>
                <option value="">Seleccionar manualmente…</option>
                {options.map((option) => <option key={option.id} value={option.id}>{option.code} · {option.name}{option.active ? "" : " · inactivo"}</option>)}
              </select>
            </label>
            <button className="button secondary" type="button" disabled={rowBusy || busyKey === "apply" || !selectedTarget} onClick={() => void curate(row)}>{rowBusy ? "Guardando…" : "Guardar equivalencia"}</button>
            <button className="button secondary" type="button" disabled={rowBusy || busyKey === "apply"} onClick={() => void curate(row, true)}>Marcar sin equivalencia</button>
          </div> : null}
        </article>;
      })}
    </div> : <div className="mt-5 rounded-xl bg-[var(--surface-soft)] p-4"><strong>No hay valores legacy pendientes para este filtro.</strong><p className="quiet mt-1 text-xs">Cuando se promuevan bitácoras históricas, esta superficie detectará automáticamente textos que aún no tengan relación canónica.</p></div>}

    <FeedbackBox feedback={feedback} />
    <p className="quiet mt-4 text-xs">Regla de seguridad: una semejanza ortográfica nunca se aplica sola. Las decisiones humanas quedan versionadas; ejecutar la reconciliación solo completa FKs vacías y conserva `title`, `process` y `equipment_ref` originales.</p>
  </section>;
}
