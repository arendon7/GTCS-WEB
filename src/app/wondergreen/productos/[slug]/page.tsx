import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { ProductVisual } from "@/components/product-visual";
import { getProduct, getProductCategoryLabel, products } from "@/data/products";
import { site } from "@/data/site";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const canonical = `/wondergreen/productos/${product.slug}/`;
  return { title: product.name, description: product.objective, alternates: { canonical }, openGraph: { title: product.name, description: product.objective, url: canonical, ...(product.image ? { images: [product.image] } : {}) } };
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
  const relatedProducts = products.filter((candidate) => candidate.category === product.category && candidate.slug !== product.slug).slice(0, 4);
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(product.name)}&prioridad=${encodeURIComponent(`${product.stage || product.focus} · ${product.presentation || product.format}`)}`;
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
    ...(product.image ? { image: `${site.url}${product.image}` } : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Formato", value: product.format },
      { "@type": "PropertyValue", name: "Presentaciones", value: product.presentations.join(", ") },
      { "@type": "PropertyValue", name: "Estado comercial", value: hasPublicPrice ? "Precio público de referencia" : "Disponible bajo cotización y acompañamiento técnico" },
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
            <nav className="product-route-nav" aria-label="Rutas relacionadas del producto">
              <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
              <Link className="product-route-nav__catalog" href="/biblioteca/catalogo-wondergreen/">Ver catálogo técnico →</Link>
            </nav>
            <nav className="product-detail-index" aria-label="Secciones de esta ficha">
              <span>En esta ficha</span>
              <a href="#papel">Papel</a>
              <a href="#ficha">Datos</a>
              <a href="#aplicacion">Aplicación</a>
              <a href="#presentaciones">Presentaciones</a>
              {relatedProducts.length > 0 ? <a href="#comparar">Comparar</a> : null}
              <a href="#criterio">Criterio técnico</a>
            </nav>
            <span className="eyebrow">{getProductCategoryLabel(product.category)} · {product.family}</span>
            <p className="product-headline">{product.headline}</p>
            <h1>{product.name}</h1>
            <p className="lead">{product.intro}</p>
            <p className="product-focus"><strong>Enfoque de la familia:</strong> {product.focus}</p>
            <div className={`commercial-status ${hasPublicPrice ? "commercial-status--priced" : "commercial-status--technical"}`}><strong>{hasPublicPrice ? "Precio público de referencia" : "Disponible bajo cotización"}</strong><span>{hasPublicPrice ? "La cotización define inventario, logística y condición de entrega para el suministro." : "La referencia se suministra con acompañamiento técnico; la ficha, presentación y condición de uso se entregan para el programa seleccionado."}</span></div>
            <dl className="product-facts"><div><dt>Categoría</dt><dd>{getProductCategoryLabel(product.category)}</dd></div><div><dt>Formato</dt><dd>{product.format}</dd></div><div><dt>Etapa / objetivo</dt><dd>{product.stage}</dd></div>{product.formula ? <div><dt>Referencia</dt><dd>{product.formula}</dd></div> : null}</dl>
            {hasPublicPrice ? <div className="price-panel"><div><small>Precio público de referencia · {product.presentation}</small><strong>{cop(product.priceCop!)}</strong></div><div className="button-row"><a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Consultar / comprar</a><Link className="button button--ghost" href={contactHref}>Llevar a Contacto</Link></div></div> : <div className="price-panel price-panel--technical"><div><small>Estado comercial</small><strong>Bajo cotización</strong></div><div className="button-row"><a className="button button--primary" href={site.bookingUrl} target="_blank" rel="noreferrer">Solicitar cotización</a><Link className="button button--ghost" href={contactHref}>Llevar a Contacto</Link></div></div>}
          </div>
        </div>
      </section>

      <section className="product-story" id="papel"><div className="container product-story-grid"><div><span className="eyebrow">Qué papel cumple</span><h2>{product.technicalRole}</h2><p>Wondergreen se organiza por función y etapa para ayudar a entender la decisión antes de entrar en dosis o frecuencia. La recomendación final debe leer cultivo, momento fisiológico, suelo, agua, manejo previo y análisis disponibles.</p></div><div><span className="eyebrow">Puede tener sentido en</span><ul>{product.idealFor.map((item)=><li key={item}>{item}</li>)}</ul></div></div></section>

      <section className="product-detail-content" id="ficha"><div className="container product-detail-content-grid"><article className="product-detail-card"><span className="eyebrow">Por qué entra en el programa</span><h2>Beneficios que deben leerse junto al objetivo del cultivo.</h2><ul>{product.benefits.map((item)=><li key={item}>{item}</li>)}</ul></article><article className="product-detail-card"><span className="eyebrow">Ficha resumida</span><h2>Datos para comparar la referencia.</h2><dl className="product-spec-list">{product.specs.map((spec)=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></article></div></section>

      <section className="product-application-section" id="aplicacion"><div className="container product-application-grid"><div><span className="eyebrow">Cómo avanzar a aplicación</span><h2>La decisión se construye desde el lote, no solo desde la fórmula.</h2><ol>{product.application.map((item, index)=><li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol></div><div><span className="eyebrow">Cultivos y sistemas de referencia</span><p className="product-section-lead">Estos cultivos aparecen como puntos de orientación del portafolio. No reemplazan el diagnóstico del lote ni convierten automáticamente la referencia en una recomendación.</p><div className="product-crop-pills">{product.crops.map((crop)=><span key={crop}>{crop}</span>)}</div><div className="product-caution-card"><strong>Antes de usar</strong><ul>{product.cautions.map((item)=><li key={item}>{item}</li>)}</ul></div></div></div></section>

      <section className="presentation-section" id="presentaciones"><div className="container presentation-grid"><div><span className="eyebrow">Presentaciones documentadas</span><h2>El formato cambia según escala y canal.</h2><p>Estas son las presentaciones incluidas en el Product Master. La cotización coordina la presentación, el volumen, la logística y el canal de suministro adecuados para cada solicitud.</p></div><div className="presentation-pills">{product.presentations.map((item)=><span key={item}>{item}</span>)}</div></div></section>

      {relatedProducts.length > 0 ? <section className="product-related-section" id="comparar" aria-labelledby="product-related-title"><div className="container"><div className="product-related-heading"><div><span className="eyebrow">Comparar dentro del sistema</span><h2 id="product-related-title">Otras referencias de la línea {product.category === "solidos" ? "sólida" : product.category === "liquidos" ? "líquida" : "biológica"}.</h2></div><p>La etapa orienta la familia, pero no reemplaza el diagnóstico. Revisa el papel de cada referencia antes de decidir fórmula, presentación, dosis o frecuencia.</p></div><div className="product-related-grid">{relatedProducts.map((related) => <Link className="product-related-card" href={`/wondergreen/productos/${related.slug}/`} key={related.slug}><div className="product-related-card__media">{related.image ? <img src={related.image} alt={`Referencia visual de ${related.name}`} width={760} height={1074} loading="lazy" decoding="async" /> : <span>{related.family}</span>}</div><div className="product-related-card__body"><span>{related.stage || related.focus}</span><strong>{related.name}</strong><small>{related.formula || related.format} · {related.presentation || related.presentations[0]}</small><em>Ver ficha →</em></div></Link>)}</div><div className="product-related-actions"><Link className="text-link" href="/wondergreen/ciencia/">Leer la ciencia Wondergreen →</Link><Link className="text-link" href="/wondergreen/cotizador/">Abrir cotizador →</Link></div></div></section> : null}

      <section className="product-truth-section" id="criterio"><div className="container product-truth-grid"><div><span className="eyebrow eyebrow--light">Criterio técnico</span><h2>La información de producto se convierte en un programa aplicable.</h2></div><div><p>La ficha técnica, la etiqueta, la condición regulatoria y la recomendación para el cultivo guían dosis, frecuencia, compatibilidades, concentración, objetivo de manejo y seguimiento. Así cada referencia llega al lote con criterios claros de aplicación.</p><h3>Notas de manejo</h3><ul>{product.notes.map((note)=><li key={note}>{note}</li>)}</ul><div className="button-row"><Link className="button button--outline-light" href="/biblioteca/manual-uso-wondergreen/">Abrir manual de aplicación</Link><Link className="button button--ghost-light" href="/wondergreen/ciencia/">Conocer la ciencia Wondergreen</Link></div></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>¿Quieres saber si esta familia tiene sentido para tu cultivo?</h2></div><div className="button-row"><Link className="button button--dark" href="/wondergreen/cultivos/">Buscar por cultivo</Link><Link className="button button--ghost" href="/wondergreen/cotizador/">Abrir cotizador</Link><a className="button button--ghost" href={site.bookingUrl} target="_blank" rel="noreferrer">Hablar con el equipo</a></div></div></section>
    </>
  );
}
