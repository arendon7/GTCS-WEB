"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

type DemoKind = "agroway" | "sana";
type ModuleItem = { id: string; code: string; label: string; detail: string };
type RecordItem = { id: string; title: string; detail: string; status: string; tone: "ok" | "warn" | "muted" };

const configs: Record<DemoKind, { brand: string; kicker: string; context: string; subtitle: string; description: string; modules: ModuleItem[]; records: Record<string, RecordItem[]> }> = {
  agroway: {
    brand: "AGROWAY",
    kicker: "Trazabilidad agrícola · Espacio de trabajo",
    context: "Café · Támesis",
    subtitle: "Ciclo productivo 2026 · 18 lotes relacionados",
    description: "La aplicación conecta diagnóstico, plan, abastecimiento, labores, evidencia y cosecha para que cada decisión del campo conserve su historia.",
    modules: [
      { id: "overview", code: "01", label: "Resumen", detail: "Avance del ciclo y próxima acción" },
      { id: "projects", code: "02", label: "Proyectos", detail: "Productores, fincas y ciclos" },
      { id: "lots", code: "03", label: "Lotes", detail: "Cultivos, diagnóstico y plan" },
      { id: "field", code: "04", label: "Trabajo de campo", detail: "Labores, aplicaciones y novedades" },
      { id: "evidence", code: "05", label: "Evidencias", detail: "Soportes y revisión" },
      { id: "harvest", code: "06", label: "Cosechas", detail: "Resultados y nuevos ciclos" },
      { id: "catalog", code: "07", label: "Catálogo técnico", detail: "Insumos, protocolos y compatibilidad" },
    ],
    records: {
      projects: [
        { id: "PR-024", title: "Café de montaña · Támesis", detail: "12 productores · 18 lotes · ciclo principal", status: "En ejecución", tone: "ok" },
        { id: "PR-019", title: "Transición agroecológica · Jardín", detail: "8 productores · 11 lotes · diagnóstico inicial", status: "Diagnóstico", tone: "muted" },
        { id: "PR-011", title: "Hortalizas protegidas · Fredonia", detail: "4 productores · 6 lotes · cosecha próxima", status: "Seguimiento", tone: "warn" },
      ],
      lots: [
        { id: "LOT-118", title: "La Esperanza · Lote 03", detail: "Café · 2,4 ha · diagnóstico 08 jun", status: "Plan activo", tone: "ok" },
        { id: "LOT-121", title: "El Porvenir · Lote 01", detail: "Café · 1,8 ha · muestra de suelo pendiente", status: "Por revisar", tone: "warn" },
        { id: "LOT-126", title: "La Vega · Lote 02", detail: "Plátano · 0,9 ha · plan por aprobar", status: "Borrador", tone: "muted" },
      ],
      field: [
        { id: "ACT-441", title: "Aplicación de protocolo nutricional", detail: "LOT-118 · 11 jun · Andrea M.", status: "Evidencia cargada", tone: "ok" },
        { id: "ACT-438", title: "Revisión de floración", detail: "LOT-121 · 10 jun · Carlos R.", status: "Observación abierta", tone: "warn" },
        { id: "ACT-432", title: "Control de cobertura vegetal", detail: "LOT-126 · 08 jun · equipo de campo", status: "Registrada", tone: "muted" },
      ],
      evidence: [
        { id: "EV-208", title: "Registro fotográfico de aplicación", detail: "ACT-441 · 4 fotografías · checksum válido", status: "Validada", tone: "ok" },
        { id: "EV-204", title: "Resultado de análisis de suelo", detail: "LOT-121 · laboratorio aliado · 10 jun", status: "Pendiente de revisión", tone: "warn" },
        { id: "EV-199", title: "Acta de visita técnica", detail: "PR-024 · firma digital · 08 jun", status: "Validada", tone: "ok" },
      ],
      harvest: [
        { id: "COS-031", title: "Corte principal · La Esperanza", detail: "LOT-118 · 1.240 kg registrados · 06 jun", status: "Conciliación", tone: "warn" },
        { id: "COS-028", title: "Corte de prueba · El Porvenir", detail: "LOT-121 · 380 kg registrados · 29 may", status: "Registrada", tone: "muted" },
        { id: "COS-022", title: "Ciclo anterior · La Vega", detail: "LOT-126 · 710 kg · cierre documentado", status: "Cerrada", tone: "ok" },
      ],
      catalog: [
        { id: "INS-014", title: "Wondergreen 2Grow", detail: "Fertilizante organomineral · protocolo café", status: "Compatible", tone: "ok" },
        { id: "BIO-003", title: "Wondergreen Biol", detail: "Bioinsumo líquido · microorganismos eficientes", status: "Ficha disponible", tone: "ok" },
        { id: "PRO-021", title: "Protocolo de aplicación foliar", detail: "Versión 03 · revisión técnica pendiente", status: "Por aprobar", tone: "warn" },
      ],
    },
  },
  sana: {
    brand: "SANA",
    kicker: "Ecosistema de inversión · Espacio de trabajo",
    context: "Portafolio productivo · Antioquia",
    subtitle: "Corte de seguimiento · 15 junio 2026",
    description: "SANA articula oportunidades, capital, ciencia y acompañamiento. Recibe datos relacionados de AGROWAY para seguir el proyecto sin separar la decisión financiera de la realidad del campo.",
    modules: [
      { id: "overview", code: "01", label: "Resumen", detail: "Portafolio y decisiones abiertas" },
      { id: "opportunities", code: "02", label: "Oportunidades", detail: "Proyectos en estructuración" },
      { id: "portfolio", code: "03", label: "Portafolio", detail: "Proyectos acompañados" },
      { id: "followup", code: "04", label: "Seguimiento", detail: "Avance, alertas y resultados" },
      { id: "data-room", code: "05", label: "Data room", detail: "Evidencia autorizada" },
      { id: "committee", code: "06", label: "Comité", detail: "Decisiones y responsables" },
    ],
    records: {
      opportunities: [
        { id: "OP-014", title: "Café regenerativo · Támesis", detail: "18 lotes · trazabilidad AGROWAY activa · etapa 2", status: "En estructuración", tone: "ok" },
        { id: "OP-011", title: "Hortalizas de ciclo corto · Fredonia", detail: "6 lotes · presupuesto en revisión · etapa 1", status: "Por evaluar", tone: "warn" },
        { id: "OP-008", title: "Plátano asociado · Jardín", detail: "11 lotes · diagnóstico preliminar · etapa 1", status: "Información inicial", tone: "muted" },
      ],
      portfolio: [
        { id: "PF-024", title: "Café de montaña · Támesis", detail: "Capital acompañado · 12 productores · 32% de avance", status: "En ejecución", tone: "ok" },
        { id: "PF-019", title: "Regeneración de suelo · Andes", detail: "8 lotes · protocolo Wondergreen · 64% de avance", status: "Seguimiento", tone: "ok" },
        { id: "PF-013", title: "Agroforestería · Jericó", detail: "4 lotes · reporte trimestral pendiente", status: "Alerta documental", tone: "warn" },
      ],
      followup: [
        { id: "SEG-108", title: "Validar cosecha del ciclo principal", detail: "PF-024 · dato de AGROWAY · responsable: comité técnico", status: "Prioridad alta", tone: "warn" },
        { id: "SEG-104", title: "Actualizar plan de acompañamiento", detail: "PF-019 · visita técnica · próxima semana", status: "En curso", tone: "ok" },
        { id: "SEG-099", title: "Revisar presupuesto de establecimiento", detail: "OP-011 · supuestos y cotizaciones", status: "Por asignar", tone: "muted" },
      ],
      "data-room": [
        { id: "DR-221", title: "Resumen de trazabilidad del ciclo", detail: "PF-024 · 18 lotes · lectura agregada autorizada", status: "Disponible", tone: "ok" },
        { id: "DR-218", title: "Plan agronómico y protocolo", detail: "PF-019 · Wondergreen · versión 03", status: "En revisión", tone: "warn" },
        { id: "DR-207", title: "Presupuesto y supuestos", detail: "OP-011 · documento de trabajo · acceso restringido", status: "Borrador", tone: "muted" },
      ],
      committee: [
        { id: "DEC-014", title: "Liberar siguiente hito de Támesis", detail: "PF-024 · evidencia de cosecha y conciliación", status: "Para decidir", tone: "warn" },
        { id: "DEC-011", title: "Aprobar protocolo de suelo", detail: "PF-019 · Greenatics + Wondergreen · 12 jun", status: "Aprobada", tone: "ok" },
        { id: "DEC-008", title: "Solicitar información de Fredonia", detail: "OP-011 · faltan costos y cronograma", status: "Pendiente", tone: "muted" },
      ],
    },
  },
};

