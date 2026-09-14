import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { casaJardinProducts, getCasaJardinProduct } from "@/data/casa-jardin-detail";

export function generateStaticParams() {
  return casaJardinProducts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getCasaJardinProduct(slug);
  return product ? { title: `${product.name} | Wondergreen Casa & Jardín`, description: product.role, alternates: { canonical: `/casa-jardin/productos/${product.slug}/` } } : { title: "Producto | Wondergreen Casa & Jardín" };
}

export default async function CasaJardinProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getCasaJardinProduct(slug);
  if (!product) notFound();

  return (
    <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero homegarden-detail-hero"><div className="container homegarden-subpage-hero__grid"><div><Link className="back-link" href="/casa-jardin/productos/">← Volver a productos</Link><span className="eyebrow eyebrow--light">Wondergreen · {product.label}</span><h1>{product.name}</h1><p className="lead">{product.role}</p><p className="homegarden-detail-hero__prompt">{product.prompt}</p><div className="button-row"><Link className="button button--light" href={product.technicalHref}>Ver referencia técnica</Link><Link className="button button--outline-light" href="/casa-jardin/#diagnostico">Revisar mi planta</Link></div></div><figure className="homegarden-subpage-hero__visual homegarden-detail-visual">{product.image ? <Image src={product.image} alt={`Ficha visual ${product.name} Wondergreen`} fill priority sizes="(max-width: 850px) 100vw, 40vw" /> : <div className="homegarden-detail-visual__compost"><span>BASE DEL SISTEMA</span><strong>Suelo<br />primero.</strong><small>COMPOST</small></div>}<figcaption>{product.formula} · REFERENCIA DE LÍNEA</figcaption></figure></div></section>
      <section className="homegarden-public-section"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Qué papel cumple</span><h2>La referencia se entiende mejor dentro del momento de la planta.</h2></div><p>{product.context} La etapa orienta la conversación, pero no reemplaza la revisión de agua, drenaje, raíces, luz, sanidad y estado general.</p></div><div className="homegarden-detail-facts"><article><span>Referencia</span><strong>{product.formula}</strong><p>Identidad técnica de la línea Wondergreen.</p></article><article><span>Presentación</span><strong>{product.formats}</strong><p>Orientación doméstica por etapa y tipo de planta.</p></article><article><span>Cómo avanzar</span><strong>Con acompañamiento</strong><p>El equipo define la presentación y el protocolo apropiados para cada caso.</p></article></div></div></section>
      <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><span className="eyebrow">Decidir con criterio</span><h2>La línea orienta. La condición confirma.</h2></div><p>No conviertas un síntoma aislado en una receta. Si hay encharcamiento, pudrición, daño radicular, plaga o marchitez severa, el siguiente paso puede ser revisar la causa y no fertilizar.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Usar orientador</Link><Link className="button button--ghost" href="/casa-jardin/guias/">Consultar guías</Link><Link className="button button--ghost" href="/casa-jardin/kits/">Ver kits relacionados</Link></div></div></section>
    </div>
  );
}
