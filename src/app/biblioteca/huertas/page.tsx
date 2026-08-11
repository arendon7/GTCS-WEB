import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Guía para huertas urbanas, escolares y comunitarias",
  description: "Ruta práctica Greenatics/Wondergreen para planear una huerta desde suelo, establecimiento y manejo hasta seguimiento y aprendizaje circular.",
  alternates: { canonical: "/biblioteca/huertas/" },
};

const route = [
  ["01", "Definir", "Qué se quiere cultivar, para quién, en cuánto espacio y con qué disponibilidad real de agua, luz y cuidado."],
  ["02", "Preparar", "Revisar contenedor o cama, drenaje, sustrato, materia orgánica y condición inicial antes de sembrar."],
  ["03", "Establecer", "Sembrar o trasplantar sin forzar la nutrición cuando la planta aún se está adaptando."],
  ["04", "Acompañar", "Leer crecimiento, humedad, raíces, sanidad y etapa para decidir si el sistema necesita soporte."],
  ["05", "Cosechar y aprender", "Registrar qué funcionó, devolver biomasa aprovechable al ciclo y ajustar el siguiente cultivo."],
] as const;

const contexts = [
  ["Casa y matera", "Simplicidad, lectura visual y rutinas fáciles de sostener."],
  ["Huerta comunitaria", "Roles claros, calendario, manejo colectivo y trazabilidad básica."],
  ["Huerta escolar", "Aprendizaje ambiental y agronómico con gestión institucional y responsables adultos."],
  ["Proyecto territorial", "Puede integrarse con compostaje, educación ambiental, viveros y programas públicos."],
] as const;

export default function GardensGuidePage() {
  const url = `${site.url}/biblioteca/huertas/`;
  return (
    <>
      <ArticleJsonLd
        headline="Guía para huertas urbanas, escolares y comunitarias"
        description="Ruta práctica para planear, establecer, acompañar y aprender de una huerta con enfoque de suelo y circularidad."
        url={url}
        about={["Huerta urbana", "Huerta escolar", "Huerta comunitaria", "Compost", "Agricultura urbana"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Guía de huertas", url },
      ]} />

      <section className="knowledge-hero knowledge-hero--garden">
        <div className="container knowledge-hero-grid">
          <div><Link className="back-link" href="/biblioteca/">← Biblioteca</Link><span className="eyebrow">Huertas · guía práctica</span><h1>Una buena huerta empieza por el sistema, no por el fertilizante.</h1><p className="lead">Espacio, luz, agua, suelo, drenaje, cultivo y capacidad de cuidado determinan el resultado. Wondergreen entra después, cuando la necesidad está clara.</p></div>
          <aside className="knowledge-warning"><span>Principio</span><strong>Aprender haciendo, pero registrar para mejorar.</strong><p>En proyectos comunitarios o educativos, una bitácora sencilla de siembra, riego, observaciones y cosecha convierte la huerta en una herramienta de aprendizaje y gestión.</p></aside>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container"><div className="section-heading"><span className="eyebrow">Ruta de implementación</span><h2>Cinco pasos que sirven antes de hablar de producto.</h2></div><div className="garden-route">{route.map(([n,title,copy]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container"><div className="section-heading"><span className="eyebrow">Contexto importa</span><h2>No es lo mismo una matera que una huerta escolar.</h2></div><div className="knowledge-card-grid knowledge-card-grid--four">{contexts.map(([title,copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="home-learning-band">
        <div className="container home-learning-grid"><div><span className="eyebrow eyebrow--light">Ciclo circular</span><h2>Observar → cuidar → cosechar → aprovechar → volver al suelo.</h2></div><div className="home-learning-list"><div><strong>Materia orgánica</strong><span>El compost puede ser parte de la base del sistema cuando su uso sea técnicamente apropiado.</span></div><div><strong>Nutrición</strong><span>La línea se elige por etapa y objetivo; no se repite una receta fija para todas las especies.</span></div><div><strong>Sanidad</strong><span>Primero identificar causa y condición; luego evaluar el manejo complementario.</span></div><div><strong>Aprendizaje</strong><span>Registrar fechas, cambios, cosecha y problemas ayuda a mejorar el siguiente ciclo.</span></div></div></div>
      </section>

      <section className="knowledge-section">
        <div className="container split-knowledge"><div><span className="eyebrow">Qué puede aportar Greenatics</span><h2>Producto, conocimiento y proyecto pueden convivir.</h2></div><div><p>Una huerta puede ser una compra pequeña para hogar o una intervención institucional más completa. En municipios, colegios y comunidades puede integrarse con educación ambiental, aprovechamiento de orgánicos, compost, viveros y acompañamiento técnico.</p><div className="button-row"><Link className="button button--primary" href="/wondergreen/hogar/">Wondergreen Hogar</Link><Link className="button button--ghost" href="/municipios/">Proyectos territoriales</Link></div></div></div>
      </section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Uso responsable</span><h2>La web orienta; el contexto define la recomendación.</h2></div><div><p>No publicamos una dosis universal para huertas. Especie, volumen de sustrato, etapa, exposición, agua y condición de la planta cambian la necesidad.</p><Link href="/diagnostico/">Iniciar diagnóstico →</Link></div></div></section>
    </>
  );
}
