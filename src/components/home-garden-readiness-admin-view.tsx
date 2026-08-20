"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOpsStore } from "@/components/ops-store";
import { homeGardenEvidenceRules } from "@/data/home-garden-evidence";
import { homeGardenPlannedSkuCandidates } from "@/data/home-garden-sku-launch-matrix";
import {
  buildHomeGardenReadinessRegistry,
  canAppendHomeGardenEvidence,
  canManageHomeGardenReadiness,
  homeGardenGateLabels,
  homeGardenLaunchEvidenceKinds,
  type HomeGardenEvidenceDisposition,
  type HomeGardenLaunchEvidenceKind,
  type HomeGardenLaunchEvidenceRevision,
} from "@/lib/home-garden-readiness-registry";
import {
  appendHomeGardenLaunchEvidence,
  loadHomeGardenLaunchEvidence,
} from "@/lib/supabase/home-garden-readiness-repository";

type Feedback = { kind: "ok" | "error"; text: string } | null;
type RegistryFilter = "all" | "pending" | "ready";

const dispositionLabels: Record<HomeGardenEvidenceDisposition, string> = {
  draft: "Borrador / por revisar",
  verified: "Verificada",
  rejected: "Rechazada / reabre gate",
  superseded: "Superada",
};

function GatePill({ closed, label }: { closed: boolean; label: string }) {
  return <span className={`status-pill ${closed ? "status-normal" : "status-planned"}`}>{closed ? "✓" : "○"} {label}</span>;
}

