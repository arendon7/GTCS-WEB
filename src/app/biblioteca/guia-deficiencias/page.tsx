import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { deficiencyCrops } from "@/data/knowledge";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Guía práctica de deficiencias nutricionales",
  description: "Herramienta de diagnóstico visual inicial para aguacate, cacao, café, pastos y limón Tahití, con criterios para no confundir nutrición con otros problemas del lote.",
  alternates: { canonical: "/biblioteca/guia-deficiencias/" },
  robots: { index: true, follow: true },
};

const quickRules = [
  ["Hojas viejas", "Revisar primero nutrientes móviles como N, P, K y Mg."],
  ["Hojas nuevas", "Revisar primero Ca, S, B, Fe, Zn y Mn, sin asumir que el síntoma es exclusivamente nutricional."],
  ["Patrón del lote", "Distinguir planta aislada, manchón, zona baja, ladera, cabecera de riego o afectación general."],
  ["Antes de corregir", "Cruzar con fertilización previa, pH, textura, drenaje, humedad, raíces y carga productiva."],
];

export default function DeficiencyGuidePage() {
  const url = `${site.url}/biblioteca/guia-deficiencias/`;
  return (
    <>
      <ArticleJsonLd headline="Guía práctica para identificar deficiencias nutricionales" description="Diagnóstico visual inicial para aguacate, cacao, café, pastos y limón Tahití." url={url} dateModified="2026-04-22" about={["Nutrición vegetal", "Aguacate", "Cacao", "Café", "Pastos", "Limón Tahití"]} />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Guía de deficiencias", url },
      ]} />

      <section className="knowledge-hero">
        <div className="container knowledge-hero-grid">
          <div>
            <Link className="back-link" href="/biblioteca/">← Biblioteca</Link>
            <span className="eyebrow">Guía práctica · diagnóstico visual inicial</span>
            <h1>Identificar una deficiencia empieza por saber qué mirar.</h1>
            <p className="lead">Esta guía organiza señales visuales de aguacate, cacao, café, pastos y limón Tahití. Sirve para orientar preguntas en campo; no sustituye análisis de suelo, foliar ni revisión agronómica.</p>
          </div>
          <aside className="knowledge-warning">
            <span>Alcance</span>
            <strong>Un mismo síntoma puede tener varias causas.</strong>
            <p>Sequía, anegamiento, acidez, salinidad, fitotoxicidad, plagas, enfermedades o daño mecánico pueden parecer problemas nutricionales.</p>
          </aside>
        </div>
      </section>

      <section className="knowledge-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Lectura rápida</span><h2>Cuatro filtros antes de recomendar.</h2></div>
          <div className="knowledge-rule-grid">{quickRules.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Por cultivo</span><h2>La misma señal no se interpreta igual en todos los sistemas.</h2><p>Usa el tejido donde inicia, el patrón del lote y el contexto productivo como primeros filtros.</p></div>
          <div className="deficiency-stack">
            {deficiencyCrops.map((crop) => (
              <article className="deficiency-crop" key={crop.slug} id={crop.slug}>
                <div className="deficiency-crop-head"><div><span className="eyebrow">Cultivo</span><h2>{crop.name}</h2></div><p>{crop.intro}</p></div>
                <div className="deficiency-table-wrap"><table className="deficiency-table"><thead><tr><th>Nutriente</th><th>Dónde inicia</th><th>Señal guía</th><th>Clave de interpretación</th></tr></thead><tbody>{crop.rows.map((row) => <tr key={`${crop.slug}-${row.nutrient}`}><td><strong>{row.nutrient}</strong></td><td>{row.starts}</td><td>{row.symptom}</td><td>{row.key}</td></tr>)}</tbody></table></div>
                <div className="field-note-grid">{crop.fieldNotes.map((note) => <span key={note}>{note}</span>)}</div>
                <Link className="knowledge-inline-link" href={`/wondergreen/cultivos/${crop.slug === "pastos" ? "pastos-gramineas" : crop.slug}/`}>Ver programa Wondergreen para {crop.name} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Fuente y gobernanza</span><h2>Diagnóstico primero. Producto después.</h2></div><div><p>Esta versión web deriva de la guía técnica consolidada por Greenatics. Las recomendaciones específicas, dosis, mezclas y correcciones requieren validación del lote y documentación vigente del producto.</p><Link href="/diagnostico/">Iniciar diagnóstico Greenatics →</Link></div></div></section>
    </>
  );
}
