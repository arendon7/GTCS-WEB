"use client";

import { useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import "./red-app-v4.css";

type ViewId = "overview" | "territory" | "generators" | "routes" | "field" | "qa" | "findings" | "pmirs" | "pmirs-live" | "indicators" | "evidence" | "coord";
type Tone = "ok" | "warn" | "muted" | "critical";
type QaDecision = "Por validar" | "Aprobada" | "Corrección solicitada";
type LiveUpdate = { progress: number; state: string; tone: Tone };
type NavigationItem = { id: ViewId; code: string; label: string; detail: string; group: string };

const navigation: NavigationItem[] = [
  { id: "overview", code: "01", label: "Proyecto 360", detail: "Resumen y siguiente acción", group: "Dirección" },
  { id: "territory", code: "02", label: "Territorio", detail: "Contexto y diagnóstico", group: "Dirección" },
  { id: "generators", code: "03", label: "Generadores", detail: "Usuarios, actores y fuentes", group: "Operación territorial" },
  { id: "routes", code: "04", label: "Rutas", detail: "Cobertura y microrrutas", group: "Operación territorial" },
  { id: "field", code: "05", label: "FIELD", detail: "Visitas y captura móvil", group: "Trabajo de campo" },
  { id: "qa", code: "06", label: "QA/QC", detail: "Cola de revisión", group: "Trabajo de campo" },
  { id: "findings", code: "07", label: "Hallazgos", detail: "Prioridades y causas", group: "Planeación" },
  { id: "pmirs", code: "08", label: "PMIRS STUDIO", detail: "Programas y acciones", group: "Planeación" },
  { id: "pmirs-live", code: "09", label: "PMIRS VIVO", detail: "Implementación y avance", group: "Planeación" },
  { id: "indicators", code: "10", label: "Indicadores", detail: "Metas y desempeño", group: "Planeación" },
  { id: "evidence", code: "11", label: "Evidencias", detail: "Soportes y trazabilidad", group: "Gobierno del dato" },
  { id: "coord", code: "12", label: "Coordinación", detail: "Responsables y alertas", group: "Gobierno del dato" },
];

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
  ["04", "QA/QC", "9 por revisar", "22/31", 71],
  ["05", "Línea base", "Borrador controlado", "05/08", 48],
  ["06", "PMIRS", "Implementación inicial", "07/22", 32],
] as const;

const recentActivity = [
  ["14:20", "QA/QC", "Se solicitó aclaración sobre pesaje de la jornada 04", "Por revisar"],
  ["12:05", "FIELD", "Se cerró visita de infraestructura en sector La Bomba", "Registrado"],
  ["10:40", "Rutas", "La microrruta selectiva 02 completó su ciclo sin novedad crítica", "Registrado"],
  ["09:15", "Proyecto 360", "Se actualizó responsable del diagnóstico municipal", "Validado"],
] as const;

const generators = [
  ["GEN-018", "Plaza de mercado", "La 50", "Orgánico", "18,4 t/mes", "Caracterizado", "ok"],
  ["GEN-024", "Restaurante", "Centro", "Orgánico + impropios", "4,2 t/mes", "Por verificar", "warn"],
  ["GEN-031", "Institución educativa", "Niquía", "Mixto", "2,1 t/mes", "Registrado", "muted"],
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
  ["QA-104", "Registro de infraestructura", "FIELD · GEN-031", "Falta fotografía de acceso", "Juan O.", "Aclaración", "muted"],
  ["QA-099", "Caracterización de orgánicos", "GEN-024", "Separar muestra e impropios", "María G.", "Corrección", "warn"],
  ["QA-096", "Acta de visita", "FIELD · La Bomba", "Firma de responsable", "Laura R.", "Por validar", "muted"],
] as const;

const programs = [
  ["P-01", "Separación en la fuente", "12 acciones", "7 en curso", "Reducir impropios y mejorar la calidad del material", 58],
  ["P-02", "Recolección diferenciada", "06 acciones", "2 en curso", "Ajustar cobertura, frecuencia y reglas de entrega", 31],
  ["P-03", "Aprovechamiento y tratamiento", "04 acciones", "1 en diseño", "Conectar volumen, calidad, destino y capacidad instalada", 18],
] as const;

const findings = [
  ["H-021", "Alta presencia de impropios en R-02", "Calidad", "Alta", "QA-099 · GEN-024", "Abierto", "warn"],
  ["H-018", "Cobertura incompleta en jornada nocturna", "Logística", "Media", "R-02 · FIELD 04", "En análisis", "muted"],
  ["H-014", "Medición de capacidad de recepción", "Infraestructura", "Alta", "EV-199 · P-03", "Con decisión", "warn"],
  ["H-009", "Acuerdos de entrega sin versión común", "Gobernanza", "Media", "EV-207 · P-01", "Resuelto", "ok"],
] as const;

const liveActions = [
  ["A-014", "Reducir impropios en la fuente", "P-01", "Administración PH", "58 %", "En curso", "11 jun", "ok"],
  ["A-015", "Ajustar ventana de R-02", "P-02", "ECO ABURRÁ", "30 %", "Bloqueada", "12 jun", "warn"],
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
  ["EV-221", "Fotografía de punto de almacenamiento", "GEN-031 · FIELD", "11 jun 2026", "Imagen · georreferencia · Laura R.", "Validada", "ok"],
  ["EV-218", "Planilla de pesaje jornada 04", "R-02 · QA/QC", "10 jun 2026", "Documento · 3 registros", "Unidad no registrada", "warn"],
  ["EV-207", "Acta de acuerdo con generadores", "P-01 · PMIRS", "08 jun 2026", "PDF · 6 firmas", "Validada", "ok"],
  ["EV-199", "Croquis de cobertura piloto", "R-03 · Territorio", "05 jun 2026", "Mapa · versión 02", "Borrador", "muted"],
] as const;

