import type { Metadata } from "next";
import Link from "next/link";
import { companyServices } from "@/data/services";

export const metadata: Metadata = {
  title: "Empresas y grandes generadores",
  description: "Diagnóstico, PMIRS, recolección, tratamiento, plantas, operación y trazabilidad Greenatics para empresas y grandes generadores de residuos orgánicos.",
  alternates: { canonical: "/empresas/" },
};

const segments = [
  ["Alimentos y agroindustria", "Descartes de proceso, materias orgánicas, subproductos y corrientes que requieren caracterización antes de definir su ruta."],
  ["Plazas, retail y distribución", "Alta concentración de material orgánico, múltiples generadores y necesidad de separación, almacenamiento, frecuencia y trazabilidad."],
  ["Hoteles, restaurantes y centros comerciales", "Corrientes recurrentes que pueden organizarse mediante separación, recolección programada y evidencia de tratamiento."],
  ["Pecuario", "Estiércoles y otras corrientes orgánicas con potencial de tratamiento biológico sujeto a composición, agua, escala y condiciones del predio."],
  ["Instituciones y campus", "Colegios, universidades, hospitales y sedes con necesidades de PMIRS, cultura interna, rutas y seguimiento."],
  ["Operadores y grandes complejos", "Aeropuertos, zonas francas, operadores de aseo y complejos con varios puntos de generación y requerimientos logísticos."],
];

const evidence = [
  ["Generación", "Qué se produce, cuánto, cuándo y dónde."],
  ["Calidad", "Qué tan separado llega y qué impropios aparecen."],
  ["Logística", "Canecas, almacenamiento, frecuencias, ruta y tiempos."],
  ["Tratamiento", "Qué proceso recibe la corriente y bajo qué criterio."],
  ["Resultado", "Material tratado, novedades, productos o destinos."],
  ["Indicadores", "Consolidados que permiten demostrar gestión y mejorar."],
];

