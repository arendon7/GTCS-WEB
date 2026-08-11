import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
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
  return {
    title: product.name,
    description: product.objective,
    alternates: { canonical },
    openGraph: { title: product.name, description: product.objective, url: canonical },
  };
}

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const productUrl = `${site.url}/wondergreen/productos/${product.slug}/`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.objective,
    url: productUrl,
    brand: { "@type": "Brand", name: "Wondergreen Nutrients" },
    category: `Fertilizantes > ${product.family}`,
    sku: product.slug,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Formato", value: product.format },
      { "@type": "PropertyValue", name: "Presentación", value: product.presentation },
      ...(product.formula ? [{ "@type": "PropertyValue", name: "Referencia", value: product.formula }] : []),
    ],
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "COP",
      price: product.priceCop,
      seller: { "@id": `${site.url}/#organization` },
    },
  };

  return (
    <section className="product-detail">
      <JsonLd data={productSchema} />
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Wondergreen", url: `${site.url}/wondergreen/` },
        { name: product.name, url: productUrl },
      ]} />
      <div className="container product-detail-grid">
        <div className={`product-stage family-${product.family.toLowerCase()}`}><span>{product.family}</span><strong>{product.format}</strong><em>{product.formula || "Materia orgánica"}</em></div>
        <div className="product-info">
          <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
          <span className="eyebrow">{product.family} · {product.stage}</span>
          <h1>{product.name}</h1>
          <p className="lead">{product.objective}</p>
          <dl className="product-facts"><div><dt>Formato</dt><dd>{product.format}</dd></div><div><dt>Presentación</dt><dd>{product.presentation}</dd></div>{product.formula ? <div><dt>Referencia</dt><dd>{product.formula}</dd></div> : null}</dl>
          <div className="price-panel"><div><small>Precio de catálogo</small><strong>{cop(product.priceCop)}</strong></div><a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Consultar / comprar</a></div>
          <div className="technical-lock"><strong>Información técnica protegida</strong><p>Dosis, compatibilidades, registro, composición declarada y recomendaciones específicas solo se publicarán desde fichas técnicas y documentos regulatorios validados.</p></div>
          <ul className="notes-list">{product.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