const coordinationItems = [
  ["Solicitud de información", "Confirmar horario de visita", "Administración PH", "Hoy", "FIELD", "Solicitar confirmación de ventana y responsable antes de cerrar la jornada."],
  ["Corrección QA", "Soporte de pesaje jornada 04", "María G.", "Mañana", "QA/QC", "Completar unidad y soporte para que la muestra pueda entrar a la línea base."],
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
  ["06", "Cierre", "Firma y resumen de jornada", "Pendiente", "warn", "Cerrar con resumen, firma, pendientes y responsable de QA/QC."],
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
  const [notice, setNotice] = useState("El contexto del proyecto acompaña cada registro.");
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

  const selectView = (nextView: ViewId) => {
    setView(nextView);
    const next = navigation.find((item) => item.id === nextView);
    setNotice(`${next?.label}: vista de demostración cargada. Los cambios no se guardan en este entorno.`);
  };

  return <div className="red-app">
    <header className="red-app__topbar">
      <Link className="red-app__brand" href="/red/"><span aria-hidden="true">G</span><div><strong>GREENATICS</strong><small>RED · Espacio de trabajo</small></div></Link>
      <div className="red-app__topbar-context"><span>Proyecto activo</span><strong>RED-024 · Támesis</strong><small>Diagnóstico territorial · 2026</small></div>
      <div className="red-app__topbar-meta"><Status tone="muted">Estación demo</Status><span>Datos ilustrativos</span><Link className="red-app__site-link" href="/plataforma/usuarios/">Usuarios y permisos</Link><Link className="red-app__site-link" href="/" aria-label="Volver al sitio Greenatics">Volver a Greenatics</Link></div>
    </header>

    <div className="red-app__body">
      <aside className="red-app__rail" aria-label="Módulos de GREENATICS Red">
        <div className="red-app__context"><span>Contexto de trabajo</span><strong>Támesis</strong><small>Antioquia · Área urbana y rural priorizada</small><button type="button" onClick={() => setNotice("Selector de contexto: en producción permitiría cambiar organización, municipio, proyecto y periodo con permisos.")}>Cambiar contexto <b>⌄</b></button></div>
        <nav aria-label="Módulos de la aplicación">
          {["Dirección", "Operación territorial", "Trabajo de campo", "Planeación", "Gobierno del dato"].map((group) => <div className="red-app__nav-group" key={group}><span>{group}</span>{navigation.filter((item) => item.group === group).map((item) => <button type="button" key={item.id} className={view === item.id ? "is-active" : undefined} aria-current={view === item.id ? "page" : undefined} onClick={() => selectView(item.id)}><b>{item.code}</b><div><strong>{item.label}</strong><small>{item.detail}</small></div></button>)}</div>)}
        </nav>
        <div className="red-app__rail-note"><i /><div><strong>Estados protegidos</strong><span>RAW no es VALIDATED. Cada estado conserva fuente, actor, fecha y motivo.</span></div></div>
      </aside>

      <section className="red-app__workspace" aria-label="Área de trabajo de GREENATICS Red">
        <div className="red-app__workspace-head"><div><span>GREENATICS Red / {activeItem.label}</span><h1>{view === "overview" ? "Resumen de proyecto" : activeItem.label}</h1><p>{view === "overview" ? "Una lectura ejecutiva del territorio, el trabajo de campo y el avance hacia un PMIRS implementable." : activeItem.detail}</p></div><div className="red-app__head-actions"><button type="button" className="red-app__secondary" onClick={() => setNotice("Exportación demostrativa: en producción reuniría datos visibles, filtros, fuentes y versión del corte.")}>Exportar corte</button><button type="button" className="red-app__primary" onClick={() => setNotice(`Nueva acción vinculada a ${activeItem.label}: en producción conservaría responsable, objeto de origen y fecha objetivo.`)}>+ Nueva acción</button></div></div>
        <p className="red-app__notice" aria-live="polite"><b>Modo demostración</b> {notice}</p>

        {view === "overview" && <Overview setNotice={setNotice} />}
        {view === "territory" && <Territory setNotice={setNotice} />}
        {view === "generators" && <Generators setNotice={setNotice} selectedGeneratorId={selectedGeneratorId} setSelectedGeneratorId={setSelectedGeneratorId} />}
        {view === "routes" && <Routes setNotice={setNotice} selectedRouteId={selectedRouteId} setSelectedRouteId={setSelectedRouteId} />}
        {view === "field" && <Field setNotice={setNotice} selectedFieldStepId={selectedFieldStepId} setSelectedFieldStepId={setSelectedFieldStepId} />}
        {view === "qa" && <Qa setNotice={setNotice} selectedQaId={selectedQaId} setSelectedQaId={setSelectedQaId} qaDecisions={qaDecisions} setQaDecisions={setQaDecisions} />}
        {view === "findings" && <Findings setNotice={setNotice} selectedFindingId={selectedFindingId} setSelectedFindingId={setSelectedFindingId} />}
        {view === "pmirs" && <Pmirs setNotice={setNotice} selectedActionId={selectedActionId} setSelectedActionId={setSelectedActionId} />}
        {view === "pmirs-live" && <PmirsLive setNotice={setNotice} selectedActionId={selectedActionId} setSelectedActionId={setSelectedActionId} liveUpdates={liveUpdates} setLiveUpdates={setLiveUpdates} />}
        {view === "indicators" && <Indicators setNotice={setNotice} />}
        {view === "evidence" && <Evidence setNotice={setNotice} selectedEvidenceId={selectedEvidenceId} setSelectedEvidenceId={setSelectedEvidenceId} />}
        {view === "coord" && <Coord setNotice={setNotice} />}
      </section>
    </div>
  </div>;
}

function Overview({ setNotice }: { setNotice: (message: string) => void }) {
  return <div className="red-app__screen"><MetricGrid /><div className="red-app__overview-grid"><Panel className="red-app__next"><div className="red-app__panel-head"><div><span>Siguiente decisión</span><h2>Validar la jornada 04 antes de cerrar la línea base.</h2></div><Status tone="warn">Prioridad alta</Status></div><p>Hay dos pesajes que todavía no pueden compararse porque falta confirmar la unidad y un soporte fotográfico. Resolverlo evita que una muestra preliminar entre como dato consolidado.</p><button type="button" onClick={() => setNotice("QA-108 seleccionado: revisar unidad, soporte y decisión antes de aprobar la jornada 04.")}>Abrir cola de revisión ↗</button></Panel><Panel><PanelHead eyebrow="Calidad del dato" title="Estado de la evidencia" aside={<Status tone="warn">9 alertas</Status>} /><div className="red-app__state-bars"><div><span>Registrado</span><strong>126</strong><i><b style={{ width: "100%" }} /></i></div><div><span>Validado</span><strong>84</strong><i><b style={{ width: "67%" }} /></i></div><div><span>Interpretado</span><strong>32</strong><i><b style={{ width: "25%" }} /></i></div><div><span>Derivado</span><strong>7</strong><i><b style={{ width: "8%" }} /></i></div></div><p className="red-app__panel-footnote">Los estados no son una escala de confianza automática: indican qué revisión recibió cada objeto.</p></Panel></div><Panel><PanelHead eyebrow="Progreso por hitos" title="Del diagnóstico al PMIRS vivo" aside={<small>El porcentaje acompaña el trabajo, no lo sustituye.</small>} /><ol className="red-app__steps">{projectStages.map(([code, title, state, count, progress]) => <li key={code}><span>{code}</span><div><strong>{title}</strong><small>{state}</small></div><b>{count}</b><i><em style={{ width: `${progress}%` }} /></i></li>)}</ol></Panel><Panel><PanelHead eyebrow="Actividad reciente" title="Qué cambió en el proyecto" aside={<small>Últimos eventos trazables</small>} /><div className="red-app__timeline">{recentActivity.map(([time, type, copy, state]) => <button type="button" key={`${time}-${type}`} onClick={() => setNotice(`${type}: evento seleccionado. En producción abriría el objeto origen y su historial.`)}><time>{time}</time><i /><div><strong>{copy}</strong><small>{type} · RED-024 · {state}</small></div><b>↗</b></button>)}</div></Panel></div>;
}

