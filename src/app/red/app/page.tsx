"use client";

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import { countApprovedDecisions, countCorrectionStates } from "./qa-metrics";
import "./red-app-v4.css";

type ViewId = "overview" | "territory" | "generators" | "routes" | "field" | "qa" | "findings" | "pmirs" | "pmirs-live" | "indicators" | "evidence" | "coord";
type Tone = "ok" | "warn" | "muted" | "critical";
type QaDecision = "Por validar" | "Aprobada" | "Corrección solicitada";
type LiveUpdate = { progress: number; state: string; tone: Tone };
type NavigationItem = { id: ViewId; code: string; label: string; detail: string; group: string };

const navigation: NavigationItem[] = [
  { id: "overview", code: "01", label: "Resumen del proyecto", detail: "Contexto y siguiente decisión", group: "Dirección" },
  { id: "territory", code: "02", label: "Territorio", detail: "Contexto y diagnóstico", group: "Dirección" },
  { id: "generators", code: "03", label: "Generadores", detail: "Usuarios, actores y fuentes", group: "Operación territorial" },
  { id: "routes", code: "04", label: "Rutas", detail: "Cobertura y microrrutas", group: "Operación territorial" },
  { id: "field", code: "05", label: "Trabajo de campo", detail: "Visitas, medición y soportes", group: "Trabajo de campo" },
  { id: "qa", code: "06", label: "Revisión de datos", detail: "Calidad, fuentes y evidencias", group: "Trabajo de campo" },
  { id: "findings", code: "07", label: "Hallazgos", detail: "Prioridades y causas", group: "Planeación" },
  { id: "pmirs", code: "08", label: "Programas PMIRS", detail: "Acciones, metas y responsables", group: "Planeación" },
  { id: "pmirs-live", code: "09", label: "Seguimiento PMIRS", detail: "Implementación, avances y evidencia", group: "Planeación" },
  { id: "indicators", code: "10", label: "Indicadores", detail: "Metas y desempeño", group: "Planeación" },
  { id: "evidence", code: "11", label: "Evidencias", detail: "Soportes y trazabilidad", group: "Gobierno del dato" },
  { id: "coord", code: "12", label: "Coordinación", detail: "Responsables y alertas", group: "Gobierno del dato" },
];
const navigationGroups = ["Dirección", "Operación territorial", "Trabajo de campo", "Planeación", "Gobierno del dato"] as const;

const metrics = [
  ["Cobertura del diagnóstico", "78 %", "14 de 18 unidades con registro inicial", "ok"],
  ["Generadores activos", "126", "Hogares, comercio e instituciones", "ok"],
  ["Rutas en operación", "04", "2 selectivas · 2 de verificación", "muted"],
  ["Registros por revisar", "09", "5 de campo · 4 documentales", "warn"],
  ["Avance PMIRS", "32 %", "7 acciones con responsable asignado", "ok"],
  ["Hallazgos abiertos", "06", "1 con prioridad alta", "warn"],
] as const;

const projectStages = [
  ["01", "Diagnóstico", "En curso", "14/18", 78],
  ["02", "Generadores", "Caracterización activa", "126", 66],
  ["03", "Rutas", "Pilotos en observación", "04", 54],
  ["04", "Calidad del dato", "9 por revisar", "22/31", 71],
  ["05", "Línea base", "Borrador controlado", "05/08", 48],
  ["06", "PMIRS", "Implementación inicial", "07/22", 32],
] as const;

const recentActivity = [
  ["14:20", "Revisión de datos", "Se solicitó aclaración sobre pesaje de la jornada 04", "Por revisar"],
  ["12:05", "Trabajo de campo", "Se cerró una visita de infraestructura del territorio de muestra", "Registrado"],
  ["10:40", "Rutas", "La microrruta selectiva 02 completó su ciclo sin novedad crítica", "Registrado"],
  ["09:15", "Proyecto", "Se actualizó responsable del diagnóstico municipal", "Validado"],
] as const;

const generators = [
  ["GEN-018", "Plaza de mercado", "La 50", "Orgánico", "18,4 t/mes", "Caracterizado", "ok"],
  ["GEN-024", "Restaurante", "Centro", "Orgánico + impropios", "4,2 t/mes", "Por verificar", "warn"],
  ["GEN-031", "Institución educativa", "Sector institucional", "Mixto", "2,1 t/mes", "Registrado", "muted"],
  ["GEN-047", "Conjunto residencial", "Santa Ana", "Orgánico", "8,7 t/mes", "Caracterizado", "ok"],
  ["GEN-063", "Comercio minorista", "Parque principal", "Pendiente de clasificar", "Por medir", "Pendiente", "warn"],
] as const;

const routes = [
  ["R-01", "Corredor comercial centro", "42 generadores", "Lun · Mié · Vie", "84 %", "03:40", "Estable", "ok"],
  ["R-02", "Plaza y restaurantes", "28 generadores", "Mar · Jue · Sáb", "71 %", "02:55", "Observar", "warn"],
  ["R-03", "Instituciones educativas", "19 generadores", "Jornada piloto", "58 %", "En diseño", "Piloto", "muted"],
] as const;

const queue = [
  ["QA-108", "Pesaje jornada 04", "R-02 · 06 jun", "Unidad no registrada", "Claudia C.", "Corrección", "warn"],
  ["QA-104", "Registro de infraestructura", "Campo · GEN-031", "Falta fotografía de acceso", "Juan O.", "Aclaración", "muted"],
  ["QA-099", "Caracterización de orgánicos", "GEN-024", "Separar muestra e impropios", "María G.", "Corrección", "warn"],
  ["QA-096", "Acta de visita", "Campo · territorio de muestra", "Firma de responsable", "Equipo de campo", "Por validar", "muted"],
] as const;

const programs = [
  ["P-01", "Separación en la fuente", "12 acciones", "7 en curso", "Reducir impropios y mejorar la calidad del material", 58],
  ["P-02", "Recolección diferenciada", "06 acciones", "2 en curso", "Ajustar cobertura, frecuencia y reglas de entrega", 31],
  ["P-03", "Aprovechamiento y tratamiento", "04 acciones", "1 en diseño", "Conectar volumen, calidad, destino y capacidad instalada", 18],
] as const;

const findings = [
  ["H-021", "Alta presencia de impropios en R-02", "Calidad", "Alta", "QA-099 · GEN-024", "Abierto", "warn"],
  ["H-018", "Cobertura incompleta en jornada nocturna", "Logística", "Media", "R-02 · Campo 04", "En análisis", "muted"],
  ["H-014", "Medición de capacidad de recepción", "Infraestructura", "Alta", "EV-199 · P-03", "Con decisión", "warn"],
  ["H-009", "Acuerdos de entrega sin versión común", "Gobernanza", "Media", "EV-207 · P-01", "Resuelto", "ok"],
] as const;

const liveActions = [
  ["A-014", "Reducir impropios en la fuente", "P-01", "Administración PH", "58 %", "En curso", "11 jun", "ok"],
  ["A-015", "Ajustar ventana de R-02", "P-02", "Operador de ejemplo", "30 %", "Bloqueada", "12 jun", "warn"],
  ["A-016", "Validar capacidad de recepción", "P-03", "GREENATICS", "15 %", "En curso", "14 jun", "ok"],
  ["A-017", "Actualizar acuerdo de entrega", "P-01", "Municipio", "100 %", "Por cerrar", "08 jun", "muted"],
] as const;

const indicators = [
  ["Material orgánico separado", "18,4 t/mes", "Línea base en construcción", "La cifra corresponde a una unidad caracterizada; no es un resultado municipal."],
  ["Pureza de la muestra", "86 %", "3 de 5 muestras válidas", "Requiere ampliar la serie antes de comparar sectores o periodos."],
  ["Cobertura de ruta", "42 / 50", "Generadores atendidos", "La cobertura se calcula sobre el universo activo del piloto R-01."],
  ["Acciones con evidencia", "07", "De 22 acciones PMIRS", "Cada acción debe conservar soporte, fecha, responsable y estado."],
] as const;

