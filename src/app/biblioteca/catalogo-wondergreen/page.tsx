import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleJsonLd } from "@/components/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getCommercialPresentations } from "@/data/product-publication";
import { catalogQuoteGroups, getTechnicalCatalogInquiries } from "@/data/catalog";
import { getProductMedia } from "@/data/product-media";
import { casaJardinKits as casaJardinV4Kits } from "@/data/casa-jardin-v4-review";
import { bioinputs, products } from "@/data/products";
import { site } from "@/data/site";
import { WondergreenScienceVisual } from "@/components/wondergreen-science-visual";

const compostFamilyMedia = getProductMedia("compost");
const compostFamilyVisual = compostFamilyMedia.reference ?? compostFamilyMedia.editorial;

export const metadata: Metadata = {
  title: "Catálogo Wondergreen | Fertilizantes y bioinsumos",
  description: "Explora Compost, fertilizantes sólidos organominerales ocluidos, fertilizantes líquidos de base biológica y bioinsumos Wondergreen.",
  alternates: { canonical: "/biblioteca/catalogo-wondergreen/" },
  openGraph: {
    title: "Catálogo Wondergreen | Greenatics",
    description: "Productos Wondergreen para suelo, cultivo y manejo biológico, organizados por familia.",
    url: "/biblioteca/catalogo-wondergreen/",
    images: ["/products/wondergreen-catalog-editorial-v1-og.jpg"],
  },
};

const catalogFamilies = [
  {
    id: "compost",
    label: "Compost",
    eyebrow: "Materia orgánica estabilizada",
    summary: "Acondiciona suelo y sustrato; establece la base orgánica antes de definir el resto del programa.",
    visual: compostFamilyVisual?.src ?? "/products/wondergreen-line-compost.jpg",
    visualAlt: compostFamilyVisual?.alt ?? "Compost aplicado al suelo de un cultivo.",
    countLabel: "1 referencia",
    items: products.filter((product) => product.category === "acondicionadores"),
  },
  {
    id: "solidos",
    label: "Fertilizantes sólidos",
    eyebrow: "Organominerales ocluidos",
    summary: "Cuatro líneas integran nutrientes y materia orgánica en matrices de liberación gradual: 2GROW, 2BALANCE, 2BLOOM y 2FRUIT.",
    visual: "/products/wondergreen-line-2grow.jpg",
    visualAlt: "Planta joven creciendo en suelo con gránulos de fertilizante.",
    countLabel: "4 líneas",
    items: products.filter((product) => product.category === "solidos"),
  },
  {
    id: "liquidos",
    label: "Fertilizantes líquidos",
    eyebrow: "Bioles y nutrición biológica",
    summary: "Cada formulación parte de bioles de digestión anaerobia multietapa, pasa por formulación y estabilización, y aporta materia orgánica, nutrientes y microorganismos benéficos al sistema suelo-planta.",
    visual: "/products/wondergreen-line-liquidos.jpg",
    visualAlt: "Vaso con fertilizante líquido junto a una planta en cultivo.",
    countLabel: "5 formulaciones",
    items: products.filter((product) => product.category === "liquidos"),
  },
  {
    id: "bioinsumos",
    label: "Bioinsumos",
    eyebrow: "Referencias botánicas y microbiológicas",
    summary: "Seis referencias cuyo alcance se confirma en la ficha, etiqueta y registro vigentes.",
    visual: "/products/wondergreen-line-bioinsumos-v2.jpg",
    visualAlt: "Una persona trasplanta una planta joven con sus raíces en un vivero.",
    countLabel: "6 referencias",
    items: bioinputs.filter((product) => product.slug !== "bioinsumos"),
  },
] as const;