function Territory({ setNotice }: { setNotice: (message: string) => void }) {
  const [selectedLayerId, setSelectedLayerId] = useState("03");
  const selectedLayer = territoryLayers.find(([code]) => code === selectedLayerId) ?? territoryLayers[0];
  const selectLayer = (id: string) => { setSelectedLayerId(id); setNotice(`${id}: capa territorial cargada con fuentes y objetos relacionados.`); };
  return <div className="red-app__screen">
    <section className="red-app__territory-hero"><div><span>PROYECTO 360 · CONTEXTO TERRITORIAL</span><h2>Una línea base que explica dónde ocurre el problema y qué decisión sigue.</h2><p>Red organiza municipio, actores, infraestructura, flujos, restricciones y fuentes antes de convertirlos en una cifra o una acción. El objetivo no es solo mapear: es hacer visible el contexto que cambia la decisión.</p></div><div className="red-app__territory-stamp"><strong>18</strong><span>unidades priorizadas</span><small>14 con registro inicial</small></div></section>
    <div className="red-app__territory-grid"><Panel><PanelHead eyebrow="Ficha territorial" title="Támesis · Antioquia" aside={<Status>Contexto activo</Status>} /><dl className="red-app__detail-list"><div><dt>Alcance</dt><dd>Área urbana y veredas priorizadas</dd></div><div><dt>Periodo de lectura</dt><dd>Enero a junio de 2026</dd></div><div><dt>Decisión</dt><dd>Diseñar un sistema de aprovechamiento con rutas y capacidad instalada</dd></div><div><dt>Fuentes</dt><dd>Visitas FIELD, registros de generadores, documentos y acuerdos</dd></div></dl></Panel><Panel><PanelHead eyebrow="Mapa de trabajo" title="Capas que deben conversar" /><div className="red-app__layer-list">{territoryLayers.map(([code, title, copy]) => <button type="button" className={selectedLayer[0] === code ? "is-selected" : undefined} aria-pressed={selectedLayer[0] === code} key={code} onClick={() => selectLayer(code)}><span>{code}</span><div><strong>{title}</strong><small>{copy}</small></div><b>↗</b></button>)}</div></Panel></div>
    <RecordInspector eyebrow="Capa seleccionada" code={`CAPA-${selectedLayer[0]}`} title={selectedLayer[1]} status="Contexto activo" tone="ok" summary={selectedLayer[2]} details={[["Objetos", selectedLayer[3]], ["Proyecto", "RED-024 · Támesis"], ["Periodo", "Enero a junio de 2026"], ["Siguiente lectura", selectedLayer[0] === "03" ? "Validar capacidad instalada" : "Cruzar fuentes de trabajo"]]} relation="Proyecto 360 · Generadores · Rutas · FIELD" action="Abrir capa completa" setNotice={setNotice} />
    <Panel><PanelHead eyebrow="Preguntas abiertas" title="Lo que todavía requiere trabajo territorial" aside={<Status tone="warn">3 pendientes</Status>} /><div className="red-app__question-grid">{[["01", "¿Cuál es el universo completo de generadores?", "Falta cerrar el cruce entre directorio y recorrido de campo."], ["02", "¿Qué calidad llega a cada ventana de recolección?", "Se requieren muestras comparables por sector y jornada."], ["03", "¿Qué capacidad debe reservarse para el destino?", "La salida define requisitos de volumen, mezcla y control."]].map(([code, title, copy]) => <article key={code}><span>{code}</span><h3>{title}</h3><p>{copy}</p><button type="button" onClick={() => setNotice(`Pregunta ${code} convertida en tarea de diagnóstico.`)}>Convertir en tarea</button></article>)}</div></Panel>
  </div>;
}