const evidence = [
  ["EV-221", "Fotografía de punto de almacenamiento", "GEN-031 · Campo", "11 jun 2026", "Imagen · georreferencia · Laura R.", "Validada", "ok"],
  ["EV-218", "Planilla de pesaje jornada 04", "R-02 · Revisión de datos", "10 jun 2026", "Documento · 3 registros", "Unidad no registrada", "warn"],
  ["EV-207", "Acta de acuerdo con generadores", "P-01 · PMIRS", "08 jun 2026", "PDF · 6 firmas", "Validada", "ok"],
  ["EV-199", "Croquis de cobertura piloto", "R-03 · Territorio", "05 jun 2026", "Mapa · versión 02", "Borrador", "muted"],
] as const;

const coordinationItems = [
  ["Solicitud de información", "Confirmar horario de visita", "Administración PH", "Hoy", "Campo", "Solicitar confirmación de ventana y responsable antes de cerrar la jornada."],
  ["Corrección de datos", "Soporte de pesaje jornada 04", "María G.", "Mañana", "Revisión", "Completar unidad y soporte para que la muestra pueda entrar a la línea base."],
  ["Decisión", "Priorizar punto de almacenamiento", "Dirección", "12 sep", "PMIRS", "Definir recurso y responsable para conectar el hallazgo con una acción."],
  ["Incidencia", "Acceso restringido en R-02", "Juan O.", "Abierta", "Rutas", "Registrar la restricción y acordar una alternativa de recorrido."],
] as const;

const territoryLayers = [
  ["01", "Actores y generadores", "Quién entrega, qué entrega y bajo qué acuerdo.", "GEN-024 · GEN-031 · acuerdos de entrega"],
  ["02", "Logística", "Dónde se recoge, con qué frecuencia y qué restricciones aparecen.", "R-01 · R-02 · cobertura y ciclos"],
  ["03", "Infraestructura", "Qué capacidad existe, qué falta y qué puede conectarse a OPS.", "EV-199 · capacidad de recepción"],
  ["04", "Decisión pública", "Qué programa, recurso o responsabilidad debe activarse.", "P-01 · P-02 · P-03"],
] as const;

const fieldSteps = [
  ["01", "Contexto", "Proyecto, ruta y responsable", "Completado", "ok", "Confirmar proyecto, municipio, ruta y capturista antes de iniciar."],
  ["02", "Generadores", "6 puntos visitados", "Completado", "ok", "Relacionar cada visita con generador, ubicación y acuerdo de entrega."],
  ["03", "Medición", "Pesajes y caracterización", "En revisión", "muted", "Verificar unidad, método, bruto, tara y peso neto antes de consolidar."],
  ["04", "Infraestructura", "2 fotografías pendientes", "Pendiente", "warn", "Completar fotografía de acceso, capacidad observada y restricción operativa."],
  ["05", "Novedades", "1 observación de acceso", "Registrado", "ok", "Describir la novedad, su impacto en la ruta y la respuesta acordada."],
  ["06", "Cierre", "Firma y resumen de jornada", "Pendiente", "warn", "Cerrar con resumen, firma, pendientes y responsable de revisión."],
] as const;

function Status({ children, tone = "ok" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`red-app__status red-app__status--${tone}`}>{children}</span>;
}

function MetricGrid() {
  return <section className="red-app__metrics" aria-label="Indicadores principales">{metrics.map(([label, value, detail, tone]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small><i className={`red-app__metric-dot red-app__metric-dot--${tone}`} /></article>)}</section>;
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`red-app__panel ${className}`}>{children}</section>;
}

function PanelHead({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: ReactNode }) {
  return <div className="red-app__panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div>{aside}</div>;
}

