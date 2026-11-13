"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type DemoKind = "agroway" | "sana";
type ModuleItem = { id: string; code: string; label: string; detail: string };
type RelatedRecord = { moduleId: string; recordId: string; label: string };
type RecordItem = { id: string; title: string; detail: string; status: string; tone: "ok" | "warn" | "muted"; related?: RelatedRecord[] };
type ReviewGuidance = { title: string; description: string };

const reviewGuidance: Record<DemoKind, Record<string, ReviewGuidance>> = {
  agroway: {
    projects: { title: "Delimitar el ciclo", description: "Confirma qué productores, fincas y periodo corresponden al proyecto antes de agregar avances." },
    lots: { title: "Verificar el contexto del lote", description: "Contrasta identificación, cultivo y área con el diagnóstico y el plan vinculados." },
    field: { title: "Relacionar labor y evidencia", description: "Vincula fecha, responsable, lote y labor; deja claro qué soporte permite revisar el registro." },
    evidence: { title: "Revisar el soporte", description: "Comprueba fecha, lote y actividad asociada, y contrasta el archivo con el registro de ejemplo." },
    harvest: { title: "Conciliar la cosecha", description: "Cruza lote, periodo y cantidad registrada con el soporte de recepción antes de cerrar el ejemplo." },
    catalog: { title: "Contrastar la referencia", description: "Verifica nombre, composición y recomendación de uso con la ficha técnica vigente y el cultivo correspondiente." },
  },
  sana: {
    opportunities: { title: "Aclarar la oportunidad", description: "Resume necesidad productiva, población, ubicación, información disponible y supuestos de entrada." },
    portfolio: { title: "Relacionar alcance y avance", description: "Compara alcance, presupuesto, hitos y responsables; diferencia datos confirmados de datos de ejemplo." },
    followup: { title: "Definir la próxima acción", description: "Precisa quién debe hacer qué, en qué plazo y con qué evidencia se revisará el avance." },
    "data-room": { title: "Comprobar el documento", description: "Revisa versión, fecha, responsable y relación del archivo con el proyecto antes de usarlo en una revisión." },
    committee: { title: "Hacer explícita la decisión", description: "Indica qué se propone decidir, qué evidencia sustenta la propuesta y qué condición sigue pendiente." },
  },
};

const sectionGuidance: Record<DemoKind, Record<string, ReviewGuidance>> = {
  agroway: {
    projects: { title: "Ubica el ciclo antes de seguirlo.", description: "Relaciona productor, finca y periodo para entender el alcance de cada proyecto." },
    lots: { title: "Lee el lote desde su contexto agronómico.", description: "Identifica cultivo, área y diagnóstico vinculados al plan de trabajo." },
    field: { title: "Registra qué ocurrió en el lote.", description: "Sitúa labor, fecha, responsable y evidencia antes de interpretar el avance." },
    evidence: { title: "Comprueba el soporte detrás del registro.", description: "Relaciona cada archivo con el lote, la actividad y la fecha correspondiente." },
    harvest: { title: "Concilia la cosecha con su soporte.", description: "Contrasta cantidad, fecha y lote con el registro de recepción." },
    catalog: { title: "Conecta cada referencia con su uso.", description: "Revisa cultivo y ficha vigente; el catálogo de muestra no sincroniza inventarios." },
  },
  sana: {
    opportunities: { title: "Delimita la oportunidad antes de estructurarla.", description: "Relaciona necesidad productiva, actores, territorio, información y supuestos." },
    portfolio: { title: "Lee alcance, etapa y avance en conjunto.", description: "Diferencia hitos confirmados de datos de ejemplo antes de revisar la inversión." },
    followup: { title: "Convierte el seguimiento en una próxima acción.", description: "Asocia responsable, plazo y evidencia para revisar el avance." },
    "data-room": { title: "Ubica cada documento en su contexto.", description: "Contrasta versión, fecha, responsable y proyecto antes de usar un soporte." },
    committee: { title: "Haz visible qué decisión está pendiente.", description: "Resume propuesta, evidencia disponible, condición abierta y responsable." },
  },
};