const familyReferenceVisuals = {
  solidos: [
    { slug: "2grow-solido-40kg", label: "2GROW · 15-3-3" },
    { slug: "2balance-solido-40kg", label: "2BALANCE · 7-7-7" },
    { slug: "2bloom-solido-40kg", label: "2BLOOM · 3-8-3" },
    { slug: "2fruit-solido-40kg", label: "2FRUIT · 3-3-8" },
  ],
  liquidos: [
    { slug: "2grow-liquido-1l", label: "2GROW · 100-20-20" },
    { slug: "2grow-liquido-200-0-0", label: "2GROW · 200-0-0" },
    { slug: "2balance-liquido", label: "2BALANCE · 70-70-70" },
    { slug: "2bloom-liquido", label: "2BLOOM · 30-80-30" },
    { slug: "2fruit-liquido", label: "2FRUIT · 30-30-80" },
  ],
  bioinsumos: [
    { slug: "bioinsumo-trichoderma", label: "Trichoderma" },
    { slug: "bioinsumo-bacillus-subtilis", label: "Bacillus" },
    { slug: "bioinsumo-beauveria", label: "Beauveria" },
    { slug: "bioinsumo-metarhizium", label: "Metarhizium" },
    { slug: "bioinsumo-ajo-aji", label: "Ajo-Ají" },
    { slug: "bioinsumo-neem", label: "Neem" },
  ],
} as const;

function getCatalogVisuals(product: (typeof products)[number]) {
  if (product.category === "solidos") {
    return [getProductMedia(product.slug).editorial].filter(Boolean);
  }

  if (product.category === "liquidos") {
    if (product.slug === "2grow-liquido") {
      return [
        getProductMedia("2grow-liquido-1l").reference,
        getProductMedia("2grow-liquido-200-0-0").reference,
      ].filter(Boolean);
    }

    return [
      getProductMedia(`${product.slug}-1l`).reference ?? getProductMedia(product.slug).reference,
    ].filter(Boolean);
  }

  if (product.category === "bioinsumos") {
    return [getProductMedia(product.slug).reference].filter(Boolean);
  }

  const compost = getProductMedia("compost-40kg");
  return [compost.reference ?? compost.editorial].filter(Boolean);
}