function Status({ children, tone }: { children: ReactNode; tone: RecordItem["tone"] }) {
  return <span className={`portfolio-demo__status portfolio-demo__status--${tone}`}>{children}</span>;
}

function Metrics({ kind }: { kind: DemoKind }) {
  const metrics = kind === "agroway"
    ? [["Lotes activos", "18", "3 con próxima acción"], ["Productores", "12", "En 2 proyectos"], ["Actividades del ciclo", "64", "52 con evidencia"], ["Revisión pendiente", "07", "2 de prioridad alta"]]
    : [["Proyectos activos", "06", "4 con seguimiento"], ["Capital acompañado", "$420 M", "Corte ilustrativo"], ["Hitos del periodo", "18", "13 confirmados"], ["Decisiones abiertas", "04", "1 de prioridad alta"]];
  return <div className="portfolio-demo__metrics">{metrics.map(([label, value, detail]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</div>;
}

function Overview({ kind, setNotice }: { kind: DemoKind; setNotice: (value: string) => void }) {
  const agroway = kind === "agroway";
  return <div className="portfolio-demo__screen">
    <Metrics kind={kind} />
    <div className="portfolio-demo__overview-grid">
      <section className="portfolio-demo__panel portfolio-demo__panel--dark"><span>{agroway ? "Siguiente acción de campo" : "Siguiente decisión de portafolio"}</span><h2>{agroway ? "Cerrar la revisión del lote La Esperanza antes de la próxima aplicación." : "Validar el hito de cosecha del proyecto Café de montaña."}</h2><p>{agroway ? "La actividad está registrada y la evidencia cargada. Falta revisar el resultado del análisis y confirmar la recomendación del siguiente paso." : "AGROWAY ya registra el ciclo y la evidencia principal. El comité debe conciliar cosecha, avance y presupuesto antes de liberar el siguiente hito."}</p><button type="button" onClick={() => setNotice(agroway ? "LOT-118 seleccionado: diagnóstico, protocolo y evidencias listos para revisión." : "DEC-014 seleccionado: abrir la evidencia autorizada y preparar la decisión del comité.")}>Abrir próxima acción →</button></section>
      <section className="portfolio-demo__panel"><div className="portfolio-demo__panel-head"><div><span>Calidad del contexto</span><h2>{agroway ? "Estado del ciclo" : "Estado del portafolio"}</h2></div><Status tone="ok">Actualizado hoy</Status></div><div className="portfolio-demo__state-list">{(agroway ? [["Registrado", "64"], ["Con evidencia", "52"], ["Revisado", "41"], ["Cerrado", "19"]] : [["Estructuración", "03"], ["En ejecución", "04"], ["Con hito confirmado", "13"], ["Con alerta", "02"]]).map(([label, value], index) => <div key={label}><span>{label}</span><strong>{value}</strong><i><b style={{ width: `${[100, 81, 64, 32][index]}%` }} /></i></div>)}</div><p className="portfolio-demo__footnote">Los estados explican qué revisión recibió el dato; no convierten una proyección en resultado confirmado.</p></section>
    </div>
    <section className="portfolio-demo__panel"><div className="portfolio-demo__panel-head"><div><span>Actividad reciente</span><h2>Qué cambió en el proyecto</h2></div><small>Últimos eventos relacionados</small></div><div className="portfolio-demo__timeline">{(agroway ? [["14:20", "Trabajo de campo", "Se cargó evidencia de aplicación en LOT-118", "Registrado"], ["11:35", "Diagnóstico", "Se actualizó observación de floración en LOT-121", "Por revisar"], ["09:10", "Cosecha", "Se inició conciliación del corte principal", "En curso"]] : [["14:20", "AGROWAY", "Se sincronizó avance del ciclo de Támesis", "Registrado"], ["12:05", "Comité", "Se solicitó soporte de cosecha para PF-024", "Por decidir"], ["09:15", "Data room", "Se publicó el resumen autorizado del ciclo", "Disponible"]]).map(([time, type, copy, state]) => <button type="button" key={`${time}-${type}`} onClick={() => setNotice(`${type}: evento seleccionado. En producción abriría el objeto origen y su historial.`)}><time>{time}</time><i /><div><strong>{copy}</strong><small>{type} · {state}</small></div><b>↗</b></button>)}</div></section>
  </div>;
}

function RecordsView({ kind, module, records, setNotice }: { kind: DemoKind; module: ModuleItem; records: RecordItem[]; setNotice: (value: string) => void }) {
  return <div className="portfolio-demo__screen"><section className="portfolio-demo__section-intro"><div><span>{module.code} · {module.label}</span><h2>{kind === "agroway" ? "El dato de campo conserva su contexto." : "La oportunidad se acompaña con información autorizada."}</h2><p>{module.detail}. Cada fila relaciona un objeto con su estado, responsable y próxima decisión.</p></div><div><strong>{String(records.length).padStart(2, "0")}</strong><small>registros visibles</small></div></section><section className="portfolio-demo__panel"><div className="portfolio-demo__panel-head"><div><span>Vista de trabajo</span><h2>{module.label}</h2></div><button type="button" className="portfolio-demo__secondary" onClick={() => setNotice(`Filtro de ${module.label}: en producción conservaría permisos, periodo y organización.`)}>Filtrar vista</button></div><div className="portfolio-demo__records">{records.map((record) => <button type="button" key={record.id} onClick={() => setNotice(`${record.id} seleccionado: se abriría su ficha completa, relaciones, evidencia e historial.`)}><span>{record.id}</span><div><strong>{record.title}</strong><small>{record.detail}</small></div><Status tone={record.tone}>{record.status}</Status><b>↗</b></button>)}</div><p className="portfolio-demo__selection">Selecciona un registro para abrir su ficha, revisar relaciones y preparar una acción.</p></section><div className="portfolio-demo__two-col"><section className="portfolio-demo__panel"><span>Regla de trazabilidad</span><h2>{kind === "agroway" ? "Una observación no es una recomendación." : "Una proyección no es un resultado."}</h2><p>{kind === "agroway" ? "AGROWAY separa diagnóstico, plan, producto, aplicación, evidencia y cosecha para que el equipo pueda revisar qué ocurrió antes de concluir." : "SANA separa oportunidad, presupuesto, avance, evidencia y resultado para que una conversación de inversión conserve sus supuestos."}</p></section><section className="portfolio-demo__panel portfolio-demo__panel--soft"><span>Próximo paso</span><h2>Conectar el registro con la decisión.</h2><p>El entorno productivo conservaría responsable, fecha objetivo, permisos y una nueva versión del dato.</p><button type="button" className="portfolio-demo__primary" onClick={() => setNotice(`Nueva acción vinculada a ${module.label}: el responsable y el objeto origen quedan visibles.`)}>+ Nueva acción</button></section></div></div>;
}

export function PortfolioDemoApp({ kind }: { kind: DemoKind }) {
  const config = configs[kind];
  const [view, setView] = useState("overview");
  const [notice, setNotice] = useState("Entorno demo listo: puedes recorrer módulos y seleccionar registros.");
  const activeModule = config.modules.find((module) => module.id === view) ?? config.modules[0];
  const records = config.records[view] ?? [];

  const selectView = (nextView: string) => {
    setView(nextView);
    const module = config.modules.find((item) => item.id === nextView);
    setNotice(`${module?.label ?? "Vista"}: módulo demo cargado. Los cambios no se guardan en este entorno.`);
  };

  return <div className="portfolio-demo">
    <header className="portfolio-demo__topbar"><Link className="portfolio-demo__brand" href={kind === "agroway" ? "/agroway/" : "/sana/"}><span>{kind === "agroway" ? "AG" : "SA"}</span><div><strong>{config.brand}</strong><small>{config.kicker}</small></div></Link><div className="portfolio-demo__context"><span>Contexto activo</span><strong>{config.context}</strong><small>{config.subtitle}</small></div><div className="portfolio-demo__top-actions"><span className="portfolio-demo__demo-badge">Demo navegable</span><span className="portfolio-demo__user">Usuario demo · Dirección</span><Link className="portfolio-demo__access-link" href="/plataforma/usuarios/">Usuarios y permisos</Link><Link className="portfolio-demo__site-link" href="/" aria-label="Volver al sitio Greenatics">Volver a Greenatics</Link></div></header>
    <div className="portfolio-demo__body"><aside className="portfolio-demo__rail" aria-label={`Módulos de ${config.brand}`}><div className="portfolio-demo__context-card"><span>Organización de prueba</span><strong>{kind === "agroway" ? "Greenatics Campo" : "Greenatics Portafolio"}</strong><small>Permisos ilustrativos · lectura y seguimiento</small><button type="button" onClick={() => setNotice("Selector de contexto: en producción permitiría cambiar organización, proyecto, periodo y rol con permisos.")}>Cambiar contexto <b>⌄</b></button></div><nav aria-label="Módulos de la aplicación">{config.modules.map((module) => <button type="button" key={module.id} className={view === module.id ? "is-active" : undefined} aria-current={view === module.id ? "page" : undefined} onClick={() => selectView(module.id)}><b>{module.code}</b><div><strong>{module.label}</strong><small>{module.detail}</small></div></button>)}</nav><div className="portfolio-demo__rail-note"><i /><div><strong>Modo prueba</strong><span>Los datos son ilustrativos. La versión productiva separará usuarios, organizaciones, permisos, evidencia y persistencia.</span></div></div></aside><section className="portfolio-demo__workspace" aria-label={`Área de trabajo de ${config.brand}`}><div className="portfolio-demo__workspace-head"><div><span>{config.brand} / {activeModule.label}</span><h1>{activeModule.label}</h1><p>{activeModule.id === "overview" ? config.description : activeModule.detail}</p></div><div className="portfolio-demo__head-actions"><button type="button" className="portfolio-demo__secondary" onClick={() => setNotice("Exportación demo: en producción reuniría los registros visibles, filtros, fuentes y versión del corte.")}>Exportar corte</button><button type="button" className="portfolio-demo__primary" onClick={() => setNotice(`Nueva acción en ${activeModule.label}: en producción conservaría responsable, objeto origen y fecha objetivo.`)}>+ Nueva acción</button></div></div><p className="portfolio-demo__notice" aria-live="polite"><b>Entorno demo</b> {notice}</p>{view === "overview" ? <Overview kind={kind} setNotice={setNotice} /> : <RecordsView kind={kind} module={activeModule} records={records} setNotice={setNotice} />}</section></div>
  </div>;
}
