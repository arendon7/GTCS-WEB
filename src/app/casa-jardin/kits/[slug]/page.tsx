import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
      images: [{ url: kit.image, alt: `Kit de cultivo ${kit.name} de Wondergreen` }],
    },
  };
}

const stageLinks: Record<string, string> = { COMPOST: "/casa-jardin/productos/compost/", CRECE: "/casa-jardin/productos/crece/", EQUILIBRA: "/casa-jardin/productos/equilibra/", FLORECE: "/casa-jardin/productos/florece/", FRUCTIFICA: "/casa-jardin/productos/fructifica/" };

export default async function CasaJardinKitDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = getCasaJardinKit(slug);
  if (!kit) notFound();
  const contactHref = `/contacto/?interes=casa-jardin&perfil=hogar&diagnostico=${encodeURIComponent(`Consulta sobre el kit ${kit.name}`)}&prioridad=${encodeURIComponent(`${kit.audience}. ${kit.promise}`)}`;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Kits por uso", url: `${site.url}/casa-jardin/kits/` }, { name: kit.name, url: `${site.url}/casa-jardin/kits/${kit.slug}/` }]} />
      <div className="homegarden-public-subpage">
      <section className="homegarden-subpage-hero homegarden-detail-hero"><div className="container homegarden-subpage-hero__grid"><div><Link className="back-link" href="/casa-jardin/kits/">← Volver a kits</Link><span className="eyebrow eyebrow--light">Wondergreen · kit de cultivo</span><h1>{kit.name}</h1><p className="lead">{kit.audience}. <strong>{kit.promise}</strong></p><div className="button-row"><a className="button button--light" href="#composicion">Ver composición</a><a className="button button--outline-light" href={kit.slug === "mi-huerta" ? "#ruta-cultivo" : "#ruta-kit"}>Ver ruta de uso</a></div></div><figure className="homegarden-kit-detail-art"><Image src={kit.image} alt={`Productos Wondergreen del kit ${kit.name}, junto a una bolsa de yute y plantas.`} fill priority sizes="(max-width: 760px) 100vw, 50vw" /><figcaption>Kit {kit.name} · Wondergreen Casa & Jardín</figcaption></figure></div></section>
      <section className="homegarden-public-section" id="composicion"><div className="container"><div className="wg-v4-heading"><div><span className="eyebrow">Qué incluye</span><h2>Una ruta de cultivo, con sus herramientas de apoyo.</h2></div><p>{kit.note}</p></div><ul className="homegarden-kit-includes">{kit.includes.map((item) => <li key={item}>{item}</li>)}</ul><div className="wg-v4-heading homegarden-kit-stages-heading"><div><span className="eyebrow">Productos del kit</span><h2>Cada referencia acompaña una etapa distinta.</h2></div><p>Elige según el estado de la planta. La composición reúne opciones de cuidado, no una mezcla para aplicar de una sola vez.</p></div><div className="homegarden-detail-composition">{kit.composition.map((item) => { const stage = item.split(" · ")[0]; const stageClass = stage.toLowerCase(); return <article className={`homegarden-detail-composition__item homegarden-detail-composition__item--${stageClass}`} key={item}><h3>{stage}</h3><p>{item.slice(stage.length + 3)}</p>{stageLinks[stage] ? <Link href={stageLinks[stage]}>Conocer {stage.toLowerCase()} <span aria-hidden="true">→</span></Link> : null}</article>; })}</div></div></section>
      {kit.slug === "mi-huerta" ? (
        <section className="homegarden-huerta-paths" id="ruta-cultivo" aria-labelledby="homegarden-huerta-paths-title">
          <div className="container">
            <div className="homegarden-huerta-paths__heading">
              <div><span className="eyebrow">Dos rutas de cultivo</span><h2 id="homegarden-huerta-paths-title">La cosecha define el recorrido.</h2></div>
              <p>Una huerta puede dar hojas, frutos o ambos. COMPOST prepara el medio y 2GROW acompaña el crecimiento vegetativo; después, cada especie sigue su propio ciclo.</p>
            </div>
            <div className="homegarden-huerta-paths__grid">
              <article className="homegarden-huerta-path homegarden-huerta-path--leaves">
                <span className="homegarden-huerta-path__eyebrow">Aromáticas y cultivos de hoja</span>
                <h3>De la preparación a la cosecha de hojas.</h3>
                <ol aria-label="Ruta para cosechar hojas">
                  <li><b>01</b><strong>COMPOST</strong><span>Prepara suelo y sustrato</span></li><li aria-hidden="true" className="homegarden-huerta-path__arrow">→</li>
                  <li><b>02</b><strong>2GROW</strong><span>Acompaña el crecimiento vegetativo</span></li><li aria-hidden="true" className="homegarden-huerta-path__arrow">→</li>
                  <li><b>03</b><strong>COSECHA</strong><span>Hojas según el ciclo de la especie</span></li>
                </ol>
                <p>Albahaca, cilantro, perejil, tomillo y romero pueden cultivarse por sus hojas; no necesitan llegar a flor o fruto para completar su recorrido.</p>
              </article>
              <article className="homegarden-huerta-path homegarden-huerta-path--fruit">
                <span className="homegarden-huerta-path__eyebrow">Hortalizas y especies que forman fruto</span>
                <h3>De la etapa vegetativa al desarrollo del fruto.</h3>
                <ol aria-label="Ruta para cultivos que forman fruto">
                  <li><b>01</b><strong>COMPOST</strong><span>Prepara suelo y sustrato</span></li><li aria-hidden="true" className="homegarden-huerta-path__arrow">→</li>
                  <li><b>02</b><strong>2GROW</strong><span>Acompaña el crecimiento</span></li><li aria-hidden="true" className="homegarden-huerta-path__arrow">→</li>
                  <li><b>03</b><strong>2BLOOM</strong><span>Transición reproductiva y floración</span></li><li aria-hidden="true" className="homegarden-huerta-path__arrow">→</li>
                  <li><b>04</b><strong>2FRUIT</strong><span>Desarrollo del fruto</span></li>
                </ol>
                <p>2BLOOM y 2FRUIT corresponden a momentos distintos del cultivo. La especie, el clima y las condiciones de manejo también influyen en cada etapa.</p>
              </article>
            </div>
            <aside className="homegarden-huerta-balance">
              <div><span className="homegarden-huerta-balance__mark" aria-hidden="true">+</span><div><strong>2BALANCE · nutrición equilibrada y mantenimiento</strong><p>Es una referencia complementaria para plantas estables, no un paso obligatorio de ninguna ruta. Valora la condición de la planta y sigue la etiqueta de la presentación.</p></div></div>
              <Link href="/casa-jardin/productos/equilibra/">Conocer 2BALANCE <span aria-hidden="true">→</span></Link>
            </aside>
          </div>
        </section>
      ) : null}
      <section className="homegarden-detail-route homegarden-kit-route" id="ruta-kit" aria-labelledby="homegarden-kit-route-title"><div className="container"><div className="homegarden-detail-route__heading"><div><span className="eyebrow">Cómo orienta este kit</span><h2 id="homegarden-kit-route-title">Una guía útil para el uso que tienes en mente.</h2></div><p>La planta y sus condiciones indican qué paso conviene seguir. Aquí encuentras una lectura breve; la guía amplía la orientación según el uso del kit.</p></div><ol>{kit.route.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.body}</p></div></li>)}</ol><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Usar orientador</Link><a className="button button--ghost" href={kit.guideHref} download={kit.guideHref.endsWith(".pdf") || undefined} aria-label={`${kit.guideHref.endsWith(".pdf") ? "Descargar" : "Consultar"} ${kit.guideTitle}`}>{kit.guideHref.endsWith(".pdf") ? "Descargar guía del kit" : "Consultar guía web del kit"}</a><Link className="button button--ghost" href={contactHref}>Consultar este kit</Link></div></div></section>
      </div>
    </>
  );
}
