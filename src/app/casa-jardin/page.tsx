import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CasaJardinInteractive } from "@/components/casa-jardin-interactive";
import { CasaJardinV4Review } from "@/components/casa-jardin-v4-review";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { casaJardinProducts } from "@/data/casa-jardin-detail";
import { casaJardinKits } from "@/data/casa-jardin-v4-review";
import { site } from "@/data/site";

const observationStates = [
  { src: "/guides/casa-observar-activa.jpg", alt: "Ilustración de una planta activa en una matera", label: "Activa" },
  { src: "/guides/casa-observar-revisar.jpg", alt: "Ilustración de una planta recién trasplantada para observar antes de nutrir", label: "Trasplante reciente" },
  { src: "/guides/casa-observar-detener.jpg", alt: "Ilustración de una planta con señales de encharcamiento que invitan a revisar el drenaje", label: "Revisar drenaje" },
];

export const metadata: Metadata = {
  title: "Wondergreen Casa & Jardín | Nutrición por etapas",
  description: "Productos Wondergreen, propuestas de kits y guías para plantas, jardines y huertas. Revisa la etapa y condición de cada planta para orientarte.",
  alternates: { canonical: "/casa-jardin/" },
  openGraph: {
    type: "website",
    siteName: "Greenatics",
    title: "Casa & Jardín | Wondergreen",
    description: "Una ruta sencilla para reconocer la etapa, encontrar productos y cuidar plantas, jardines y huertas en casa.",
    url: "/casa-jardin/",
    images: ["/products/casa-jardin-hero-editorial-v01.jpg"],
  },
};

