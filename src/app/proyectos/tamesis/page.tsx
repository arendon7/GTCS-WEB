import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyecto Támesis",
  description: "Caso Greenatics de aprovechamiento orgánico y valorización en Támesis, Antioquia.",
};

const capabilities = [
  ["Aprovechamiento orgánico", "Conversión de corrientes orgánicas mediante procesos biológicos y manejo controlado."],
  ["Compostaje", "Tratamiento y estabilización de materiales para su transformación en productos aprovechables."],
  ["Digestión anaerobia", "Integración de rutas de valorización con potencial de generación de biogás y fracciones fertilizantes."],
  ["Productos agrícolas", "Conexión del tratamiento con fertilizantes sólidos, líquidos y la lógica comercial Wondergreen."],
  ["Operación y control", "Seguimiento de actividades, condiciones de proceso, mantenimiento y trazabilidad."],
  ["Territorio", "Articulación de la solución con actores locales, aprovechamiento y retorno de valor al entorno."],
];

export default function TamesisPage() {
  return (
    <>
      <section className="project-case-hero">
        <div className="container project-case-grid">
          <div><Link className="back-link" href="/proyectos/">← Proyectos</Link><span className="eyebrow">Caso Greenatics · Támesis</span><h1>El residuo puede convertirse en producto, energía y conocimiento operativo.</h1><p className="lead">Támesis representa la integración de aprovechamiento orgánico con rutas de valorización, productos agrícolas y aprendizaje técnico aplicable a nuevos territorios.</p></div>
          <aside className="project-factbox"><span>Alcance público</span><p>La página describe capacidades y lógica tecnológica. Capacidades nominales, volúmenes procesados, producción y desempeño se publicarán solo desde registros vigentes y aprobados.</p></aside>
        </div>
      </section>
      <section className="project-case-section"><div className="container"><div className="section-heading"><span className="eyebrow">Qué demuestra este caso</span><h2>Valorización más allá de una sola tecnología.</h2></div><div className="project-cap-grid">{capabilities.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2,"0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="validation-note"><strong>Criterio de publicación:</strong> el sitio evita convertir valores internos o históricos en promesas comerciales permanentes. Los indicadores se incorporarán con fuente, fecha de corte y validación.</div></div></section>
      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Diseñar una solución</span><h2>¿Quieres evaluar compostaje, digestión o un sistema combinado?</h2></div><Link className="button button--dark" href="/contacto/">Hablar con Greenatics</Link></div></section>
    </>
  );
}
