import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { CropLibraryGrid } from "@/components/crop-library-grid";
import { WondergreenSolidLines } from "@/components/wondergreen-packshots";
import { WondergreenLiquidLines } from "@/components/wondergreen-liquid-lines";
import { WondergreenBioinputLines } from "@/components/wondergreen-bioinput-lines";
import { WondergreenTechnicalLibrary } from "@/components/wondergreen-technical-library";
import { getProductMedia } from "@/data/product-media";
import { site } from "@/data/site";

const compostEditorialImage = getProductMedia("compost").editorial;

const heroProductReferences = [
  {
    name: "Compost",
    category: "Materia orgánica",
    image: "/products/wondergreen-line-compost.jpg",
    alt: "Compost aplicado al suelo junto a un cultivo.",
    type: "editorial",
  },
  {
    name: "Sólidos · 2GROW",
    category: "Organomineral ocluido",
    image: "/products/wondergreen-line-2grow.jpg",
    alt: "Plántula en suelo con gránulos, una escena asociada al crecimiento del cultivo.",
    type: "editorial",
  },
  {
    name: "Fertilizantes líquidos",
    category: "Fertilizante líquido",
    image: "/products/wondergreen-line-liquidos.jpg",
    alt: "Vaso con líquido oscuro junto a una planta joven en suelo agrícola.",
    type: "editorial",
  },
  {
    name: "Bioinsumos",
    category: "Botánicos y microbiológicos",
    image: "/products/wondergreen-line-bioinsumos-v2.jpg",
    alt: "Persona observa las raíces de una plántula de café en un vivero.",
    type: "editorial",
  },
] as const;

export const metadata: Metadata = {
  title: "Wondergreen | Nutrición organomineral y acompañamiento agronómico",
  description: "Compost, fertilizantes organominerales sólidos y líquidos y bioinsumos Wondergreen, con orientación agronómica para cada cultivo y etapa.",
  alternates: { canonical: "/wondergreen/" },
  openGraph: {
    title: "Wondergreen | Nutrición organomineral y acompañamiento agronómico",
    description: "Compost, fertilizantes organominerales sólidos y líquidos y bioinsumos Wondergreen, con orientación agronómica para cada cultivo y etapa.",
    url: "/wondergreen/",
    images: ["/products/wondergreen-soil-roots-editorial-og.jpg"],
  },
};

const tools = [
  ["Análisis de suelo", "Ordena variables y vacíos de información.", "/wondergreen/analisis-suelo/"],
  ["Preparador de recomendación", "Organiza área, etapa y referencia a revisar.", "/wondergreen/calculadora/"],
  ["Compatibilidad", "Consulta precauciones de mezcla y aplicación.", "/wondergreen/compatibilidad/"],
  ["Alertas del cultivo", "Organiza la observación de síntomas.", "/wondergreen/quiz-deficiencias/"],
] as const;

