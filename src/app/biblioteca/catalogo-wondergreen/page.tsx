import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { portfolioFamilies } from "@/data/knowledge";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Catálogo técnico-comercial Wondergreen",
  description: "Lee Wondergreen como un sistema: objetivo agronómico, etapa del cultivo, familia, formato y validación técnica antes de elegir producto.",
  alternates: { canonical: "/biblioteca/catalogo-wondergreen/" },
};

const decisionSteps = [
  ["01", "Objetivo", "Define qué quieres resolver: suelo, crecimiento, mantenimiento, floración, producción o soporte biológico."],
  ["02", "Etapa", "Ubica el momento fisiológico dominante del cultivo; no todas las necesidades ocurren al mismo tiempo."],
  ["03", "Familia", "Selecciona Compost, 2GROW, 2BALANCE, 2BLOOM, 2FRUIT o un complemento biológico según el objetivo."],
  ["04", "Formato", "El sólido, líquido o biológico se elige por sistema de manejo, logística y recomendación técnica, no por comodidad visual."],
  ["05", "Validación", "Confirma ficha vigente, condición del lote, presentación, disponibilidad y recomendación antes de comprar."],
] as const;

const outsideCatalog = [
  ["Guías por cultivo", "Etapas, alertas y criterio específico para café, cacao, aguacate, limón Tahití y pastos."],
  ["Fichas por producto", "Composición, presentación, uso y datos regulatorios cuando exista una versión vigente aprobada."],
  ["Diagnóstico", "Lectura del lote y de síntomas antes de convertir una necesidad en recomendación."],
  ["Casos y ensayos", "Evidencia agronómica publicada con cultivo, periodo, método y alcance explícitos."],
  ["Tablas de aplicación", "Dosis, vía, frecuencia y compatibilidad solo desde documentación técnica vigente."],
  ["Línea Hogar", "Una experiencia separada para casa, materas y huerta urbana, sin mezclarla con el catálogo profesional."],
] as const;

export default function WondergreenCatalogGuidePage() {
  const url = `${site.url}/biblioteca/catalogo-wondergreen/`;
  return (
    <>
      <ArticleJsonLd
        headline="Catálogo técnico-comercial Wondergreen: cómo leer el sistema"
        description="Arquitectura de decisión del portafolio Wondergreen por objetivo agronómico y etapa del cultivo."
        url={url}
        dateModified="2026-04-22"
        about={["Wondergreen Nutrients", "Nutrición vegetal", "Compost", "Bioinsumos"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Catálogo Wondergreen", url },
      ]} />

      <section className="knowledge-hero knowledge-hero--wondergreen">
        <div className="container knowledge-hero-grid">
          <div>
            <Link className="back-link" href="/biblioteca/">← Biblioteca</Link>
            <span className="eyebrow">Catálogo técnico-comercial</span>
            <div className="knowledge-wg-logo"><img src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width="420" height="221" /></div>
            <h1>El portafolio se entiende mejor cuando se lee como sistema.</h1>
            <p className="lead">Primero el objetivo agronómico. Después la etapa. Luego la familia y el formato. La compra llega al final, cuando la recomendación tiene sentido.</p>
          </div>
          <aside className="knowledge-warning knowledge-warning--light">
            <span>Idea central</span>
            <strong>Menos fricción para elegir. Más criterio para recomendar.</strong>
            <p>Esta versión web separa la lectura comercial simple de la profundidad técnica que debe vivir en fichas, guías, ensayos y tablas validadas.</p>
          </aside>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Cómo elegir</span><h2>Cinco decisiones, en orden.</h2></div>
          <div className="decision-flow">{decisionSteps.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Familias del sistema</span><h2>Cada línea tiene un momento y una función.</h2></div>
          <div className="portfolio-system-grid">
            {portfolioFamilies.map((item) => (
              <article className={`portfolio-system-card family-accent-${item.family.toLowerCase()}`} key={item.family}>
                <span>{item.moment}</span><h3>{item.family}</h3><p>{item.purpose}</p><small>{item.next}</small>
              </article>
            ))}
          </div>
          <div className="knowledge-actions"><Link className="button button--primary" href="/wondergreen/">Explorar productos</Link><Link className="button button--ghost" href="/wondergreen/cotizador/">Cotizar referencias</Link></div>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Más allá del catálogo</span><h2>La profundidad técnica vive donde corresponde.</h2><p>El catálogo abre la decisión. La biblioteca la sustenta.</p></div>
          <div className="knowledge-card-grid">{outsideCatalog.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="knowledge-source-band">
        <div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Wondergreen</span><h2>¿Quieres pasar de catálogo a recomendación?</h2></div><div><p>Consulta las guías por cultivo o inicia un diagnóstico. Las dosis y compatibilidades se liberan únicamente desde la documentación vigente del producto.</p><div className="button-row"><Link className="button button--light" href="/wondergreen/cultivos/">Guías por cultivo</Link><Link className="button button--outline-light" href="/diagnostico/">Diagnóstico</Link></div></div></div>
      </section>
    </>
  );
}
