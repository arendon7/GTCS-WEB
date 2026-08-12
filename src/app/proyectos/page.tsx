import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyectos y experiencia",
  description: "Experiencia Greenatics en diagnóstico, plantas, rehabilitación, operación, rutas selectivas, tratamiento biológico, productos agrícolas y trazabilidad.",
  alternates: { canonical: "/proyectos/" },
};

const experience = [
  ["Diagnóstico y estructuración", "Lectura de generación, infraestructura, territorio, modelo operativo y alternativas antes de invertir."],
  ["Rehabilitación", "Evaluación y recuperación progresiva de plantas o composteras que requieren repotenciación, proceso, personal o mantenimiento."],
  ["Puesta en marcha", "Arranque y estabilización de procesos, protocolos, capacitación, control y resolución de desviaciones."],
  ["Tratamiento biológico", "Compostaje, digestión anaerobia y esquemas combinados según características de la corriente y objetivos del proyecto."],
  ["Rutas y suministro", "Separación en la fuente, rutas selectivas, microrrutas y captura de datos para asegurar material de mejor calidad."],
  ["Productos y mercado", "Conexión del aprovechamiento con compost, biol, fertilizantes organominerales, Wondergreen y posibles destinos de valor."],
  ["Operación", "POE, roles, mantenimiento, inventarios, calidad, programación, reportes y mejora continua."],
  ["Datos", "Trazabilidad desde generador y recepción hasta proceso, producto, despacho e indicadores de impacto gobernados."],
];

export default function ProjectsPage() {
  return (
    <>
      <section className="solution-hero">
        <div className="container solution-hero-grid">
          <div>
            <span className="eyebrow">Proyectos Greenatics</span>
            <h1>La experiencia no es una foto de una planta. Es saber qué hacer antes, durante y después de construirla.</h1>
            <p className="lead">Nuestros casos documentan problemas de territorio, calidad del material, infraestructura, procesos biológicos, operación, productos y datos. Por eso usamos los proyectos como evidencia de aprendizaje transferible, no como una vitrina de cifras sin contexto.</p>
          </div>
          <aside className="solution-proof"><span className="eyebrow">Criterio de publicación</span><strong>Caso real + periodo + alcance.</strong><p>La web distingue experiencia histórica, condición actual e indicador público. Una propuesta, una capacidad nominal o una fotografía antigua nunca se convierten automáticamente en un resultado vigente.</p></aside>
        </div>
      </section>

      <section className="projects-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Casos documentados</span><h2>Dos plantas, aprendizajes diferentes.</h2><p>Yarumal permite mostrar la operación y la trazabilidad en desarrollo; Támesis aporta un caso especialmente valioso sobre diagnóstico, rehabilitación y puesta en marcha progresiva.</p></div>
          <div className="project-grid">
            <article className="project-card project-card--yarumal"><span className="project-index">CASO 01 · NORTE DE ANTIOQUIA</span><h2>Yarumal</h2><p>Experiencia documentada en recepción e inspección, segregación de impropios, lotes, compostaje, digestión anaerobia, productos, mantenimiento y construcción de una capa digital de seguimiento.</p><img className="project-symbol" src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" /><Link href="/proyectos/yarumal/">Ver caso Yarumal →</Link></article>
            <article className="project-card project-card--tamesis"><span className="project-index">CASO 02 · SUROESTE DE ANTIOQUIA</span><h2>Támesis</h2><p>Documentación de diagnóstico y propuesta de intervención para recuperar una planta existente mediante puesta en marcha, estabilización y escalabilidad, conectando ruta selectiva, biorefinería, compostaje, operación y territorio.</p><img className="project-symbol" src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" /><Link href="/proyectos/tamesis/">Ver caso Támesis →</Link></article>
          </div>
        </div>
      </section>

      <section className="project-case-section project-case-section--soft"><div className="container"><div className="section-heading"><span className="eyebrow">Experiencia que puede transferirse</span><h2>Lo valioso de un proyecto es lo que enseña para el siguiente.</h2></div><div className="project-cap-grid">{experience.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="tech-principle"><div className="container tech-principle-grid"><div><span className="eyebrow eyebrow--light">Proyectos en maduración</span><h2>Prefactibilidad y factibilidad también son proyectos.</h2></div><div><p>Greenatics trabaja en la estructuración de nuevas soluciones municipales, regionales y empresariales. Mientras un proyecto está en diagnóstico, conversación comercial o prefactibilidad, la web no lo presenta como planta adjudicada, construida u operativa. Esa separación protege la calidad de la información y permite mostrar madurez sin exagerar avance.</p><Link href="/servicios/prefactibilidad/">Ver cómo estructuramos una prefactibilidad →</Link></div></div></section>

      <section className="project-case-section"><div className="container"><div className="section-heading"><span className="eyebrow">Cómo se vuelve público un resultado</span><h2>Del registro interno a una cifra que se puede defender.</h2></div><ol className="route-list"><li><strong>Registrar</strong><span>El dato nace en la operación o en un entregable técnico identificado.</span></li><li><strong>Conciliar</strong><span>Se revisan periodo, unidad, alcance, fuente y duplicados.</span></li><li><strong>Aprobar</strong><span>Un responsable valida que el dato sí puede publicarse.</span></li><li><strong>Explicar</strong><span>La cifra se acompaña de contexto y metodología suficiente.</span></li><li><strong>Actualizar</strong><span>El resultado conserva fecha de corte y no se presenta como eterno.</span></li></ol><div className="knowledge-actions"><Link className="button button--ghost" href="/impacto/">Ver modelo de impacto público</Link></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Construir el siguiente caso</span><h2>Cada territorio parte de condiciones distintas. El aprendizaje sí puede transferirse.</h2></div><div className="button-row"><Link className="button button--dark" href="/diagnostico/">Encontrar mi ruta</Link><Link className="button button--ghost" href="/parque-ambiental/">Explorar Parque Ambiental</Link></div></div></section>
    </>
  );
}