export default function WondergreenPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: "https://greenatics.com.co/" }, { name: "Wondergreen", url: "https://greenatics.com.co/wondergreen/" }]} />
      <section className="wg-v4-hero">
        <div className="container wg-v4-hero__grid">
          <div className="wg-v4-hero__copy">
            <Image className="wg-v4-brand-lockup" src="/brand/wondergreen-nutrients-transparent.png" alt="Wondergreen Nutrients" width={746} height={392} priority />
            <h1>Wondergreen: nutrición para el suelo y el cultivo.</h1>
            <p className="lead editorial-justify">Compost, fertilizantes organominerales sólidos y líquidos, y bioinsumos Wondergreen acompañan el manejo del suelo y el cultivo. Explora las familias y sus fichas; la elección depende de cada cultivo, etapa y condición del lote.</p>
            <div className="button-row"><Link className="button button--light" href="#productos">Explorar las familias</Link><a className="button button--outline-light" href={site.croperStoreUrl} target="_blank" rel="noopener noreferrer">Comprar en Croper <span aria-hidden="true">↗</span><span className="sr-only"> (se abre en una pestaña nueva)</span></a></div>
          </div>
          <div className="wg-v4-hero__visual wg-v4-family-gallery" role="group" aria-label="Wondergreen: cuatro familias de producto">
            {heroProductReferences.map((product) => (
              <figure className={`wg-v4-family-gallery__item wg-v4-family-gallery__item--${product.type}`} key={product.name}>
                <div className="wg-v4-family-gallery__media"><Image src={product.image} alt={product.alt} fill priority sizes="(max-width: 760px) 44vw, 19vw" /></div>
                <figcaption><strong>{product.name}</strong><span>{product.category}</span></figcaption>
              </figure>
            ))}
            <p className="wg-v4-family-gallery__note">Imágenes de contexto para las familias; consulta fichas y catálogo para confirmar referencias, etiquetas y presentaciones.</p>
          </div>
        </div>
      </section>

      <section className="wg-v4-products" id="productos">
        <div className="container">
          <div className="wg-v4-heading"><div><h2>Cuatro familias. Una decisión informada para cada cultivo.</h2></div><p>Conoce la función de cada referencia, compara las opciones y abre su ficha técnica. La dosis y la forma de uso se leen en contexto con la etiqueta y las condiciones del lote.</p></div>
          <nav className="wg-v4-product-jump" id="familias" aria-label="Explorar productos Wondergreen"><span>Ir a</span><Link href="/wondergreen/productos/compost/">Compost</Link><a href="#solidos">Fertilizantes sólidos</a><a href="#liquidos">Fertilizantes líquidos</a><a href="#bioinsumos">Bioinsumos</a><a href="#documentos">Fichas y catálogo</a></nav>
          <article className="wg-compost-entry" id="compost" aria-labelledby="wg-compost-title">
            {compostEditorialImage ? <figure className="wg-compost-entry__media"><img src={compostEditorialImage.src} alt={compostEditorialImage.alt} width={1280} height={1280} loading="lazy" decoding="async" /><figcaption>Materia orgánica para acondicionar el suelo y el sustrato.</figcaption></figure> : null}
            <div><h3 id="wg-compost-title">Compost Wondergreen</h3><p>Materia orgánica para preparar y enriquecer el suelo o el sustrato antes de acompañar las siguientes etapas del cultivo.</p></div>
            <Link href="/wondergreen/productos/compost/">Conocer Compost y sus presentaciones <span aria-hidden="true">→</span></Link>
          </article>
          <WondergreenSolidLines />
          <WondergreenLiquidLines />
          <WondergreenBioinputLines />
          <WondergreenTechnicalLibrary />
        </div>
      </section>

      <section className="wg-v4-guidance" aria-labelledby="wg-v4-guidance-title">
        <div className="container wg-v4-guidance__grid">
          <figure className="wg-v4-guidance__visual">
            <Image
              src="/products/wondergreen-soil-roots-editorial.webp"
              alt="Raíces y suelo que muestran la relación entre nutrición y cultivo."
              fill
              sizes="(max-width: 900px) 100vw, 42vw"
            />
            <figcaption>La nutrición se decide en contexto.</figcaption>
          </figure>
          <div className="wg-v4-guidance__copy">
            <h2 id="wg-v4-guidance-title">La fórmula es el inicio. El cultivo define la decisión.</h2>
            <p className="editorial-justify">Dos cultivos pueden requerir rutas distintas, incluso cuando se busca un mismo objetivo. Por eso, una recomendación considera especie y etapa, condiciones del suelo y del agua, manejo actual y propósito del productor. Las referencias Wondergreen se revisan dentro de ese contexto; la dosis y la forma de uso deben corresponder a la etiqueta vigente y a la orientación técnica aplicable.</p>
            <p className="wg-v4-guidance__prompt">Para orientarte, cuéntanos qué cultivas, en qué etapa está el lote y qué resultado buscas. Si tienes análisis de suelo o agua, o información sobre el manejo actual, compártelos: ayudan a revisar qué familia de productos podría tener sentido y qué información conviene completar.</p>
            <Link className="wg-v4-guidance__link" href="/servicios/programas-wondergreen/">
              Conocer el acompañamiento agronómico <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="wg-v4-tools"><div className="container wg-v4-tools__grid"><div><h2>Herramientas para preparar la decisión.</h2><p>Organiza datos del lote, revisa compatibilidad y reconoce qué preguntas llevar a una conversación técnica.</p><div className="button-row"><Link className="button button--light" href="/herramientas/">Ver las herramientas digitales</Link></div></div><div className="wg-v4-tools__list">{tools.map(([title, copy, href]) => <Link href={href} key={title}><div><strong>{title}</strong><p>{copy}</p></div><em aria-hidden="true">→</em></Link>)}</div></div></section>

      <section className="wg-v4-crops" id="cultivos"><div className="container"><div className="wg-v4-heading"><div><h2>Empieza por el cultivo y su etapa.</h2></div><p>Una muestra de las rutas técnicas que ayudan a ordenar la observación antes de elegir una referencia. La biblioteca reúne los doce cultivos.</p></div><CropLibraryGrid featuredOnly /><div className="wg-v4-crops__all"><Link className="button button--dark" href="/wondergreen/cultivos/">Explorar las 12 rutas por cultivo <span aria-hidden="true">→</span></Link></div></div></section>

      <section className="wg-v4-bridge"><div className="container wg-v4-bridge__grid"><figure><Image src="/guides/home-garden-casa-jardin-cover.webp" alt="Guía Wondergreen Casa y Jardín" fill sizes="(max-width: 800px) 100vw, 38vw" /></figure><div><h2>Wondergreen también llega a casa, jardín y huerta.</h2><p>Casa & Jardín traduce el cuidado del suelo y la nutrición de las plantas a decisiones cotidianas, con productos, kits y guías para distintos espacios.</p><div className="button-row"><Link className="button button--dark" href="/casa-jardin/">Explorar Casa & Jardín</Link><Link className="button button--ghost" href="/casa-jardin/kits/">Conocer los kits de cultivo</Link></div></div></div></section>

      <section className="closing-cta"><div className="container closing-inner"><div><h2>Una recomendación útil empieza por entender el lote.</h2><p>Comparte el cultivo, la etapa, el área y lo que buscas lograr. Si tienes un análisis de suelo, también nos ayuda a orientar la conversación.</p></div><Link className="button button--dark" href="/contacto/?interes=wondergreen&perfil=agro">Solicitar orientación para mi lote</Link></div></section>
    </>
  );
}