export default function CompaniesPage() {
  return (
    <>
      <section className="solution-hero solution-hero--dark company-hero--depth">
        <div className="container solution-hero-grid">
          <div>
            <span className="eyebrow eyebrow--light">Empresas y grandes generadores</span>
            <h1>Tu residuo orgánico puede pasar de costo operativo a flujo gestionado, trazable y aprovechable.</h1>
            <p className="lead">Greenatics trabaja desde la generación dentro de la empresa hasta la logística, el tratamiento y la información. Podemos intervenir una sola etapa —por ejemplo PMIRS, caracterización o recolección— o diseñar un sistema completo.</p>
            <div className="button-row"><Link className="button button--light" href="/servicios/diagnostico-caracterizacion/">Solicitar diagnóstico</Link><Link className="button button--outline-light" href="/servicios/">Ver servicios</Link></div>
          </div>
          <aside className="solution-proof"><span className="eyebrow eyebrow--light">Primero: entender la corriente</span><strong>Volumen no basta.</strong><p>Composición, humedad, impropios, estacionalidad, almacenamiento, frecuencia, distancia y destino cambian la solución técnica y económica.</p></aside>
        </div>
      </section>

      <section className="segment-section"><div className="container"><div className="section-heading"><span className="eyebrow">Dónde intervenimos</span><h2>El generador define el sistema; no al contrario.</h2><p>Estos sectores comparten una característica: la corriente orgánica solo se vuelve aprovechable de forma consistente cuando la operación interna y la logística están diseñadas para ello.</p></div><div className="segment-grid">{segments.map(([title,copy],index)=><article className="segment-card" key={title}><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p><strong>Diagnóstico → gestión → evidencia</strong></article>)}</div></div></section>

      <section className="company-pmirs"><div className="container company-pmirs-grid"><div><span className="eyebrow">Gestión dentro de la organización</span><h2>PMIRS: convertir instrucciones dispersas en una operación que la gente pueda ejecutar.</h2><p>Un plan útil no se queda en un documento. Debe aterrizar responsables, puntos de generación, separación, recipientes, almacenamiento, rutas internas, gestores, evidencias, contingencias e indicadores. El alcance exacto se adapta al tipo de organización y a los requerimientos que le sean aplicables.</p><Link className="button button--dark" href="/servicios/pmirs/">Ver servicio PMIRS</Link></div><div className="pmirs-stack">{["Diagnóstico y línea base","Mapa de corrientes y puntos","Separación y almacenamiento","Rutas internas / externas","Responsables y formación","Indicadores y mejora"].map((item,index)=><div key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}</div></div></section>

      <section className="company-service-section"><div className="container"><div className="section-heading"><span className="eyebrow">Portafolio empresarial</span><h2>Servicios que pueden combinarse según la madurez del generador.</h2></div><div className="municipal-service-grid company-service-grid">{companyServices.map((service)=><article key={service.slug}><div className="service-depth-meta"><span>{service.category}</span><em>{service.audience}</em></div><h3>{service.name}</h3><p>{service.summary}</p><div className="service-problem"><strong>Qué resuelve</strong><p>{service.solves}</p></div><Link href={`/servicios/${service.slug}/`}>Ver servicio en profundidad →</Link></article>)}</div></div></section>

      <section className="collection-service"><div className="container collection-service-grid"><div><span className="eyebrow eyebrow--light">Recolección + tratamiento</span><h2>La trazabilidad debe continuar después de que el camión se lleva el material.</h2><p>Para corrientes y zonas donde exista viabilidad operativa, Greenatics puede estructurar un servicio de recolección programada y tratamiento de orgánicos separados en la fuente. El alcance puede incorporar registros de atención, recepción, novedades y consolidados de gestión, en lugar de limitarse a una factura de transporte.</p><Link className="knowledge-inline-link crop-light-link" href="/servicios/recoleccion-tratamiento/">Ver servicio de recolección y tratamiento →</Link></div><ol>{["Caracterizar y acordar criterios de aceptación","Definir recipientes, almacenamiento y frecuencia","Recolectar y registrar la atención","Recibir, verificar y tratar la corriente","Consolidar evidencia e indicadores","Corregir impropios y optimizar la ruta"].map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></li>)}</ol></div></section>

      <section className="evidence-chain"><div className="container"><div className="section-heading"><span className="eyebrow">Cadena de evidencia</span><h2>Lo que no se registra es difícil de mejorar y difícil de demostrar.</h2></div><div className="evidence-grid">{evidence.map(([title,copy],index)=><article key={title}><span>{String(index+1).padStart(2,"0")}</span><strong>{title}</strong><p>{copy}</p></article>)}</div><div className="knowledge-actions"><Link className="button button--ghost" href="/impacto/">Conocer modelo de datos e impacto</Link></div></div></section>

      <section className="solution-flow"><div className="container"><div className="section-heading"><span className="eyebrow">Ruta Greenatics</span><h2>Primero reducir incertidumbre. Después escalar.</h2></div><ol className="solution-flow-list"><li><span>01</span><strong>Caracterizar</strong><small>Corriente, volumen, calidad, frecuencia y puntos.</small></li><li><span>02</span><strong>Ordenar</strong><small>PMIRS, separación, almacenamiento, responsables y logística.</small></li><li><span>03</span><strong>Implementar</strong><small>Ruta, servicio, infraestructura o tratamiento requerido.</small></li><li><span>04</span><strong>Valorizar</strong><small>Compostaje, digestión u otra ruta técnicamente aplicable.</small></li><li><span>05</span><strong>Medir</strong><small>Evidencia, indicadores, costos, calidad y oportunidades.</small></li></ol></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Primer paso</span><h2>Muéstranos dónde nace el residuo y construimos la ruta desde ahí.</h2></div><Link className="button button--dark" href="/servicios/diagnostico-caracterizacion/">Empezar diagnóstico</Link></div></section>
    </>
  );
}
