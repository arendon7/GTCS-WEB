import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { casaJardinKits, casaJardinProducts, getCasaJardinKit } from "@/data/casa-jardin-v4-review";
import { site } from "@/data/site";

type KitPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return casaJardinKits.map((kit) => ({ slug: kit.slug }));
}

export async function generateMetadata({ params }: KitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const kit = getCasaJardinKit(slug);
  if (!kit) return { title: "Propuesta de kit | Wondergreen" };

  return {
    title: `${kit.name} · propuesta en revisión | Wondergreen`,
    description: `${kit.promise}${kit.secondaryPromise ? ` ${kit.secondaryPromise}` : ""} Revisa la composición propuesta y las validaciones pendientes.`,
    robots: { index: false, follow: false },
  };
}

export default async function CasaJardinKitV4Page({ params }: KitPageProps) {
  const { slug } = await params;
  const kit = getCasaJardinKit(slug);
  if (!kit) notFound();

  const components = kit.composition.map((item) => ({
    ...item,
    product: casaJardinProducts.find((product) => product.slug === item.productSlug),
  }));

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", url: `${site.url}/` },
        { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` },
        { name: "Kits", url: `${site.url}/casa-jardin/kits/` },
        { name: kit.name, url: `${site.url}/casa-jardin/kits/v4/${kit.slug}/` },
      ]} />
      <div className="homegarden-v4-kit-page">
        <section className="homegarden-v4-kit-hero">
          <div className="container homegarden-v4-kit-hero__grid">
            <div className="homegarden-v4-kit-hero__copy">
              <nav aria-label="Ruta de navegación" className="homegarden-v4-kit-breadcrumb">
                <Link href="/casa-jardin/">Casa &amp; Jardín</Link><span aria-hidden="true">/</span><Link href="/casa-jardin/kits/#kits-v4">Kits propuestos</Link>
              </nav>
              <span className="eyebrow eyebrow--light">Wondergreen · configuración propuesta</span>
              <h1>{kit.name}</h1>
              <p className="homegarden-v4-kit-hero__audience">{kit.audience}</p>
              <p className="lead">{kit.promise}</p>
              {kit.secondaryPromise ? <p className="homegarden-v4-kit-hero__audience">{kit.secondaryPromise}</p> : null}
              <p className="homegarden-v4-kit-hero__status">{kit.approvedDoseClaims?.length ? "Las promesas y pautas de dosis de esta ficha están aprobadas; la composición y el armado comercial se muestran como propuesta." : "Esta ficha muestra una propuesta para revisar. No confirma una presentación comercial ni una indicación de uso."}</p>
              <div className="button-row">
                <a className="button button--light" href="#composicion">Revisar composición</a>
                <Link className="button button--outline-light" href={`/wondergreen/cotizador/?kit=${kit.slug}#kits`}>Solicitar revisión y cotización</Link>
                <Link className="button button--outline-light" href="/casa-jardin/kits/#kits-v4">Volver a las propuestas</Link>
              </div>
            </div>
            <figure className="homegarden-v4-kit-hero__art">
              <Image src={kit.image} alt={kit.imageAlt} fill priority sizes="(max-width: 800px) 100vw, 50vw" />
              <figcaption>{kit.slug === "mi-huerta" ? "Arte aprobado · EQUILIBRA aparece fuera de la matriz; el armado comercial sigue en revisión" : kit.slug === "plantas-con-flor" ? "Arte aprobado · la matriz y el armado comercial siguen en revisión" : "Arte de referencia V4 · contenido y armado por confirmar"}</figcaption>
            </figure>
          </div>
        </section>

        {kit.editorialStory ? <section className="homegarden-v4-kit-story" aria-labelledby="homegarden-v4-kit-story-title"><div className="container"><header className="homegarden-v4-kit-story__intro"><span className="eyebrow">{kit.editorialStory.eyebrow}</span><h2 id="homegarden-v4-kit-story-title">{kit.editorialStory.title}</h2><p>{kit.editorialStory.intro}</p></header><div className="homegarden-v4-kit-story__moments">{kit.editorialStory.moments.map((moment) => <article key={moment.title}><span>{moment.label}</span><h3>{moment.title}</h3><p>{moment.copy}</p><Link href={moment.href}>{moment.linkLabel} <span aria-hidden="true">→</span></Link></article>)}</div><p className="homegarden-v4-kit-story__closing">{kit.editorialStory.closing}</p></div></section> : null}

        {kit.approvedDoseClaims?.length ? (
          <section className="homegarden-v4-kit-section" aria-labelledby="homegarden-v4-dose-title">
            <div className="container">
              <header className="homegarden-v4-kit-section__heading">
                <div><span className="eyebrow">Guía de uso aprobada</span><h2 id="homegarden-v4-dose-title">Dosis y preparación.</h2></div>
                <p>Pautas aprobadas para orientar el uso; la composición comercial de {kit.name} sigue en propuesta.</p>
              </header>
              <div className="homegarden-detail-composition">
                {kit.approvedDoseClaims.map((claim) => <article key={claim.title}><h3>{claim.title}</h3><p>{claim.copy}</p></article>)}
              </div>
            </div>
          </section>
        ) : null}

        <section className="homegarden-v4-kit-section" id="composicion" aria-labelledby="homegarden-v4-composition-title">
          <div className="container">
            <header className="homegarden-v4-kit-section__heading">
              <div><span className="eyebrow">Matriz propuesta</span><h2 id="homegarden-v4-composition-title">Qué aparece en esta composición.</h2></div>
              <p>Las cantidades corresponden a la propuesta gráfica y requieren conciliación con referencias, presentaciones y armado final.</p>
            </header>
            <div className="homegarden-v4-kit-components">
              {components.map(({ product, productSlug, quantity }) => (
                <article className="homegarden-v4-kit-component" key={productSlug}>
                  {product && <div className="homegarden-v4-kit-component__image"><Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 700px) 45vw, 180px" /></div>}
                  <div className="homegarden-v4-kit-component__text">
                    <span>{product?.status === "catálogo identificado" ? "Referencia identificada" : "Referencia por validar"}</span>
                    <h3>{product?.name ?? productSlug}</h3>
                    <p>{product?.label}</p>
                    <dl><div><dt>Presentación ilustrada</dt><dd>{product?.proposedFormat ?? "Por confirmar"}</dd></div><div><dt>Cantidad en la matriz</dt><dd>{quantity} {quantity === 1 ? "unidad" : "unidades"} propuesta{quantity === 1 ? "" : "s"}</dd></div></dl>
                    {product?.status === "referencia adicional por validar" && <p className="homegarden-v4-kit-component__caution">{product.validationNote ?? "Identidad comercial, etiqueta y condiciones de uso pendientes de validación. Esta ficha no atribuye dosis ni efectos."}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="homegarden-v4-kit-totals" aria-labelledby="homegarden-v4-totals-title">
          <div className="container homegarden-v4-kit-totals__grid">
            <div><span className="eyebrow eyebrow--light">Empaque y accesorios</span><h2 id="homegarden-v4-totals-title">Una idea de armado, todavía por conciliar.</h2><p>{kit.note}</p></div>
            <div className="homegarden-v4-kit-totals__cards"><article><span>Totales ilustrados</span><strong>{kit.proposedTotals}</strong><p>Propuesta; no confirma unidades comerciales vigentes.</p></article><article><span>Accesorios ilustrados</span><ul>{kit.accessories.map((accessory) => <li key={accessory}>{accessory}</li>)}</ul><p>Materiales y disponibilidad por confirmar.</p></article></div>
          </div>
        </section>

        <section className="homegarden-v4-kit-use">
          <div className="container homegarden-v4-kit-use__panel">
            <span className="eyebrow">Antes de usar</span>
            {kit.approvedDoseClaims?.length ? (
              <>
                <h2>Prepara el atomizador y controla el fertilizante anual.</h2>
                <p><strong>Atomizador:</strong> mezcla 1 parte del producto líquido indicado con 10 partes de agua.</p>
                <p><strong>Fertilizante sólido:</strong> repártelo en un anillo bajo la proyección de la copa (zona de gotera); en matera, sigue ese borde y deja libre el tallo. Cúbrelo con una capa ligera de sustrato y riega para incorporarlo.</p>
                <p><strong>Control anual:</strong> suma todas las aplicaciones de fertilizante y no superes el 10% del peso del suelo o sustrato: máximo 100 g por cada kg al año. Registra cada aplicación. La composición del kit continúa como propuesta; sus referencias responden a necesidades distintas y no deben mezclarse ni aplicarse todas juntas.</p>
              </>
            ) : (
              <>
                <h2>La composición no es un protocolo de aplicación.</h2>
                <p>Las referencias de esta propuesta corresponden a momentos o necesidades distintas. La ficha no indica mezclarlas ni aplicarlas juntas. Consulta la etiqueta vigente de cada producto y las recomendaciones técnicas cuando se cierre la matriz.</p>
              </>
            )}
            {kit.slug === "mi-huerta" && <p>Para criterios generales de planeación y manejo por contexto, consulta la <Link href="/biblioteca/huertas/">guía web de huertas</Link>. La composición comercial de este kit sigue en propuesta.</p>}
            <Link className="homegarden-v4-kit-back" href="/casa-jardin/kits/#kits-v4">Explorar las otras propuestas <span aria-hidden="true">→</span></Link>
          </div>
        </section>
      </div>
    </>
  );
}