export default function CasaJardinPage() {
  const aromaticasKit = casaJardinKits.find(({ slug }) => slug === "aromaticas-y-hojas");

  if (!aromaticasKit) throw new Error("Missing Aromáticas y Hojas visual proposal");

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Casa & Jardín", url: `${site.url}/casa-jardin/` }]} />

      <section className="homegarden-v4-hero homegarden-v4-hero--entry" aria-labelledby="homegarden-title">
        <div className="container homegarden-v4-hero__grid">
          <div className="homegarden-v4-hero__copy">
            <Image className="homegarden-v4-hero__brand" src="/brand/wondergreen-nutrients-transparent.png" alt="Wondergreen Nutrients" width={746} height={392} />
            <h1 id="homegarden-title">Nutrición clara para plantas, jardines y huertas.</h1>
            <p className="lead">Reconoce la etapa, revisa cómo está tu planta y encuentra productos, kits y guías Wondergreen para acompañarla.</p>
            <div className="button-row">
              <Link className="button button--dark" href="#kits-v4-title">Ver propuestas de kits</Link>
              <Link className="button button--ghost" href="#diagnostico">Orientar mi planta</Link>
            </div>
          </div>
          <figure className="homegarden-v4-hero__image">
            <div className="homegarden-v4-hero__visual-stage">
              <div className="homegarden-v4-hero__image-frame">
                <Image src="/products/casa-jardin-hero-editorial-v01.jpg" alt="Manos cuidando hierbas frescas en una maceta de barro, con luz natural." fill loading="eager" fetchPriority="high" sizes="(max-width: 850px) 100vw, 48vw" />
              </div>
              <Link className="homegarden-v4-hero__kit-art" href="#aromaticas-y-hojas" aria-label="Ver la propuesta de kit Aromáticas y Hojas">
                <span className="homegarden-v4-hero__kit-art-image"><Image src="/wondergreen/v4/kits/aromaticas-y-hojas.png" alt="" aria-hidden="true" fill sizes="(max-width: 760px) 102px, 230px" /></span>
                <span className="homegarden-v4-hero__kit-art-label">Propuesta · Aromáticas y Hojas <span aria-hidden="true">→</span></span>
              </Link>
            </div>
            <figcaption><strong>Tu planta cambia. Su nutrición también.</strong><span>Una guía práctica para elegir con criterio, no a ciegas.</span></figcaption>
          </figure>
        </div>
      </section>

      <nav className="homegarden-v4-jump container" aria-label="Explorar Casa y Jardín">
        <span>Explorar</span><a href="#kits-v4-title">Kits</a><a href="#etapas">Productos por etapa</a><a href="#diagnostico">Orientador</a><Link href="/casa-jardin/guias/">Guías</Link>
      </nav>

      <div id="espacios">
        <div id="kits">
          <h2 className="sr-only" id="homegarden-routes-title">Propuestas de kits Wondergreen para distintos espacios y plantas</h2>
          <CasaJardinV4Review />
        </div>
      </div>

      <section className="homegarden-v4-stages" id="etapas" aria-labelledby="homegarden-stages-title">
        <div className="container homegarden-v4-stages__layout">
          <header className="homegarden-v4-stages__intro"><h2 id="homegarden-stages-title">COMPOST prepara. La planta marca la etapa.</h2><p>Las cinco referencias acompañan momentos distintos. No todas las especies pasan por cada etapa ni requieren todos los productos.</p><Link className="text-link" href="/casa-jardin/productos/">Ver productos y fichas <span aria-hidden="true">→</span></Link></header>
          <ul className="homegarden-v4-product-grid" id="productos">
            {casaJardinProducts.map((product) => <li className={`homegarden-v4-product-card homegarden-v4-product-card--${product.slug}`} key={product.slug}>
              <Link className="homegarden-v4-product-card__link" href={`/casa-jardin/productos/${product.slug}/`}>
                <span className="homegarden-v4-product-card__image"><Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 560px) 100vw, (max-width: 760px) 48vw, (max-width: 1100px) 30vw, 18vw" /></span>
                <span className="homegarden-v4-product-card__body"><span className="homegarden-v4-product-card__label">{product.label}</span><strong>{product.name}</strong><span className="homegarden-v4-product-card__role">{product.role}</span><span className="homegarden-v4-product-card__cta">Ver ficha <span aria-hidden="true">→</span></span></span>
              </Link>
            </li>)}
          </ul>
        </div>
      </section>

      <section className="homegarden-v4-decision" aria-labelledby="homegarden-decision-title">
        <div className="container homegarden-v4-decision__grid">
          <figure><Image src="/guides/casa-guia-drenaje.webp" alt="Dos materas: una con drenaje y otra sin, junto a una representación de sus raíces." fill sizes="(max-width: 850px) 100vw, 44vw" /><figcaption>El drenaje y el estado de las raíces orientan el cuidado antes de fertilizar.</figcaption></figure>
          <div><h2 id="homegarden-decision-title">Antes de nutrir, revisa agua y drenaje.</h2><p>Una planta decaída puede tener exceso de agua, poco drenaje, raíces afectadas o un problema sanitario. Añadir fertilizante no corrige esas causas. Revisa el sustrato y cómo evacúa el agua antes de elegir una referencia.</p><Link className="text-link" href="#diagnostico">Orientar mi planta <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>

      <section className="homegarden-v4-diagnostic" id="diagnostico" aria-labelledby="homegarden-diagnostic-title">
        <div className="container"><header><h2 id="homegarden-diagnostic-title">Empieza por lo que observas.</h2><p>Las opciones marcadas al inicio son un ejemplo. Cámbialas para reflejar lo que observas; la orientación no reemplaza la etiqueta ni una valoración especializada.</p></header><CasaJardinInteractive /></div>
      </section>

      <section className="homegarden-v4-guides" id="guias" aria-labelledby="homegarden-guides-title">
        <div className="container">
          <div className="homegarden-v4-guides__row"><div><h2 id="homegarden-guides-title">Aprende a leer lo que tu planta muestra.</h2><p>Empieza por observar su estado; después explora las guías de etapas, trasplante y huerta.</p></div><Link className="text-link" href="/casa-jardin/guias/">Ver todas las guías <span aria-hidden="true">→</span></Link></div>
          <article className="homegarden-v4-guide-preview">
            <div className="homegarden-v4-guide-preview__visual" aria-label="Tres situaciones para observar antes de nutrir">
              {observationStates.map((image) => <figure key={image.src}><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 30vw, 14vw" /><figcaption>{image.label}</figcaption></figure>)}
            </div>
            <div className="homegarden-v4-guide-preview__copy"><span className="eyebrow">Guía Casa & Jardín</span><h3>Antes de nutrir, revisa cómo está.</h3><p>Compara una planta activa, un trasplante reciente y señales de encharcamiento. Humedad, drenaje y raíces ayudan a decidir si es momento de elegir una referencia.</p><Link className="button button--dark" href="/casa-jardin/guias/#observar">Leer la guía de observación <span aria-hidden="true">→</span></Link></div>
          </article>
        </div>
      </section>

      <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">Casa, jardín o huerta</span><h2>Encuentra productos, rutas de cuidado y orientación Wondergreen para tu espacio.</h2></div><Link className="button button--dark" href="/contacto/?interes=casa-jardin">Consultar Casa & Jardín</Link></div></section>
    </>
  );
}
