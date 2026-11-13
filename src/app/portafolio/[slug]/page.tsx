import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioGroup, portfolioGroupSlugs } from "@/data/portfolio";
import { PortfolioWondergreenScience } from "@/components/portfolio-wondergreen-science";

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
  const closingHeading = group.slug === "wondergreen"
    ? "¿Qué producto o etapa quieres revisar para tu cultivo?"
    : "¿Qué necesitas resolver en esta línea de trabajo?";
  const closingCta = group.slug === "wondergreen" ? "Pedir orientación agronómica" : "Conversar sobre mi proyecto";
  const contactHref = group.slug === "wondergreen"
    ? "/contacto/?interes=wondergreen&perfil=agro"
    : `/contacto/?interes=${group.slug}`;
  const detailImage = group.detailImage ?? group.image;
  const detailImageAlt = group.detailImageAlt ?? group.imageAlt;
  const detailStatement = group.detailStatement ?? group.statement;

  return (
    <>
      <section className={`portfolio-v5-detail-hero portfolio-v5-detail-hero--${group.color}`}>
        <div className="container portfolio-v5-detail-hero__grid"><div><Link className="back-link back-link--light" href="/portafolio/">← Portafolio Greenatics 2.0</Link><span className="eyebrow eyebrow--light">{group.eyebrow}</span><h1>{group.headline}</h1><p className="lead">{group.intro}</p><div className="button-row"><Link className="button button--light" href="#oferta">Ver ofertas de esta línea</Link></div></div><figure className={detailImage.endsWith(".svg") ? "portfolio-v5-detail-hero__figure--diagram" : undefined}>{detailImage.endsWith(".svg") ? <div className="portfolio-v5-diagram-frame"><Image src={detailImage} alt={detailImageAlt} fill priority sizes="(max-width: 900px) 100vw, 44vw" /></div> : <Image src={detailImage} alt={detailImageAlt} fill priority sizes="(max-width: 900px) 100vw, 44vw" />}<figcaption>{detailStatement}</figcaption></figure></div>
      </section>
      <section id="oferta" className={`portfolio-v5-entry portfolio-v5-entry--${group.slug}`}><div className="container"><span className="eyebrow">Qué puedes activar aquí</span><h2>{group.entryHeading}</h2><p>{group.entryIntro}</p><div className={`portfolio-v5-entry__grid${group.entries.length === 3 ? " portfolio-v5-entry__grid--three" : ""}`}>{group.entries.map((entry) => <article className={entry.image ? undefined : "portfolio-v5-entry__text-only"} key={entry.slug}>{entry.image ? <figure className={entry.image.endsWith(".svg") ? "portfolio-v5-entry__figure--diagram" : undefined}><Image src={entry.image} alt={entry.imageAlt ?? entry.name} fill sizes="(max-width: 760px) 100vw, 31vw" />{entry.imageCaption ? <figcaption>{entry.imageCaption}</figcaption> : null}</figure> : null}<div><span className="eyebrow">{entry.eyebrow}</span><h3>{entry.name}</h3><strong>{entry.promise}</strong><p>{entry.detail}</p>{group.slug !== "wondergreen" ? <ul>{entry.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul> : null}<Link href={entry.href}>{entry.cta} <span aria-hidden="true">→</span></Link></div></article>)}</div></div></section>
      {group.slug === "wondergreen" ? <PortfolioWondergreenScience /> : null}
      {group.slug === "wondergreen" ? <section className="portfolio-v5-catalog"><div className="container portfolio-v5-catalog__inner"><div><span className="eyebrow">Catálogo de referencias</span><h2>Explora fórmulas, estados y formatos por familia.</h2><p>El catálogo reúne fertilizantes sólidos y líquidos, Compost y bioinsumos. En 2GROW líquido, 200-0-0 es la formulación de mayor concentración de nitrógeno dentro de la misma línea; consulta allí las referencias y presentaciones vigentes.</p></div><Link className="button button--dark" href="/biblioteca/catalogo-wondergreen/#familias">Abrir catálogo por familias</Link></div></section> : null}
      {group.slug !== "wondergreen" ? <section className="portfolio-v5-proof"><div className="container portfolio-v5-proof__inner"><div><span className="eyebrow eyebrow--light">{group.proofLabel}</span><h2>{group.proofTitle}</h2></div><p>{group.proofCopy}</p></div></section> : null}
      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Siguiente paso</span><h2>{closingHeading}</h2></div><Link className="button button--dark" href={contactHref}>{closingCta}</Link></div></section>
    </>
  );
}
