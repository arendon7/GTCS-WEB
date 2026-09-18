import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioGroup, portfolioGroupSlugs } from "@/data/portfolio";
import { products } from "@/data/products";

export function generateStaticParams() { return portfolioGroupSlugs; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const group = getPortfolioGroup(slug);
  if (!group) return {};
  return { title: group.name, description: group.intro, alternates: { canonical: `/portafolio/${group.slug}/` } };
}

export default async function PortfolioGroupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const group = getPortfolioGroup(slug);
  if (!group) notFound();

  return (
    <>
      <section className={`portfolio-v5-detail-hero portfolio-v5-detail-hero--${group.color}`}>
        <div className="container portfolio-v5-detail-hero__grid"><div><Link className="back-link back-link--light" href="/portafolio/">← Portafolio Greenatics 2.0</Link><span className="eyebrow eyebrow--light">{group.eyebrow}</span><h1>{group.headline}</h1><p className="lead">{group.intro}</p><div className="button-row"><Link className="button button--light" href="/contacto/">Hablar sobre esta línea</Link><Link className="button button--outline-light" href="/diagnostico/">Encontrar punto de entrada</Link></div></div><figure><Image src={group.image} alt={group.imageAlt} fill priority sizes="(max-width: 900px) 100vw, 44vw" /><figcaption>{group.statement}</figcaption></figure></div>
      </section>
      <section className="portfolio-v5-entry"><div className="container"><span className="eyebrow">Qué puede activar esta línea</span><h2>Una entrada concreta, una ruta de crecimiento.</h2><p>Selecciona la oferta que más se acerca a tu situación. Cada entrada tiene un alcance entendible, una salida de trabajo y un siguiente paso posible.</p><div className="portfolio-v5-entry__grid">{group.entries.map((entry, index) => <article key={entry.slug}><figure><Image src={entry.image} alt={entry.imageAlt} fill sizes="(max-width: 760px) 100vw, 31vw" /><span>0{index + 1}</span></figure><div><span className="eyebrow">{entry.eyebrow}</span><h3>{entry.name}</h3><strong>{entry.promise}</strong><p>{entry.detail}</p><ul>{entry.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul><Link href={entry.href}>{entry.cta} <span aria-hidden="true">→</span></Link></div></article>)}</div></div></section>
      {group.slug === "wondergreen" ? <section className="portfolio-v5-products"><div className="container"><div className="portfolio-v5-heading"><div><span className="eyebrow">Producto por producto</span><h2>La referencia cambia; el criterio permanece.</h2></div><p>Estas son las referencias que ya tienen página individual en la web. La fórmula ayuda a orientar la etapa, pero la dosis final se define con ficha, cultivo, diagnóstico, vía y condición del lote.</p></div><div className="portfolio-v5-products__grid">{products.map((product) => <article key={product.slug}><figure><Image src={product.image || "/products/wondergreen-2grow.webp"} alt={`Producto ${product.name}`} fill sizes="(max-width: 700px) 50vw, 18vw" /></figure><div><span>{product.family}</span><h3>{product.name}</h3><strong>{product.formula || product.focus}</strong><p>{product.stage || product.technicalRole}</p><Link href={`/wondergreen/productos/${product.slug}/`}>Abrir ficha <span aria-hidden="true">→</span></Link></div></article>)}<article className="portfolio-v5-products__documented"><figure><Image src="/guides/ficha-biol-cover.png" alt="Ficha técnica del Biol Wondergreen" fill sizes="(max-width: 700px) 50vw, 18vw" /></figure><div><span>BIOL</span><h3>Biol Wondergreen</h3><strong>Uso documentado: 1 L en 100 L de agua</strong><p>Referencia para fertirriego y aplicación edáfica según la ficha técnica consultada.</p><Link href="/wondergreen/productos/biol/">Ver ficha y uso <span aria-hidden="true">→</span></Link></div></article></div></div></section> : null}
      <section className="portfolio-v5-proof"><div className="container portfolio-v5-proof__inner"><div><span className="eyebrow eyebrow--light">Cómo trabajamos</span><h2>La oferta se adapta al contexto; el método mantiene el rigor.</h2></div><p>Partimos de datos, definimos una línea base, hacemos explícitas las decisiones y acompañamos la implementación con responsables, indicadores y evidencia. Cuando el sistema está listo, conectamos la siguiente capa: producto, energía, clima, datos o expansión.</p></div></section>
      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Construir la ruta</span><h2>¿Quieres que revisemos esta línea para tu organización?</h2></div><Link className="button button--dark" href={`/contacto/?interes=${group.slug}`}>Solicitar orientación</Link></div></section>
    </>
  );
}