function RecordInspector({ eyebrow, code, title, status, tone, summary, details, relation, action, setNotice }: { eyebrow: string; code: string; title: string; status: string; tone: Tone; summary: string; details: Array<readonly [string, string]>; relation: string; action: string; setNotice: (message: string) => void }) {
  return <Panel className="red-app__record-inspector"><div className="red-app__inspector-main"><span>{eyebrow} · {code}</span><h2>{title}</h2><p>{summary}</p></div><div className="red-app__inspector-details">{details.map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div><div className="red-app__inspector-footer"><span><b>Relacionado con</b> {relation}</span><Status tone={tone}>{status}</Status><button type="button" onClick={() => setNotice(`${code}: ${action} seleccionado. En producción abriría el flujo con permisos y objeto origen.`)}>{action} ↗</button></div></Panel>;
}

function Generators({ setNotice, selectedGeneratorId, setSelectedGeneratorId }: { setNotice: (message: string) => void; selectedGeneratorId: string; setSelectedGeneratorId: (id: string) => void }) {
  const selectedGenerator = generators.find(([id]) => id === selectedGeneratorId) ?? generators[0];
  const selectGenerator = (id: string) => { setSelectedGeneratorId(id); setNotice(`${id}: ficha contextual cargada con fuente, volumen, estado y relación operativa.`); };
  return <div className="red-app__screen"><MetricGrid /><Panel><PanelHead eyebrow="Directorio territorial" title="Generadores y unidades de gestión" aside={<><button type="button" className="red-app__small-button" onClick={() => setNotice("Nuevo generador: en producción abriría un formulario con ubicación, contacto, corriente, acuerdo y evidencia.")}>+ Agregar generador</button><button type="button" className="red-app__filter-button" onClick={() => setNotice("Filtros demostrativos: sector, corriente, estado de caracterización y ruta.")}>Filtrar</button></>} /><p className="red-app__panel-intro">El generador no es solo un punto en el mapa. Es una fuente con responsable, corriente, frecuencia, capacidad de entrega, reglas de calidad y relación con una ruta.</p><div className="red-app__table-wrap"><table className="red-app__table"><thead><tr><th>ID</th><th>Tipo y sector</th><th>Corriente</th><th>Volumen estimado</th><th>Estado</th></tr></thead><tbody>{generators.map(([id, type, sector, stream, volume, state, tone]) => <tr key={id} className={selectedGeneratorId === id ? "is-selected" : undefined} tabIndex={0} aria-selected={selectedGeneratorId === id} aria-label={`Seleccionar ${id}: ${type}, ${state}`} onClick={() => selectGenerator(id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectGenerator(id); } }}><td><strong>{id}</strong></td><td><strong>{type}</strong><small>{sector}</small></td><td>{stream}</td><td>{volume}</td><td><Status tone={tone as Tone}>{state}</Status></td></tr>)}</tbody></table></div></Panel><RecordInspector eyebrow="Generador seleccionado" code={selectedGenerator[0]} title={selectedGenerator[1]} status={selectedGenerator[5]} tone={selectedGenerator[6] as Tone} summary={`Fuente ${selectedGenerator[3].toLowerCase()} ubicada en ${selectedGenerator[2]}. La ficha conecta caracterización, acuerdo de entrega, ruta y evidencia.`} details={[["Volumen estimado", selectedGenerator[4]], ["Corriente", selectedGenerator[3]], ["Sector", selectedGenerator[2]], ["Próxima revisión", selectedGenerator[0] === "GEN-024" ? "Separar muestra e impropios" : "Confirmar ficha de campo"]]} relation="Rutas · FIELD · Evidencias" action="Abrir ficha completa" setNotice={setNotice} /><div className="red-app__two-col"><Panel><PanelHead eyebrow="Calidad de caracterización" title="Qué debe quedar en la ficha" /><ul className="red-app__check-list"><li><b>Origen</b><span>Tipo de actividad, ubicación y responsable de entrega.</span></li><li><b>Corriente</b><span>Orgánico, reciclable, rechazo, poda u otra corriente definida.</span></li><li><b>Medición</b><span>Volumen, peso, periodo, método y unidad claramente registrados.</span></li><li><b>Acuerdo</b><span>Ventana de entrega, recipiente, calidad mínima y novedad.</span></li></ul></Panel><Panel className="red-app__accent-panel"><span>Regla de diseño</span><h2>El mapa muestra el punto. La ficha explica la relación.</h2><p>La ruta solo puede diseñarse bien cuando se conoce el comportamiento del generador y el destino que recibirá el material.</p></Panel></div></div>;
}

function Routes({ setNotice, selectedRouteId, setSelectedRouteId }: { setNotice: (message: string) => void; selectedRouteId: string; setSelectedRouteId: (id: string) => void }) {
  const selectedRoute = routes.find(([id]) => id === selectedRouteId) ?? routes[0];
  const selectRoute = (id: string) => { setSelectedRouteId(id); setNotice(`${id}: ficha de recorrido cargada con cobertura, ciclo, frecuencia y destino.`); };
  return <div className="red-app__screen">
    <section className="red-app__route-summary"><div><span>RUTAS · DISEÑO Y SEGUIMIENTO</span><h2>Una microrruta eficiente es un acuerdo operativo medible.</h2><p>Red relaciona generadores, horarios, recipiente, vehículo, personal, tiempos de ciclo, descarga, calidad y destino. El vehículo es solo una pieza de la ruta.</p></div><div><strong>84 %</strong><small>mejor cobertura observada</small><span>R-01 · piloto</span></div></section>
    <div className="red-app__route-grid">{routes.map(([id, name, generatorsCount, frequency, coverage, cycle, state, tone]) => <button type="button" className={`red-app__route-card${selectedRoute[0] === id ? " is-selected" : ""}`} aria-pressed={selectedRoute[0] === id} key={id} onClick={() => selectRoute(id)}><div><span>{id}</span><Status tone={tone as Tone}>{state}</Status></div><h3>{name}</h3><p>{generatorsCount} · {frequency}</p><dl><div><dt>Cobertura</dt><dd>{coverage}</dd></div><div><dt>Ciclo</dt><dd>{cycle}</dd></div></dl><b>Ver ruta y evidencia ↗</b></button>)}</div>
    <RecordInspector eyebrow="Ruta seleccionada" code={selectedRoute[0]} title={selectedRoute[1]} status={selectedRoute[6]} tone={selectedRoute[7] as Tone} summary={`${selectedRoute[2]} · ${selectedRoute[3]}. La ruta conecta cobertura, frecuencia, tiempos de ciclo, calidad de entrega y destino para que el diseño pueda comprobarse.`} details={[["Cobertura", selectedRoute[4]], ["Ciclo observado", selectedRoute[5]], ["Frecuencia", selectedRoute[3]], ["Próxima revisión", selectedRoute[0] === "R-02" ? "Ventana y calidad" : "Cierre de jornada"]]} relation="Generadores · FIELD · OPS" action="Abrir recorrido" setNotice={setNotice} />
    <div className="red-app__two-col"><Panel><PanelHead eyebrow="Control del ciclo" title="Qué se registra en cada recorrido" /><div className="red-app__route-flow">{[["01", "Salida", "Vehículo, equipo, hora y condiciones."], ["02", "Recolección", "Generador, recipiente, peso, calidad y novedad."], ["03", "Traslado", "Tiempo, recorrido, incidencia y desvío."], ["04", "Descarga", "Recepción, destino, rechazo y soporte."]].map(([code, title, copy]) => <div key={code}><span>{code}</span><strong>{title}</strong><p>{copy}</p></div>)}</div></Panel><Panel><PanelHead eyebrow="Alerta de diseño" title="La frecuencia debe responder al flujo real." aside={<Status tone="warn">Revisar R-02</Status>} /><p className="red-app__large-copy">R-02 tiene buena concentración de generadores, pero una ventana corta de entrega y mayor variabilidad de impropios. Antes de ampliar cobertura conviene probar horario, recipiente y regla de aceptación.</p><button type="button" className="red-app__text-action" onClick={() => setNotice("R-02: se creó una tarea para probar una ventana de entrega y revisar la calidad de la muestra.")}>Crear tarea de piloto ↗</button></Panel></div>
  </div>;
}

