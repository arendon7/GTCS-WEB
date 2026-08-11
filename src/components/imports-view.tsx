"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useOpsStore } from "@/components/ops-store";
import { historicalQaFixture } from "@/lib/import-fixtures";
import { dryRunLegacyImport, sha256Text, type ImportRun, type LegacyImportPayload } from "@/lib/importer";
import { parseGreenaticsWorkbook, type XlsxAdapterResult } from "@/lib/xlsx-adapter";

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
  const { promoteHistoricalImport } = useOpsStore();
  const [sourceText, setSourceText] = useState("");
  const [binaryHash, setBinaryHash] = useState<string>();
  const [adapterResult, setAdapterResult] = useState<XlsxAdapterResult>();
  const [runs, setRuns] = useState<ImportRun[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const parsed = useMemo(() => parsePayload(sourceText), [sourceText]);

  function loadFixture() {
    setAdapterResult(undefined);
    setBinaryHash(undefined);
    setSourceText(JSON.stringify(historicalQaFixture, null, 2));
    setMessage("Fixture cargado. Aún no se ha procesado.");
  }

  async function loadWorkbook(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const bytes = await file.arrayBuffer();
      const result = await parseGreenaticsWorkbook(bytes, file.name);
      setAdapterResult(result);
      setBinaryHash(result.sourceHash);
      setSourceText(JSON.stringify(result.payload, null, 2));
      setMessage(`Excel leído: ${result.sheets.length} hojas, ${result.payload.logs.length} filas de bitácora y ${result.payload.receipts.length} recepciones candidatas. Revisa perfiles e issues antes del dry-run.`);
    } catch (error) {
      setAdapterResult(undefined);
      setBinaryHash(undefined);
      setSourceText("");
      setMessage(error instanceof Error ? `No se pudo leer el XLSX: ${error.message}` : "No se pudo leer el XLSX.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  function editSource(value: string) {
    setSourceText(value);
    setBinaryHash(undefined);
    setAdapterResult(undefined);
  }

  async function executeDryRun() {
    if (!parsed) {
      setMessage("El JSON no cumple el contrato histórico esperado.");
      return;
    }
    setBusy(true);
    try {
      const sourceHash = binaryHash ?? await sha256Text(sourceText);
      if (runs.some((run) => run.sourceHash === sourceHash)) {
        setMessage("Esta fuente ya fue procesada; el hash evita crear una corrida duplicada.");
        return;
      }
      const run = dryRunLegacyImport(parsed, sourceHash);
      setRuns((current) => [run, ...current]);
      setMessage(`Dry-run creado: ${run.id}. ${run.counts.quarantined} filas quedaron en cuarentena y no podrán promocionarse.`);
    } finally {
      setBusy(false);
    }
  }

  function promote(runId: string) {
    const run = runs.find((item) => item.id === runId);
    if (!run) return;
    const result = promoteHistoricalImport(run);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setRuns((current) => current.map((item) => item.id === runId ? { ...item, promoted: true } : item));
    setMessage(`Promoción canónica completada: ${result.activities} actividades y ${result.receptions} recepciones. Cuarentena y duplicados quedaron fuera.`);
  }

  return <>
    <header className="page-header">
      <div>
        <p className="eyebrow">Calidad de datos</p>
        <h1>Importaciones históricas</h1>
        <p className="lede">Excel/JSON → adapter explícito → staging inmutable → validación → promoción canónica. Nada ambiguo entra silenciosamente al modelo operacional.</p>
      </div>
      <div className="header-actions">
        <label className="button secondary cursor-pointer" htmlFor="historical-xlsx">Seleccionar Excel</label>
        <input id="historical-xlsx" aria-label="Archivo Excel" className="sr-only" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={loadWorkbook} />
        <button className="button secondary" type="button" onClick={loadFixture}>Cargar fixture QA</button>
        <button className="button primary" type="button" disabled={!parsed || busy} onClick={executeDryRun}>{busy ? "Procesando…" : "Ejecutar dry-run"}</button>
      </div>
    </header>

    {adapterResult && <section className="panel" aria-label="Lectura del Excel" style={{ maxWidth: 1440, margin: "0 auto 16px" }}>
      <div className="section-head"><div><p className="eyebrow">Adapter XLSX</p><h2>Lectura del archivo</h2><p className="quiet">SHA-256 binario {adapterResult.sourceHash.slice(0,16)}… · las reglas de calidad aún no se han ejecutado.</p></div><span className={`status-pill ${adapterResult.issues.length ? "status-medium" : "status-normal"}`}>{adapterResult.issues.length} observaciones</span></div>
      <div className="grid gap-3 md:grid-cols-2">{adapterResult.sheets.map((sheet)=><div className="rounded-xl border border-[var(--line)] p-4" key={sheet.name}><div className="flex items-start justify-between gap-3"><div><strong className="text-sm">{sheet.name}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{sheet.plant ?? "Planta no resuelta"} · {sheet.rows} filas</span></div><span className="status-pill status-planned">{sheet.kind}</span></div>{sheet.profile && <p className="mt-3 text-xs text-[var(--muted)]">{sheet.profile}</p>}</div>)}</div>
      {adapterResult.issues.length > 0 && <div className="mt-4 alert-list">{adapterResult.issues.map((issue,index)=><div className="alert-row" key={`${issue.sheetName}-${issue.code}-${index}`}><strong>{issue.sheetName} · {issue.code}</strong><span>{issue.detail}</span></div>)}</div>}
    </section>}

    <section className="panel" style={{ maxWidth: 1440, margin: "0 auto 16px" }}>
      <div className="section-head">
        <div><h2>Entrada de staging</h2><p className="quiet">Contrato normalizado que recibirá exactamente las mismas reglas de validación, provenga de XLSX o JSON.</p></div>
        <span className="status-pill status-planned">Promoción controlada</span>
      </div>
      <label htmlFor="historical-source" className="quiet">Contrato histórico normalizado</label>
      <textarea
        id="historical-source"
        value={sourceText}
        onChange={(event) => editSource(event.target.value)}
        placeholder="Selecciona un Excel, carga el fixture o pega un LegacyImportPayload JSON"
        style={{ width: "100%", minHeight: 220, marginTop: 8, resize: "vertical", border: "1px solid var(--line)", borderRadius: 10, padding: 12, font: "12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace" }}
      />
      {message ? <p role="status" className="quiet" style={{ marginBottom: 0 }}>{message}</p> : null}
    </section>

    <div style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gap: 16 }}>
      {runs.map((run) => <section className="panel" key={run.id}>
        <div className="section-head">
          <div><p className="eyebrow">{run.id}</p><h2>{run.sourceName}</h2><p className="quiet">SHA-256 {run.sourceHash.slice(0, 16)}… · {new Date(run.createdAt).toLocaleString("es-CO")}</p></div>
          <button className={`button ${run.promoted ? "secondary" : "primary"}`} type="button" onClick={() => promote(run.id)} disabled={run.promoted}>{run.promoted ? "Promovido" : "Aprobar candidatos válidos"}</button>
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
          <div className="panel" style={{ padding: 14 }}><div className="section-head"><h2>Issues detectados</h2><span className="alert-count">{run.issues.length}</span></div><div className="alert-list">{run.issues.map((issue, index) => <div className="alert-row" key={`${issue.rowId}-${issue.code}-${index}`}><strong>{issue.rowId} · {issue.code}</strong><span>{issue.detail}</span></div>)}</div></div>
          <div className="panel" style={{ padding: 14 }}><div className="section-head"><h2>Actividades candidatas</h2><span className="quiet">sin duplicar personas</span></div><div className="worker-list">{run.activities.map((activity) => <div className="worker-row" key={activity.key}><div className="grow"><strong>{activity.activity}</strong><span>{activity.plant} · {activity.workers.join(" + ")}</span></div><div className="right"><strong>{activity.durationHours.toFixed(1)} h</strong><small>{activity.sourceRowIds.join(", ")}</small></div></div>)}</div></div>
        </div>

        <div className="panel" style={{ marginTop: 16, padding: 14 }}><div className="section-head"><h2>Filas de staging</h2><span className="quiet">evidencia original preservada</span></div><div className="worker-list">{[...run.receipts, ...run.logs].map((row) => <div className="worker-row" key={row.rowId}><div className="grow"><strong>{row.rowId}</strong><span>{"generator" in row ? `${row.generator} · ${row.wasteType}` : `${row.activity} · ${row.workerOriginal || "Sin trabajador"}`}</span></div><span className={`status-pill ${row.status === "valid" ? "status-normal" : row.status === "warning" ? "status-medium" : row.status === "quarantined" ? "status-high" : "status-planned"}`}>{statusLabel(row.status)}</span></div>)}</div></div>
      </section>)}
    </div>
  </>;
}
