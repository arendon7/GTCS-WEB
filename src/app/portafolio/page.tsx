import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { portfolioGroups, type PortfolioGroup } from "@/data/portfolio";
import { getProductMedia } from "@/data/product-media";

export const metadata: Metadata = {
  title: "Servicios, productos y herramientas",
  description:
    "Servicios para territorios, empresas y agroindustria; productos Wondergreen y herramientas digitales para operar, cultivar y decidir.",
  alternates: { canonical: "/portafolio/" },
};

const offerGroups = [
  {
    id: "portafolio-servicios",
    title: "Servicios para cada tipo de operación",
    description:
      "Planeación pública, gestión por sede y rutas para valorizar biomasa: cada contexto parte de una necesidad distinta.",
    slugs: ["territorio", "empresas", "valorizacion"],
    className: "portfolio-offer__service-grid",
  },
  {
    id: "portafolio-herramientas",
    title: "Herramientas para operar y decidir",
    description:
      "Plataformas para registrar el trabajo, organizar información y convertir datos en decisiones útiles.",
    slugs: ["clima-datos", "operacion-digital"],
    className: "portfolio-offer__tool-grid",
  },
] as const;

const solidProductExamples = [
  {
    name: "2GROW · 15-3-3",
    slug: "2grow-solido-40kg",
  },
  {
    name: "2BALANCE · 7-7-7",
    slug: "2balance-solido-40kg",
  },
  {
    name: "2BLOOM · 3-8-3",
    slug: "2bloom-solido-40kg",
  },
  {
    name: "2FRUIT · 3-3-8",
    slug: "2fruit-solido-40kg",
  },
].map(({ name, slug }) => {
  const reference = getProductMedia(slug).reference;
  if (!reference) throw new Error(`Missing Wondergreen product reference image: ${slug}`);
  return { name, image: reference.src, alt: reference.alt };
});

function getGroups(slugs: readonly string[]) {
  return slugs
    .map((slug) => portfolioGroups.find((group) => group.slug === slug))
    .filter((group): group is PortfolioGroup => Boolean(group));
}

