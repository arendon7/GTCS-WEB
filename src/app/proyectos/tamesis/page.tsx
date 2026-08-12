import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyecto Támesis",
  description: "Caso Greenatics de diagnóstico, rehabilitación, puesta en marcha y aprovechamiento de residuos orgánicos en Támesis, Antioquia.",
  alternates: { canonical: "/proyectos/tamesis/" },
};

const findings = [
  ["Ruta selectiva", "La evaluación histórica identificó que calidad del material, macrocontaminantes, educación al generador y logística debían trabajarse junto con la planta."],
  ["Infraestructura", "Se documentaron necesidades de repotenciación, drenajes y manejo de lixiviados, adecuaciones de recepción, seguridad y servicios de apoyo."],
  ["Biorefinería", "El sistema anaerobio llevaba un periodo fuera de uso y requería reactivación biológica, revisión de equipos y una estrategia de arranque progresivo."],
  ["Hidrólisis", "La evaluación incluyó el estado de tanques, componentes de percolación/hidrólisis y necesidades de mantenimiento o ampliación según el esquema de operación estudiado."],
  ["Compostaje", "Se revisaron áreas, secuencia de proceso, control de lixiviados, maduración, granulometría y presencia de impropios en producto terminado."],
  ["Operación", "El proyecto no se redujo a obra física: contempló personal, POE, capacitación, equipos de apoyo, analítica, mantenimiento y herramientas digitales de trazabilidad."],
];

const phases = [
  ["01", "Puesta en marcha", "Recuperar condiciones mínimas de infraestructura, equipos, proceso, personal y control para reactivar el sistema de manera segura y ordenada."],
  ["02", "Estabilización", "Estandarizar procedimientos, mejorar el comportamiento de los procesos biológicos, fortalecer mantenimiento y reducir variabilidad operacional."],
  ["03", "Escalabilidad", "Usar la operación estabilizada y sus datos para evaluar nuevas capacidades, corrientes, productos y un posible papel territorial de mayor escala."],
];

const learning = [
  ["Una planta parada no se enciende: se pone en marcha", "La reactivación de procesos biológicos exige diagnóstico, inoculación/estabilización según el sistema, seguimiento y tiempo; no solo mantenimiento mecánico."],
  ["La ruta forma parte de la tecnología", "Si el material llega mezclado o con demasiados impropios, el problema se transfiere a selección, proceso, costos y calidad del producto."],
  ["Infraestructura y biología se condicionan entre sí", "Drenajes, cubiertas, áreas, energía, equipos y manejo de lixiviados modifican la capacidad real de controlar el proceso."],
  ["El producto empieza en la recepción", "El potencial de compost, biol o fertilizantes depende de la materia prima, el proceso, el control de calidad y la formulación posterior."],
  ["Escalar después de estabilizar", "La capacidad nominal no reemplaza la evidencia operacional. Primero se demuestra suministro, proceso, personal y destino; después se justifica ampliar."],
  ["El dato debe nacer en la operación", "Bitácoras, mantenimiento, recepción, lotes, inventarios y variables de proceso permiten identificar por qué la planta mejora o se desvía."],
];

export default function TamesisPage() {
  return (
    <>
      <section className="project-case-hero">
        <div className="container project-case-grid">
          <div>
            <Link className="back-link" href="/proyectos/">← Proyectos</Link>
            <span className="eyebrow">Caso Greenatics · Támesis</span>
            <h1>Rehabilitar una planta significa recuperar una operación, no solamente reparar equipos.</h1>
            <p className="lead">La documentación de Támesis muestra una situación frecuente en proyectos municipales: existe infraestructura y experiencia previa, pero hacen falta diagnóstico, repotenciación, reactivación biológica, protocolos, logística de suministro, personal, control y una ruta clara de estabilización.</p>
          </div>
          <aside className="project-factbox">
            <span>Lectura correcta del caso</span>
            <p>Esta página reconstruye aprendizajes y alcance documentado de evaluaciones y propuestas históricas de puesta en marcha. No presenta presupuestos, capacidades nominales, registros, licencias o rendimientos antiguos como estado actual de la planta.</p>
          </aside>
        </div>
      </section>

      <section className="project-case-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Diagnóstico integral</span><h2>El problema estaba distribuido en toda la cadena.</h2><p>Las visitas y documentos de trabajo revisaron simultáneamente suministro, infraestructura, proceso biológico, compostaje, control de externalidades y recursos para operar.</p></div>
          <div className="project-cap-grid">{findings.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="solution-flow">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Modelo de intervención documentado</span><h2>Puesta en marcha → Estabilización → Escalabilidad.</h2><p>Este orden sigue siendo valioso como criterio de proyecto: recuperar control antes de pretender operar a una escala mayor.</p></div>
          <ol className="solution-flow-list solution-flow-list--three">{phases.map(([number,title,copy])=><li key={number}><span>{number}</span><strong>{title}</strong><small>{copy}</small></li>)}</ol>
        </div>
      </section>

      <section className="project-case-section project-case-section--soft">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Qué aprendemos de Támesis</span><h2>Seis principios transferibles a otras plantas.</h2></div>
          <div className="project-cap-grid">{learning.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="tech-principle">
        <div className="container tech-principle-grid">
          <div><span className="eyebrow eyebrow--light">De planta a sistema territorial</span><h2>La escalabilidad abre la conversación sobre un Parque Ambiental.</h2></div>
          <div><p>La documentación histórica de Támesis incluso plantea que una operación estabilizada puede convertirse en base para ampliar la atención regional y desarrollar estrategias de economía circular. En la V0.2 tratamos esa idea como una arquitectura de proyecto que requiere nueva prefactibilidad, no como una capacidad vigente ya demostrada.</p><Link href="/parque-ambiental/">Conocer el concepto de Parque Ambiental →</Link></div>
        </div>
      </section>

      <section className="project-case-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Información que sí debería medir una puesta en marcha</span><h2>La estabilización necesita evidencia.</h2></div>
          <ol className="route-list route-list--six"><li><strong>Entrada</strong><span>Generadores, toneladas, impropios y frecuencia.</span></li><li><strong>Proceso</strong><span>Lotes, tiempos, parámetros y novedades.</span></li><li><strong>Mantenimiento</strong><span>Equipos, paradas, causa y acción correctiva.</span></li><li><strong>Producto</strong><span>Tipo, lote, calidad, cantidad e inventario.</span></li><li><strong>Destino</strong><span>Despacho, uso, cliente o aplicación.</span></li><li><strong>Mejora</strong><span>Alertas, desviaciones y decisiones de escalamiento.</span></li></ol>
          <div className="validation-note"><strong>Criterio de publicación:</strong> los valores históricos de producción, inversión o capacidad permanecen como evidencia de proyecto interna hasta que exista reconciliación con registros vigentes y fecha de corte.</div>
        </div>
      </section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">¿Tienes una planta subutilizada?</span><h2>Antes de reemplazarla, diagnostiquemos qué parte del sistema necesita recuperarse.</h2></div><Link className="button button--dark" href="/servicios/rehabilitacion/">Ver servicio de rehabilitación</Link></div></section>
    </>
  );
}
