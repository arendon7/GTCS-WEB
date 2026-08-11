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
          <div><span className="eyebrow">Una marca Greenatics</span><BrandName brand="wondergreen" /><h1>La nutrición cambia cuando cambia tu cultivo.</h1><p className="lead">Por eso organizamos Wondergreen por objetivo y etapa: entiende qué necesitas primero; elige el producto después.</p><div className="button-row"><a className="button button--primary" href="#productos">Ver productos</a><Link className="button button--ghost" href="/contacto/">Pedir asesoría</Link></div></div>
          <div className="leaf-system" aria-hidden="true"><div className="leaf leaf-a">GROW</div><div className="leaf leaf-b">BALANCE</div><div className="leaf leaf-c">BLOOM</div><div className="leaf leaf-d">FRUIT</div><div className="leaf-core">W</div></div>
        </div>
      </section>

      <section className="stage-section">
        <div className="container"><div className="section-heading"><span className="eyebrow">El sistema Wondergreen</span><h2>Empieza por la etapa.</h2></div><div className="stage-track">{stages.map(([title, family, copy], index) => <article key={family}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><em>{family}</em><p>{copy}</p></article>)}</div></div>
      </section>

      <section className="catalog-section" id="productos">
        <div className="container"><div className="section-heading split-heading"><div><span className="eyebrow">Portafolio inicial</span><h2>Productos listos para explorar.</h2></div><p>Precios de catálogo de referencia. Disponibilidad, dosis y recomendación técnica se confirman antes de cerrar la compra.</p></div><div className="product-grid product-grid--catalog">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div></div>
      </section>

      <section className="advisor-section"><div className="container advisor-grid"><div><span className="eyebrow eyebrow--light">Próxima capa</span><h2>¿Qué necesita tu cultivo?</h2><p>El recomendador combinará cultivo, etapa, objetivo y formato sin sustituir el criterio agronómico ni inventar dosis.</p></div><Link className="button button--light" href="/contacto/">Solicitar recomendación técnica</Link></div></section>
    </>
  );
}
