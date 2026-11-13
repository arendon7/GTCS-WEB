import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { casaJardinProducts } from "@/data/casa-jardin-detail";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Productos por etapa | Wondergreen Casa & Jardín",
  description: "Explora Wondergreen por suelo, crecimiento, equilibrio, floración y fructificación, con rutas de cuidado y orientación doméstica por etapa.",
  alternates: { canonical: "/casa-jardin/productos/" },
  openGraph: {
    title: "Productos por etapa | Wondergreen Casa & Jardín",
    description: "Explora Wondergreen por suelo, crecimiento, equilibrio, floración y fructificación, con rutas de cuidado y orientación doméstica por etapa.",
    url: "/casa-jardin/productos/",
    images: ["/products/wondergreen-soil-roots-editorial-og.jpg"],
  },
};

const productFamilyClass = (product: (typeof casaJardinProducts)[number]) => (product.family ?? "compost").toLowerCase();

export default function CasaJardinProductosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }, { name: "Productos por etapa", url: `${site.url}/casa-jardin/productos/` }]} />
      <div className="homegarden-public-subpage homegarden-public-subpage--product-index">
      <section className="homegarden-subpage-hero">
        <div className="container homegarden-subpage-hero__grid">
          <div>
            <Link className="back-link" href="/casa-jardin/">← Volver a Casa & Jardín</Link>
            <h1>Compost prepara. Elige según la etapa.</h1>
            <p className="lead">COMPOST prepara suelo y sustrato. CRECE, EQUILIBRA, FLORECE y FRUCTIFICA responden a momentos distintos: no se aplican juntas ni forman una secuencia obligatoria.</p>
            <div className="button-row"><a className="button button--light" href="#catalogo">Explorar productos</a><a className="button button--outline-light" href="#criterio-decision">Leer criterio de elección</a></div>
          </div>
          <div className="homegarden-subpage-hero__visual homegarden-product-family-map homegarden-product-family-map--products" aria-label="COMPOST prepara el suelo; cuatro productos se eligen según la etapa de cada planta">
            <div className="homegarden-product-family-map__base"><span>PREPARAR SUELO Y SUSTRATO</span><strong>COMPOST</strong></div>
            <div className="homegarden-product-family-map__stages"><span>SEGÚN LA PLANTA</span><ul><li>CRECE</li><li>EQUILIBRA</li><li>FLORECE</li><li>FRUCTIFICA</li></ul></div>
            <p>No todas las especies recorren las mismas etapas.</p>
          </div>
        </div>
      </section>

      <section className="homegarden-public-section" id="catalogo">
        <div className="container">
          <div className="wg-v4-heading"><div><h2>Cinco referencias para necesidades distintas.</h2></div><p>Empieza por la etapa observable y la condición de la planta. Cada ficha desarrolla la función de su producto y conecta con la guía relacionada.</p></div>
          <div className="homegarden-product-grid">
            {casaJardinProducts.map((product) => <article className={`homegarden-product-card homegarden-product-card--${productFamilyClass(product)}`} key={product.slug}>
              <figure className="homegarden-product-card__media"><Image src={product.referenceImage} alt={product.referenceImageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1050px) 50vw, 33vw" /></figure>
              <div className="homegarden-product-card__body"><span className="homegarden-product-card__label">{product.label}</span><h3>{product.name}</h3><p>{product.role}</p><Link href={`/casa-jardin/productos/${product.slug}/`}>Ver ficha de {product.name} <span aria-hidden="true">→</span></Link></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="homegarden-public-section homegarden-public-section--soft" id="criterio-decision"><div className="container homegarden-public-callout"><div><span className="eyebrow">Regla de decisión</span><h2>Una etapa orienta; la condición confirma.</h2></div><p>Agua, drenaje, raíces, luz, sanidad, tamaño del recipiente y estado general importan tanto como la fórmula. Por eso no publicamos una dosis universal ni convertimos una imagen de síntoma en diagnóstico.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/#diagnostico">Revisar mi planta</Link><Link className="button button--ghost" href="/casa-jardin/kits/">Ver kits por uso</Link></div></div></section>
      </div>
    </>
  );
}
