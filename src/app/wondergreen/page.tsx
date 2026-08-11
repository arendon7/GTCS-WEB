import type { Metadata } from "next";
import Link from "next/link";
import { BrandName } from "@/components/brand-name";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Wondergreen",
  description: "Portafolio Wondergreen de nutrición vegetal organizado por etapa y objetivo.",
};

const stages = [
  ["Suelo", "Compost", "Preparación, materia orgánica y acondicionamiento."],
  ["Crecer", "2GROW", "Brotación, establecimiento y recuperación vegetativa."],
  ["Balancear", "2BALANCE", "Mantenimiento y nutrición balanceada."],
  ["Florecer", "2BLOOM", "Transición reproductiva y floración."],
  ["Producir", "2FRUIT", "Llenado, engrose y fase productiva."],
];

export default function WondergreenPage() {
  return (
    <>
      <section className="wg-hero">
        <div className="container wg-hero-grid">
          <div>
            <span className="eyebrow">Una marca Greenatics</span>
            <BrandName brand="wondergreen" />
            <h1>La nutrición cambia cuando cambia tu cultivo.</h1>
            <p className="lead">Por eso organizamos Wondergreen por objetivo y etapa: entiende qué necesitas primero; elige el producto después.</p>
            <div className="button-row">
              <Link className="button button--primary" href="/wondergreen/cultivos/">Buscar por cultivo</Link>
              <Link className="button button--ghost" href="/wondergreen/cotizador/">Calcular pedido</Link>
            </div>
          </div>
          <div className="leaf-system" aria-hidden="true">
            <div className="leaf leaf-a">GROW</div><div className="leaf leaf-b">BALANCE</div><div className="leaf leaf-c">BLOOM</div><div className="leaf leaf-d">FRUIT</div><div className="leaf-core">W</div>
          </div>
        </div>
      </section>

      <section className="stage-section">
        <div className="container">
          <div className="section-heading"><span className="eyebrow">El sistema Wondergreen</span><h2>Empieza por la etapa.</h2></div>
          <div className="stage-track">{stages.map(([title, family, copy], index) => <article key={family}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><em>{family}</em><p>{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="wg-tools">
        <div className="container wg-tools-grid">
          <article className="wg-tool-card">
            <span className="eyebrow">Ruta agronómica</span>
            <h3>¿Tienes café, cacao, aguacate, limón o pastos?</h3>
            <p>Explora una guía por momento fisiológico y entiende qué línea tiene sentido antes de hablar de formato o cantidad.</p>
            <Link href="/wondergreen/cultivos/">Explorar por cultivo →</Link>
          </article>
          <article className="wg-tool-card wg-tool-card--dark">
            <span className="eyebrow eyebrow--light">Ruta comercial</span>
            <h3>¿Ya sabes qué necesitas?</h3>
            <p>Combina presentaciones y cantidades para calcular un valor de catálogo estimado antes de confirmar disponibilidad y logística.</p>
            <Link href="/wondergreen/cotizador/">Abrir cotizador →</Link>
          </article>
        </div>
      </section>

      <section className="catalog-section" id="productos">
        <div className="container">
          <div className="section-heading split-heading"><div><span className="eyebrow">Portafolio inicial</span><h2>Productos listos para explorar.</h2></div><p>Precios de catálogo de referencia. Disponibilidad, dosis y recomendación técnica se confirman antes de cerrar la compra.</p></div>
          <div className="product-grid product-grid--catalog">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
        </div>
      </section>

      <section className="advisor-section">
        <div className="container advisor-grid"><div><span className="eyebrow eyebrow--light">Acompañamiento técnico</span><h2>La guía orienta. El lote decide.</h2><p>Wondergreen ayuda a ordenar la decisión por cultivo y etapa, pero la recomendación final debe considerar condición del lote, análisis disponibles, agua, manejo y objetivo productivo.</p></div><Link className="button button--light" href="/contacto/">Solicitar recomendación técnica</Link></div>
      </section>
    </>
  );
}
