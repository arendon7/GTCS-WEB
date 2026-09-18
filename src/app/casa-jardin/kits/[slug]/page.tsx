import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { casaJardinKits, getCasaJardinKit } from "@/data/casa-jardin-detail";
import { site } from "@/data/site";

export function generateStaticParams() {
  return casaJardinKits.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kit = getCasaJardinKit(slug);
  if (!kit) return { title: "Kit | Wondergreen Casa & Jardín" };
  const canonical = `/casa-jardin/kits/${kit.slug}/`;
  const description = `${kit.promise} Ruta de cuidado y condiciones de uso.`;
  return {
    title: `${kit.name} | Kits Wondergreen Casa & Jardín`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${kit.name} | Wondergreen Casa & Jardín`,
      description,
      url: canonical,
      ...(kit.image ? { images: [kit.image] } : {}),
    },
  };
}

const stageLinks: Record<string, string> = { COMPOST: "/casa-jardin/productos/compost/", CRECE: "/casa-jardin/productos/crece/", EQUILIBRA: "/casa-jardin/productos/equilibra/", FLORECE: "/casa-jardin/productos/florece/", FRUCTIFICA: "/casa-jardin/productos/fructifica/" };

export default async function CasaJardinKitDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = getCasaJardinKit(slug);
  if (!kit) notFound();

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Kits por uso", url: `${site.url}/casa-jardin/kits/` }, { name: kit.name, url: `${site.url}/casa-jardin/kits/${kit.slug}/` }]} />
      <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero homegarden-detail-hero"><div className="container homegarden-subpage-hero__grid"><div><Link className="back-link" href="/casa-jardin/kits/">← Volver a kits</Link><span className="eyebrow eyebrow--light">Wondergreen · kit por contexto</span><h1>{kit.name}</h1><p className="lead">{kit.audience}. <strong>{kit.promise}</strong></p><div className="button-row"><a className="button button--light" href="#composicion">Ver composición</a><Link className="button button--outline-light" href="/casa-jardin/#diagnostico">Revisar mi planta</Link></div></div><figure className="homegarden-subpage-hero__visual homegarden-detail-visual">{kit.image ? <Image src={kit.image} alt={`Guía visual Kit ${kit.name}`} fill priority sizes="(max-width: 850px) 100vw, 40vw" /> : <div className="homegarden-detail-visual__compost"><span>RUTA POR CONTEXTO</span><strong>Una ruta<br />completa.</strong><small>{kit.name}</small></div>}<figcaption>RUTA DE CUIDADO · COTIZACIÓN ACOMPAÑADA</figcaption></figure></div></section>
      <section className="homegarden-public-section" id="composicion"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Composición orientativa</span><h2>El kit organiza etapas, no prescribe una mezcla.</h2></div><p>{kit.note} El equipo Greenatics define presentación, dosificador, etiqueta, precio, stock y forma de entrega para cada solicitud.</p></div><div className="homegarden-detail-composition">{kit.composition.map((item, index) => { const stage = item.split(" · ")[0]; return <article key={item}><span>0{index + 1}</span><h3>{stage}</h3><p>{item.slice(stage.length + 3)}</p>{stageLinks[stage] ? <Link href={stageLinks[stage]}>Abrir etapa <span aria-hidden="true">→</span></Link> : null}</article>; })}</div></div></section>
      <section className="homegarden-public-section homegarden-public-section--soft"><div className="container homegarden-public-callout"><div><span className="eyebrow">Orientación secundaria</span><h2>Primero entiende el kit. Después decide cada planta.</h2></div><p>Si conviven varias etapas, el diagnóstico ayuda a separar decisiones. Si la planta está estresada, encharcada o con señales sanitarias, revisa la causa antes de aplicar.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Usar orientador</Link><Link className="button button--ghost" href="/casa-jardin/productos/">Comparar productos</Link><Link className="button button--ghost" href="/casa-jardin/guias/">Abrir guías</Link></div></div></section>
      </div>
    </>
  );
}