function Field({ setNotice, selectedFieldStepId, setSelectedFieldStepId }: { setNotice: (message: string) => void; selectedFieldStepId: string; setSelectedFieldStepId: (id: string) => void }) {
  const selectedStep = fieldSteps.find(([code]) => code === selectedFieldStepId) ?? fieldSteps[0];
  const selectStep = (id: string) => { setSelectedFieldStepId(id); setNotice(`${id}: paso FIELD seleccionado para revisar captura, evidencia y cierre.`); };
  return <div className="red-app__screen">
    <section className="red-app__field-header"><div><span>FIELD · VISITA ACTIVA · R-02</span><h2>Jornada de caracterización 04</h2><p>El flujo móvil prioriza capturar bien el hecho antes de interpretarlo. Cada paso queda ligado a proyecto, ruta, generador, persona, hora y evidencia.</p></div><Status>07/10 pasos</Status></section>
    <div className="red-app__field-grid">{fieldSteps.map(([code, title, copy, state, tone]) => <button type="button" className={selectedStep[0] === code ? "is-selected" : undefined} aria-pressed={selectedStep[0] === code} key={code} onClick={() => selectStep(code)}><span>{code}</span><strong>{title}</strong><p>{copy}</p><Status tone={tone as Tone}>{state}</Status></button>)}</div>
    <RecordInspector eyebrow="Paso FIELD seleccionado" code={`FIELD-${selectedStep[0]}`} title={selectedStep[1]} status={selectedStep[3]} tone={selectedStep[4] as Tone} summary={selectedStep[5]} details={[["Jornada", "Caracterización 04"], ["Ruta", "R-02 · Plaza y restaurantes"], ["Estado", selectedStep[3]], ["Evidencia", selectedStep[0] === "04" ? "2 fotografías pendientes" : "Soporte relacionado"]]} relation="Proyecto 360 · Generadores · QA/QC" action="Abrir captura" setNotice={setNotice} />
    <div className="red-app__two-col"><Panel className="red-app__mobile-rule"><span>Regla de captura</span><h2>Fotos, pesajes y novedades quedan ligados al objeto actual.</h2><p>El bruto y la tara generan el peso neto; el equipo de campo no debe digitar un cálculo que la plataforma puede conservar de forma reproducible.</p></Panel><Panel><PanelHead eyebrow="Resumen de jornada" title="Lo que debe cerrar el capturista" /><ul className="red-app__check-list"><li><b>Fuente</b><span>Generador y punto visitado identificados.</span></li><li><b>Medición</b><span>Unidad, método y hora visibles.</span></li><li><b>Evidencia</b><span>Fotografía o documento relacionado.</span></li><li><b>Cierre</b><span>Novedades y responsable de revisión.</span></li></ul></Panel></div>
  </div>;
}

function Qa({ setNotice, selectedQaId, setSelectedQaId, qaDecisions, setQaDecisions }: { setNotice: (message: string) => void; selectedQaId: string; setSelectedQaId: (id: string) => void; qaDecisions: Record<string, QaDecision>; setQaDecisions: Dispatch<SetStateAction<Record<string, QaDecision>>> }) {
  const selectedQa = queue.find(([id]) => id === selectedQaId) ?? queue[0];
  const selectedState = qaDecisions[selectedQa[0]] ?? selectedQa[5];
  const pendingCount = queue.filter(([id, , , , , state]) => (qaDecisions[id] ?? state) !== "Aprobada").length;
  const correctionCount = queue.filter(([id, , , , , state]) => state === "Corrección" || qaDecisions[id] === "Corrección solicitada").length;
  const decide = (decision: QaDecision) => {
    setQaDecisions((current) => ({ ...current, [selectedQa[0]]: decision }));
    setNotice(`${selectedQa[0]}: ${decision.toLowerCase()} en esta sesión. En producción quedaría actor, fecha, criterio y versión en el historial.`);
  };
  const toneForState = (state: string): Tone => state === "Aprobada" ? "ok" : state === "Corrección solicitada" || state === "Corrección" ? "warn" : "muted";

  return <div className="red-app__screen"><section className="red-app__metrics"><article><span>Objetos por validar</span><strong>{pendingCount + 5}</strong><small>5 FIELD · 4 documentos · demo</small></article><article><span>Correcciones en esta vista</span><strong>{correctionCount}</strong><small>El RAW permanece intacto</small></article><article><span>Aclaración solicitada</span><strong>03</strong><small>Pregunta al responsable</small></article><article><span>Aprobados este periodo</span><strong>22</strong><small>Con actor y fecha</small></article><article><span>Evidencias completas</span><strong>68 %</strong><small>Sobre objetos revisados</small></article><article><span>Bloqueos críticos</span><strong>01</strong><small>Impide cerrar la línea base</small></article></section><div className="red-app__qa-grid"><Panel><PanelHead eyebrow="Cola de revisión" title="Objetos por validar" aside={<Status tone="warn">{pendingCount} en esta vista</Status>} /><p className="red-app__panel-intro">La cola prioriza por impacto en la decisión, no solo por fecha. Selecciona un objeto para revisar su fuente, alerta y evidencia antes de decidir.</p><div className="red-app__queue">{queue.map(([id, object, origin, alert, person, state, fallbackTone]) => { const currentState = qaDecisions[id] ?? state; return <button type="button" className={selectedQa[0] === id ? "is-selected" : undefined} aria-pressed={selectedQa[0] === id} key={id} onClick={() => { setSelectedQaId(id); setNotice(`${id}: objeto seleccionado para comparar RAW, evidencia, alerta y decisión QA.`); }}><span>{id}</span><strong>{object}</strong><small>{origin} · {person}</small><em>{alert}</em><Status tone={toneForState(currentState) || fallbackTone as Tone}>{currentState}</Status></button>; })}</div></Panel><Panel className="red-app__qa-decision"><PanelHead eyebrow="Objeto en revisión" title={selectedQa[1]} aside={<Status tone={toneForState(selectedState)}> {selectedState} </Status>} /><dl><div><dt>Fuente</dt><dd>{selectedQa[2]}</dd></div><div><dt>Responsable</dt><dd>{selectedQa[4]}</dd></div><div><dt>Registro</dt><dd>{selectedQa[0] === "QA-108" ? "Bruto 184 kg · tara 36 kg" : "Registro recibido · pendiente de cotejo"}</dd></div><div><dt>Evidencia</dt><dd>{selectedQa[0] === "QA-108" ? "3 fotografías · 1 planilla" : "Soporte relacionado en expediente"}</dd></div><div><dt>Alerta</dt><dd>{selectedQa[3]}</dd></div></dl><div className="red-app__decision-buttons"><button type="button" onClick={() => decide("Aprobada")}>Aprobar</button><button type="button" onClick={() => decide("Corrección solicitada")}>Solicitar corrección</button>{selectedState !== "Por validar" && <button type="button" className="red-app__decision-reset" onClick={() => { setQaDecisions((current) => { const next = { ...current }; delete next[selectedQa[0]]; return next; }); setNotice(`${selectedQa[0]}: decisión local restablecida a su estado de demo.`); }}>Restablecer</button>}</div><p className="red-app__panel-footnote">Estado local de esta demo. La decisión de QA no modifica silenciosamente el registro de campo.</p></Panel></div></div>;
}