export default function RedAppPage() {
  const [view, setView] = useState<ViewId>("overview");
  const [notice, setNoticeState] = useState("El contexto del proyecto acompaña cada registro.");
  const setNotice = (message: string) => setNoticeState(message);
  const [selectedQaId, setSelectedQaId] = useState("QA-108");
  const [qaDecisions, setQaDecisions] = useState<Record<string, QaDecision>>({});
  const [selectedActionId, setSelectedActionId] = useState("A-014");
  const [liveUpdates, setLiveUpdates] = useState<Record<string, LiveUpdate>>({});
  const [selectedGeneratorId, setSelectedGeneratorId] = useState("GEN-024");
  const [selectedFindingId, setSelectedFindingId] = useState("H-021");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("EV-221");
  const [selectedRouteId, setSelectedRouteId] = useState("R-02");
  const [selectedFieldStepId, setSelectedFieldStepId] = useState("03");
  const activeItem = navigation.find((item) => item.id === view) ?? navigation[0];

  useEffect(() => {
    const syncViewFromUrl = () => {
      const requestedView = window.location.hash.slice(1);
      if (requestedView && !navigation.some((item) => item.id === requestedView)) return;
      const next = navigation.find((item) => item.id === requestedView) ?? navigation[0];
      setView(next.id);
      setNotice(`${next.label}: módulo de muestra cargado. Los cambios se mantienen solo en esta sesión.`);
    };

    syncViewFromUrl();
    window.addEventListener("popstate", syncViewFromUrl);
    window.addEventListener("hashchange", syncViewFromUrl);
    return () => {
      window.removeEventListener("popstate", syncViewFromUrl);
      window.removeEventListener("hashchange", syncViewFromUrl);
    };
  }, []);

  const selectView = (nextView: ViewId) => {
    setView(nextView);
    if (window.location.hash !== `#${nextView}`) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${nextView}`);
    }
    const next = navigation.find((item) => item.id === nextView);
    setNotice(`${next?.label}: estación pública cargada. Los cambios se mantienen en esta sesión.`);
  };

  return <div className="red-app">
    <header className="red-app__topbar">
      <Link className="red-app__brand" href="/red/"><Image src="/brand/greenatics-horizontal.webp" alt="Greenatics" width={146} height={46} priority /><small>RED · Estación de muestra</small></Link>
      <div className="red-app__topbar-context"><span>Territorio y organización · demostración</span><strong>Escenario ficticio</strong><small>Nombres, cifras y estados no son de entidades reales</small></div>
      <div className="red-app__topbar-meta"><Status tone="muted">Datos ficticios</Status><Link className="red-app__site-link" href="/" aria-label="Volver al sitio Greenatics">Volver a Greenatics</Link></div>
    </header>

    <div className="red-app__body">
      <aside className="red-app__rail" aria-label="Módulos de GREENATICS Red">
        <div className="red-app__context"><span>Contexto de muestra</span><strong>Territorio u organización</strong><small>Actores, grandes generadores y registros sintéticos</small></div>
        <label className="red-app__mobile-module-switcher" htmlFor="red-app-mobile-module">
          <span>Módulo activo</span>
          <select id="red-app-mobile-module" value={view} onChange={(event) => selectView(event.currentTarget.value as ViewId)}>
            {navigationGroups.map((group) => (
              <optgroup label={group} key={group}>
                {navigation.filter((item) => item.group === group).map((item) => (
                  <option value={item.id} key={item.id}>{item.code} · {item.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <nav aria-label="Módulos de la aplicación">
          {navigationGroups.map((group) => <div className="red-app__nav-group" key={group}><span>{group}</span>{navigation.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} className={view === item.id ? "is-active" : undefined} aria-current={view === item.id ? "page" : undefined} onClick={() => selectView(item.id)}><b>{item.code}</b><div><strong>{item.label}</strong><small>{item.detail}</small></div></button>)}</div>)}
        </nav>
        <div className="red-app__rail-note"><i /><div><strong>Estados protegidos</strong><span>RAW no es VALIDATED. Cada estado conserva fuente, actor, fecha y motivo.</span></div></div>
      </aside>

      <section className="red-app__workspace" aria-label="Área de trabajo de GREENATICS Red">
        <div className="red-app__workspace-head"><div><span>GREENATICS Red / {activeItem.label}</span><h1>{view === "overview" ? "Resumen del proyecto" : activeItem.label}</h1><p>{view === "overview" ? "Muestra cómo ordenar el diagnóstico, el trabajo de campo y el seguimiento de un PGIRS territorial o un PMIRS organizacional, incluidos grandes generadores." : activeItem.detail}</p></div><div className="red-app__head-actions"><Link className="red-app__primary" href="/contacto/?interes=red">Conversar sobre territorio u organización</Link></div></div>
        <p className="red-app__notice" aria-live="polite"><b>Estación pública</b> {publicRedText(notice)}</p>

        {view === "overview" && <Overview setNotice={setNotice} setView={selectView} />}
        {view === "territory" && <Territory setNotice={setNotice} setView={selectView} />}
        {view === "generators" && <Generators setNotice={setNotice} selectedGeneratorId={selectedGeneratorId} setSelectedGeneratorId={setSelectedGeneratorId} />}
        {view === "routes" && <Routes setNotice={setNotice} selectedRouteId={selectedRouteId} setSelectedRouteId={setSelectedRouteId} />}
        {view === "field" && <Field setNotice={setNotice} selectedFieldStepId={selectedFieldStepId} setSelectedFieldStepId={setSelectedFieldStepId} />}
        {view === "qa" && <Qa setNotice={setNotice} selectedQaId={selectedQaId} setSelectedQaId={setSelectedQaId} qaDecisions={qaDecisions} setQaDecisions={setQaDecisions} />}
        {view === "findings" && <Findings setNotice={setNotice} selectedFindingId={selectedFindingId} setSelectedFindingId={setSelectedFindingId} />}
        {view === "pmirs" && <Pmirs setNotice={setNotice} setView={selectView} selectedActionId={selectedActionId} setSelectedActionId={setSelectedActionId} />}
        {view === "pmirs-live" && <PmirsLive setNotice={setNotice} selectedActionId={selectedActionId} setSelectedActionId={setSelectedActionId} liveUpdates={liveUpdates} setLiveUpdates={setLiveUpdates} />}
        {view === "indicators" && <Indicators />}
        {view === "evidence" && <Evidence setNotice={setNotice} selectedEvidenceId={selectedEvidenceId} setSelectedEvidenceId={setSelectedEvidenceId} />}
        {view === "coord" && <Coord setNotice={setNotice} />}
      </section>
    </div>
  </div>;
}

function Overview({ setNotice, setView }: { setNotice: (message: string) => void; setView: (view: ViewId) => void }) {
  return <div className="red-app__screen"><MetricGrid /><div className="red-app__overview-grid"><Panel className="red-app__next"><div className="red-app__panel-head"><div><span>Siguiente decisión · ejemplo</span><h2>Validar la jornada de muestra antes de cerrar la línea base.</h2></div><Status tone="warn">Prioridad de ejemplo</Status></div><p>La muestra enseña cómo una unidad y su soporte se revisan antes de incorporar una lectura a una línea base.</p><button type="button" onClick={() => { setView("qa"); setNotice("Revisión de datos: valida la unidad y el soporte de la jornada de muestra."); }}>Abrir cola de revisión ↗</button></Panel><Panel><PanelHead eyebrow="Calidad del dato" title="Estado de la evidencia · ejemplo" aside={<Status tone="warn">9 alertas</Status>} /><div className="red-app__state-bars"><div><span>Registrado</span><strong>126</strong><i><b style={{ width: "100%" }} /></i></div><div><span>Validado</span><strong>84</strong><i><b style={{ width: "67%" }} /></i></div><div><span>Interpretado</span><strong>32</strong><i><b style={{ width: "25%" }} /></i></div><div><span>Derivado</span><strong>7</strong><i><b style={{ width: "8%" }} /></i></div></div><p className="red-app__panel-footnote">Los estados no son una escala de confianza automática: indican qué revisión recibió cada objeto.</p></Panel></div><Panel><PanelHead eyebrow="Progreso por hitos" title="Del diagnóstico al seguimiento del PMIRS" aside={<small>Avances ficticios de demostración.</small>} /><ol className="red-app__steps">{projectStages.map(([code, title, state, count, progress]) => <li key={code}><span>{code}</span><div><strong>{title}</strong><small>{state}</small></div><b>{count}</b><i><em style={{ width: `${progress}%` }} /></i></li>)}</ol></Panel><Panel><PanelHead eyebrow="Actividad de muestra" title="Cómo se relacionan los eventos" aside={<small>Secuencia ficticia</small>} /><div className="red-app__timeline">{recentActivity.map(([time, type, copy, state]) => <div key={`${time}-${type}`}><time>{time}</time><i /><div><strong>{copy}</strong><small>{type} · DEMO-RED · {state}</small></div></div>)}</div></Panel></div>;
}

function Territory({ setNotice, setView }: { setNotice: (message: string) => void; setView: (view: ViewId) => void }) {
  const [selectedLayerId, setSelectedLayerId] = useState("03");
  const selectedLayer = territoryLayers.find(([code]) => code === selectedLayerId) ?? territoryLayers[0];
  const selectLayer = (id: string) => { setSelectedLayerId(id); setNotice(`${id}: capa territorial cargada con fuentes y objetos relacionados.`); };
  return <div className="red-app__screen">
    <section className="red-app__territory-hero"><div><span>PROYECTO · CONTEXTO Y ACTORES</span><h2>Una línea base que explica dónde ocurre el problema y qué decisión sigue.</h2><p>Red organiza el contexto del territorio o la organización: actores, generadores, infraestructura, flujos, restricciones y fuentes. El objetivo no es solo mapear, sino hacer visible lo que cambia la decisión, desde la gestión de un PGIRS hasta el PMIRS de una unidad residencial, un centro comercial o una institución.</p></div><div className="red-app__territory-stamp"><strong>18</strong><span>unidades priorizadas · ejemplo</span><small>14 con registro inicial · ficticio</small></div></section>
    <div className="red-app__territory-grid"><Panel><PanelHead eyebrow="Ficha territorial · ficticia" title="Territorio municipal de muestra" aside={<Status tone="muted">Datos sintéticos</Status>} /><dl className="red-app__detail-list"><div><dt>Alcance</dt><dd>Área urbana y veredas de ejemplo</dd></div><div><dt>Periodo de lectura</dt><dd>Corte de demostración</dd></div><div><dt>Decisión</dt><dd>Diseñar un sistema de aprovechamiento con rutas y capacidad instalada</dd></div><div><dt>Fuentes</dt><dd>Ejemplos de visitas de campo, registros de generadores, documentos y acuerdos</dd></div></dl></Panel><Panel><PanelHead eyebrow="Mapa de trabajo" title="Capas que deben conversar" /><div className="red-app__layer-list">{territoryLayers.map(([code, title, copy]) => <button type="button" className={selectedLayer[0] === code ? "is-selected" : undefined} aria-pressed={selectedLayer[0] === code} key={code} onClick={() => selectLayer(code)}><span>{code}</span><div><strong>{title}</strong><small>{copy}</small></div><b>↗</b></button>)}</div></Panel></div>
    <RecordInspector eyebrow="Capa seleccionada" code={`CAPA-${selectedLayer[0]}`} title={selectedLayer[1]} status="Contexto de muestra" tone="muted" summary={selectedLayer[2]} details={[["Objetos", selectedLayer[3]], ["Proyecto", "DEMO-RED · territorio ficticio"], ["Periodo", "Corte de demostración"], ["Siguiente lectura", selectedLayer[0] === "03" ? "Validar capacidad instalada" : "Cruzar fuentes de trabajo"]]} relation="Resumen del proyecto · Generadores · Rutas · Trabajo de campo" action="Revisar las fuentes relacionadas con esta capa" setNotice={setNotice} />
    <Panel><PanelHead eyebrow="Preguntas abiertas · muestra" title="Lo que todavía requiere trabajo territorial" aside={<Status tone="warn">3 pendientes ficticios</Status>} /><div className="red-app__question-grid">{[["01", "¿Cuál es el universo completo de generadores?", "Falta cerrar el cruce entre directorio y recorrido de campo."], ["02", "¿Qué calidad llega a cada ventana de recolección?", "Se requieren muestras comparables por sector y jornada."], ["03", "¿Qué capacidad debe reservarse para el destino?", "La salida define requisitos de volumen, mezcla y control."]].map(([code, title, copy]) => <article key={code}><span>{code}</span><h3>{title}</h3><p>{copy}</p><button type="button" onClick={() => { setView("findings"); setNotice(`Pregunta ${code}: consulta los hallazgos de muestra asociados al diagnóstico.`); }}>Ver hallazgos de muestra</button></article>)}</div></Panel>
  </div>;
}

function publicRedText(value: string) {
  return value
    .replaceAll("Proyecto 360", "Resumen del proyecto")
    .replaceAll("PMIRS STUDIO", "Programas PMIRS")
    .replaceAll("PMIRS VIVO", "Seguimiento PMIRS")
    .replaceAll("QA/QC", "revisión de datos")
    .replaceAll("FIELD", "trabajo de campo");
}

function RecordInspector({ eyebrow, code, title, status, tone, summary, details, relation, action }: { eyebrow: string; code: string; title: string; status: string; tone: Tone; summary: string; details: Array<readonly [string, string]>; relation: string; action: string; setNotice: (message: string) => void }) {
  return (
    <Panel className="red-app__record-inspector">
      <div className="red-app__inspector-main">
        <span>{publicRedText(eyebrow)} · {code}</span>
        <h2>{title}</h2>
        <p>{publicRedText(summary)}</p>
      </div>
      <div className="red-app__inspector-details">
        {details.map(([label, value]) => (
          <div key={label}><small>{publicRedText(label)}</small><strong>{publicRedText(value)}</strong></div>
        ))}
      </div>
      <div className="red-app__inspector-footer">
        <span><b>Relacionado con</b> {publicRedText(relation)}</span>
        <Status tone={tone}>{status}</Status>
        <details className="red-app__inspector-next">
          <summary>Siguiente paso sugerido</summary>
          <p>{publicRedText(action)}. Es una orientación; no ejecuta acciones ni modifica los datos de muestra.</p>
        </details>
      </div>
    </Panel>
  );
}

function Generators({ setNotice, selectedGeneratorId, setSelectedGeneratorId }: { setNotice: (message: string) => void; selectedGeneratorId: string; setSelectedGeneratorId: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visibleGenerators = generators.filter((row) => row.join(" ").toLocaleLowerCase("es").includes(normalizedQuery));
  const selectedGenerator = visibleGenerators.find(([id]) => id === selectedGeneratorId) ?? visibleGenerators[0] ?? generators[0];
  const selectGenerator = (id: string) => { setSelectedGeneratorId(id); setNotice(`${id}: ficha contextual cargada con fuente, volumen, estado y relación operativa.`); };
  return (
    <div className="red-app__screen">
      <MetricGrid />
      <Panel className="red-app__generators-panel">
        <PanelHead
          eyebrow="Directorio territorial"
          title="Generadores y unidades de gestión"
          aside={<label className="red-app__search-label">Buscar en la muestra<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tipo, sector, corriente o estado" /></label>}
        />
        <p className="red-app__panel-intro">El generador no es solo un punto en el mapa. Es una fuente con responsable, corriente, frecuencia, capacidad de entrega, reglas de calidad y relación con una ruta.</p>
        <p className="red-app__table-hint">Desliza horizontalmente para consultar todas las columnas.</p>
        <div className="red-app__table-wrap">
          <table className="red-app__table">
            <thead><tr><th>ID</th><th>Tipo y sector</th><th>Corriente</th><th>Volumen estimado</th><th>Estado</th></tr></thead>
            <tbody>
              {visibleGenerators.map(([id, type, sector, stream, volume, state, tone]) => <tr key={id} className={selectedGeneratorId === id ? "is-selected" : undefined}><td><button type="button" className="red-app__row-select" aria-label={`Ver ficha de ${id}: ${type}, ${state}`} aria-pressed={selectedGeneratorId === id} onClick={() => selectGenerator(id)}><strong>{id}</strong></button></td><td><strong>{type}</strong><small>{sector}</small></td><td>{stream}</td><td>{volume}</td><td><Status tone={tone as Tone}>{state}</Status></td></tr>)}
              {visibleGenerators.length === 0 ? <tr><td colSpan={5}>No hay registros de ejemplo que coincidan con “{query}”.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Panel>
      {visibleGenerators.length > 0 ? <RecordInspector eyebrow="Generador seleccionado · muestra" code={selectedGenerator[0]} title={selectedGenerator[1]} status={selectedGenerator[5]} tone={selectedGenerator[6] as Tone} summary={`Fuente ${selectedGenerator[3].toLowerCase()} ubicada en ${selectedGenerator[2]}. La ficha conecta caracterización, acuerdo de entrega, ruta y evidencia.`} details={[["Volumen estimado", selectedGenerator[4]], ["Corriente", selectedGenerator[3]], ["Sector", selectedGenerator[2]], ["Próxima revisión", selectedGenerator[0] === "GEN-024" ? "Separar muestra e impropios" : "Confirmar ficha de campo"]]} relation="Rutas · Trabajo de campo · Evidencias" action="Confirmar la ficha de campo y el acuerdo de entrega" setNotice={setNotice} /> : null}
      <div className="red-app__two-col"><Panel><PanelHead eyebrow="Calidad de caracterización" title="Qué debe quedar en la ficha" /><ul className="red-app__check-list"><li><b>Origen</b><span>Tipo de actividad, ubicación y responsable de entrega.</span></li><li><b>Corriente</b><span>Orgánico, reciclable, rechazo, poda u otra corriente definida.</span></li><li><b>Medición</b><span>Volumen, peso, periodo, método y unidad claramente registrados.</span></li><li><b>Acuerdo</b><span>Ventana de entrega, recipiente, calidad mínima y novedad.</span></li></ul></Panel><Panel className="red-app__accent-panel"><span>Regla de diseño</span><h2>El mapa muestra el punto. La ficha explica la relación.</h2><p>La ruta solo puede diseñarse bien cuando se conoce el comportamiento del generador y el destino que recibirá el material.</p></Panel></div>
    </div>
  );
}

function Routes({ setNotice, selectedRouteId, setSelectedRouteId }: { setNotice: (message: string) => void; selectedRouteId: string; setSelectedRouteId: (id: string) => void }) {
  const selectedRoute = routes.find(([id]) => id === selectedRouteId) ?? routes[0];
  const selectRoute = (id: string) => { setSelectedRouteId(id); setNotice(`${id}: ficha de recorrido cargada con cobertura, ciclo, frecuencia y destino.`); };
  return <div className="red-app__screen">
    <section className="red-app__route-summary"><div><span>RUTAS · DISEÑO Y SEGUIMIENTO</span><h2>Una microrruta eficiente es un acuerdo operativo medible.</h2><p>Red relaciona generadores, horarios, recipiente, vehículo, personal, tiempos de ciclo, descarga, calidad y destino. El vehículo es solo una pieza de la ruta.</p></div><div><strong>84 %</strong><small>Cobertura ilustrativa de la ruta</small><span>R-01 · escenario de muestra</span></div></section>
    <div className="red-app__route-grid">{routes.map(([id, name, generatorsCount, frequency, coverage, cycle, state, tone]) => <button type="button" className={`red-app__route-card${selectedRoute[0] === id ? " is-selected" : ""}`} aria-pressed={selectedRoute[0] === id} key={id} onClick={() => selectRoute(id)}><div><span>{id}</span><Status tone={tone as Tone}>{state}</Status></div><h3>{name}</h3><p>{generatorsCount} · {frequency}</p><dl><div><dt>Cobertura</dt><dd>{coverage}</dd></div><div><dt>Ciclo</dt><dd>{cycle}</dd></div></dl><b>Ver detalles de esta ruta</b></button>)}</div>
    <RecordInspector eyebrow="Ruta seleccionada" code={selectedRoute[0]} title={selectedRoute[1]} status={selectedRoute[6]} tone={selectedRoute[7] as Tone} summary={`${selectedRoute[2]} · ${selectedRoute[3]}. La ruta conecta cobertura, frecuencia, tiempos de ciclo, calidad de entrega y destino para que el diseño pueda comprobarse.`} details={[["Cobertura", selectedRoute[4]], ["Ciclo observado", selectedRoute[5]], ["Frecuencia", selectedRoute[3]], ["Próxima revisión", selectedRoute[0] === "R-02" ? "Ventana y calidad" : "Cierre de jornada"]]} relation="Generadores · FIELD · OPS" action="Verificar el ciclo observado, la calidad y el destino" setNotice={setNotice} />
    <div className="red-app__two-col"><Panel><PanelHead eyebrow="Control del ciclo" title="Qué se registra en cada recorrido" /><div className="red-app__route-flow">{[["01", "Salida", "Vehículo, equipo, hora y condiciones."], ["02", "Recolección", "Generador, recipiente, peso, calidad y novedad."], ["03", "Traslado", "Tiempo, recorrido, incidencia y desvío."], ["04", "Descarga", "Recepción, destino, rechazo y soporte."]].map(([code, title, copy]) => <div key={code}><span>{code}</span><strong>{title}</strong><p>{copy}</p></div>)}</div></Panel><Panel><PanelHead eyebrow="Alerta de diseño · muestra" title="La frecuencia debe responder al flujo real." aside={<Status tone="warn">Revisar R-02</Status>} /><p className="red-app__large-copy">R-02 tiene buena concentración de generadores, pero una ventana corta de entrega y mayor variabilidad de impropios. Antes de ampliar cobertura conviene probar horario, recipiente y regla de aceptación.</p><Link className="red-app__text-action" href="/contacto/?interes=red&servicio=microrrutas-motocarguero">Diseñar un piloto de microrruta ↗</Link></Panel></div>
  </div>;
}

function Field({ setNotice, selectedFieldStepId, setSelectedFieldStepId }: { setNotice: (message: string) => void; selectedFieldStepId: string; setSelectedFieldStepId: (id: string) => void }) {
  const selectedStep = fieldSteps.find(([code]) => code === selectedFieldStepId) ?? fieldSteps[0];
  const selectStep = (id: string) => { setSelectedFieldStepId(id); setNotice(`${id}: paso de campo seleccionado para revisar captura, evidencia y cierre.`); };
  return <div className="red-app__screen">
    <section className="red-app__field-header"><div><span>TRABAJO DE CAMPO · VISITA DE MUESTRA · R-02</span><h2>Jornada de caracterización 04</h2><p>El flujo móvil prioriza capturar bien el hecho antes de interpretarlo. Cada paso queda ligado a proyecto, ruta, generador, persona, hora y evidencia.</p></div><Status>07/10 pasos</Status></section>
    <div className="red-app__field-grid">{fieldSteps.map(([code, title, copy, state, tone]) => <button type="button" className={selectedStep[0] === code ? "is-selected" : undefined} aria-pressed={selectedStep[0] === code} key={code} onClick={() => selectStep(code)}><span>{code}</span><strong>{title}</strong><p>{copy}</p><Status tone={tone as Tone}>{state}</Status></button>)}</div>
    <RecordInspector eyebrow="Paso de campo seleccionado" code={`CAMPO-${selectedStep[0]}`} title={selectedStep[1]} status={selectedStep[3]} tone={selectedStep[4] as Tone} summary={selectedStep[5]} details={[["Jornada", "Caracterización 04"], ["Ruta", "R-02 · Plaza y restaurantes"], ["Estado", selectedStep[3]], ["Evidencia", selectedStep[0] === "04" ? "2 fotografías pendientes" : "Soporte relacionado"]]} relation="Resumen del proyecto · Generadores · Revisión de datos" action="Completar la captura pendiente y relacionar su evidencia" setNotice={setNotice} />
    <div className="red-app__two-col"><Panel className="red-app__mobile-rule"><span>Regla de captura</span><h2>Fotos, pesajes y novedades quedan ligados al objeto actual.</h2><p>El bruto y la tara generan el peso neto; el equipo de campo no debe digitar un cálculo que la plataforma puede conservar de forma reproducible.</p></Panel><Panel><PanelHead eyebrow="Resumen de jornada" title="Lo que debe cerrar el capturista" /><ul className="red-app__check-list"><li><b>Fuente</b><span>Generador y punto visitado identificados.</span></li><li><b>Medición</b><span>Unidad, método y hora visibles.</span></li><li><b>Evidencia</b><span>Fotografía o documento relacionado.</span></li><li><b>Cierre</b><span>Novedades y responsable de revisión.</span></li></ul></Panel></div>
  </div>;
}

function Qa({ setNotice, selectedQaId, setSelectedQaId, qaDecisions, setQaDecisions }: { setNotice: (message: string) => void; selectedQaId: string; setSelectedQaId: (id: string) => void; qaDecisions: Record<string, QaDecision>; setQaDecisions: Dispatch<SetStateAction<Record<string, QaDecision>>> }) {
  const selectedQa = queue.find(([id]) => id === selectedQaId) ?? queue[0];
  const selectedState = qaDecisions[selectedQa[0]] ?? selectedQa[5];
  const pendingCount = queue.filter(([id, , , , , state]) => (qaDecisions[id] ?? state) !== "Aprobada").length;
  const correctionCount = countCorrectionStates(queue.map(([id, , , , , state]) => ({ id, state })), qaDecisions);
  const approvedCount = 22 + countApprovedDecisions(qaDecisions);
  const decide = (decision: QaDecision) => {
    setQaDecisions((current) => ({ ...current, [selectedQa[0]]: decision }));
    setNotice(`${selectedQa[0]}: cambio de estado simulado solo en esta sesión; no se modifica el registro de campo.`);
  };
  const toneForState = (state: string): Tone => state === "Aprobada" ? "ok" : state === "Corrección solicitada" || state === "Corrección" ? "warn" : "muted";

  return (
    <div className="red-app__screen">
      <section className="red-app__metrics">
        <article><span>Objetos por validar</span><strong>{pendingCount + 5}</strong><small>5 registros de campo · 4 documentos · cifras ficticias</small></article>
        <article><span>Correcciones en esta vista</span><strong>{correctionCount}</strong><small>Estado local de muestra</small></article>
        <article><span>Aclaraciones solicitadas</span><strong>03</strong><small>Ejemplo ilustrativo</small></article>
        <article><span>Aprobados en el periodo</span><strong>{approvedCount}</strong><small>Cifra ficticia</small></article>
        <article><span>Evidencias completas</span><strong>68 %</strong><small>Ejemplo · no corresponde a una operación real</small></article>
        <article><span>Bloqueos críticos</span><strong>01</strong><small>Estado ficticio de demostración</small></article>
      </section>
      <div className="red-app__qa-grid">
        <Panel>
          <PanelHead eyebrow="Cola de revisión · muestra" title="Objetos por validar" aside={<Status tone="warn">{pendingCount} en esta vista</Status>} />
          <p className="red-app__panel-intro">La cola prioriza por impacto en la decisión, no solo por fecha. Selecciona un objeto para revisar su fuente, alerta y evidencia antes de decidir.</p>
          <div className="red-app__queue">
            {queue.map(([id, object, origin, alert, person, state, fallbackTone]) => {
              const currentState = qaDecisions[id] ?? state;
              return (
                <button
                  type="button"
                  className={selectedQa[0] === id ? "is-selected" : undefined}
                  aria-pressed={selectedQa[0] === id}
                  key={id}
                  onClick={() => {
                    setSelectedQaId(id);
                    setNotice(`${id}: registro de muestra seleccionado para revisar fuente, evidencia, alerta y decisión siguiente.`);
                  }}
                >
                  <span>{id}</span>
                  <strong>{object}</strong>
                  <small>{origin} · {person}</small>
                  <em>{alert}</em>
                  <Status tone={toneForState(currentState) || fallbackTone as Tone}>{currentState}</Status>
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel className="red-app__qa-decision">
          <PanelHead eyebrow="Objeto en revisión · ficticio" title={selectedQa[1]} aside={<Status tone={toneForState(selectedState)}>{selectedState}</Status>} />
          <dl>
            <div><dt>Fuente</dt><dd>{selectedQa[2]}</dd></div>
            <div><dt>Responsable</dt><dd>{selectedQa[4]}</dd></div>
            <div><dt>Registro</dt><dd>{selectedQa[0] === "QA-108" ? "Bruto 184 kg · tara 36 kg" : "Registro recibido · pendiente de cotejo"}</dd></div>
            <div><dt>Evidencia</dt><dd>{selectedQa[0] === "QA-108" ? "3 fotografías · 1 planilla" : "Soporte relacionado en expediente"}</dd></div>
            <div><dt>Alerta</dt><dd>{selectedQa[3]}</dd></div>
          </dl>
          <div className="red-app__decision-buttons">
            <button type="button" onClick={() => decide("Aprobada")}>Simular aprobación</button>
            <button type="button" onClick={() => decide("Corrección solicitada")}>Simular solicitud de corrección</button>
            {selectedState !== "Por validar" && (
              <button type="button" className="red-app__decision-reset" onClick={() => {
                setQaDecisions((current) => {
                  const next = { ...current };
                  delete next[selectedQa[0]];
                  return next;
                });
                setNotice(`${selectedQa[0]}: decisión local restablecida a su estado ilustrativo.`);
              }}>
                Restablecer estado
              </button>
            )}
          </div>
          <p className="red-app__panel-footnote">Acciones efímeras en este navegador: no aprueban ni modifican datos de un municipio u organización.</p>
        </Panel>
      </div>
    </div>
  );
}

function Findings({ setNotice, selectedFindingId, setSelectedFindingId }: { setNotice: (message: string) => void; selectedFindingId: string; setSelectedFindingId: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visibleFindings = findings.filter((row) => {
    const matchesQuery = row.join(" ").toLocaleLowerCase("es").includes(normalizedQuery);
    const matchesPriority = priorityFilter === "all" || row[3] === priorityFilter;
    return matchesQuery && matchesPriority;
  });
  const selectedFinding = visibleFindings.find(([id]) => id === selectedFindingId) ?? visibleFindings[0] ?? findings[0];
  const selectFinding = (id: string) => { setSelectedFindingId(id); setNotice(`${id}: ficha contextual cargada con hecho, fuente, prioridad y decisión siguiente.`); };

  return <div className="red-app__screen">
    <section className="red-app__finding-intro"><div><span>HALLAZGOS · LECTURA EXPLICABLE</span><h2>Un hallazgo no es una opinión: es una observación con fuente, causa y decisión pendiente.</h2><p>Red permite separar el hecho observado de la interpretación del equipo. Así una prioridad puede discutirse, asignarse y convertirse en acción sin perder el registro que la originó.</p></div><div><strong>06</strong><small>hallazgos abiertos · ejemplo</small><Status tone="warn">1 alta prioridad · ficticio</Status></div></section>
    <Panel>
      <PanelHead eyebrow="Registro de hallazgos · muestra" title="Prioridades activas del proyecto" aside={<div className="red-app__finding-filters"><label className="red-app__search-label">Buscar en la muestra<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Código, hallazgo, fuente o estado" /></label><label className="red-app__search-label">Prioridad<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="all">Todas</option><option value="Alta">Alta</option><option value="Media">Media</option></select></label></div>} />
      <div className="red-app__finding-list">{visibleFindings.map(([id, title, category, priority, origin, state, tone]) => <button type="button" className={selectedFinding[0] === id ? "is-selected" : undefined} aria-pressed={selectedFinding[0] === id} key={id} onClick={() => selectFinding(id)}><div><span>{id}</span><Status tone={tone as Tone}>{priority}</Status></div><strong>{title}</strong><small>{category} · {origin}</small><b>{state} ↗</b></button>)}</div>
      {visibleFindings.length === 0 ? <p className="red-app__panel-intro">No hay hallazgos ficticios que coincidan con esa búsqueda y prioridad.</p> : null}
    </Panel>
    {visibleFindings.length > 0 ? <RecordInspector eyebrow="Hallazgo seleccionado · muestra" code={selectedFinding[0]} title={selectedFinding[1]} status={selectedFinding[5]} tone={selectedFinding[6] as Tone} summary={`${selectedFinding[2]} · ${selectedFinding[4]}. La observación conserva su fuente y abre una decisión trazable, sin presentarla como una causa ya demostrada.`} details={[["Prioridad", selectedFinding[3]], ["Origen", selectedFinding[4]], ["Estado", selectedFinding[5]], ["Siguiente paso", selectedFinding[0] === "H-021" ? "Revisar calidad en GEN-024" : "Abrir análisis del responsable"]]} relation="QA/QC · PMIRS STUDIO · Evidencias" action="Contrastar el hallazgo con su fuente y acordar la revisión siguiente" setNotice={setNotice} /> : null}
    <div className="red-app__two-col"><Panel><PanelHead eyebrow="Ficha de lectura" title="Qué debe explicar un hallazgo" /><div className="red-app__finding-chain">{[["Hecho", "Qué se observó y cuándo."], ["Fuente", "Qué registro o evidencia lo respalda."], ["Causa", "Qué hipótesis debe revisarse."], ["Decisión", "Qué acción, responsable o recurso sigue."]].map(([title, copy]) => <div key={title}><strong>{title}</strong><p>{copy}</p></div>)}</div></Panel><Panel className="red-app__accent-panel"><span>Regla de interpretación</span><h2>La causa se discute. La fuente se conserva.</h2><p>Un hallazgo puede cambiar de prioridad o cerrarse, pero la observación original y la decisión tomada deben seguir siendo consultables.</p></Panel></div>
  </div>;
}

function PmirsLive({ setNotice, selectedActionId, setSelectedActionId, liveUpdates, setLiveUpdates }: { setNotice: (message: string) => void; selectedActionId: string; setSelectedActionId: (id: string) => void; liveUpdates: Record<string, LiveUpdate>; setLiveUpdates: Dispatch<SetStateAction<Record<string, LiveUpdate>>> }) {
  const selectedAction = liveActions.find(([id]) => id === selectedActionId) ?? liveActions[0];
  const registerProgress = () => {
    const [id, , , , progress, state, , tone] = selectedAction;
    const current = liveUpdates[id]?.progress ?? Number.parseInt(progress, 10);
    const nextProgress = Math.min(100, current + 10);
    const nextState = nextProgress === 100 ? "Por cerrar" : state === "Bloqueada" ? "En curso" : "En curso";
    setLiveUpdates((updates) => ({ ...updates, [id]: { progress: nextProgress, state: nextState, tone: nextProgress === 100 ? "muted" : tone as Tone } }));
    setNotice(`${id}: avance simulado en ${nextProgress} %. En una operación real, el cierre requiere comentario, evidencia y fecha de revisión.`);
  };

  return <div className="red-app__screen"><section className="red-app__live-intro"><div><span>SEGUIMIENTO DEL PMIRS · IMPLEMENTACIÓN</span><h2>El plan deja de ser documento cuando cada acción tiene dueño, fecha y evidencia.</h2><p>Esta vista sigue la ejecución del PMIRS: qué está en curso, qué se bloqueó, qué debe cerrarse y qué decisión necesita la coordinación. El avance siempre conserva el programa y el hallazgo de origen.</p></div><div><strong>32 %</strong><small>avance de ejemplo · ficticio</small><Status tone="warn">2 bloqueos de muestra</Status></div></section><Panel><PanelHead eyebrow="Tablero de implementación · muestra" title="Acciones que requieren seguimiento" aside={<button type="button" onClick={registerProgress}>Simular avance +10 %</button>} /><p className="red-app__panel-intro">Selecciona una acción y prueba el aumento local de avance. El cambio se pierde al salir de esta sesión; no actualiza un PMIRS real.</p><div className="red-app__live-table"><div className="red-app__live-table-head"><span>Acción</span><span>Responsable</span><span>Avance</span><span>Estado</span><span>Entrega</span></div>{liveActions.map(([id, title, program, owner, progress, state, due, fallbackTone]) => { const update = liveUpdates[id]; const currentProgress = update?.progress ?? Number.parseInt(progress, 10); const currentState = update?.state ?? state; const currentTone = update?.tone ?? fallbackTone as Tone; return <button type="button" className={selectedActionId === id ? "is-selected" : undefined} aria-pressed={selectedActionId === id} key={id} onClick={() => { setSelectedActionId(id); setNotice(`${id}: seguimiento de muestra seleccionado. El botón “Simular avance” cambia solo este estado temporal.`); }}><div><strong>{id} · {title}</strong><small>{program} · dato ficticio</small></div><span>{owner}</span><b>{currentProgress} %</b><Status tone={currentTone}>{currentState}</Status><time>{due}</time></button>; })}</div><p className="red-app__selection-note"><b>Acción seleccionada:</b> {selectedAction[0]} · {selectedAction[1]} · cambios locales no persistentes</p></Panel><div className="red-app__two-col"><Panel><PanelHead eyebrow="Cadencia de seguimiento" title="Una acción se cierra con evidencia" /><ol className="red-app__follow-up"><li><span>01</span><div><strong>Asignar</strong><p>Responsable, alcance y fecha de compromiso.</p></div></li><li><span>02</span><div><strong>Ejecutar</strong><p>Actividad, novedad, recurso y soporte.</p></div></li><li><span>03</span><div><strong>Revisar</strong><p>Resultado observado y criterio de cierre.</p></div></li><li><span>04</span><div><strong>Aprender</strong><p>Ajuste de meta, programa o siguiente ciclo.</p></div></li></ol></Panel><Panel className="red-app__dark-panel"><span>Conexión con OPS</span><h2>Red define la intervención. OPS puede demostrar la operación.</h2><p>Cuando una acción PMIRS depende de una planta, una recepción, un lote o un equipo, la integración futura debe traer una referencia autorizada y conservar su fuente.</p></Panel></div></div>;
}

function Pmirs({ setNotice, setView, selectedActionId, setSelectedActionId }: { setNotice: (message: string) => void; setView: (view: ViewId) => void; selectedActionId: string; setSelectedActionId: (id: string) => void }) {
  const selectedAction = liveActions.find(([id]) => id === selectedActionId) ?? liveActions[0];
  const selectAction = (id: string) => { setSelectedActionId(id); setNotice(`${id}: ficha de acción cargada con programa, responsable, meta y evidencia esperada.`); };
  return <div className="red-app__screen">
    <section className="red-app__pmirs-hero"><div><span>FORMULACIÓN Y SEGUIMIENTO DEL PMIRS</span><h2>Convertir hallazgos en programas, acciones e indicadores.</h2><p>La formulación empieza cuando la línea base tiene el nivel de revisión necesario. Cada acción conserva problema, responsable, meta, fecha, recurso, evidencia y estado.</p></div><div><strong>03</strong><small>programas activos</small><b>22 acciones</b></div></section>
    <div className="red-app__program-grid">{programs.map(([id, title, count, status, copy, progress]) => <button type="button" className="red-app__program-card" key={id} onClick={() => { const relatedAction = id === "P-01" ? "A-014" : id === "P-02" ? "A-015" : "A-016"; setSelectedActionId(relatedAction); setView("pmirs-live"); setNotice(`${id}: abrimos el seguimiento de muestra asociado a “${title}”.`); }}><span>{id} · MUESTRA</span><h3>{title}</h3><p>{copy}</p><div><strong>{progress}%</strong><small>{count} · {status}</small></div><i><b style={{ width: `${progress}%` }} /></i></button>)}</div>
    <Panel><PanelHead eyebrow="Constructor de acciones · recorrido" title="Trabajo listo para coordinar" aside={<small>El alta real requiere un entorno organizacional.</small>} /><div className="red-app__action-list">{liveActions.slice(0, 3).map(([id, title, program, owner, progress, state, , tone]) => <button type="button" className={selectedAction[0] === id ? "is-selected" : undefined} aria-pressed={selectedAction[0] === id} key={id} onClick={() => selectAction(id)}><span>{id}</span><div><strong>{title}</strong><small>{program} · {owner}</small></div><Status tone={tone as Tone}>{state} · {progress}</Status><b>↗</b></button>)}</div></Panel>
    <RecordInspector eyebrow="Acción seleccionada" code={selectedAction[0]} title={selectedAction[1]} status={selectedAction[5]} tone={selectedAction[7] as Tone} summary={`Acción del ${selectedAction[2]} a cargo de ${selectedAction[3]}. Su avance debe explicar qué cambió, qué soporte lo demuestra y qué bloqueo permanece.`} details={[["Programa", selectedAction[2]], ["Responsable", selectedAction[3]], ["Avance", selectedAction[4]], ["Entrega", selectedAction[6]]]} relation="Hallazgos · Indicadores · Evidencias" action="Revisar el avance, la evidencia y los bloqueos de esta acción" setNotice={setNotice} />
  </div>;
}

function Indicators() {
  return (
    <div className="red-app__screen">
      <section className="red-app__indicator-intro">
        <div>
          <span>INDICADORES · CORTE DE MUESTRA</span>
          <h2>Medir para decidir, no para llenar un tablero.</h2>
          <p>Cada indicador debe declarar qué mide, sobre qué universo, con qué periodo, qué fuente lo alimenta y qué nivel de validación tiene. Un porcentaje sin denominador no es una línea base.</p>
        </div>
        <div><strong>Junio 2026</strong><small>Fecha ficticia de demostración</small><Status tone="muted">Cifras ilustrativas</Status></div>
      </section>
      <div className="red-app__indicator-grid">
        {indicators.map(([title, value, state, note]) => (
          <article key={title}>
            <span>{title}</span>
            <strong>{value}</strong>
            <Status tone={state.includes("requiere") ? "warn" : "muted"}>{state}</Status>
            <p>{note}</p>
            <b>Ficha de lectura ilustrativa</b>
          </article>
        ))}
      </div>
      <div className="red-app__two-col">
        <Panel>
          <PanelHead eyebrow="Cadena de cálculo" title="De la fuente al indicador" />
          <div className="red-app__lineage">
            {[["01", "Fuente", "Registro de campo, planilla, acta o sistema de operación."], ["02", "Regla", "Unidad, filtro, periodo, universo y fórmula documentados."], ["03", "Revisión", "Registros aprobados en la revisión de datos o exclusiones explicadas."], ["04", "Resultado", "Valor contextualizado para gestión o comunicación."]].map(([code, title, copy]) => (
              <div key={code}><span>{code}</span><div><strong>{title}</strong><p>{copy}</p></div></div>
            ))}
          </div>
        </Panel>
        <Panel className="red-app__accent-panel">
          <span>Comunicación pública</span>
          <h2>Un indicador orienta. Un caso con evidencia demuestra.</h2>
          <p>Red distingue una lectura interna del resultado de un proyecto. Para comunicarlo, conserva el alcance, el periodo, el método y el soporte que permiten explicar qué demuestra cada cifra.</p>
        </Panel>
      </div>
    </div>
  );
}

function Evidence({ setNotice, selectedEvidenceId, setSelectedEvidenceId }: { setNotice: (message: string) => void; selectedEvidenceId: string; setSelectedEvidenceId: (id: string) => void }) {
  const selectedEvidence = evidence.find(([id]) => id === selectedEvidenceId) ?? evidence[0];
  const selectEvidence = (id: string) => { setSelectedEvidenceId(id); setNotice(`${id}: ficha contextual cargada con soporte, metadatos, estado y objeto origen.`); };
  return (
    <div className="red-app__screen">
      <section className="red-app__evidence-hero">
        <div>
          <span>EVIDENCIAS · EXPEDIENTE DE MUESTRA</span>
          <h2>La evidencia no es un archivo suelto: es la prueba de una decisión.</h2>
          <p>Fotografías, actas, planillas, mapas y reportes se relacionan con el proyecto, la visita, el generador, la ruta o la acción que explican.</p>
        </div>
        <div><strong>84</strong><small>soportes de ejemplo</small><Status tone="muted">Datos ficticios</Status></div>
      </section>
      <Panel>
        <PanelHead eyebrow="Repositorio contextual" title="Evidencias recientes" />
        <div className="red-app__evidence-grid">
          {evidence.map(([id, title, origin, date, detail, state, tone]) => (
            <button type="button" className={selectedEvidence[0] === id ? "is-selected" : undefined} aria-pressed={selectedEvidence[0] === id} key={id} onClick={() => selectEvidence(id)}>
              <div><span>{id}</span><Status tone={tone as Tone}>{state}</Status></div>
              <h3>{title}</h3><p>{origin}</p><small>{date} · {detail}</small><b>Consultar ficha del soporte</b>
            </button>
          ))}
        </div>
      </Panel>
      <RecordInspector
        eyebrow="Evidencia seleccionada"
        code={selectedEvidence[0]}
        title={selectedEvidence[1]}
        status={selectedEvidence[5]}
        tone={selectedEvidence[6] as Tone}
        summary={`${selectedEvidence[2]} · ${selectedEvidence[4]}. El soporte debe explicar qué decisión respalda y bajo qué versión puede consultarse.`}
        details={[["Fecha", selectedEvidence[3]], ["Tipo", selectedEvidence[4].split(" · ")[0]], ["Estado", selectedEvidence[5]], ["Acceso", "Proyecto DEMO-RED · equipo ilustrativo"]]}
        relation="FIELD · QA/QC · PMIRS VIVO"
        action="Relacionar el soporte con el registro que respalda"
        setNotice={setNotice}
      />
      <div className="red-app__two-col">
        <Panel>
          <PanelHead eyebrow="Metadatos mínimos" title="Qué debe acompañar cada soporte" />
          <ul className="red-app__check-list">
            <li><b>Objeto origen</b><span>La evidencia debe explicar qué registro, hallazgo o acción respalda.</span></li>
            <li><b>Autoría y fecha</b><span>Quién la produjo, cuándo y desde qué contexto.</span></li>
            <li><b>Estado</b><span>Borrador, recibido, revisado, aprobado o rechazado.</span></li>
            <li><b>Acceso</b><span>Qué organización, rol o equipo puede verla y descargarla.</span></li>
          </ul>
        </Panel>
        <Panel className="red-app__dark-panel">
          <span>Expediente de muestra</span>
          <h2>Un tercero debe poder reconstruir la decisión.</h2>
          <p>La trazabilidad permite volver del resultado a la acción, de la acción al hallazgo y del hallazgo a la fuente que lo originó.</p>
        </Panel>
      </div>
    </div>
  );
}

function Coord({ setNotice }: { setNotice: (message: string) => void }) {
  const [selectedCoordId, setSelectedCoordId] = useState("coord-0");
  const selectedCoord = coordinationItems[Number(selectedCoordId.replace("coord-", ""))] ?? coordinationItems[0];
  return (
    <div className="red-app__screen">
      <section className="red-app__metrics" aria-label="Indicadores ilustrativos de coordinación">
        <article><span>Solicitudes de coordinación</span><strong>04</strong><small>Ejemplo · hilos abiertos</small></article>
        <article><span>Fechas próximas</span><strong>02</strong><small>Ejemplo · siguientes 48 horas</small></article>
        <article><span>Elementos por validar</span><strong>09</strong><small>Ejemplo · cola de revisión</small></article>
        <article><span>Incidencias de muestra</span><strong>01</strong><small>Ejemplo · bloqueo de línea base</small></article>
        <article><span>Roles del escenario</span><strong>11</strong><small>Municipio, ESP y equipo ficticios</small></article>
        <article><span>Decisiones ilustrativas</span><strong>07</strong><small>Este ejemplo no guarda historial</small></article>
      </section>
      <p className="red-app__panel-footnote">Los registros de esta vista son ficticios. Seleccionar un hilo solo actualiza el detalle local; no envía mensajes ni crea tareas.</p>
      <Panel>
        <PanelHead eyebrow="Centro de coordinación · ejemplo" title="Relacionar una conversación con el trabajo." aside={<small>Diseño de flujo, no servicio conectado</small>} />
        <div className="red-app__coord-list">
          {coordinationItems.map(([type, title, owner, due, module], index) => (
            <button
              type="button"
              className={selectedCoordId === `coord-${index}` ? "is-selected" : undefined}
              aria-pressed={selectedCoordId === `coord-${index}`}
              key={title}
              onClick={() => {
                setSelectedCoordId(`coord-${index}`);
                setNotice(`${type}: hilo de muestra seleccionado con objeto origen, responsable, fecha objetivo y módulo ${module}.`);
              }}
            >
              <span>{type}</span><strong>{title}</strong><small>{owner} · {module}</small><b>{due}</b>
            </button>
          ))}
        </div>
      </Panel>
      <RecordInspector
        eyebrow="Hilo seleccionado · muestra"
        code={`COORD-${selectedCoordId.replace("coord-", "")}`}
        title={selectedCoord[1]}
        status={selectedCoord[0]}
        tone={selectedCoord[0] === "Incidencia" ? "warn" : "muted"}
        summary={selectedCoord[5]}
        details={[["Tipo", selectedCoord[0]], ["Responsable de ejemplo", selectedCoord[2]], ["Fecha ilustrativa", selectedCoord[3]], ["Módulo relacionado", selectedCoord[4]]]}
        relation="Proyecto 360 · FIELD · QA/QC · PMIRS"
        action="Confirmar responsable y fecha de respuesta"
        setNotice={setNotice}
      />
      <Panel className="red-app__coord-rule">
        <span>Flujo conceptual</span>
        <h2>Notificar no reemplaza el registro de la decisión.</h2>
        <p>Según el proyecto y los conectores habilitados, una notificación puede llegar por email o WhatsApp. El sistema debe conservar la solicitud, su objeto relacionado, responsable y decisión; esta demostración no envía mensajes ni mantiene ese historial.</p>
        <div className="red-app__state-pills"><span>Solicitud</span><span>Tarea</span><span>Incidencia</span><span>Decisión</span></div>
      </Panel>
    </div>
  );
}
