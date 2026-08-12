import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { ProductVisual } from "@/components/product-visual";
import { getProduct, products } from "@/data/products";
import { site } from "@/data/site";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const canonical = `/wondergreen/productos/${product.slug}/`;
  return { title: product.name, description: product.objective, alternates: { canonical }, openGraph: { title: product.name, description: product.objective, url: canonical } };
}

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const productUrl = `${site.url}/wondergreen/productos/${product.slug}/`;
  const hasPublicPrice = typeof product.priceCop === "number";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.objective,
    url: productUrl,
    brand: { "@type": "Brand", name: "Wondergreen Nutrients" },
    category: product.category,
    sku: product.slug,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Formato", value: product.format },
      { "@type": "PropertyValue", name: "Presentaciones", value: product.presentations.join(", ") },
      { "@type": "PropertyValue", name: "Estado comercial", value: hasPublicPrice ? "Precio público validado" : "Portafolio técnico; confirmar disponibilidad" },
      ...(product.formula ? [{ "@type": "PropertyValue", name: "Referencia", value: product.formula }] : []),
    ],
    ...(hasPublicPrice ? { offers: { "@type": "Offer", url: productUrl, priceCurrency: "COP", price: product.priceCop, seller: { "@id": `${site.url}/#organization` } } } : {}),
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Wondergreen", url: `${site.url}/wondergreen/` },{ name: product.name, url: productUrl }]} />

      <section className="product-detail product-detail--depth">
        <div className="container product-detail-grid">
          <ProductVisual product={product} context="detail" />
          <div className="product-info">
            <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
            <span className="eyebrow">{product.category} · {product.family}</span>
            <h1>{product.name}</h1>
            <p className="lead">{product.objective}</p>
            <div className={`commercial-status ${hasPublicPrice ? "commercial-status--priced" : "commercial-status--technical"}`}><strong>{hasPublicPrice ? "Referencia comercial reconciliada" : "Portafolio técnico"}</strong><span>{hasPublicPrice ? "Tiene precio público de referencia. Inventario y logística se confirman antes de venta." : "La familia está documentada, pero precio, disponibilidad, etiqueta y/o condición regulatoria deben reconciliarse antes de venta pública."}</span></div>
            <dl className="product-facts"><div><dt>Categoría</dt><dd>{product.category}</dd></div><div><dt>Formato</dt><dd>{product.format}</dd></div><div><dt>Etapa / objetivo</dt><dd>{product.stage}</dd></div>{product.formula ? <div><dt>Referencia</dt><dd>{product.formula}</dd></div> : null}</dl>
            {hasPublicPrice ? <div className="price-panel"><div><small>Precio público de referencia · {product.presentation}</small><strong>{cop(product.priceCop!)}</strong></div><a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Consultar / comprar</a></div> : <div className="price-panel price-panel--technical"><div><small>Estado comercial</small><strong>Consultar</strong></div><a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Validar disponibilidad</a></div>}
          </div>
        </div>
      </section>

      <section className="product-story"><div className="container product-story-grid"><div><span className="eyebrow">Qué papel cumple</span><h2>{product.technicalRole}</h2><p>Wondergreen se organiza por función y etapa para ayudar a entender la decisión antes de entrar en dosis o frecuencia. La recomendación final debe leer cultivo, momento fisiológico, suelo, agua, manejo previo y análisis disponibles.</p></div><div><span className="eyebrow">Puede tener sentido en</span><ul>{product.idealFor.map((item)=><li key={item}>{item}</li>)}</ul></div></div></section>

      <section className="presentation-section"><div className="container presentation-grid"><div><span className="eyebrow">Presentaciones documentadas</span><h2>El formato cambia según escala y canal.</h2><p>Estas son las presentaciones incluidas en el Product Master. Que una presentación aparezca aquí no implica inventario inmediato ni habilitación automática de compra.</p></div><div className="presentation-pills">{product.presentations.map((item)=><span key={item}>{item}</span>)}</div></div></section>

      <section className="product-truth-section"><div className="container product-truth-grid"><div><span className="eyebrow eyebrow--light">Product Truth</span><h2>Información técnica protegida para no vender con datos equivocados.</h2></div><div><p>Dosis, frecuencia, compatibilidades, concentración ampliada, cepas, blancos biológicos, registro ICA, claims de eficacia y recomendaciones específicas solo se publican cuando están reconciliados con ficha técnica, etiqueta y documentación regulatoria vigente.</p><ul>{product.notes.map((note)=><li key={note}>{note}</li>)}</ul></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>¿Quieres saber si esta familia tiene sentido para tu cultivo?</h2></div><div className="button-row"><Link className="button button--dark" href="/wondergreen/cultivos/">Buscar por cultivo</Link><a className="button button--ghost" href={site.bookingUrl} target="_blank" rel="noreferrer">Hablar con el equipo</a></div></div></section>
    </>
  );
}
