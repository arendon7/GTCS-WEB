import type { Metadata } from "next";
import Link from "next/link";
import { environmentalParkModules, municipalServices } from "@/data/services";

export const metadata: Metadata = {
  title: "Municipios y ESP",
  description: "Greenatics estructura proyectos de orgánicos para municipios y ESP: PGIRS, prefactibilidad, rutas selectivas, motocarguero, plantas, rehabilitación, operación y trazabilidad.",
  alternates: { canonical: "/municipios/" },
};

const moments = [
  ["Tengo el problema, no el proyecto", "Diagnóstico + PGIRS + prefactibilidad", "Ordenamos generación, actores, costos, infraestructura y alternativas antes de definir inversión."],
  ["Ya existe un proyecto", "Factibilidad + ingeniería", "Revisamos supuestos, balances, implantación, equipos, cantidades, APU y lógica de operación según alcance."],
  ["Tengo infraestructura que no funciona", "Diagnóstico + rehabilitación", "Separamos fallas físicas, biológicas, logísticas, administrativas y de personal antes de intervenir."],
  ["La planta existe, falta suministro", "Ruta selectiva + motocarguero", "Diseñamos y probamos generadores, frecuencias, microrrutas, tiempos, calidad de separación y datos de recolección."],
  ["La planta funciona, pero no está bajo control", "Dirección/operación + OPS", "Estandarizamos programación, registros, mantenimiento, lotes, producto, inventarios, alertas e indicadores."],
];

const publicQuestions = [
  "¿Cuánta fracción orgánica se genera y cuánto puede separarse realmente?",
  "¿Qué parte del PGIRS ya está implementada y qué proyectos siguen pendientes?",
  "¿Existe ruta selectiva, cobertura, frecuencia y generadores caracterizados?",
  "¿Hay infraestructura aprovechable o conviene una nueva solución?",
  "¿Quién operará la planta, con qué personal, presupuesto y responsabilidades?",
  "¿Qué productos o destinos tendrán las salidas del proceso?",
  "¿Cómo se registrarán recepción, impropios, lotes, mantenimiento, producto e impacto?",
  "¿Cuál es la escala realista de arranque y cómo puede crecer el sistema?",
];