export default function WondergreenCatalogGuidePage() {
  const url = `${site.url}/biblioteca/catalogo-wondergreen/`;

  return (
    <>
      <ArticleJsonLd
        headline="Catálogo Wondergreen: productos para suelo, cultivo y manejo biológico"
        description="Compost, fertilizantes organominerales sólidos y líquidos y bioinsumos Wondergreen, organizados por familia y función."
        url={url}
        dateModified="2026-11-02"
        about={["Wondergreen Nutrients", "Fertilizantes organominerales", "Nutrición vegetal", "Bioinsumos"]}
      />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` }, { name: "Biblioteca", url: `${site.url}/biblioteca/` }, { name: "Catálogo Wondergreen", url }]} />

      <section className="knowledge-hero knowledge-hero--wondergreen wg-catalog-hero">
        <div className="container wg-catalog-hero__grid">
          <div className="wg-catalog-hero__copy">
            <Link className="back-link" href="/biblioteca/">← Biblioteca</Link>
            <div className="wg-catalog-brand-lockup">
              <span className="eyebrow">Catálogo de productos</span>
                <Image className="wg-catalog-brand" src="/brand/wondergreen-nutrients-transparent.png" alt="Wondergreen Nutrients" width={746} height={392} preload />
            </div>
            <h1>Nutrición organomineral y biológica <span>para suelo y cultivo.</span></h1>
            <p className="lead">Empieza por lo que necesitas atender: incorporar materia orgánica, revisar una fórmula de liberación gradual, conocer fertilizantes líquidos basados en bioles o explorar bioinsumos. El catálogo reúne Compost, cuatro líneas sólidas, cinco formulaciones líquidas y seis referencias de bioinsumos; abre cada familia para comparar referencias y consultar sus fichas.</p>
            <div className="button-row wg-catalog-hero__actions">
              <Link className="button button--dark" href="#familias">Explorar las familias <span aria-hidden="true">↓</span></Link>
              <a className="button button--outline-light" href={site.croperStoreUrl} target="_blank" rel="noopener noreferrer">Comprar en la tienda Greenatics de Croper <span aria-hidden="true">↗</span><span className="sr-only"> (se abre en una pestaña nueva)</span></a>
            </div>
            <p className="wg-catalog-hero__kits-link">
              <span>¿Buscas una propuesta para tus plantas en casa?</span>
              <Link href="#kits">Explora los nueve kits Casa &amp; Jardín <span aria-hidden="true">↓</span></Link>
            </p>
          </div>
          <figure className="wg-catalog-hero__visual">
            <Image className="wg-catalog-hero__backdrop" src="/products/wondergreen-catalog-v03.webp" alt="Planta de café junto a suelo, compost y frutos en un paisaje de cultivo." fill sizes="(max-width: 900px) 100vw, 46vw" preload />
            <figcaption><strong>Del suelo a la planta.</strong><span>La nutrición empieza por comprender el suelo y lo que necesita el cultivo.</span></figcaption>
            <div className="wg-catalog-product-board" role="group" aria-label="Cuatro referencias de fertilizantes sólidos Wondergreen en presentación de 40 kg">
              <strong className="wg-catalog-product-board__heading">Fertilizantes sólidos · 40 kg</strong>
              {familyReferenceVisuals.solidos.map(({ slug, label }) => {
                const reference = getProductMedia(slug).reference;
                if (!reference) return null;
                return (
                  <figure className="wg-catalog-product-board__item" key={slug} data-product={slug}>
                    <Image src={reference.src} alt={reference.alt} width={320} height={320} sizes="(max-width: 680px) 38vw, (max-width: 980px) 34vw, 14vw" />
                    <figcaption>{label}</figcaption>
                  </figure>
                );
              })}
            </div>
          </figure>
        </div>
      </section>

      <section className="wg-catalog-science" aria-labelledby="wg-catalog-science-title">
        <div className="container">
          <header className="wg-catalog-science__heading">
            <div><span className="eyebrow">Formulación y suelo</span><h2 id="wg-catalog-science-title">Dos familias. Dos bases de formulación.</h2></div>
            <p>La estructura del producto y el origen de sus componentes explican su diseño. La respuesta se evalúa con la referencia, el suelo, el cultivo y el manejo.</p>
          </header>
          <div className="wg-catalog-science__grid">
            <article className="wg-catalog-science__card">
              <WondergreenScienceVisual family="solid" alt="Ilustración conceptual de un pellet alargado con inclusiones minerales dentro de una matriz orgánica; no es micrografía ni muestra medida." caption="Matriz orgánica · fracción mineral integrada" className="wg-catalog-science__art" artDirection="panel" panelBreakpoint={680} />
              <div className="wg-catalog-science__copy"><span>Fertilizantes sólidos</span><h3>Diseño orientado a liberación gradual.</h3><p>La matriz integra nutrientes minerales y materia orgánica. Su comportamiento depende de la fórmula, el suelo y el manejo del cultivo.</p></div>
            </article>
            <article className="wg-catalog-science__card wg-catalog-science__card--liquid">
              <WondergreenScienceVisual family="liquid" alt="Composición conceptual de recipientes que representa etapas de bioles, formulación y fertilizante líquido; el color es ilustrativo." caption="Origen biológico · proceso multietapa" className="wg-catalog-science__art wg-catalog-science__art--liquid" artDirection="panel" panelBreakpoint={680} />
              <div className="wg-catalog-science__copy"><span>Fertilizantes líquidos</span><h3>Del biol a una formulación estabilizada.</h3><p>Las referencias parten de bioles obtenidos mediante fermentación anaerobia multietapa. Después se formulan y estabilizan para aportar materia orgánica, nutrientes y microorganismos benéficos al sistema suelo-planta. La ficha de cada referencia detalla su composición y uso.</p></div>
            </article>
          </div>
          <div className="wg-catalog-science__boundary"><p>La evidencia general explica principios; no demuestra por sí sola el desempeño de una fórmula Wondergreen.</p><Link href="/wondergreen/ciencia/#evidencia-cientifica">Leer la evidencia y sus límites <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>

      <section className="wg-catalog-list" id="familias" aria-label="Familias y referencias del catálogo Wondergreen">
        <div className="container">
          <header className="wg-catalog-list__heading">
            <h2>Explora por familia y abre las referencias.</h2>
            <p>Compara la función de cada familia, revisa sus referencias y abre la ficha técnica para ampliar la información.</p>
          </header>
          {catalogFamilies.map((family, index) => (
            <details className={`wg-catalog-family wg-catalog-family--${family.id}`} id={`familia-${family.id}`} key={family.id}>
              <summary>
                {family.id in familyReferenceVisuals ? (
                  <div className={`wg-catalog-family__visual-grid wg-catalog-family__visual-grid--${family.id}`} aria-label={`Productos de ${family.label}`}>
                    {familyReferenceVisuals[family.id as keyof typeof familyReferenceVisuals].map(({ slug, label }) => {
                      const reference = getProductMedia(slug).reference;
                      if (!reference && slug === "bioinsumo-trichoderma") {
                        return (
                          <figure className="wg-catalog-family__visual-holdback" key={slug}>
                            <span>Trichoderma</span>
                            <figcaption>Especie por confirmar</figcaption>
                          </figure>
                        );
                      }
                      if (!reference) return null;

                      return (
                        <figure key={slug}>
                          <Image src={reference.src} alt={reference.alt} width={1254} height={1254} sizes="(max-width: 680px) 48px, 64px" />
                          <figcaption>{label}</figcaption>
                        </figure>
                      );
                    })}
                    {family.id === "solidos" ? (
                      <p className="wg-catalog-family__visual-note">Los sacos corresponden a la presentación comercial de 40 kg; el equipo confirma precio y disponibilidad para cada solicitud.</p>
                    ) : family.id === "liquidos" ? (
                      <p className="wg-catalog-family__visual-note">Las imágenes ayudan a reconocer cada línea; consulta la ficha y confirma con nuestro equipo la presentación y la etiqueta vigentes.</p>
                    ) : family.id === "bioinsumos" ? (
                      <p className="wg-catalog-family__visual-note">Las imágenes disponibles identifican las referencias; Trichoderma se muestra con nombre genérico hasta confirmar su ficha y etiqueta vigentes.</p>
                    ) : null}
                  </div>
                ) : (
                  <figure className="wg-catalog-family__visual">
                    <Image src={family.visual} alt={family.visualAlt} width={1254} height={1254} sizes="(max-width: 680px) 82px, 112px" />
                  </figure>
                )}
                <span className="wg-catalog-family__identity"><small>{family.eyebrow}</small><strong>{family.label}</strong><em>{family.summary}</em></span>
                <span className="wg-catalog-family__count"><span>{family.countLabel}</span><b aria-hidden="true">+</b></span>
              </summary>
                  <div className="wg-catalog-family__products">
                {family.items.map((product) => {
                  const concentrations = product.concentrations?.join(" · ") ?? product.formula ?? "";
                  const formats = getCommercialPresentations(product.slug);
                  const formatCopy = formats.length > 0 ? formats.join(" · ") : "Consulta formatos y condiciones de suministro";
                  const isGrowLiquid = product.slug === "2grow-liquido";
                  const visuals = getCatalogVisuals(product);

                  return (
                    <article className="wg-catalog-product" key={product.slug}>
                      {visuals.length > 0 ? (
                        <div className={`wg-catalog-product__visuals${visuals.length > 1 ? " wg-catalog-product__visuals--pair" : ""}`}>
                          {visuals.map((visual, visualIndex) => visual ? (
                            <figure className="wg-catalog-product__visual" key={visual.src}>
                              <Image src={visual.src} alt={visual.alt} width={1254} height={1254} sizes="(max-width: 680px) 96px, 142px" />
                              <figcaption>{isGrowLiquid ? visualIndex === 0 ? "100-20-20" : "200-0-0" : product.name.replace(/^Wondergreen\s+/, "")}</figcaption>
                            </figure>
                          ) : null)}
                        </div>
                      ) : null}
                      <div>
                        <span>{product.stage ?? product.format}</span>
                        <h3>{product.name}</h3>
                        {concentrations ? <strong>{concentrations}</strong> : null}
                        <p>{product.technicalRole}</p>
                        {isGrowLiquid ? <p className="wg-catalog-product__note"><strong>Una misma línea, dos concentraciones.</strong> 2GROW 100-20-20 y 2GROW 200-0-0; esta última es la formulación de mayor concentración de nitrógeno.</p> : null}
                        {isGrowLiquid ? (
                          <small>
                            2GROW 100-20-20: {formatCopy}. 2GROW 200-0-0: formato y suministro por consultar.
                          </small>
                        ) : <small>Presentaciones: {formatCopy}.</small>}
                      </div>
                      <div className="wg-catalog-product__actions">
                        <Link href={`/wondergreen/productos/${product.slug}/`}>Abrir ficha <span aria-hidden="true">→</span></Link>
                        {catalogQuoteGroups[product.slug] ? (
                          <Link href={`/wondergreen/cotizador/?grupo=${product.slug}`}>
                            Elegir presentación para cotizar <span aria-hidden="true">→</span>
                          </Link>
                        ) : null}
                        {getTechnicalCatalogInquiries(product.slug).map((inquiry) => (
                          <Link key={inquiry.id} href={`/wondergreen/cotizador/?consulta=${inquiry.id}#consultas-tecnicas`}>
                            Consultar {inquiry.label.replace(/^Wondergreen\s+/, "")} <span aria-hidden="true">→</span>
                          </Link>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="wg-catalog-kits" id="kits" aria-labelledby="wg-catalog-kits-title">
        <div className="container">
          <header className="wg-catalog-kits__heading">
            <div><span className="eyebrow">Propuestas Casa &amp; Jardín</span><h2 id="wg-catalog-kits-title">Nueve rutas para elegir cómo cuidar tus plantas.</h2></div>
            <p>Compara la propuesta visual y la orientación de cada kit. Puedes pedir que el equipo revise y cotice una configuración; sus referencias, presentaciones, empaques y disponibilidad se confirman antes de emitir una oferta.</p>
          </header>
          <div className="wg-catalog-kits__grid">
            {casaJardinV4Kits.map((kit) => (
              <article className="wg-catalog-kit" key={kit.slug}>
                <Link className="wg-catalog-kit__media" href={`/casa-jardin/kits/v4/${kit.slug}/`} aria-label={`Consultar propuesta de ${kit.name}`}>
                  <Image src={kit.image} alt={kit.imageAlt} fill sizes="(max-width: 720px) 100vw, (max-width: 1050px) 50vw, 33vw" />
                </Link>
                <div className="wg-catalog-kit__body">
                  <small>{kit.audience}</small>
                  <h3>{kit.name}</h3>
                  <p>{kit.promise}</p>
                  <p className="wg-catalog-kit__matrix"><strong>Totales propuestos:</strong> {kit.proposedTotals}</p>
                  <details className="wg-catalog-kit__review-note">
                    <summary>Nota de revisión</summary>
                    <p>{kit.note}</p>
                  </details>
                  <div className="wg-catalog-kit__actions">
                    <Link className="wg-catalog-kit__cta" href={`/casa-jardin/kits/v4/${kit.slug}/`}>Ver composición y notas <span aria-hidden="true">→</span></Link>
                    <Link className="wg-catalog-kit__cta" href={`/wondergreen/cotizador/?kit=${kit.slug}#kits`}>Solicitar revisión y cotización <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="wg-catalog-kits__note">Cada kit presenta una configuración orientativa. Antes de emitir una oferta, confirmamos referencias, cantidades, presentaciones y empaque. Solicitar cotización no confirma disponibilidad ni compra.</p>
        </div>
      </section>

      <section className="wg-catalog-guidance" id="documentos">
        <div className="container wg-catalog-guidance__inner">
          <div><span className="eyebrow eyebrow--light">Del catálogo al lote</span><h2>La ficha es el comienzo de una decisión bien aplicada.</h2></div>
          <div>
            <p>La selección y el uso se relacionan con cultivo, etapa, suelo, agua y objetivo. Consulta la guía del cultivo y la ficha de la referencia; para dosis, compatibilidades y programa, solicita orientación agronómica.</p>
            <div className="wg-catalog-guidance__actions">
              <nav className="wg-catalog-guidance__primary" aria-label="Siguientes pasos para elegir productos Wondergreen">
                <Link className="button button--light" href="/wondergreen/cultivos/">Ver guías por cultivo</Link>
                <Link className="button button--outline-light" href="/contacto/?interes=wondergreen&perfil=agro">Solicitar orientación</Link>
              </nav>
              <nav className="wg-catalog-guidance__resources" aria-label="Materiales de consulta Wondergreen">
                <span>Materiales de consulta</span>
                <Link href="/biblioteca/manual-uso-wondergreen/">Manual de uso</Link>
                <Link href="/wondergreen/productos/biol/">Ficha de Biol Wondergreen</Link>
              </nav>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