function Findings({ setNotice, selectedFindingId, setSelectedFindingId }: { setNotice: (message: string) => void; selectedFindingId: string; setSelectedFindingId: (id: string) => void }) {
  const selectedFinding = findings.find(([id]) => id === selectedFindingId) ?? findings[0];
  const selectFinding = (id: string) => { setSelectedFindingId(id); setNotice(`${id}: ficha contextual cargada con hecho, fuente, prioridad y decisión siguiente.`); };
  return <div className="red-app__screen"><section className="red-app__finding-intro"><div><span>HALLAZGOS · LECTURA EXPLICABLE</span><h2>Un hallazgo no es una opinión: es una observación con fuente, causa y decisión pendiente.</h2><p>Red permite separar el hecho observado de la interpretación del equipo. Así una prioridad puede discutirse, asignarse y convertirse en acción sin perder el registro que la originó.</p></div><div><strong>06</strong><small>hallazgos abiertos</small><Status tone="warn">1 alta prioridad</Status></div></section><Panel><PanelHead eyebrow="Registro de hallazgos" title="Prioridades activas del proyecto" aside={<><button type="button" className="red-app__small-button" onClick={() => setNotice("Nuevo hallazgo: en producción abriría fuente, descripción, causa, severidad, responsable y evidencia.")}>+ Nuevo hallazgo</button><button type="button" className="red-app__filter-button" onClick={() => setNotice("Filtros demostrativos: severidad, módulo origen, estado y responsable.")}>Filtrar</button></>} /><div className="red-app__finding-list">{findings.map(([id, title, category, priority, origin, state, tone]) => <button type="button" className={selectedFinding[0] === id ? "is-selected" : undefined} aria-pressed={selectedFinding[0] === id} key={id} onClick={() => selectFinding(id)}><div><span>{id}</span><Status tone={tone as Tone}>{priority}</Status></div><strong>{title}</strong><small>{category} · {origin}</small><b>{state} ↗</b></button>)}</div></Panel><RecordInspector eyebrow="Hallazgo seleccionado" code={selectedFinding[0]} title={selectedFinding[1]} status={selectedFinding[5]} tone={selectedFinding[6] as Tone} summary={`${selectedFinding[2]} · ${selectedFinding[4]}. La observación conserva su fuente y abre una decisión trazable, sin presentarla como una causa ya demostrada.`} details={[["Prioridad", selectedFinding[3]], ["Origen", selectedFinding[4]], ["Estado", selectedFinding[5]], ["Siguiente paso", selectedFinding[0] === "H-021" ? "Revisar calidad en GEN-024" : "Abrir análisis del responsable"]]} relation="QA/QC · PMIRS STUDIO · Evidencias" action="Abrir análisis" setNotice={setNotice} /><div className="red-app__two-col"><Panel><PanelHead eyebrow="Ficha de lectura" title="Qué debe explicar un hallazgo" /><div className="red-app__finding-chain">{[["Hecho", "Qué se observó y cuándo."], ["Fuente", "Qué registro o evidencia lo respalda."], ["Causa", "Qué hipótesis debe revisarse."], ["Decisión", "Qué acción, responsable o recurso sigue."]].map(([title, copy]) => <div key={title}><strong>{title}</strong><p>{copy}</p></div>)}</div></Panel><Panel className="red-app__accent-panel"><span>Regla de interpretación</span><h2>La causa se discute. La fuente se conserva.</h2><p>Un hallazgo puede cambiar de prioridad o cerrarse, pero la observación original y la decisión tomada deben seguir siendo consultables.</p></Panel></div></div>;
}

function PmirsLive({ setNotice, selectedActionId, setSelectedActionId, liveUpdates, setLiveUpdates }: { setNotice: (message: string) => void; selectedActionId: string; setSelectedActionId: (id: string) => void; liveUpdates: Record<string, LiveUpdate>; setLiveUpdates: Dispatch<SetStateAction<Record<string, LiveUpdate>>> }) {
  const selectedAction = liveActions.find(([id]) => id === selectedActionId) ?? liveActions[0];
  const registerProgress = () => {
    const [id, , , , progress, state, , tone] = selectedAction;
    const current = liveUpdates[id]?.progress ?? Number.parseInt(progress, 10);
    const nextProgress = Math.min(100, current + 10);
    const nextState = nextProgress === 100 ? "Por cerrar" : state === "Bloqueada" ? "En curso" : "En curso";
    setLiveUpdates((updates) => ({ ...updates, [id]: { progress: nextProgress, state: nextState, tone: nextProgress === 100 ? "muted" : tone as Tone } }));
    setNotice(`${id}: avance local registrado en ${nextProgress} %. En producción pediría comentario, evidencia y fecha de revisión.`);
  };

  return <div className="red-app__screen"><section className="red-app__live-intro"><div><span>PMIRS VIVO · IMPLEMENTACIÓN Y SEGUIMIENTO</span><h2>El plan deja de ser documento cuando cada acción tiene dueño, fecha y evidencia.</h2><p>Esta vista sigue la ejecución del PMIRS: qué está en curso, qué se bloqueó, qué debe cerrarse y qué decisión necesita la coordinación. El avance siempre conserva el programa y el hallazgo de origen.</p></div><div><strong>32 %</strong><small>avance del plan</small><Status tone="warn">2 bloqueos</Status></div></section><Panel><PanelHead eyebrow="Tablero de implementación" title="Acciones que requieren seguimiento" aside={<button type="button" onClick={registerProgress}>+ Registrar avance</button>} /><p className="red-app__panel-intro">Selecciona una acción y registra un avance de prueba. La actualización vive solo en esta sesión para mostrar el recorrido completo.</p><div className="red-app__live-table"><div className="red-app__live-table-head"><span>Acción</span><span>Responsable</span><span>Avance</span><span>Estado</span><span>Entrega</span></div>{liveActions.map(([id, title, program, owner, progress, state, due, fallbackTone]) => { const update = liveUpdates[id]; const currentProgress = update?.progress ?? Number.parseInt(progress, 10); const currentState = update?.state ?? state; const currentTone = update?.tone ?? fallbackTone as Tone; return <button type="button" className={selectedActionId === id ? "is-selected" : undefined} aria-pressed={selectedActionId === id} key={id} onClick={() => { setSelectedActionId(id); setNotice(`${id}: seguimiento seleccionado. Usa “Registrar avance” para simular una actualización trazable.`); }}><div><strong>{id} · {title}</strong><small>{program}</small></div><span>{owner}</span><b>{currentProgress} %</b><Status tone={currentTone}>{currentState}</Status><time>{due}</time></button>; })}</div><p className="red-app__selection-note"><b>Acción seleccionada:</b> {selectedAction[0]} · {selectedAction[1]} · cambios locales no persistentes</p></Panel><div className="red-app__two-col"><Panel><PanelHead eyebrow="Cadencia de seguimiento" title="Una acción se cierra con evidencia" /><ol className="red-app__follow-up"><li><span>01</span><div><strong>Asignar</strong><p>Responsable, alcance y fecha de compromiso.</p></div></li><li><span>02</span><div><strong>Ejecutar</strong><p>Actividad, novedad, recurso y soporte.</p></div></li><li><span>03</span><div><strong>Revisar</strong><p>Resultado observado y criterio de cierre.</p></div></li><li><span>04</span><div><strong>Aprender</strong><p>Ajuste de meta, programa o siguiente ciclo.</p></div></li></ol></Panel><Panel className="red-app__dark-panel"><span>Conexión con OPS</span><h2>Red define la intervención. OPS puede demostrar la operación.</h2><p>Cuando una acción PMIRS depende de una planta, una recepción, un lote o un equipo, la integración futura debe traer una referencia autorizada y conservar su fuente.</p></Panel></div></div>;
}

