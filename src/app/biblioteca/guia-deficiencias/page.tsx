import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { deficiencyCrops } from "@/data/knowledge";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Guía práctica de deficiencias nutricionales · En validación",
  description: "Borrador técnico en validación para diagnóstico visual inicial en aguacate, cacao, café, pastos y limón Tahití.",
  alternates: { canonical: "/biblioteca/guia-deficiencias/" },
  robots: { index: false, follow: false },
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
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Biblioteca", url: `${site.url}/biblioteca/` },
        { name: "Guía de deficiencias · En validación", url },
      ]} />

      <section className="knowledge-hero">
        <div className="container knowledge-hero-grid">
          <div>
            <Link className="back-link" href="/biblioteca/">← Biblioteca</Link>
            <span className="eyebrow">Borrador técnico · en validación</span>
            <h1>Identificar una deficiencia empieza por saber qué mirar.</h1>
            <p className="lead">Esta versión organiza señales visuales de aguacate, cacao, café, pastos y limón Tahití para revisión técnica interna. No debe usarse todavía como diagnóstico agronómico publicado ni sustituye análisis de suelo, foliar o revisión profesional.</p>
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
          <div className="knowledge-rule-grid">
            {quickRules.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </div>
      </section>

      <section className="knowledge-section knowledge-section--soft">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">Por cultivo · material en revisión</span><h2>La misma señal no se interpreta igual en todos los sistemas.</h2><p>Las tablas siguientes permanecen visibles para QA editorial, pero su publicación definitiva depende de cerrar la trazabilidad de la fuente técnica.</p></div>
          <div className="deficiency-stack">
            {deficiencyCrops.map((crop) => (
              <article className="deficiency-crop" key={crop.slug} id={crop.slug}>
                <div className="deficiency-crop-head"><div><span className="eyebrow">Cultivo</span><h2>{crop.name}</h2></div><p>{crop.intro}</p></div>
                <div className="deficiency-table-wrap">
                  <table className="deficiency-table">
                    <thead><tr><th>Nutriente</th><th>Dónde inicia</th><th>Señal guía</th><th>Clave de interpretación</th></tr></thead>
                    <tbody>{crop.rows.map((row) => <tr key={`${crop.slug}-${row.nutrient}`}><td><strong>{row.nutrient}</strong></td><td>{row.starts}</td><td>{row.symptom}</td><td>{row.key}</td></tr>)}</tbody>
                  </table>
                </div>
                <div className="field-note-grid">{crop.fieldNotes.map((note) => <span key={note}>{note}</span>)}</div>
                <Link className="knowledge-inline-link" href={`/wondergreen/cultivos/${crop.slug === "pastos" ? "pastos-gramineas" : crop.slug}/`}>Ver programa Wondergreen para {crop.name} →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="knowledge-source-band">
        <div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Fuente y gobernanza</span><h2>No se libera hasta cerrar la trazabilidad técnica.</h2></div><div><p>No hemos localizado todavía una fuente maestra vigente que permita atribuir y validar de forma suficiente todas las tablas de esta versión. Por eso permanece fuera del índice público y no se presenta como guía aprobada.</p><Link href="/diagnostico/">Usar diagnóstico Greenatics →</Link></div></div>
      </section>
    </>
  );
}
