import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyectos y experiencia",
  description: "Casos y capacidades de Greenatics en aprovechamiento de residuos orgánicos, operación de plantas y producción de recursos derivados.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="solution-hero">
        <div className="container solution-hero-grid">
          <div>
            <span className="eyebrow">Proyectos Greenatics</span>
            <h1>La experiencia se demuestra operando.</h1>
            <p className="lead">Nuestros casos conectan recepción de orgánicos, control de calidad, tratamiento biológico, producción, acompañamiento territorial y trazabilidad.</p>
          </div>
          <aside className="solution-proof">
            <span className="eyebrow">Criterio de publicación</span>
            <strong>Casos reales, datos validados.</strong>
            <p>La web distingue entre capacidades ejecutadas y cifras operativas internas. Los indicadores cuantitativos se publicarán únicamente cuando tengan corte y validación.</p>
          </aside>
        </div>
      </section>

      <section className="projects-section">
        <div className="container project-grid">
          <article className="project-card project-card--yarumal">
            <span className="project-index">CASO 01 · NORTE DE ANTIOQUIA</span>
            <h2>Yarumal</h2>
            <p>Operación técnica de residuos orgánicos con recepción, inspección, segregación de impropios, trazabilidad por lotes, tratamiento biológico y manejo de productos derivados.</p>
            <img className="project-symbol" src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" />
            <Link href="/proyectos/yarumal/">Ver caso Yarumal →</Link>
          </article>
          <article className="project-card project-card--tamesis">
            <span className="project-index">CASO 02 · SUROESTE DE ANTIOQUIA</span>
            <h2>Támesis</h2>
            <p>Experiencia Greenatics asociada a aprovechamiento orgánico, producción de fertilizantes y desarrollo de soluciones que integran tratamiento, valorización y territorio.</p>
            <img className="project-symbol" src="/brand/greenatics-symbol.svg" alt="" aria-hidden="true" />
            <Link href="/proyectos/tamesis/">Ver caso Támesis →</Link>
          </article>
        </div>
      </section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Replicar experiencia</span><h2>Cada territorio parte de condiciones distintas. El método sí puede transferirse.</h2></div><Link className="button button--dark" href="/municipios/">Soluciones municipales</Link></div></section>
    </>
  );
}