export default function MunicipiosPage() {
  return (
    <>
      <section className="municipal-hero municipal-hero--depth">
        <div className="container municipal-grid">
          <div>
            <span className="eyebrow eyebrow--light">Greenatics para municipios y ESP</span>
            <h1>Del PGIRS a una operación de aprovechamiento que sí puede sostenerse.</h1>
            <p className="lead">Un proyecto de orgánicos necesita mucho más que infraestructura. Greenatics conecta planeación, separación en la fuente, rutas selectivas, plantas, operación, productos y datos para construir sistemas que puedan arrancar, estabilizarse y mejorar.</p>
            <div className="button-row"><Link className="button button--light" href="/servicios/diagnostico-caracterizacion/">Solicitar diagnóstico territorial</Link><Link className="button button--outline-light" href="/servicios/">Ver portafolio completo</Link></div>
          </div>
          <aside className="municipal-stat municipal-stat--deep"><span>Ruta Greenatics</span><strong>Planear → Recolectar → Transformar → Operar → Medir → Devolver valor</strong><p>La escala, tecnología y modelo contractual se definen después de entender el territorio; no antes.</p></aside>
        </div>
      </section>

      <section className="public-question-section"><div className="container"><div className="section-heading"><span className="eyebrow">Antes de comprar equipos</span><h2>Ocho preguntas que cambian el proyecto.</h2><p>La factibilidad técnica depende de la cadena completa. Estas preguntas alimentan el diagnóstico y evitan diseñar una planta desconectada de su suministro y de su operación.</p></div><div className="question-grid">{publicQuestions.map((question,index)=><article key={question}><span>{String(index+1).padStart(2,"0")}</span><p>{question}</p></article>)}</div></div></section>

      <section className="municipal-moments"><div className="container"><div className="section-heading"><span className="eyebrow">¿En qué momento está tu municipio?</span><h2>No todos necesitan empezar por el mismo servicio.</h2></div><div className="moment-stack">{moments.map(([situation,route,copy],index)=><article key={situation}><span>{String(index+1).padStart(2,"0")}</span><div><small>Situación</small><h3>{situation}</h3></div><div><small>Ruta sugerida</small><strong>{route}</strong><p>{copy}</p></div></article>)}</div></div></section>

      <section className="capabilities capabilities--depth"><div className="container"><div className="section-heading"><span className="eyebrow">Servicios para municipios y ESP</span><h2>Del instrumento de planeación al detalle de la operación.</h2><p>Cada bloque puede contratarse de manera independiente o formar parte de un proyecto integral.</p></div><div className="municipal-service-grid">{municipalServices.map((service)=><article key={service.slug}><div className="service-depth-meta"><span>{service.category}</span><em>{service.audience}</em></div><h3>{service.name}</h3><p>{service.summary}</p><ul>{service.includes.slice(0,4).map((item)=><li key={item}>{item}</li>)}</ul><Link href={`/servicios/${service.slug}/`}>Ver servicio en profundidad →</Link></article>)}</div></div></section>

      <section className="park-section">
        <div className="container park-grid">
          <div className="park-intro"><span className="eyebrow eyebrow--light">Concepto Greenatics</span><h2>Parque Ambiental / Parque Tecnológico Ambiental.</h2><p>Más que una planta aislada, es una arquitectura territorial que puede integrar aprovechamiento, logística, productos, energía, formación y datos en un mismo sistema. Su configuración se define mediante diagnóstico y prefactibilidad; no existe una capacidad o paquete universal.</p><div className="button-row"><Link className="button button--light" href="/parque-ambiental/">Explorar el concepto</Link><Link className="button button--outline-light" href="/servicios/prefactibilidad/">Evaluar prefactibilidad</Link></div></div>
          <div className="park-module-grid">{environmentalParkModules.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><strong>{title}</strong><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="motocarguero-section"><div className="container motocarguero-grid"><div><span className="eyebrow">Implementar para aprender</span><h2>Motocarguero: una microrruta también puede ser un instrumento de diagnóstico.</h2><p>Greenatics contempla el motocarguero como servicio/piloto para recolección selectiva y toma de datos. En lugar de diseñar una expansión solo en escritorio, una ruta piloto permite medir puntos atendidos, tiempos, frecuencia, volumen, impropios y comportamiento de los generadores.</p><Link className="knowledge-inline-link" href="/servicios/motocarguero/">Ver servicio de motocarguero →</Link></div><div className="motocarguero-flow"><div><span>01</span><strong>Seleccionar generadores</strong></div><div><span>02</span><strong>Diseñar recorrido</strong></div><div><span>03</span><strong>Operar y registrar</strong></div><div><span>04</span><strong>Ajustar frecuencia</strong></div><div><span>05</span><strong>Escalar con evidencia</strong></div></div></div></section>

      <section className="route-section" id="ruta"><div className="container"><div className="section-heading"><span className="eyebrow">Maduración del proyecto</span><h2>Empezar, consolidar y escalar.</h2></div><ol className="route-list route-list--six"><li><strong>Diagnosticar</strong><span>Generación, actores, PGIRS, infraestructura y brechas.</span></li><li><strong>Diseñar</strong><span>Rutas, alternativas, capacidades, implantación y operación.</span></li><li><strong>Implementar</strong><span>Infraestructura, procedimientos, personal y formación.</span></li><li><strong>Estabilizar</strong><span>Arranque, calidad del material, parámetros, mantenimiento y producto.</span></li><li><strong>Medir</strong><span>Generador → ruta → recepción → proceso → producto → destino.</span></li><li><strong>Escalar</strong><span>Nuevos generadores, módulos, territorios o salidas con datos reales.</span></li></ol></div></section>

      <section className="public-readiness"><div className="container public-readiness-grid"><div><span className="eyebrow eyebrow--light">Información y cumplimiento</span><h2>La documentación acompaña la operación; no la reemplaza.</h2></div><div><p>Cuando el alcance lo requiere, Greenatics puede organizar información técnica, operativa y documental para soportar seguimiento del servicio, reportes, metas del PGIRS y procesos de preparación de información. La web no presenta NUIT, RUPS o SUI como permisos automáticos ni como sustitutos de los trámites y responsabilidades que correspondan a cada prestador.</p><Link href="/contacto/">Revisar el contexto de mi ESP →</Link></div></div></section>
    </>
  );
}