function Pmirs({ setNotice, selectedActionId, setSelectedActionId }: { setNotice: (message: string) => void; selectedActionId: string; setSelectedActionId: (id: string) => void }) {
  const selectedAction = liveActions.find(([id]) => id === selectedActionId) ?? liveActions[0];
  const selectAction = (id: string) => { setSelectedActionId(id); setNotice(`${id}: ficha de acción cargada con programa, responsable, meta y evidencia esperada.`); };
  return <div className="red-app__screen">
    <section className="red-app__pmirs-hero"><div><span>PMIRS STUDIO · PMIRS VIVO</span><h2>Convertir hallazgos en programas, acciones e indicadores.</h2><p>La formulación empieza cuando la línea base tiene el nivel de revisión necesario. Cada acción conserva problema, responsable, meta, fecha, recurso, evidencia y estado.</p></div><div><strong>03</strong><small>programas activos</small><b>22 acciones</b></div></section>
    <div className="red-app__program-grid">{programs.map(([id, title, count, status, copy, progress]) => <button type="button" className="red-app__program-card" key={id} onClick={() => setNotice(`${id}: programa seleccionado. Abriría hallazgos, acciones, indicadores y evidencias relacionadas.`)}><span>{id}</span><h3>{title}</h3><p>{copy}</p><div><strong>{progress}%</strong><small>{count} · {status}</small></div><i><b style={{ width: `${progress}%` }} /></i></button>)}</div>
    <Panel><PanelHead eyebrow="Constructor de acciones" title="Trabajo listo para coordinar" aside={<button type="button" onClick={() => setNotice("Nueva acción simulada: se abriría con hallazgo, responsable, indicador y fecha precargados.")}>+ Nueva acción</button>} /><div className="red-app__action-list">{liveActions.slice(0, 3).map(([id, title, program, owner, progress, state, , tone]) => <button type="button" className={selectedAction[0] === id ? "is-selected" : undefined} aria-pressed={selectedAction[0] === id} key={id} onClick={() => selectAction(id)}><span>{id}</span><div><strong>{title}</strong><small>{program} · {owner}</small></div><Status tone={tone as Tone}>{state} · {progress}</Status><b>↗</b></button>)}</div></Panel>
    <RecordInspector eyebrow="Acción seleccionada" code={selectedAction[0]} title={selectedAction[1]} status={selectedAction[5]} tone={selectedAction[7] as Tone} summary={`Acción del ${selectedAction[2]} a cargo de ${selectedAction[3]}. Su avance debe explicar qué cambió, qué soporte lo demuestra y qué bloqueo permanece.`} details={[["Programa", selectedAction[2]], ["Responsable", selectedAction[3]], ["Avance", selectedAction[4]], ["Entrega", selectedAction[6]]]} relation="Hallazgos · Indicadores · Evidencias" action="Abrir seguimiento" setNotice={setNotice} />
  </div>;
}

function Indicators({ setNotice }: { setNotice: (message: string) => void }) {
  return <div className="red-app__screen"><section className="red-app__indicator-intro"><div><span>INDICADORES · CORTE CONTROLADO</span><h2>Medir para decidir, no para llenar un tablero.</h2><p>Cada indicador debe declarar qué mide, sobre qué universo, con qué periodo, qué fuente lo alimenta y qué nivel de validación tiene. Un porcentaje sin denominador no es una línea base.</p></div><div><strong>Junio 2026</strong><small>Corte demostrativo</small><button type="button" onClick={() => setNotice("Selector de corte: en producción permitiría cambiar periodo y comparar versiones autorizadas.")}>Cambiar corte ↗</button></div></section><div className="red-app__indicator-grid">{indicators.map(([title, value, state, note]) => <article key={title} onClick={() => setNotice(`${title}: indicador seleccionado. Abriría fórmula, fuente, periodo, objetos incluidos y revisión.`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setNotice(`${title}: indicador seleccionado. Abriría fórmula, fuente, periodo, objetos incluidos y revisión.`); }} role="button" tabIndex={0}><span>{title}</span><strong>{value}</strong><Status tone={state.includes("requiere") ? "warn" : "muted"}>{state}</Status><p>{note}</p><b>Ver ficha metodológica ↗</b></article>)}</div><div className="red-app__two-col"><Panel><PanelHead eyebrow="Cadena de cálculo" title="De la fuente al indicador" /><div className="red-app__lineage">{[["01", "Fuente", "Registro de campo, planilla, acta o sistema de operación."], ["02", "Regla", "Unidad, filtro, periodo, universo y fórmula documentados."], ["03", "Revisión", "Objetos QA/QC aprobados o exclusiones explicadas."], ["04", "Resultado", "Valor contextualizado para gestión o comunicación."]].map(([code, title, copy]) => <div key={code}><span>{code}</span><div><strong>{title}</strong><p>{copy}</p></div></div>)}</div></Panel><Panel className="red-app__accent-panel"><span>Claim público</span><h2>El indicador puede informar. El caso validado puede demostrar.</h2><p>Red ayuda a conservar la diferencia entre una lectura interna, un resultado de proyecto y una afirmación pública con alcance, periodo y soporte.</p></Panel></div></div>;
}

