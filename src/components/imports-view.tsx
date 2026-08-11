"use client";

import { useMemo, useState } from "react";
import { historicalQaFixture } from "@/lib/import-fixtures";
import { dryRunLegacyImport, sha256Text, type ImportRun, type LegacyImportPayload } from "@/lib/importer";

function parsePayload(value: string): LegacyImportPayload | undefined {
  try {
    const parsed = JSON.parse(value) as LegacyImportPayload;
    if (!parsed || typeof parsed.sourceName !== "string" || !Array.isArray(parsed.receipts) || !Array.isArray(parsed.logs)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function statusLabel(status: "valid" | "warning" | "quarantined" | "duplicate") {
  if (status === "valid") return "Válida";
  if (status === "warning") return "Warning";
  if (status === "quarantined") return "Cuarentena";
  return "Duplicado";
}

export function ImportsView() {
  const [sourceText, setSourceText] = useState("");
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(() => parsePayload(sourceText), [sourceText]);

  function loadFixture() {
    setSourceText(JSON.stringify(historicalQaFixture, null, 2));
    setMessage("Fixture cargado. Aún no se ha procesado.");
  }

  async function executeDryRun() {
    if (!parsed) {
      setMessage("El JSON no cumple el contrato histórico esperado.");
      return;
    }
    setBusy(true);
    try {
      const sourceHash = await sha256Text(sourceText);
      if (runs.some((run) => run.sourceHash === sourceHash)) {
        setMessage("Esta fuente ya fue procesada; el hash evita crear una corrida duplicada.");
        return;
      }
      const run = dryRunLegacyImport(parsed, sourceHash);
      setRuns((current) => [run, ...current]);
      setMessage(`Dry-run creado: ${run.id}`);
    } finally {
      setBusy(false);
    }
  }

  function promote(runId: string) {
    setRuns((current) => current.map((run) => run.id === runId ? { ...run, promoted: true } : run));
    setMessage("Candidatos válidos aprobados en staging. La fuente original permanece intacta.");
  }

  return <>
    <header className="page-header">
      <div>
        <p className="eyebrow">Calidad de datos</p>
        <h1>Importaciones históricas</h1>
        <p className="lede">Fuente → staging inmutable → validación → aprobación. Cuarentena y duplicados nunca entran silenciosamente al modelo operacional.</p>
      </div>
      <div className="header-actions">
        <button className="button secondary" type="button" onClick={loadFixture}>Cargar fixture histórico QA</button>
        <button className="button primary" type="button" disabled={!parsed || busy} onClick={executeDryRun}>{busy ? "Procesando…" : "Ejecutar dry-run"}</button>
      </div>
    </header>

    <section className="panel" style={{ maxWidth: 1440, margin: "0 auto 16px" }}>
      <div className="section-head">
        <div><h2>Entrada de staging</h2><p className="quiet">JSON histórico normalizado por un adapter. El XLSX real llegará a esta misma frontera.</p></div>
        <span className="status-pill status-planned">Sin escritura canónica</span>
      </div>
      <label htmlFor="historical-source" className="quiet">Contrato histórico</label>
      <textarea
        id="historical-source"
        value={sourceText}
        onChange={(event) => setSourceText(event.target.value)}
        placeholder="Carga el fixture o pega un LegacyImportPayload JSON"
        style={{ width: "100%", minHeight: 220, marginTop: 8, resize: "vertical", border: "1px solid var(--line)", borderRadius: 10, padding: 12, font: "12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace" }}
      />
      {message ? <p role="status" className="quiet" style={{ marginBottom: 0 }}>{message}</p> : null}
    </section>

    <div style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gap: 16 }}>
      {runs.map((run) => <section className="panel" key={run.id}>
        <div className="section-head">
          <div>
            <p className="eyebrow">{run.id}</p>
            <h2>{run.sourceName}</h2>
            <p className="quiet">SHA-256 {run.sourceHash.slice(0, 16)}… · {new Date(run.createdAt).toLocaleString("es-CO")}</p>
          </div>
          <button className={`button ${run.promoted ? "secondary" : "primary"}`} type="button" onClick={() => promote(run.id)} disabled={run.promoted}>
            {run.promoted ? "Promovido" : "Aprobar candidatos válidos"}
          </button>
        </div>

        <div className="metrics-grid" style={{ margin: "0 0 16px", gridTemplateColumns: "repeat(6,minmax(0,1fr))" }}>
          <div className="metric-block"><span>Filas</span><strong>{run.counts.totalRows}</strong><small>raw staging</small></div>
          <div className="metric-block"><span>Válidas</span><strong>{run.counts.valid}</strong><small>sin observaciones</small></div>
          <div className="metric-block"><span>Warnings</span><strong>{run.counts.warning}</strong><small>promovibles con trazabilidad</small></div>
          <div className="metric-block"><span>Cuarentena</span><strong>{run.counts.quarantined}</strong><small>requieren revisión</small></div>
          <div className="metric-block"><span>Duplicados</span><strong>{run.counts.duplicate}</strong><small>no promover</small></div>
          <div className="metric-block"><span>Actividades</span><strong>{run.counts.activities}</strong><small>candidatas agrupadas</small></div>
        </div>

        <div className="content-grid" style={{ margin: 0 }}>
          <div className="panel" style={{ padding: 14 }}>
            <div className="section-head"><h2>Issues detectados</h2><span className="alert-count">{run.issues.length}</span></div>
            <div className="alert-list">
              {run.issues.map((issue, index) => <div className="alert-row" key={`${issue.rowId}-${issue.code}-${index}`}>
                <strong>{issue.rowId} · {issue.code}</strong>
                <span>{issue.detail}</span>
              </div>)}
            </div>
          </div>
          <div className="panel" style={{ padding: 14 }}>
            <div className="section-head"><h2>Actividades candidatas</h2><span className="quiet">sin duplicar personas</span></div>
            <div className="worker-list">
              {run.activities.map((activity) => <div className="worker-row" key={activity.key}>
                <div className="grow"><strong>{activity.activity}</strong><span>{activity.plant} · {activity.workers.join(" + ")}</span></div>
                <div className="right"><strong>{activity.durationHours.toFixed(1)} h</strong><small>{activity.sourceRowIds.join(", ")}</small></div>
              </div>)}
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16, padding: 14 }}>
          <div className="section-head"><h2>Filas de staging</h2><span className="quiet">evidencia original preservada</span></div>
          <div className="worker-list">
            {[...run.receipts, ...run.logs].map((row) => <div className="worker-row" key={row.rowId}>
              <div className="grow"><strong>{row.rowId}</strong><span>{"generator" in row ? `${row.generator} · ${row.wasteType}` : `${row.activity} · ${row.workerOriginal || "Sin trabajador"}`}</span></div>
              <span className={`status-pill ${row.status === "valid" ? "status-normal" : row.status === "warning" ? "status-medium" : row.status === "quarantined" ? "status-high" : "status-planned"}`}>{statusLabel(row.status)}</span>
            </div>)}
          </div>
        </div>
      </section>)}
    </div>
  </>;
}