export function HomeGardenReadinessAdminView() {
  const { backend, access } = useOpsStore();
  const authorized = useMemo(() => access.some((item) => canManageHomeGardenReadiness(item.role)), [access]);
  const allowedEvidenceKinds = useMemo(
    () => homeGardenLaunchEvidenceKinds.filter((kind) => access.some((item) => canAppendHomeGardenEvidence(item.role, kind))),
    [access],
  );
  const [revisions, setRevisions] = useState<HomeGardenLaunchEvidenceRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [filter, setFilter] = useState<RegistryFilter>("all");

  const [candidateId, setCandidateId] = useState(homeGardenPlannedSkuCandidates[0]?.id ?? "");
  const [evidenceKind, setEvidenceKind] = useState<HomeGardenLaunchEvidenceKind>("laboratory-report");
  const [disposition, setDisposition] = useState<HomeGardenEvidenceDisposition>("draft");
  const [title, setTitle] = useState("");
  const [sourceReference, setSourceReference] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [sameReference, setSameReference] = useState(false);
  const [samePresentation, setSamePresentation] = useState(false);
  const [completeForGate, setCompleteForGate] = useState(false);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (backend.mode !== "supabase" || !authorized) {
      setRevisions([]);
      return;
    }
    setLoading(true);
    try {
      setRevisions(await loadHomeGardenLaunchEvidence());
      setFeedback(null);
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "No fue posible cargar el registro." });
    } finally {
      setLoading(false);
    }
  }, [authorized, backend.mode]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (allowedEvidenceKinds.includes(evidenceKind)) return;
    const firstAllowed = allowedEvidenceKinds[0];
    if (firstAllowed) setEvidenceKind(firstAllowed);
  }, [allowedEvidenceKinds, evidenceKind]);

  const registry = useMemo(() => buildHomeGardenReadinessRegistry(revisions), [revisions]);
  const visibleItems = useMemo(() => registry.items.filter((item) => {
    if (filter === "ready") return item.commerceReady;
    if (filter === "pending") return !item.commerceReady;
    return true;
  }), [filter, registry.items]);
  const selectedRule = homeGardenEvidenceRules.find((rule) => rule.kind === evidenceKind);

  async function saveEvidence() {
    if (!access.some((item) => canAppendHomeGardenEvidence(item.role, evidenceKind))) {
      setFeedback({ kind: "error", text: "Tu rol no puede registrar este tipo de evidencia." });
      return;
    }
    if (disposition !== "verified" && completeForGate) {
      setFeedback({ kind: "error", text: "Solo una revisión verificada puede declararse completa para un gate." });
      return;
    }
    if (!candidateId || !title.trim() || !sourceReference.trim() || !note.trim()) {
      setFeedback({ kind: "error", text: "Completa presentación, título, referencia fuente y criterio de evaluación." });
      return;
    }
    setSaving(true);
    try {
      await appendHomeGardenLaunchEvidence({
        candidateId,
        evidenceKind,
        disposition,
        title: title.trim(),
        sourceReference: sourceReference.trim(),
        sourceDate: sourceDate || undefined,
        sameReference,
        samePresentation,
        completeForGate,
        note: note.trim(),
      });
      setTitle("");
      setSourceReference("");
      setSourceDate("");
      setSameReference(false);
      setSamePresentation(false);
      setCompleteForGate(false);
      setNote("");
      await load();
      setFeedback({ kind: "ok", text: "Nueva revisión registrada. El readiness se recalculó con la evidencia vigente." });
    } catch (error) {
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "No fue posible registrar la evidencia." });
    } finally {
      setSaving(false);
    }
  }

  if (backend.mode !== "supabase") return <section className="panel"><p className="eyebrow">Wondergreen · B2C</p><h1>Readiness de lanzamiento</h1><p className="lede">Este registro interno solo funciona contra Supabase. El modo local no simula evidencia regulatoria, comercial ni financiera.</p></section>;
  if (!authorized) return <section className="panel"><p className="eyebrow">Wondergreen · B2C</p><h1>Readiness de lanzamiento</h1><p className="lede">Tu rol no administra evidencia corporativa de lanzamiento.</p></section>;

  return <div className="grid gap-4">
    <header className="page-header">
      <div>
        <p className="eyebrow">Wondergreen · Casa, Jardín y Vivero</p>
        <h1>Readiness de lanzamiento B2C</h1>
        <p className="lede">Registro interno por presentación. Product Truth permanece canónico en código; aquí solo se registra evidencia secundaria de lanzamiento mediante revisiones append-only.</p>
      </div>
      <div className="header-actions">
        <select aria-label="Filtro readiness" className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={filter} onChange={(event) => setFilter(event.target.value as RegistryFilter)}>
          <option value="all">Todas</option><option value="pending">Pendientes</option><option value="ready">Listas para comercio</option>
        </select>
        <button className="button secondary" type="button" disabled={loading} onClick={() => void load()}>{loading ? "Actualizando…" : "Actualizar"}</button>
      </div>
    </header>

    {feedback ? <p role="status" className={`rounded-xl p-4 text-sm font-semibold ${feedback.kind === "error" ? "bg-[var(--red-soft)] text-[var(--red)]" : "bg-[var(--surface-soft)] text-[var(--green)]"}`}>{feedback.text}</p> : null}

    <section className="grid gap-3 md:grid-cols-4">
      <article className="panel"><span className="quiet text-xs">Presentaciones propuestas</span><strong className="mt-2 block text-3xl">{registry.summary.total}</strong></article>
      <article className="panel"><span className="quiet text-xs">Commerce ready</span><strong className="mt-2 block text-3xl">{registry.summary.commerceReady}</strong></article>
      <article className="panel"><span className="quiet text-xs">Pendientes</span><strong className="mt-2 block text-3xl">{registry.summary.pending}</strong></article>
      <article className="panel"><span className="quiet text-xs">Evidencia huérfana</span><strong className="mt-2 block text-3xl">{registry.summary.orphanEvidence}</strong></article>
    </section>

    {registry.orphanEvidence.length ? <section className="panel border border-[var(--red)]"><p className="eyebrow">Deriva detectada</p><h2>Evidencia sin candidato vigente</h2><p className="quiet mt-1">No se aplica silenciosamente a otra presentación. Debe reconciliarse.</p><ul className="mt-3 grid gap-2 text-sm">{registry.orphanEvidence.map((item) => <li key={item.id}><strong>{item.candidateId}</strong> · {item.evidenceKind} · rev. {item.revisionNo}</li>)}</ul></section> : null}

    <section className="panel">
      <div className="section-head"><div><p className="eyebrow">Nueva revisión</p><h2>Anexar evidencia gobernada</h2><p className="quiet mt-1">Guarda una referencia interna al documento; no pegues enlaces firmados, tokens ni credenciales. Los tipos disponibles dependen de tu rol.</p></div></div>
      <div className="grid gap-3 lg:grid-cols-3">
        <label className="grid gap-1 text-xs font-semibold">Presentación<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={candidateId} onChange={(event) => setCandidateId(event.target.value)}>{homeGardenPlannedSkuCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.consumerName} · {candidate.plannedVariant} · {candidate.id}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-semibold">Tipo de evidencia<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={evidenceKind} onChange={(event) => setEvidenceKind(event.target.value as HomeGardenLaunchEvidenceKind)}>{allowedEvidenceKinds.map((kind) => { const rule = homeGardenEvidenceRules.find((item) => item.kind === kind); return <option key={kind} value={kind}>{rule?.label ?? kind}</option>; })}</select></label>
        <label className="grid gap-1 text-xs font-semibold">Estado<select className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 text-sm" value={disposition} onChange={(event) => { const next = event.target.value as HomeGardenEvidenceDisposition; setDisposition(next); if (next !== "verified") setCompleteForGate(false); }}>{Object.entries(dispositionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="grid gap-1 text-xs font-semibold lg:col-span-2">Título<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Registro/etiqueta CRECE 500 g · revisión agosto" /></label>
        <label className="grid gap-1 text-xs font-semibold">Fecha fuente<input type="date" className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={sourceDate} onChange={(event) => setSourceDate(event.target.value)} /></label>
        <label className="grid gap-1 text-xs font-semibold lg:col-span-3">Referencia fuente<input className="min-h-10 rounded-lg border border-[var(--line)] px-3 text-sm" value={sourceReference} onChange={(event) => setSourceReference(event.target.value)} placeholder="Nombre de archivo, ruta interna o URL privada estable sin tokens" /></label>
        <label className="grid gap-1 text-xs font-semibold lg:col-span-3">Criterio / nota<textarea className="min-h-24 rounded-lg border border-[var(--line)] p-3 text-sm" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Qué se verificó, qué falta o por qué esta revisión reabre/cierra un gate." /></label>
      </div>
      {selectedRule ? <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-4 text-xs"><strong>{selectedRule.label}</strong><p className="mt-1"><b>Soporta:</b> {selectedRule.supports.join(" · ")}</p><p className="mt-1"><b>No demuestra:</b> {selectedRule.doesNotProve.join(" · ")}</p></div> : null}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <label className="flex items-center gap-2"><input type="checkbox" checked={sameReference} onChange={(event) => setSameReference(event.target.checked)} />Misma referencia técnica</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={samePresentation} onChange={(event) => setSamePresentation(event.target.checked)} />Misma presentación</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={completeForGate} disabled={disposition !== "verified"} onChange={(event) => setCompleteForGate(event.target.checked)} />Completa para el gate evaluado {disposition !== "verified" ? "(requiere estado Verificada)" : ""}</label>
      </div>
      <button className="button primary mt-4" type="button" disabled={saving || !allowedEvidenceKinds.length} onClick={() => void saveEvidence()}>{saving ? "Registrando…" : "Registrar nueva revisión"}</button>
    </section>

    <section className="grid gap-3">
      {visibleItems.map((item) => <article className="panel" key={item.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="eyebrow">{item.consumerName} · {item.plannedVariant}</p><h2>{item.technicalName}{item.formula ? ` · ${item.formula}` : ""}</h2><p className="quiet mt-1 text-xs">{item.id} · Product Truth: {item.technicalSlug}</p></div>
          <span className={`status-pill ${item.commerceReady ? "status-normal" : "status-planned"}`}>{item.commerceReady ? "LISTO PARA COMERCIO" : `${item.missingGates.length} GATES ABIERTOS`}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{(Object.entries(item.gates) as Array<[keyof typeof item.gates, boolean]>).map(([gate, closed]) => <GatePill key={gate} closed={closed} label={homeGardenGateLabels[gate]} />)}</div>
        <div className="mt-4 border-t border-[var(--line)] pt-4">
          <strong className="text-sm">Evidencia vigente</strong>
          {item.latestEvidence.length ? <div className="mt-2 grid gap-2">{item.latestEvidence.map((evidence) => <div className="rounded-lg bg-[var(--surface-soft)] p-3 text-xs" key={evidence.id}><div className="flex flex-wrap justify-between gap-2"><strong>{homeGardenEvidenceRules.find((rule) => rule.kind === evidence.evidenceKind)?.label ?? evidence.evidenceKind} · {dispositionLabels[evidence.disposition]}</strong><span>rev. {evidence.revisionNo}</span></div><p className="mt-1">{evidence.title}</p><p className="quiet mt-1 break-all">Fuente interna: {evidence.sourceReference}</p><p className="mt-1">{evidence.note}</p></div>)}</div> : <p className="quiet mt-2 text-xs">Sin evidencia registrada para esta presentación.</p>}
        </div>
      </article>)}
    </section>
  </div>;
}
