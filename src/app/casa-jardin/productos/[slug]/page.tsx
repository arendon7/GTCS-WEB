import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { casaJardinProducts, getCasaJardinProduct } from "@/data/casa-jardin-detail";
import { site } from "@/data/site";

export function generateStaticParams() {
  return casaJardinProducts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getCasaJardinProduct(slug);
  if (!product) return { title: "Producto | Wondergreen Casa & Jardín" };
  const canonical = `/casa-jardin/productos/${product.slug}/`;
  return {
    title: `${product.name} | Wondergreen Casa & Jardín`,
    description: product.role,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} | Wondergreen Casa & Jardín`,
      description: product.role,
      url: canonical,
    },
  };
}

export default async function CasaJardinProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getCasaJardinProduct(slug);
  if (!product) notFound();
  const familyClass = product.family?.toLowerCase() ?? "base";
  const contactHref = `/contacto/?interes=casa-jardin&perfil=hogar&diagnostico=${encodeURIComponent(`Consulta sobre ${product.name}`)}&prioridad=${encodeURIComponent(`${product.label}. ${product.role}`)}`;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Productos por etapa", url: `${site.url}/casa-jardin/productos/` }, { name: product.name, url: `${site.url}/casa-jardin/productos/${product.slug}/` }]} />
      <div className={`homegarden-public-subpage homegarden-public-subpage--${familyClass}`}>
      <section className="homegarden-subpage-hero homegarden-detail-hero"><div className="container homegarden-subpage-hero__grid"><div><Link className="back-link" href="/casa-jardin/productos/">← Volver a productos</Link><span className="eyebrow eyebrow--light">Wondergreen · {product.label}</span><h1>{product.name}</h1><p className="lead">{product.role}</p><p className="homegarden-detail-hero__prompt">{product.prompt}</p><div className="button-row"><Link className="button button--light" href={product.technicalHref}>Ver ficha técnica Wondergreen</Link><a className="button button--outline-light" href="#ruta-cuidado">Ver criterio de uso</a></div></div><figure className={`homegarden-subpage-hero__visual homegarden-detail-visual homegarden-detail-visual--${familyClass}`}><Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 900px) 100vw, 48vw" priority /></figure></div></section>
      <section className="homegarden-public-section"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Qué papel cumple</span><h2>{product.overviewTitle || "La nutrición cambia con el momento de la planta."}</h2></div><p>{product.context} La etapa ayuda a orientar la elección; agua, drenaje, raíces, luz y sanidad completan la lectura.</p></div><div className="homegarden-detail-facts"><article><span>Familia</span><strong>{product.family ?? "Base orgánica"}</strong><p>{product.family ? "Fertilizante sólido Wondergreen para nutrición por etapa." : "Compost Wondergreen para preparar suelo y sustrato."}</p></article><article><span>{product.identityLabel}</span><strong>{product.identity}</strong><p>{product.identityHelp}</p></article><article><span>Qué aporta</span><strong>{product.family ? "Matriz organomineral ocluida" : "Materia orgánica"}</strong><p>{product.benefit}</p></article></div></div></section>
      {product.editorialScience ? <section className="homegarden-detail-science" aria-labelledby="homegarden-detail-science-title"><div className="container"><div className="homegarden-detail-science__intro"><span className="eyebrow">{product.editorialScience.eyebrow}</span><h2 id="homegarden-detail-science-title">{product.editorialScience.title}</h2><p>{product.editorialScience.copy}</p></div><div className="homegarden-detail-science__notes"><article><h3>{product.editorialScience.designTitle}</h3><p>{product.editorialScience.designCopy}</p></article><article><h3>{product.editorialScience.contextTitle}</h3><p>{product.editorialScience.contextCopy}</p></article></div><Link className="homegarden-detail-science__link" href="/wondergreen/ciencia/">Explorar la ciencia detrás de Wondergreen <span aria-hidden="true">→</span></Link></div></section> : null}
      <section className="homegarden-detail-route homegarden-product-route" id="ruta-cuidado" aria-labelledby="homegarden-detail-route-title"><div className="container"><div className="homegarden-detail-route__heading"><div><span className="eyebrow">Criterio de uso</span><h2 id="homegarden-detail-route-title">Qué observar en esta etapa.</h2></div><p>{product.useFocus}</p></div><div className="homegarden-product-route__notice"><strong>Consulta la dosis y la frecuencia en la etiqueta vigente.</strong><span>Esta ficha ayuda a reconocer la etapa; no reemplaza las indicaciones del producto ni una revisión de la planta.</span></div><div className="button-row"><a className="button button--light" href={product.guideHref} download={product.guideHref.endsWith(".pdf") || undefined} aria-label={`${product.guideHref.endsWith(".pdf") ? "Descargar" : "Consultar"} ${product.guideTitle}`}>{product.guideHref.endsWith(".pdf") ? "Descargar" : "Consultar"} {product.guideTitle}</a><Link className="button button--ghost" href="/casa-jardin/#diagnostico">Volver al orientador</Link><Link className="button button--ghost" href={contactHref}>Consultar {product.name}</Link></div></div></section>
      </div>
    </>
  );
}
