import type { Metadata } from "next";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { portfolioFamilies } from "@/data/knowledge";
import { bioinputs, pricedProducts, products, technicalPortfolio } from "@/data/products";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Catálogo técnico-comercial Wondergreen",
  description: "Catálogo web Wondergreen de acondicionadores, fertilizantes organominerales y bioinsumos: familia, formato, presentación, etapa y estado comercial.",
  alternates: { canonical: "/biblioteca/catalogo-wondergreen/" },
};

const decisionSteps = [
  ["01", "Objetivo", "Define qué quieres resolver: suelo, crecimiento, mantenimiento, transición reproductiva, producción o manejo biológico."],
  ["02", "Etapa y diagnóstico", "Ubica el momento dominante del cultivo y revisa suelo, agua, síntomas, manejo y análisis disponibles."],
  ["03", "Familia", "Selecciona Compost, 2GROW, 2BALANCE, 2BLOOM, 2FRUIT o una herramienta biológica según el objetivo."],
  ["04", "Formato y presentación", "Sólido, líquido o bioinsumo; el formato debe responder a la operación y a la recomendación, no solo a disponibilidad."],
  ["05", "Product Truth", "Confirma ficha, etiqueta, presentación, condición regulatoria, disponibilidad, precio y recomendación antes de comprar o aplicar."],
] as const;

const outsideCatalog = [
  ["Guías por cultivo", "Etapas, alertas y criterio específico para café, cacao, aguacate, limón Tahití y pastos."],
  ["Fichas por producto", "Rol de cada referencia, presentaciones y datos técnicos/regulatorios solo cuando existe una versión vigente aprobada."],
  ["Diagnóstico", "Lectura del lote y de síntomas antes de convertir una necesidad en recomendación."],
  ["Casos y ensayos", "Evidencia agronómica publicada con cultivo, periodo, método, fuente y alcance explícitos."],
  ["Manual de uso", "Permanece en validación hasta cerrar trazabilidad suficiente de reglas operativas, dosis y compatibilidades."],
  ["Línea Hogar", "Una experiencia separada para casa, materas y huerta urbana, sin mezclarla con el catálogo profesional vigente."],
] as const;

const productRows = products.map((product) => ({
  family: product.family,
  name: product.name,
  category: product.category,
  format: product.format,
  formula: product.formula ?? "—",
  presentations: product.presentations.join(" · "),
  status: product.commercialStatus === "PRECIO_VALIDADO" ? "Precio reconciliado" : "Portafolio técnico",
  href: `/wondergreen/productos/${product.slug}/`,
}));