function Evidence({ setNotice, selectedEvidenceId, setSelectedEvidenceId }: { setNotice: (message: string) => void; selectedEvidenceId: string; setSelectedEvidenceId: (id: string) => void }) {
  const selectedEvidence = evidence.find(([id]) => id === selectedEvidenceId) ?? evidence[0];
  const selectEvidence = (id: string) => { setSelectedEvidenceId(id); setNotice(`${id}: ficha contextual cargada con soporte, metadatos, estado y objeto origen.`); };
  return <div className="red-app__screen"><section className="red-app__evidence-hero"><div><span>EVIDENCIAS · EXPEDIENTE DEL PROYECTO</span><h2>La evidencia no es un archivo suelto: es la prueba de una decisión.</h2><p>Fotografías, actas, planillas, mapas y reportes se relacionan con el proyecto, la visita, el generador, la ruta o la acción que explican.</p></div><div><strong>84</strong><small>soportes en el expediente</small><Status>68 % revisados</Status></div></section><Panel><PanelHead eyebrow="Repositorio contextual" title="Evidencias recientes" aside={<button type="button" onClick={() => setNotice("Cargar evidencia: en producción permitiría elegir objeto origen, tipo de soporte y nivel de acceso.")}>+ Cargar evidencia</button>} /><div className="red-app__evidence-grid">{evidence.map(([id, title, origin, date, detail, state, tone]) => <button type="button" className={selectedEvidence[0] === id ? "is-selected" : undefined} aria-pressed={selectedEvidence[0] === id} key={id} onClick={() => selectEvidence(id)}><div><span>{id}</span><Status tone={tone as Tone}>{state}</Status></div><h3>{title}</h3><p>{origin}</p><small>{date} · {detail}</small><b>Ver soporte ↗</b></button>)}</div></Panel><RecordInspector eyebrow="Evidencia seleccionada" code={selectedEvidence[0]} title={selectedEvidence[1]} status={selectedEvidence[5]} tone={selectedEvidence[6] as Tone} summary={`${selectedEvidence[2]} · ${selectedEvidence[4]}. El soporte debe explicar qué decisión respalda y bajo qué versión puede consultarse.`} details={[["Fecha", selectedEvidence[3]], ["Tipo", selectedEvidence[4].split(" · ")[0]], ["Estado", selectedEvidence[5]], ["Acceso", "Proyecto RED-024 · equipo autorizado"]]} relation="FIELD · QA/QC · PMIRS VIVO" action="Abrir expediente" setNotice={setNotice} /><div className="red-app__two-col"><Panel><PanelHead eyebrow="Metadatos mínimos" title="Qué debe acompañar cada soporte" /><ul className="red-app__check-list"><li><b>Objeto origen</b><span>La evidencia debe explicar qué registro, hallazgo o acción respalda.</span></li><li><b>Autoría y fecha</b><span>Quién la produjo, cuándo y desde qué contexto.</span></li><li><b>Estado</b><span>Borrador, recibido, revisado, aprobado o rechazado.</span></li><li><b>Acceso</b><span>Qué organización, rol o equipo puede verla y descargarla.</span></li></ul></Panel><Panel className="red-app__dark-panel"><span>Expediente listo</span><h2>Un tercero debe poder reconstruir la decisión.</h2><p>La trazabilidad permite volver del resultado a la acción, de la acción al hallazgo y del hallazgo a la fuente que lo originó.</p></Panel></div></div>;
}

function Coord({ setNotice }: { setNotice: (message: string) => void }) {
  const [selectedCoordId, setSelectedCoordId] = useState("coord-0");
  const selectedCoord = coordinationItems[Number(selectedCoordId.replace("coord-", ""))] ?? coordinationItems[0];
  return <div className="red-app__screen"><section className="red-app__metrics"><article><span>Necesitan mi respuesta</span><strong>04</strong><small>Solicitudes abiertas</small></article><article><span>Por vencer</span><strong>02</strong><small>Próximas 48 horas</small></article><article><span>Por validar</span><strong>09</strong><small>Cola QA/QC</small></article><article><span>Incidencias críticas</span><strong>01</strong><small>Con bloqueo de línea base</small></article><article><span>Responsables activos</span><strong>11</strong><small>Municipio, ESP y equipo</small></article><article><span>Decisiones del corte</span><strong>07</strong><small>Con historial</small></article></section><Panel><PanelHead eyebrow="Centro de coordinación" title="El mensaje se convierte en trabajo trazable." aside={<small>Cada hilo conserva proyecto y objeto origen</small>} /><div className="red-app__coord-list">{coordinationItems.map(([type, title, owner, due, module], index) => <button type="button" className={selectedCoordId === `coord-${index}` ? "is-selected" : undefined} aria-pressed={selectedCoordId === `coord-${index}`} key={title} onClick={() => { setSelectedCoordId(`coord-${index}`); setNotice(`${type}: hilo seleccionado con objeto origen, responsable, fecha objetivo y módulo ${module}.`); }}><span>{type}</span><strong>{title}</strong><small>{owner} · {module}</small><b>{due}</b></button>)}</div></Panel><RecordInspector eyebrow="Hilo seleccionado" code={`COORD-${selectedCoordId.replace("coord-", "")}`} title={selectedCoord[1]} status={selectedCoord[0]} tone={selectedCoord[0] === "Incidencia" ? "warn" : "muted"} summary={selectedCoord[5]} details={[["Tipo", selectedCoord[0]], ["Responsable", selectedCoord[2]], ["Fecha objetivo", selectedCoord[3]], ["Módulo", selectedCoord[4]]]} relation="Proyecto 360 · FIELD · QA/QC · PMIRS" action="Abrir conversación" setNotice={setNotice} /><Panel className="red-app__coord-rule"><span>Regla del sistema</span><h2>Email y WhatsApp notifican. Red conserva la decisión.</h2><p>Una conversación puede convertirse en solicitud, tarea, incidencia o decisión sin perder el proyecto, el objeto relacionado ni el historial.</p><div className="red-app__state-pills"><span>Solicitud</span><span>Tarea</span><span>Incidencia</span><span>Decisión</span></div></Panel></div>;
}
