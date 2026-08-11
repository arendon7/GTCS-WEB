import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Proyectos y experiencia",
  description: "Casos y capacidades documentadas de Greenatics en aprovechamiento de residuos orgánicos, plantas y producción de recursos derivados.",
};

export default function ProjectsPage() {
  return (
    <>
      <section className="solution-hero">
        <div className="container solution-hero-grid">
          <div>
            <span className="eyebrow">Proyectos Greenatics</span>
            <h1>La experiencia se demuestra con proyectos, operación y evidencia.</h1>
            <p className="lead">Nuestros casos documentan recepción de orgánicos, control de calidad, tratamiento biológico, producción, acompañamiento territorial y trazabilidad en distintos momentos de la historia de Greenatics.</p>
          </div>
          <aside className="solution-proof">
            <span className="eyebrow">Criterio de publicación</span>
            <strong>Casos reales, contexto explícito.</strong>
            <p>La web distingue entre experiencia histórica, capacidades vigentes e indicadores actuales. Ninguna cifra o fotografía de archivo se presenta como estado presente sin validación.</p>
          </aside>
        </div>
      </section>

      <section className="projects-section">
        <div className="container project-grid">
          <article className="project-card project-card--yarumal">
            <span className="project-index">CASO DOCUMENTADO 01 · NORTE DE ANTIOQUIA</span>
            <h2>Yarumal</h2>
            <p>Experiencia documentada en recepción, inspección, segregación de impropios, trazabilidad por lotes, compostaje, digestión anaerobia y gestión de productos derivados.</p>
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

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Replicar experiencia</span><h2>Cada territorio parte de condiciones distintas. El aprendizaje sí puede transferirse.</h2></div><Link className="button button--dark" href="/municipios/">Soluciones municipales</Link></div></section>
    </>
  );
}