export default function WondergreenCatalogGuidePage() {
  const url = `${site.url}/biblioteca/catalogo-wondergreen/`;
  return (
    <>
      <ArticleJsonLd headline="Catálogo técnico-comercial Wondergreen: cómo leer el sistema" description="Arquitectura del portafolio Wondergreen por objetivo agronómico, etapa, formato y Product Truth." url={url} dateModified="2026-08-11" about={["Wondergreen Nutrients", "Nutrición vegetal", "Fertilizantes organominerales", "Bioinsumos"]} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Biblioteca", url: `${site.url}/biblioteca/` },{ name: "Catálogo Wondergreen", url }]} />

      <section className="knowledge-hero knowledge-hero--wondergreen"><div className="container knowledge-hero-grid"><div><Link className="back-link" href="/biblioteca/">← Biblioteca</Link><span className="eyebrow">Catálogo técnico-comercial</span><div className="knowledge-wg-logo"><img src="/brand/wondergreen-nutrients.webp" alt="Wondergreen Nutrients" width="420" height="221" /></div><h1>El portafolio se entiende mejor cuando se lee como sistema.</h1><p className="lead">Wondergreen integra acondicionadores de suelo, fertilizantes organominerales sólidos y líquidos y un portafolio técnico de bioinsumos. La selección empieza por el objetivo y termina —no empieza— en la referencia comercial.</p></div><aside className="knowledge-warning knowledge-warning--light"><span>Idea central</span><strong>Portafolio técnico, precio y disponibilidad son estados diferentes.</strong><p>Una referencia puede estar documentada técnicamente sin estar habilitada para compra pública. La web muestra esa diferencia en lugar de esconderla o inventar disponibilidad.</p></aside></div></section>

      <section className="knowledge-section"><div className="container"><div className="section-heading"><span className="eyebrow">Cómo elegir</span><h2>Cinco decisiones, en orden.</h2></div><div className="decision-flow">{decisionSteps.map(([number,title,copy])=><article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="knowledge-section knowledge-section--soft"><div className="container"><div className="section-heading"><span className="eyebrow">Familias del sistema</span><h2>Cada línea tiene un momento y una función.</h2></div><div className="portfolio-system-grid">{portfolioFamilies.map((item)=><article className={`portfolio-system-card family-accent-${item.family.toLowerCase()}`} key={item.family}><span>{item.moment}</span><h3>{item.family}</h3><p>{item.purpose}</p><small>{item.next}</small></article>)}</div></div></section>

      <section className="knowledge-section"><div className="container"><div className="section-heading"><span className="eyebrow">Product Master público</span><h2>Referencias, formatos y presentaciones documentadas.</h2><p>El estado “precio reconciliado” habilita referencia comercial en la web; “portafolio técnico” requiere confirmar información comercial, regulatoria y de disponibilidad antes de venta.</p></div><div className="portfolio-table-wrap"><table className="portfolio-table portfolio-table--catalog"><thead><tr><th>Familia</th><th>Referencia</th><th>Categoría</th><th>Formato</th><th>Fórmula/ref.</th><th>Presentaciones</th><th>Estado</th></tr></thead><tbody>{productRows.map((row)=><tr key={row.name}><td>{row.family}</td><td><Link href={row.href}><strong>{row.name}</strong></Link></td><td>{row.category}</td><td>{row.format}</td><td>{row.formula}</td><td>{row.presentations}</td><td><span className={row.status === "Precio reconciliado" ? "catalog-status catalog-status--priced" : "catalog-status catalog-status--technical"}>{row.status}</span></td></tr>)}</tbody></table></div><div className="catalog-summary-grid"><article><strong>{pricedProducts.length}</strong><span>referencias con precio base reconciliado</span></article><article><strong>{technicalPortfolio.length}</strong><span>referencias visibles como portafolio técnico</span></article><article><strong>{bioinputs.length}</strong><span>bioinsumos documentados dentro del portafolio técnico</span></article></div></div></section>

      <section className="knowledge-section knowledge-section--soft"><div className="container"><div className="section-heading"><span className="eyebrow">Bioinsumos</span><h2>Mostrar la categoría sin inventar la eficacia.</h2><p>El Product Master contempla extractos botánicos y microorganismos. Antes de publicar blancos biológicos, cepas, concentraciones, dosis, compatibilidades o claims, la información debe coincidir con la ficha, etiqueta y condición regulatoria vigente de cada producto.</p></div><div className="knowledge-card-grid">{bioinputs.map((product)=><article key={product.slug}><span className="knowledge-card-kicker">{product.format} · {product.presentations.join(" / ")}</span><h3>{product.name}</h3><p>{product.technicalRole}</p><Link className="knowledge-inline-link" href={`/wondergreen/productos/${product.slug}/`}>Ver estado del producto →</Link></article>)}</div></div></section>

      <section className="knowledge-section"><div className="container"><div className="section-heading"><span className="eyebrow">Más allá del catálogo</span><h2>La profundidad técnica vive donde corresponde.</h2><p>El catálogo abre la decisión. La biblioteca y el diagnóstico la sustentan.</p></div><div className="knowledge-card-grid">{outsideCatalog.map(([title,copy])=><article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section className="knowledge-source-band"><div className="container knowledge-source-grid"><div><span className="eyebrow eyebrow--light">Wondergreen</span><h2>¿Quieres pasar de catálogo a recomendación?</h2></div><div><p>Consulta las guías por cultivo o inicia un diagnóstico. Las dosis, compatibilidades y usos específicos se liberan únicamente desde documentación vigente y reconciliada.</p><div className="button-row"><Link className="button button--light" href="/wondergreen/cultivos/">Guías por cultivo</Link><Link className="button button--outline-light" href="/diagnostico/">Diagnóstico</Link></div></div></div></section>
    </>
  );
}