function PortfolioGroupCard({ group }: { group: PortfolioGroup }) {
  const isDiagram = group.image.endsWith(".svg");

  return (
    <article className={`portfolio-offer-card portfolio-offer-card--${group.color}`}>
      <figure className={isDiagram ? "portfolio-offer-card__media portfolio-offer-card__media--diagram" : "portfolio-offer-card__media"}>
        <Image
          src={group.image}
          alt={group.imageAlt}
          fill
          sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 31vw"
        />
        {group.imageCaption && <figcaption>{group.imageCaption}</figcaption>}
      </figure>
      <div className="portfolio-offer-card__copy">
        <span className="eyebrow">{group.eyebrow}</span>
        <h3>{group.name}</h3>
        <p>{group.intro}</p>
        <ul>
          {group.entries.slice(0, 3).map((entry) => (
            <li key={entry.slug}>{entry.name}</li>
          ))}
        </ul>
        <Link href={`/portafolio/${group.slug}/`}>
          Explorar {group.shortName} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <section className="portfolio-v5-hero" aria-labelledby="portfolio-title">
        <div className="container portfolio-v5-hero__grid">
          <div>
            <span className="eyebrow eyebrow--light">Portafolio</span>
            <h1 id="portfolio-title">Consultoría ambiental: de la ciencia a la operación.</h1>
            <p className="lead">
              Unimos ciencia aplicada, trabajo de campo y conocimiento del sector aseo. Acompañamos
              a municipios y ESP, organizaciones, grandes generadores y agroindustrias con
              diagnósticos, PGIRS, PMIRS, rutas, infraestructura, valorización y operación.
              Wondergreen y nuestras herramientas conectan esa experiencia con el cultivo y su
              seguimiento.
            </p>
            <div className="button-row">
              <Link className="button button--neon" href="#portafolio-servicios">
                Ver las rutas del portafolio
              </Link>
              <Link className="button button--outline-light portfolio-v5-hero__secondary" href="/diagnostico/">
                Orientar mi proyecto
              </Link>
            </div>
          </div>
          <figure>
            <Image
              src="/services/nosotros-consulting-field-v1.jpg"
              alt="Dos profesionales observan material orgánico mientras revisan notas de campo."
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
            />
            <figcaption>
              <strong>Ciencia aplicada y trabajo de campo para definir el siguiente paso.</strong>
              <span>El alcance se construye según la necesidad, la evidencia disponible y la capacidad de operación.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <nav className="portfolio-audience" aria-label="Rutas por tipo de cliente">
        <div className="container portfolio-audience__inner">
          <div className="portfolio-audience__heading">
            <h2>Encuentra tu ruta</h2>
            <p>Elige el contexto que mejor describe tu operación y conoce la oferta pensada para ella.</p>
          </div>
          <div className="portfolio-audience__routes">
            <Link href="/municipios/">
              <strong>Municipios y ESP</strong>
              <span>Planeación PGIRS, recolección selectiva, infraestructura y operación.</span>
              <span className="portfolio-audience__arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/empresas/">
              <strong>Organizaciones y grandes generadores</strong>
              <span>PMIRS, logística y aprovechamiento en unidades residenciales, centros comerciales, instituciones y otras sedes.</span>
              <span className="portfolio-audience__arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/agroindustria/">
              <strong>Agroindustria</strong>
              <span>Caracterización y rutas para biomasa, subproductos y efluentes.</span>
              <span className="portfolio-audience__arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/casa-jardin/#kits-v4-title">
              <strong>Casa y Jardín</strong>
              <span>Kits de cultivo, productos Wondergreen y guías para plantas, jardines y huertas.</span>
              <span className="portfolio-audience__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {offerGroups.slice(0, 1).map((offer) => (
        <section className="portfolio-offer portfolio-offer--services" id={offer.id} key={offer.id}>
          <div className="container">
            <header className="portfolio-offer__heading">
              <div>
                <span className="eyebrow">Servicios</span>
                <h2>{offer.title}</h2>
              </div>
              <p>{offer.description}</p>
            </header>
            <div className={offer.className}>
              {getGroups(offer.slugs).map((group) => (
                <PortfolioGroupCard group={group} key={group.slug} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="portfolio-offer portfolio-offer--products" id="portafolio-productos">
        <div className="container portfolio-product-feature">
          <div className="portfolio-product-feature__copy">
            <span className="eyebrow">Productos agrícolas · Wondergreen</span>
            <h2>Nutrición para el suelo y el cultivo, según la familia y la etapa.</h2>
            <p>
              Wondergreen reúne Compost, cuatro referencias sólidas organominerales ocluidas,
              cinco formulaciones líquidas elaboradas a partir de bioles de digestión anaerobia
              multietapa y bioinsumos.
            </p>
            <p>
              Cada familia cumple una función distinta en la preparación y nutrición del cultivo.
              Explora sus fichas y elige la ruta que corresponde a tu necesidad:
            </p>
            <ul className="portfolio-product-families" aria-label="Familias de productos Wondergreen">
              <li>
                <Link href="/wondergreen/productos/compost/">
                  <strong>Compost</strong>
                  <span>Acondicionador orgánico para preparar suelo y sustratos.</span>
                  <span className="portfolio-product-families__action">Ver la ficha <span aria-hidden="true">→</span></span>
                </Link>
              </li>
              <li>
                <Link href="/wondergreen/#solidos">
                  <strong>Fertilizantes sólidos</strong>
                  <span>Cuatro referencias organominerales ocluidas, orientadas a liberación gradual.</span>
                  <span className="portfolio-product-families__action">Explorar la familia <span aria-hidden="true">→</span></span>
                </Link>
              </li>
              <li>
                <Link href="/wondergreen/#liquidos">
                  <strong>Fertilizantes líquidos</strong>
                  <span>Formulaciones a partir de bioles de digestión anaerobia multietapa, con ficha por referencia.</span>
                  <span className="portfolio-product-families__action">Explorar la familia <span aria-hidden="true">→</span></span>
                </Link>
              </li>
              <li>
                <Link href="/wondergreen/#bioinsumos">
                  <strong>Bioinsumos</strong>
                  <span>Referencias botánicas y microbiológicas para integrar al manejo del cultivo.</span>
                  <span className="portfolio-product-families__action">Explorar la familia <span aria-hidden="true">→</span></span>
                </Link>
              </li>
            </ul>
            <p>
              Los programas agronómicos integran diagnóstico, nutrición y seguimiento. Si conviene
              validar la estrategia, acordamos un ensayo y revisamos sus resultados y costos antes
              de ajustar o ampliar. El uso se define con la ficha vigente, el cultivo, la etapa y
              las condiciones del lote.
            </p>
            <p className="portfolio-product-feature__detail-link">
              <Link href="/portafolio/wondergreen/">Conocer la oferta Wondergreen y sus alcances →</Link>
            </p>
            <div className="button-row">
              <Link className="button button--dark" href="/biblioteca/catalogo-wondergreen/">
                Explorar productos Wondergreen
              </Link>
              <Link className="button button--ghost" href="/servicios/programas-wondergreen/">
                Diseñar un programa para mi cultivo
              </Link>
            </div>
          </div>
          <div className="portfolio-product-feature__samples" role="group" aria-label="Empaques Wondergreen de fertilizantes sólidos en presentación de 40 kg">
            {solidProductExamples.map((product) => (
              <figure key={product.name}>
                <div>
                  <Image src={product.image} alt={product.alt} fill sizes="(max-width: 350px) 110px, (max-width: 900px) 42vw, 20vw" />
                </div>
                <figcaption><strong>{product.name}</strong><span>40 kg</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="portfolio-product-feature__note">
            El precio y la disponibilidad de cada presentación se confirman con el equipo en cada solicitud.
          </p>
        </div>
      </section>

      {offerGroups.slice(1).map((offer) => (
        <section className="portfolio-offer portfolio-offer--tools" id={offer.id} key={offer.id}>
          <div className="container">
            <header className="portfolio-offer__heading">
              <div>
                <span className="eyebrow">Herramientas digitales</span>
                <h2>{offer.title}</h2>
              </div>
              <p>{offer.description}</p>
            </header>
            <div className={offer.className}>
              {getGroups(offer.slugs).map((group) => (
                <PortfolioGroupCard group={group} key={group.slug} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