const configs: Record<DemoKind, { brand: string; kicker: string; context: string; subtitle: string; description: string; modules: ModuleItem[]; records: Record<string, RecordItem[]> }> = {
  agroway: {
    brand: "AGROWAY",
    kicker: "Trazabilidad agrícola",
    context: "Ciclo agrícola",
    subtitle: "Productor · finca · lote · cosecha",
    description: "El recorrido ilustra cómo relacionar diagnóstico, plan, abastecimiento, labores, evidencia y cosecha para dar contexto a las decisiones de campo.",
    modules: [
      { id: "overview", code: "01", label: "Resumen", detail: "Avance del ciclo y próxima acción" },
      { id: "projects", code: "02", label: "Proyectos", detail: "Productores, fincas y ciclos" },
      { id: "lots", code: "03", label: "Lotes", detail: "Cultivos, diagnóstico y plan" },
      { id: "field", code: "04", label: "Trabajo de campo", detail: "Labores, aplicaciones y novedades" },
      { id: "evidence", code: "05", label: "Evidencias", detail: "Soportes y revisión" },
      { id: "harvest", code: "06", label: "Cosechas", detail: "Resultados y nuevos ciclos" },
      { id: "catalog", code: "07", label: "Catálogo técnico", detail: "Referencias, fichas y protocolos de uso" },
    ],
    records: {
      projects: [
        { id: "PR-024", title: "Café de montaña · Zona de muestra 01", detail: "12 productores · 18 lotes ficticios · ciclo de ejemplo", status: "En ejecución", tone: "ok" },
        { id: "PR-019", title: "Transición agroecológica · Zona de muestra 02", detail: "8 productores · 11 lotes ficticios · diagnóstico de ejemplo", status: "Diagnóstico", tone: "muted" },
        { id: "PR-011", title: "Hortalizas protegidas · Zona de muestra 03", detail: "4 productores · 6 lotes ficticios · cosecha de ejemplo", status: "Seguimiento", tone: "warn" },
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
        { id: "EV-208", title: "Registro fotográfico de aplicación", detail: "ACT-441 · 4 fotografías · control de integridad de ejemplo", status: "Validada", tone: "ok" },
        { id: "EV-204", title: "Resultado de análisis de suelo", detail: "LOT-121 · laboratorio aliado · 10 jun", status: "Pendiente de revisión", tone: "warn" },
        { id: "EV-199", title: "Acta de visita técnica", detail: "PR-024 · firma de ejemplo · 08 jun", status: "Validada", tone: "ok" },
      ],
      harvest: [
        { id: "COS-031", title: "Corte principal · La Esperanza", detail: "LOT-118 · 1.240 kg registrados · 06 jun", status: "Conciliación", tone: "warn" },
        { id: "COS-028", title: "Corte de prueba · El Porvenir", detail: "LOT-121 · 380 kg registrados · 29 may", status: "Registrada", tone: "muted" },
        { id: "COS-022", title: "Ciclo anterior · La Vega", detail: "LOT-126 · 710 kg · cierre documentado", status: "Cerrada", tone: "ok" },
      ],
      catalog: [
        { id: "INS-014", title: "Wondergreen 2GROW Líquido", detail: "Fertilizante líquido · concentraciones 100-20-20 y 200-0-0; esta última es la de mayor concentración de nitrógeno", status: "Muestra", tone: "muted" },
        { id: "INS-021", title: "Biol Wondergreen", detail: "Fertilizante líquido elaborado a partir de bioles de digestión anaerobia multietapa", status: "Muestra", tone: "muted" },
        { id: "BIO-003", title: "Wondergreen Trichoderma", detail: "Bioinsumo microbiológico · uso y concentración según ficha técnica vigente", status: "Muestra", tone: "muted" },
      ],
    },
  },
  sana: {
    brand: "SANA",
    kicker: "Estructuración productiva",
    context: "Proyecto agrícola",
    subtitle: "Oportunidad · inversión · seguimiento",
    description: "SANA organiza la oportunidad productiva, la inversión y el seguimiento del proyecto en una ruta de trabajo.",
    modules: [
      { id: "overview", code: "01", label: "Resumen", detail: "Portafolio y decisiones abiertas" },
      { id: "opportunities", code: "02", label: "Oportunidades", detail: "Proyectos en estructuración" },
      { id: "portfolio", code: "03", label: "Portafolio", detail: "Proyectos y etapas de trabajo" },
      { id: "followup", code: "04", label: "Seguimiento", detail: "Avance, alertas y resultados" },
      { id: "data-room", code: "05", label: "Documentación", detail: "Planes, presupuestos y soportes" },
      { id: "committee", code: "06", label: "Revisión", detail: "Hitos, evidencias y responsables" },
      { id: "participation", code: "07", label: "Participación", detail: "Estados y condiciones del proceso" },
    ],
    records: {
      opportunities: [
        { id: "OP-014", title: "Café de montaña · Proyecto de muestra 01", detail: "12 productores · 18 lotes ficticios · estructuración y acompañamiento de ejemplo", status: "En estructuración", tone: "ok", related: [{ moduleId: "portfolio", recordId: "PF-024", label: "Ver en portafolio" }] },
        { id: "OP-011", title: "Hortalizas de ciclo corto · Proyecto de muestra 02", detail: "6 lotes ficticios · presupuesto de ejemplo en revisión", status: "Por evaluar", tone: "warn", related: [{ moduleId: "followup", recordId: "SEG-099", label: "Ver seguimiento" }, { moduleId: "data-room", recordId: "DR-207", label: "Consultar presupuesto" }, { moduleId: "committee", recordId: "DEC-008", label: "Ver revisión pendiente" }] },
        { id: "OP-008", title: "Plátano asociado · Proyecto de muestra 03", detail: "11 lotes ficticios · diagnóstico de ejemplo", status: "Información inicial", tone: "muted" },
      ],
      portfolio: [
        { id: "PF-024", title: "Café de montaña · Proyecto de muestra 01", detail: "OP-014 · escenario ficticio · 12 productores · 32% de avance de ejemplo", status: "En ejecución", tone: "ok", related: [{ moduleId: "opportunities", recordId: "OP-014", label: "Volver a oportunidad" }, { moduleId: "followup", recordId: "SEG-108", label: "Revisar seguimiento" }, { moduleId: "data-room", recordId: "DR-221", label: "Consultar documentación" }, { moduleId: "committee", recordId: "DEC-014", label: "Ver revisión pendiente" }] },
        { id: "PF-019", title: "Regeneración de suelo · Proyecto de muestra 02", detail: "8 lotes ficticios · protocolo de ejemplo · 64% de avance de ejemplo", status: "Seguimiento", tone: "ok" },
        { id: "PF-013", title: "Agroforestería · Proyecto de muestra 03", detail: "4 lotes ficticios · reporte de ejemplo pendiente", status: "Alerta documental", tone: "warn" },
      ],
      followup: [
        { id: "SEG-108", title: "Validar cosecha del ciclo principal", detail: "PF-024 · registro de campo ficticio · responsable de ejemplo: comité técnico", status: "Prioridad alta", tone: "warn", related: [{ moduleId: "portfolio", recordId: "PF-024", label: "Volver al proyecto" }, { moduleId: "data-room", recordId: "DR-221", label: "Consultar soporte" }, { moduleId: "committee", recordId: "DEC-014", label: "Preparar revisión" }] },
        { id: "SEG-104", title: "Actualizar plan de acompañamiento", detail: "PF-019 · visita técnica · próxima semana", status: "En curso", tone: "ok" },
        { id: "SEG-099", title: "Revisar presupuesto de establecimiento", detail: "OP-011 · supuestos y cotizaciones de ejemplo", status: "Por asignar", tone: "muted", related: [{ moduleId: "opportunities", recordId: "OP-011", label: "Ver oportunidad" }, { moduleId: "data-room", recordId: "DR-207", label: "Abrir presupuesto" }, { moduleId: "committee", recordId: "DEC-008", label: "Ver revisión" }] },
      ],
      "data-room": [
        { id: "DR-221", title: "Resumen de seguimiento productivo · ejemplo", detail: "PF-024 · datos sintéticos · no hay archivo adjunto", status: "Solo muestra", tone: "muted", related: [{ moduleId: "portfolio", recordId: "PF-024", label: "Volver al proyecto" }, { moduleId: "followup", recordId: "SEG-108", label: "Ver seguimiento" }, { moduleId: "committee", recordId: "DEC-014", label: "Ir a revisión" }] },
        { id: "DR-218", title: "Referencia de plan agronómico · ejemplo", detail: "PF-019 · versión 03 mencionada en la muestra · sin archivo ni revisión real", status: "Sin soporte", tone: "warn" },
        { id: "DR-207", title: "Modelo de presupuesto y supuestos · ejemplo", detail: "OP-011 · sin valores verificables ni archivo adjunto", status: "Sin soporte", tone: "muted", related: [{ moduleId: "opportunities", recordId: "OP-011", label: "Volver a oportunidad" }, { moduleId: "followup", recordId: "SEG-099", label: "Ver seguimiento" }, { moduleId: "committee", recordId: "DEC-008", label: "Ir a revisión" }] },
      ],
      committee: [
        { id: "DEC-014", title: "Liberar siguiente hito del proyecto de muestra 01", detail: "PF-024 · evidencia de cosecha y conciliación ficticias", status: "Para decidir", tone: "warn", related: [{ moduleId: "portfolio", recordId: "PF-024", label: "Volver al proyecto" }, { moduleId: "followup", recordId: "SEG-108", label: "Ver seguimiento" }, { moduleId: "data-room", recordId: "DR-221", label: "Consultar documentación" }] },
        { id: "DEC-011", title: "Aprobar protocolo de suelo", detail: "PF-019 · Greenatics + Wondergreen · 12 jun", status: "Aprobada", tone: "ok" },
        { id: "DEC-008", title: "Solicitar información del proyecto de muestra 02", detail: "OP-011 · faltan costos y cronograma de ejemplo", status: "Pendiente", tone: "muted", related: [{ moduleId: "opportunities", recordId: "OP-011", label: "Volver a oportunidad" }, { moduleId: "followup", recordId: "SEG-099", label: "Ver seguimiento" }, { moduleId: "data-room", recordId: "DR-207", label: "Abrir documentación" }] },
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
    : [["Proyectos de ejemplo", "06", "4 en seguimiento"], ["Inversión de ejemplo", "COP 420 M", "Escenario ficticio"], ["Hitos del ejemplo", "18", "13 confirmados en el escenario"], ["Decisiones del ejemplo", "04", "1 de prioridad alta en el ejemplo"]];
  return (
    <div className="portfolio-demo__metrics">
      {metrics.map(([label, value, detail]) => (
        <article key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
      ))}
    </div>
  );
}

function Overview({ kind, onNavigate }: { kind: DemoKind; onNavigate: (section: string, recordId?: string) => void }) {
  if (kind === "sana") {
    const steps = [
      { id: "opportunities", recordId: "OP-014", title: "Entender la oportunidad", description: "Contexto productivo, actores, territorio y supuestos iniciales.", action: "Abrir OP-014" },
      { id: "portfolio", recordId: "PF-024", title: "Ordenar alcance y avance", description: "Etapa, hitos y responsabilidades del proyecto de muestra.", action: "Ver PF-024" },
      { id: "followup", recordId: "SEG-108", title: "Definir el seguimiento", description: "Próxima acción, responsable y evidencia que se necesitaría revisar.", action: "Ver SEG-108" },
      { id: "data-room", recordId: "DR-221", title: "Identificar los soportes", description: "Tipos de documentos y metadatos esperados; aquí no hay archivos reales.", action: "Ver DR-221" },
      { id: "committee", recordId: "DEC-014", title: "Preparar la revisión", description: "Contrasta faltantes, revisión humana y condiciones; la decisión no es evaluable.", action: "Ver DEC-014" },
      { id: "participation", title: "Entender la participación", description: "Distingue interés, revisión, compromiso, documentación y aporte conciliado.", action: "Ver sus etapas" },
    ];

    return (
      <div className="portfolio-demo__screen">
        <section className="portfolio-demo__sana-overview" aria-labelledby="sana-demo-overview-title">
          <div className="portfolio-demo__sana-overview-lead">
            <span>Recorrido sugerido</span>
            <h2 id="sana-demo-overview-title">Sigue un proyecto desde su contexto hasta la revisión.</h2>
            <p>Este recorrido conecta los seis módulos principales con una oportunidad ficticia. Explora cada tramo; los datos son de muestra y nada se crea ni se guarda.</p>
          </div>
          <ol className="portfolio-demo__sana-path">
            {steps.map((step, index) => (
              <li key={step.id}>
                <span aria-hidden="true">0{index + 1}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p></div>
                <button type="button" onClick={() => onNavigate(step.id, step.recordId)}>{step.action}<span aria-hidden="true">→</span></button>
              </li>
            ))}
          </ol>
        </section>
        <p className="portfolio-demo__sana-overview-footnote">Los datos de estas vistas son ficticios y no representan proyectos, clientes ni inversiones reales.</p>
      </div>
    );
  }

  const agroway = kind === "agroway";
  const states = agroway
    ? [["Registrado", "64"], ["Con evidencia", "52"], ["Revisado", "41"], ["Cerrado", "19"]]
    : [["Estructuración", "03"], ["En ejecución", "04"], ["Con hito confirmado", "13"], ["Con alerta", "02"]];
  const progressWidths = agroway ? [100, 81, 64, 30] : null;
  const activity = agroway
    ? [["14:20", "Trabajo de campo", "Evidencia relacionada con una labor del lote", "Registrado"], ["11:35", "Diagnóstico", "Observación del cultivo pendiente de revisión", "Por revisar"], ["09:10", "Cosecha", "Corte en conciliación", "En curso"]]
    : [["14:20", "Registro de campo", "Avance ficticio relacionado con el proyecto", "Referencia"], ["12:05", "Revisión", "Faltan soportes para valorar un hito", "No evaluable"], ["09:15", "Documentación", "Índice de soportes esperados; no hay archivos", "Sin soporte"]];

  return (
    <div className="portfolio-demo__screen">
      <Metrics kind={kind} />
      <div className="portfolio-demo__overview-grid">
        <section className="portfolio-demo__panel portfolio-demo__panel--dark">
          <span>{agroway ? "Atención del ciclo" : "Decisión del proyecto"}</span>
          <h2>{agroway ? "Revisar el diagnóstico del lote antes de cerrar el plan." : "Conciliar el avance con la evidencia disponible."}</h2>
          <p>{agroway ? "Distingue observación, recomendación y soporte antes de definir la siguiente labor." : "Relaciona avance, presupuesto y evidencia para preparar la revisión del proyecto."}</p>
        </section>
        <section className="portfolio-demo__panel">
          <div className="portfolio-demo__panel-head"><div><span>Seguimiento</span><h2>{agroway ? "Estado del ciclo" : "Estado del portafolio"}</h2></div></div>
          <div className="portfolio-demo__state-list">
            {states.map(([label, value], index) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                {progressWidths && <i aria-hidden="true"><b style={{ width: `${progressWidths[index]}%` }} /></i>}
              </div>
            ))}
          </div>
          <p className="portfolio-demo__footnote">
            {agroway
              ? "Cruza periodo, fuente y responsable antes de interpretar un avance."
              : "Conteos de ejemplo por estado; las categorías no representan partes de un mismo total."}
          </p>
        </section>
      </div>
      <section className="portfolio-demo__panel">
        <div className="portfolio-demo__panel-head"><div><span>Actividad reciente</span><h2>Registros del ciclo y del proyecto</h2></div></div>
        <div className="portfolio-demo__timeline">
          {activity.map(([time, type, copy, state]) => (
            <div key={`${time}-${type}`}><time>{time}</time><i /><div><strong>{copy}</strong><small>{type} · {state}</small></div></div>
          ))}
        </div>
      </section>
    </div>
  );
}

const participationStages = [
  { id: "interest", name: "Interés", status: "No registrado", description: "Una persona podría indicar qué información de una oportunidad desea conocer. Esta vista solo explica esa etapa: no registra ni envía intereses.", condition: "Elegir un proyecto y precisar el motivo de la conversación; una solicitud real requeriría revisar identidad, autorización y tratamiento de datos.", evidence: "Ficha informativa del proyecto y motivo de interés, con procedencia y versión visibles." },
  { id: "request", name: "Solicitud", status: "No creada", description: "Una solicitud formal solo podría abrirse con un proyecto habilitado y la información mínima definida.", condition: "Identidad y autorización verificadas, proyecto habilitado y requisitos de información comunicados.", evidence: "Resumen de solicitud, plan, presupuesto y soportes del predio; todos sujetos a revisión." },
  { id: "review", name: "Revisión humana", status: "No iniciada", description: "Una persona revisora analizaría los soportes, registraría hallazgos y dejaría una decisión con responsable y fecha.", condition: "Soportes vigentes y completos para el alcance acordado; revisión separada de quien estructura el proyecto.", evidence: "Lista de revisión, hallazgos, responsable, fecha y decisión documentada." },
  { id: "commitment", name: "Compromiso", status: "No aprobado ni creado", description: "El interés o la revisión no equivalen a un compromiso de participación.", condition: "Revisión aprobada, términos autorizados y aceptación expresa de las partes.", evidence: "Acuerdo con versión, alcance, obligaciones y aceptación; no existe uno en esta muestra." },
  { id: "documentation", name: "Documentación", status: "Sin archivos ni verificación", description: "Un archivo recibido no se convierte por sí solo en un hecho aprobado ni en una condición cumplida.", condition: "Cada documento requiere tipo, origen, versión, fecha, permiso y estado de verificación.", evidence: "Índice de documentos requeridos y registro de revisión; esta muestra no adjunta ni valida archivos." },
  { id: "contribution", name: "Aporte conciliado", status: "No recibido ni conciliado", description: "Un compromiso y un aporte son estados distintos y deben conservar registros separados.", condition: "Confirmación por un canal autorizado y conciliación verificable, independientes de la aceptación del compromiso.", evidence: "Comprobante y conciliación del canal externo autorizado; no hay movimiento financiero en esta muestra." },
] as const;

function ParticipationView() {
  const [selectedStageId, setSelectedStageId] = useState<(typeof participationStages)[number]["id"]>("interest");
  const selectedStage = participationStages.find((stage) => stage.id === selectedStageId) ?? participationStages[0];

  return (
    <div className="portfolio-demo__screen">
      <section className="portfolio-demo__section-intro" aria-labelledby="sana-participation-title">
        <div>
          <h2 id="sana-participation-title">Cada etapa requiere una condición distinta.</h2>
          <p>Explora el modelo previsto de participación revisada por personas. Esta vista es explicativa; no representa el historial de una persona ni de un proyecto real.</p>
        </div>
      </section>

      <div className="portfolio-demo__participation-layout">
        <nav className="portfolio-demo__participation-nav" aria-label="Etapas conceptuales de participación">
          {participationStages.map((stage, index) => (
            <button type="button" key={stage.id} className={selectedStageId === stage.id ? "is-active" : undefined} aria-pressed={selectedStageId === stage.id} aria-controls="sana-participation-detail" onClick={() => setSelectedStageId(stage.id)}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span><strong>{stage.name}</strong><small>{stage.status}</small></span>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </nav>

        <section id="sana-participation-detail" className="portfolio-demo__participation-detail" aria-live="polite" aria-atomic="true" aria-labelledby="sana-participation-stage-title">
          <span>Estado del modelo</span>
          <h3 id="sana-participation-stage-title">{selectedStage.name}</h3>
          <Status tone="muted">{selectedStage.status}</Status>
          <p>{selectedStage.description}</p>
          <dl>
            <div><dt>Condición para avanzar</dt><dd>{selectedStage.condition}</dd></div>
            <div><dt>Soporte o control esperado</dt><dd>{selectedStage.evidence}</dd></div>
          </dl>
        </section>
      </div>

      <p className="portfolio-demo__participation-boundary"><strong>Alcance de esta muestra:</strong> no habilita cuentas, solicitudes reales, acuerdos, archivos, compromisos, pagos ni aportes. La participación, si se desarrolla, requiere autorización, revisión humana y controles separados.</p>
    </div>
  );
}

const evidenceCategories = [
  { id: "identity", title: "Identidad y autorización", status: "No incluidas", description: "Responsable del proyecto, facultad para compartir la ficha y alcance autorizado de consulta.", metadata: "Origen · responsable · permiso · alcance · fecha de autorización." },
  { id: "plan", title: "Plan productivo y presupuesto", status: "Datos sintéticos · sin expediente", description: "Supuestos, cantidades, costos, periodo, responsable técnico y versión vigente del plan.", metadata: "Tipo · versión · origen · periodo · unidades · responsable · revisión." },
  { id: "property", title: "Soportes del predio", status: "No aportados", description: "Relación con el predio y permisos de uso; la ubicación pública requiere minimización y autorización.", metadata: "Tipo · origen · permiso de uso · alcance de divulgación · vigencia." },
  { id: "review", title: "Revisión y decisión", status: "No iniciada", description: "Checklist, hallazgos, responsable revisor, fecha y decisión trazable.", metadata: "Revisor · fecha · versión examinada · hallazgos · decisión." },
  { id: "field", title: "Seguimiento agrícola autorizado", status: "Sin conexión real", description: "Una lectura de campo necesitaría referencia AGROWAY, ciclo, corte, vigencia y permiso de consulta aprobados.", metadata: "Sistema fuente · contrato · versión · corte · frescura · alcance autorizado." },
  { id: "impact", title: "Método y evidencia de impacto", status: "No calculado", description: "Un resultado requiere método, versión, línea base, unidad, periodo, fuente y revisión; los datos del ejemplo no lo acreditan.", metadata: "Método · versión · línea base · unidad · periodo · fuente · revisor." },
  { id: "commitment", title: "Acuerdo y aceptación", status: "No creados", description: "La aceptación de una propuesta requiere revisión aprobada, términos autorizados y voluntad expresa de las partes.", metadata: "Partes · versión · alcance · obligaciones · aceptación · fecha." },
  { id: "contribution", title: "Comprobante y conciliación", status: "Sin aporte ni conciliación", description: "Un eventual aporte se registraría aparte del compromiso y se conciliaría mediante un canal autorizado.", metadata: "Canal · referencia · fecha · monto conciliado · responsable · soporte." },
] as const;

const decisionPrerequisites: Record<string, { summary: string; items: { title: string; status: string; detail: string }[] }> = {
  "DEC-014": {
    summary: "La propuesta de liberar el siguiente hito no se puede evaluar con los datos ficticios de esta muestra.",
    items: [
      { title: "Hito y condición de avance", status: "Por definir", detail: "Falta una condición medible y acordada para liberar el siguiente hito." },
      { title: "Cosecha y conciliación", status: "Sin soporte", detail: "DR-221 es una referencia sintética; no hay archivo, registro de recepción ni conciliación verificable." },
      { title: "Revisión técnica", status: "No iniciada", detail: "No consta una persona revisora ni una revisión del corte de evidencia." },
      { title: "Autorización y trazabilidad", status: "No registradas", detail: "La muestra no emite decisiones, autoriza recursos ni conserva actas reales." },
    ],
  },
  "DEC-008": {
    summary: "La solicitud de información es un ejemplo; los faltantes no se han enviado a un proyecto real.",
    items: [
      { title: "Presupuesto", status: "Sin soporte", detail: "DR-207 contiene solo una referencia ficticia, sin valores ni archivo verificable." },
      { title: "Cronograma y alcance", status: "Pendientes", detail: "No hay fechas, entregables ni responsables confirmados en la muestra." },
      { title: "Revisión humana", status: "No asignada", detail: "No consta responsable que valide la información recibida." },
      { title: "Respuesta y registro", status: "No disponibles", detail: "No se envían solicitudes ni se reciben respuestas desde este prototipo." },
    ],
  },
};

function DecisionPrerequisites({ recordId }: { recordId: string }) {
  const decision = decisionPrerequisites[recordId];
  if (!decision) return null;

  return (
    <section className="portfolio-demo__decision-checks" aria-labelledby="sana-decision-checks-title">
      <header><div><span>Control previo · registro de muestra</span><h3 id="sana-decision-checks-title">Antes de considerar esta decisión</h3></div><Status tone="warn">No evaluable</Status></header>
      <p>{decision.summary}</p>
      <ul>{decision.items.map((item) => (
        <li key={item.title}>
          <div><strong>{item.title}</strong><small>{item.detail}</small></div>
          <Status tone="muted">{item.status}</Status>
        </li>
      ))}</ul>
      <small className="portfolio-demo__decision-boundary">Esta pantalla no aprueba proyectos, libera recursos, solicita información ni registra decisiones reales.</small>
    </section>
  );
}

function ProjectContextCard({ recordId }: { recordId: string }) {
  if (recordId !== "PF-024") return null;

  return (
    <section className="portfolio-demo__project-context" aria-labelledby="sana-project-context-title">
      <header><div><span>Contexto consolidado · muestra ficticia</span><h3 id="sana-project-context-title">Ficha de contexto del proyecto</h3></div><Status tone="muted">Sin datos verificados</Status></header>
      <div className="portfolio-demo__project-facts">
        <article><span>Oportunidad de origen</span><strong>OP-014</strong><small>Proyecto de muestra 01</small></article>
        <article><span>Alcance narrado</span><strong>12 productores · 18 lotes</strong><small>Cifras ficticias del escenario</small></article>
        <article><span>Avance declarado</span><strong>32%</strong><small>Valor ilustrativo; no es medición verificada</small></article>
      </div>
      <div className="portfolio-demo__project-evidence">
        <strong>Para interpretar este avance harían falta:</strong>
        <ul>
          <li>Fuente, fecha de corte y responsable del dato.</li>
          <li>Alcance y presupuesto con supuestos y versión.</li>
          <li>Soporte del hito productivo y conciliación correspondiente.</li>
        </ul>
      </div>
      <p>Esta consolidación solo relaciona registros ficticios; no confirma productores, predios, costos, cosechas ni resultados reales.</p>
    </section>
  );
}

function EvidenceRegister() {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<(typeof evidenceCategories)[number]["id"]>("plan");
  const selectedEvidence = evidenceCategories.find((item) => item.id === selectedEvidenceId) ?? evidenceCategories[0];

  return (
    <section className="portfolio-demo__evidence" aria-labelledby="sana-evidence-title">
      <header>
        <div><h2 id="sana-evidence-title">Qué falta para revisar una ficha.</h2><p>Índice de tipos de evidencia esperados. Esta muestra no contiene expedientes ni archivos verificables.</p></div>
        <strong>Sin expedientes reales</strong>
      </header>
      <div className="portfolio-demo__evidence-layout">
        <nav className="portfolio-demo__evidence-nav" aria-label="Tipos de evidencia previstos">
          {evidenceCategories.map((item) => (
            <button type="button" key={item.id} className={selectedEvidenceId === item.id ? "is-active" : undefined} aria-pressed={selectedEvidenceId === item.id} aria-controls="sana-evidence-detail" onClick={() => setSelectedEvidenceId(item.id)}>
              <span><strong>{item.title}</strong><small>{item.status}</small></span>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </nav>
        <section id="sana-evidence-detail" className="portfolio-demo__evidence-detail" aria-live="polite" aria-atomic="true" aria-labelledby="sana-evidence-detail-title">
          <span>Tipo de soporte · estado de la muestra</span>
          <h3 id="sana-evidence-detail-title">{selectedEvidence.title}</h3>
          <Status tone="muted">{selectedEvidence.status}</Status>
          <p>{selectedEvidence.description}</p>
          <dl><div><dt>Metadatos que debería conservar</dt><dd>{selectedEvidence.metadata}</dd></div></dl>
        </section>
      </div>
      <p className="portfolio-demo__evidence-boundary">Un archivo cargado no sería, por sí solo, un hecho verificado. Antes de mostrar documentos reales harían falta permisos, procedencia, versionado, revisión humana y recuperación segura.</p>
    </section>
  );
}

function RecordsView({ kind, module, records, selectedRecordId, setSelectedRecordId, onOpenRelated }: { kind: DemoKind; module: ModuleItem; records: RecordItem[]; selectedRecordId: string | null; setSelectedRecordId: (id: string | null) => void; onOpenRelated: (moduleId: string, recordId: string) => void }) {
  const [query, setQuery] = useState("");
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const normalizedQuery = query.trim().toLocaleLowerCase("es");
  const visibleRecords = records.filter((record) => [record.id, record.title, record.detail, record.status].some((value) => value.toLocaleLowerCase("es").includes(normalizedQuery)));
  const selectedRecord = records.find((record) => record.id === selectedRecordId);
  const section = sectionGuidance[kind][module.id];
  useEffect(() => {
    if (!selectedRecordId) return;
    const frame = requestAnimationFrame(() => triggerRefs.current[selectedRecordId]?.focus());
    return () => cancelAnimationFrame(frame);
  }, [selectedRecordId]);

  const updateQuery = (value: string) => {
    setQuery(value);
    if (!selectedRecordId) return;
    const normalizedValue = value.trim().toLocaleLowerCase("es");
    const remainsVisible = records.some((record) =>
      record.id === selectedRecordId && [record.id, record.title, record.detail, record.status].some((field) => field.toLocaleLowerCase("es").includes(normalizedValue)),
    );
    if (!remainsVisible) setSelectedRecordId(null);
  };

  return (
    <div className="portfolio-demo__screen">
      <section className="portfolio-demo__section-intro">
        <div>
          <span>{module.code} · {module.label}</span>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <div><strong>{String(visibleRecords.length).padStart(2, "0")}</strong><small>registros visibles</small></div>
      </section>

      <section className="portfolio-demo__panel">
        <div className="portfolio-demo__panel-head">
          <div><span>Registros</span><h2>{module.label}</h2></div>
          <label className="portfolio-demo__search">Buscar en {module.label}<input type="search" value={query} onChange={(event) => updateQuery(event.currentTarget.value)} placeholder="Código, nombre o estado" /></label>
        </div>
        <div className="portfolio-demo__records">
          {visibleRecords.map((record) => (
            <button type="button" key={record.id} ref={(node) => { triggerRefs.current[record.id] = node; }} className={selectedRecordId === record.id ? "is-selected" : undefined} aria-label={`${selectedRecordId === record.id ? "Cerrar" : "Ver"} detalle de ${record.title}`} aria-expanded={selectedRecordId === record.id} aria-controls="portfolio-demo-record-detail" onClick={() => setSelectedRecordId(selectedRecordId === record.id ? null : record.id)}>
              <span>{record.id}</span>
              <div><strong>{record.title}</strong><small>{record.detail}</small></div>
              <Status tone={record.tone}>{record.status}</Status>
              <b aria-hidden="true">{selectedRecordId === record.id ? "−" : "+"}</b>
            </button>
          ))}
        </div>
        {visibleRecords.length === 0 ? <p className="portfolio-demo__selection">No hay registros de ejemplo que coincidan con “{query}”. Prueba con otro código, nombre o estado.</p> : !selectedRecord ? <p className="portfolio-demo__selection">Selecciona un registro para revisar su detalle.</p> : null}
        <aside id="portfolio-demo-record-detail" className="portfolio-demo__record-detail" aria-live="polite" aria-atomic="true" hidden={!selectedRecord}>
          {selectedRecord ? (
            <>
            <div><span>Qué revisar a continuación · {selectedRecord.id}</span><strong>{reviewGuidance[kind][module.id].title}</strong><p>{reviewGuidance[kind][module.id].description}</p>
              {selectedRecord.related?.length ? <section className="portfolio-demo__record-relations" aria-labelledby="portfolio-demo-related-title"><h3 id="portfolio-demo-related-title">Continúa el recorrido de este proyecto ficticio</h3><div>{selectedRecord.related.map((related) => <button type="button" key={`${related.moduleId}-${related.recordId}`} onClick={() => onOpenRelated(related.moduleId, related.recordId)}>{related.label}<span>{related.recordId}</span><b aria-hidden="true">→</b></button>)}</div></section> : null}
              {kind === "sana" && module.id === "portfolio" && <ProjectContextCard recordId={selectedRecord.id} />}
              {kind === "sana" && module.id === "committee" && <DecisionPrerequisites recordId={selectedRecord.id} />}
            </div>
            <button type="button" className="portfolio-demo__secondary" onClick={() => {
              const activeId = selectedRecordId;
              setSelectedRecordId(null);
              if (activeId) requestAnimationFrame(() => triggerRefs.current[activeId]?.focus());
            }}>Cerrar detalle y volver al registro</button>
            </>
          ) : null}
        </aside>
      </section>

      {kind === "agroway" && module.id === "catalog" && (
        <aside className="portfolio-demo__catalog-context" aria-label="Alcance del catálogo de muestra">
          <p>Esta vista ilustra cómo relacionar una referencia con cultivo, labor y evidencia; no sincroniza inventarios ni reemplaza las fichas técnicas vigentes.</p>
          <Link className="portfolio-demo__secondary" href="/wondergreen/#productos">Consultar catálogo Wondergreen</Link>
        </aside>
      )}

      {kind === "sana" && module.id === "data-room" && <EvidenceRegister />}

      <section className="portfolio-demo__panel portfolio-demo__panel--soft">
        <span>{kind === "agroway" ? "Lectura del ciclo" : "Lectura del proyecto"}</span>
        <h2>{kind === "agroway" ? "Relaciona labor, lote y resultado." : "Relaciona avance, inversión y soporte."}</h2>
        <p>{kind === "agroway" ? "Revisa el registro, su fecha y la evidencia antes de comparar labores o preparar la cosecha." : "Consulta periodo, responsable y documento antes de revisar un hito o comparar el avance con el presupuesto."}</p>
      </section>
    </div>
  );
}

export function PortfolioDemoApp({ kind }: { kind: DemoKind }) {
  const config = configs[kind];
  const contactAction = kind === "agroway" ? "Conversar sobre trazabilidad agrícola" : "Conversar sobre un proyecto agrícola";
  const [view, setView] = useState("overview");
  const [notice, setNotice] = useState("Selecciona una sección para recorrer la información.");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const activeModule = config.modules.find((module) => module.id === view) ?? config.modules[0];
  const records = config.records[view] ?? [];

  useEffect(() => {
    const syncViewFromUrl = () => {
      const requestedView = window.location.hash.slice(1);
      if (requestedView && !config.modules.some((item) => item.id === requestedView)) return;
      const module = config.modules.find((item) => item.id === requestedView) ?? config.modules[0];

      setView(module.id);
      setSelectedRecordId(null);
      setNotice(`Vista ${module.label}.`);
    };

    syncViewFromUrl();
    window.addEventListener("popstate", syncViewFromUrl);
    return () => window.removeEventListener("popstate", syncViewFromUrl);
  }, [config.modules]);

  const selectView = (nextView: string, nextRecordId?: string) => {
    const module = config.modules.find((item) => item.id === nextView);
    if (!module) return;
    const targetRecords = config.records[nextView] ?? [];
    const targetRecord = nextRecordId && targetRecords.some((record) => record.id === nextRecordId) ? nextRecordId : null;

    if (window.location.hash !== `#${module.id}`) {
      window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${module.id}`);
    }

    setView(module.id);
    setSelectedRecordId(targetRecord);
    setNotice(targetRecord ? `${targetRecord} abierto en ${module.label}.` : `Vista ${module.label}.`);
  };

  const openRelatedRecord = (moduleId: string, recordId: string) => {
    selectView(moduleId);
    setSelectedRecordId(recordId);
    const module = config.modules.find((item) => item.id === moduleId);
    setNotice(`${recordId} abierto en ${module?.label ?? "la vista seleccionada"}.`);
  };

  return <div className="portfolio-demo">
    <header className="portfolio-demo__topbar">
      <Link className="portfolio-demo__brand" href={kind === "agroway" ? "/agroway/" : "/sana/"}>
        {kind === "agroway" ? <Image src="/brand/agroway/agroway-logo.png" alt="AGROWAY" width={92} height={56} priority /> : <strong className="portfolio-demo__brand-name">SANA</strong>}
        <div><small>{config.kicker}</small></div>
      </Link>
      <div className="portfolio-demo__context"><span>Recorrido</span><strong>{config.context}</strong><small>{config.subtitle}</small></div>
      <div className="portfolio-demo__top-actions"><Link className="portfolio-demo__site-link" href={kind === "sana" ? "/sana/" : "/"} aria-label={kind === "sana" ? "Volver a la página de SANA" : "Volver al sitio Greenatics"}>{kind === "sana" ? "Conocer SANA" : "Volver a Greenatics"}</Link></div>
    </header>
    <div className="portfolio-demo__body">
      <aside className="portfolio-demo__rail" aria-label={`Módulos de ${config.brand}`}>
        <nav aria-label={`Secciones del recorrido ${config.brand}`}>{config.modules.map((module) => <button type="button" key={module.id} className={view === module.id ? "is-active" : undefined} aria-current={view === module.id ? "page" : undefined} onClick={() => selectView(module.id)}><b>{module.code}</b><div><strong>{module.label}</strong><small>{module.detail}</small></div></button>)}</nav>
        <label className="portfolio-demo__mobile-switcher" htmlFor={`${kind}-mobile-section`}>
          <span>Sección activa</span>
          <select id={`${kind}-mobile-section`} aria-label={`Sección activa del recorrido ${config.brand}`} value={view} onChange={(event) => selectView(event.currentTarget.value)}>
            {config.modules.map((module) => <option value={module.id} key={module.id}>{module.code} · {module.label}</option>)}
          </select>
        </label>
      </aside>
      <section className="portfolio-demo__workspace" aria-label={`Área de trabajo de ${config.brand}`}>
        <div className="portfolio-demo__workspace-head"><div><span>{config.brand} / {activeModule.label}</span><h1>{activeModule.label}</h1><p>{activeModule.id === "overview" ? config.description : activeModule.detail}</p></div><div className="portfolio-demo__head-actions"><Link className="portfolio-demo__primary" href={`/contacto/?interes=${kind}`}>{contactAction}</Link></div></div>
        <p className="portfolio-demo__notice">{kind === "sana" ? "Demostración con datos ficticios. La navegación, búsqueda y selección son locales; no se guarda ni comparte información." : "Demo navegable con datos ficticios. La navegación, búsqueda y selección son locales; no se guarda ni comparte información ni conecta fincas reales."}</p>
        <p className="portfolio-demo__screen-reader-status" role="status" aria-live="polite">{notice}</p>
      {view === "overview" ? <Overview kind={kind} onNavigate={selectView} /> : view === "participation" && kind === "sana" ? <ParticipationView /> : <RecordsView key={view} kind={kind} module={activeModule} records={records} selectedRecordId={selectedRecordId} setSelectedRecordId={setSelectedRecordId} onOpenRelated={openRelatedRecord} />}
      </section>
    </div>
  </div>;
}
