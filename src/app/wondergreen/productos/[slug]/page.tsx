import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { JsonLd } from "@/components/json-ld";
import { ProductVisual } from "@/components/product-visual";
import { getProduct, getProductCategoryLabel, products } from "@/data/products";
import { getCropForProductLabel } from "@/data/crops";
import { getPublicProductImage } from "@/data/product-media";
import { getCommercialPresentations, getProductPublication } from "@/data/product-publication";
import { site } from "@/data/site";
import styles from "./product-application.module.css";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const canonical = `/wondergreen/productos/${product.slug}/`;
  const image = getPublicProductImage(product.slug);
  return { title: product.name, description: product.objective, alternates: { canonical }, openGraph: { title: product.name, description: product.objective, url: canonical, ...(image ? { images: [image] } : {}) } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const isBioinput = product.category === "bioinsumos";
  const familyClass = product.family.toLowerCase().replace(/\s+/g, "-");
  const publicImage = getPublicProductImage(product.slug);
  const liquidScene = product.slug === "2grow-liquido"
    ? {
        src: "/products/wondergreen-2grow-liquid-process-v02.png",
        alt: "Reactor vertical, tanques de preparación, tuberías y estructuras bajo cubierta en una instalación de digestión anaerobia, con una persona para dar escala.",
        title: "Digestión anaerobia multietapa",
        detail: "Bioles · formulación · estabilización",
        width: 1536,
        height: 1024,
      }
    : product.slug === "2balance-liquido"
      ? {
          src: "/products/wondergreen-liquid-2balance-editorial.jpg",
          alt: "Ramas de cafeto con hojas verdes y frutos en diferentes estados de maduración, en una ladera de montaña.",
          title: "2BALANCE · 70-70-70",
          detail: "Perfil N-P-K equilibrado para programas de mantenimiento",
          width: 1242,
          height: 800,
        }
      : product.slug === "2bloom-liquido"
        ? {
            src: "/products/wondergreen-liquid-2bloom-editorial.jpg",
            alt: "Rama de cafeto con hojas verdes, botones florales y flores blancas abiertas.",
            title: "2BLOOM · 30-80-30",
            detail: "Fósforo como valor destacado para programas de transición reproductiva",
            width: 1242,
            height: 800,
          }
        : product.slug === "2fruit-liquido"
          ? {
              src: "/products/wondergreen-liquid-2fruit-editorial.jpg",
              alt: "Rama de cafeto con frutos verdes y rojos en diferentes etapas de desarrollo y maduración.",
              title: "2FRUIT · 30-30-80",
              detail: "Potasio como valor destacado para programas de desarrollo del fruto",
              width: 1242,
              height: 800,
            }
          : null;

  const productUrl = `${site.url}/wondergreen/productos/${product.slug}/`;
  const publication = getProductPublication(product.slug);
  const commercialPresentations = getCommercialPresentations(product.slug);
  const publicSpecs = publication.showPublicPrice
    ? product.specs
    : product.specs.filter((spec) => !/precio|presentaci|estado/i.test(spec.label));
  const conciseSpecs = product.slug === "2grow-liquido"
    ? publicSpecs.filter((spec) => !/graduación|concentración/i.test(spec.label))
    : publicSpecs;
  const showConciseSpecs = (product.category === "acondicionadores" || product.category === "bioinsumos") && conciseSpecs.length > 0;
  const handlingNotes = [...new Set([...product.cautions, ...product.notes])];
  const relatedProducts = products.filter((candidate) =>
    candidate.category === product.category &&
    candidate.slug !== product.slug &&
    candidate.slug !== "bioinsumos",
  ).slice(0, 4);
  const contactPriority = product.slug === "2grow-liquido"
    ? "Elegir concentración: 2GROW 100-20-20 o 2GROW 200-0-0"
    : product.slug === "2bloom-liquido"
      ? "Consulta técnica y suministro de 2BLOOM 30-80-30"
    : isBioinput
      ? `Confirmar documentación, uso autorizado y condiciones de ${product.name.replace("Wondergreen ", "")}`
    : `${product.stage || product.focus} · ${product.presentation || product.format}`;
  const contactHref = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(product.name)}&prioridad=${encodeURIComponent(contactPriority)}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.objective,
    url: productUrl,
    brand: { "@type": "Brand", name: "Wondergreen Nutrients" },
    category: product.category,
    sku: product.slug,
    ...(publicImage ? { image: `${site.url}${publicImage}` } : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Formato de producto", value: product.format },
      ...(commercialPresentations.length > 0 ? [{ "@type": "PropertyValue", name: "Presentaciones en catálogo comercial", value: commercialPresentations.join(", ") }] : []),
      ...(product.formula ? [{ "@type": "PropertyValue", name: "Referencia", value: product.formula }] : []),
    ],
  };

  return (
    <>
      <JsonLd data={productSchema} />
      <BreadcrumbJsonLd items={[{ name: "Greenatics", url: `${site.url}/` },{ name: "Wondergreen", url: `${site.url}/wondergreen/` },{ name: product.name, url: productUrl }]} />

      <section className={`product-detail product-detail--depth product-detail--family-${familyClass}${product.slug === "2grow-liquido" ? " product-detail--2grow-liquid" : ""}`}>
        <div className="container product-detail-grid">
          <ProductVisual product={product} context="detail" />
          <div className="product-info">
            <nav className="product-route-nav" aria-label="Rutas relacionadas del producto">
              <Link className="back-link" href="/wondergreen/">← Volver a Wondergreen</Link>
              <Link className="product-route-nav__catalog" href="/biblioteca/catalogo-wondergreen/#familias">Ver catálogo Wondergreen →</Link>
            </nav>
            <nav className={`product-detail-index ${product.slug === "2balance-liquido" ? styles.productIndexCompact : ""}`} aria-label="Secciones de esta ficha">
              <span>Ir a</span>
              <a href="#papel">Qué aporta</a>
              {product.slug === "2grow-liquido" ? <a href="#eficiencia-n">Eficiencia de N</a> : null}
              {product.slug === "2grow" ? <a href="#matriz">Matriz ocluida</a> : null}
              {product.slug === "2balance" ? <a href="#balance-solido">Leer el 7-7-7</a> : null}
              {product.slug === "2bloom" ? <a href="#bloom-solido">Leer el 3-8-3</a> : null}
              {product.slug === "2fruit" ? <a href="#fruit-solido">Leer el 3-3-8</a> : null}
              {product.slug === "2balance-liquido" ? <a href="#perfil-npk">Perfil NPK</a> : null}
              {product.slug === "2bloom-liquido" ? <a href="#evidencia-fosforo">Fósforo y floración</a> : null}
              {product.category === "liquidos" ? <a href="#biol">Base biológica</a> : null}
              {product.slug === "2fruit-liquido" ? <a href="#nutricion-fruto">Desarrollo del fruto</a> : null}
              <a href="#aplicacion">{isBioinput ? "Uso por confirmar" : "Aplicación"}</a>
              <a href="#presentaciones">Formatos</a>
              {relatedProducts.length > 0 ? <a href="#comparar">La línea</a> : null}
              <a href="#criterio">Precauciones</a>
            </nav>
            <span className={`eyebrow product-family-eyebrow product-family-eyebrow--${familyClass}`}>{product.slug === "2grow-liquido" ? "LÍNEA AGRÍCOLA · WONDERGREEN" : `${getProductCategoryLabel(product.category)} · ${product.family}`}</span>
            {product.slug !== "2grow-liquido" ? <p className="product-headline">{product.headline}</p> : null}
            <h1 className={`product-title product-title--${familyClass}`}>{product.slug === "2grow-liquido" ? "2GROW líquido" : product.name}</h1>
            <p className="lead">{product.slug === "2grow-liquido"
              ? "Base líquida de bioles de digestión anaerobia multietapa, formulada y estabilizada para el programa nutricional del cultivo. Reúne dos concentraciones: 100-20-20 para crecimiento vegetativo y 200-0-0, la de mayor nitrógeno de la línea."
              : product.intro}</p>
            {product.slug === "2grow-liquido" ? <div className="product-2grow-profiles" aria-label="Concentraciones de 2GROW líquido">
              <a href="#perfil-100-20-20"><strong>100-20-20</strong><span>Nutrición N-P-K para crecimiento vegetativo</span><em>Ver perfil ↓</em></a>
              <a href="#perfil-200-0-0"><strong>200-0-0</strong><span>Mayor concentración de N para alta demanda vegetativa</span><em>Ver perfil ↓</em></a>
            </div> : null}
            <dl className="product-facts"><div><dt>Formato</dt><dd>{product.format}</dd></div><div><dt>{isBioinput ? "Alcance técnico" : "Etapa / objetivo"}</dt><dd>{product.stage}</dd></div>{product.formula && product.slug !== "2grow-liquido" ? <div><dt>Referencia</dt><dd>{product.formula}</dd></div> : null}{product.concentrations && product.slug !== "2grow-liquido" ? <div><dt>Concentraciones de la línea</dt><dd>{product.concentrations.join(" · ")}</dd></div> : null}</dl>
            <div className="price-panel price-panel--technical">
              <div>
                <small>Disponibilidad y siguiente paso</small>
                <strong>{product.slug === "2grow-liquido" ? "Confirma formato y concentración" : "Solicitar producto y orientación"}</strong>
                <p>{product.slug === "2grow-liquido"
                  ? "Consulta los formatos comerciales publicados para 100-20-20. La presentación y el suministro de 200-0-0 se confirman por separado con el equipo."
                  : "¿Esta referencia corresponde a tu cultivo y objetivo? En Croper puedes consultar las referencias publicadas; si buscas un formato o concentración que no aparece allí, consúltanos."}</p>
              </div>
              <div className="button-row">
                <Link className="button button--primary" href={contactHref}>{product.slug === "2grow-liquido" ? "Consultar 2GROW" : `Consultar ${product.name}`}</Link>
                <a className="button button--ghost" href={site.croperStoreUrl} target="_blank" rel="noopener noreferrer">
                  {product.slug === "2grow-liquido" ? "Ver tienda en Croper" : "Ver tienda Greenatics en Croper"} <span aria-hidden="true">↗</span><span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`product-overview${product.slug === "2grow-liquido" ? " product-overview--2grow-liquid" : ""}`} id="papel" aria-labelledby="product-overview-title">
        <div className="container product-overview-grid">
          <div className="product-overview__role">
            <h2 id="product-overview-title">{product.technicalRole}</h2>
            <p>{product.objective}</p>
            <div className="product-overview__fit">
              <h3>{isBioinput ? "Antes de orientar su uso" : "Puede tener sentido en"}</h3>
              <ul>{product.idealFor.map((item)=><li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <div className="product-overview__evidence">
            <h3>{isBioinput ? "Qué confirmar antes de considerarlo" : "Qué aporta al programa"}</h3>
            <ul className="product-overview__benefits">{product.benefits.map((item)=><li key={item}>{item}</li>)}</ul>
            {showConciseSpecs ? <div className="product-overview__specs"><h3>Datos técnicos</h3><dl className="product-spec-list">{conciseSpecs.map((spec)=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl></div> : null}
          </div>
        </div>
      </section>

      {product.slug === "2grow" ? <section className={styles.solidMatrix} id="matriz" aria-labelledby="solid-matrix-title">
        <div className={styles.solidMatrixInner}>
          <header className={styles.solidMatrixHeading}>
            <span>2GROW 15-3-3 · FORMULACIÓN SÓLIDA</span>
            <h2 id="solid-matrix-title">Nutrientes integrados en una matriz organomineral ocluida.</h2>
            <p>La referencia reúne nutrientes minerales y materia orgánica en pellets para acompañar establecimiento, brotación y crecimiento vegetativo. La liberación gradual describe el propósito de diseño; su disponibilidad y respuesta dependen de las condiciones de cada lote.</p>
          </header>
          <div className={styles.solidMatrixStory}>
            <figure className={styles.solidMatrixVisual}>
              <Image src="/products/wondergreen/science/wg-organomineral-pellet-v04.jpg" alt="Ilustración conceptual de un pellet organomineral en corte, con fracciones minerales integradas en una matriz orgánica." width={1400} height={788} sizes="(max-width: 860px) 100vw, 52vw" loading="lazy" decoding="async" />
              <figcaption>El corte explica la integración de nutrientes minerales en la matriz orgánica; no expresa la composición cuantitativa de la fórmula.</figcaption>
            </figure>
            <div className={styles.solidMatrixDetails}>
              <article>
                <h3>15-3-3 para una etapa vegetativa.</h3>
                <p>El perfil declarado distingue a 2GROW dentro de la familia sólida. La selección debe considerar el aporte total del programa y la demanda del cultivo, no la fórmula aislada.</p>
              </article>
              <article>
                <h3>Oclusión como atributo de diseño.</h3>
                <p>La estructura integra fracciones minerales y materia orgánica. No permite inferir por sí sola una tasa de liberación, recuperación de nutrientes o reducción de pérdidas en campo.</p>
              </article>
              <article>
                <h3>La respuesta se comprueba en el lote.</h3>
                <p>Humedad, suelo, temperatura, etapa, colocación y manejo condicionan el comportamiento. La eficiencia de uso y la volatilización de NH₃ requieren indicadores y mediciones separados.</p>
              </article>
            </div>
          </div>
          <blockquote className={styles.solidMatrixClaim}>
            <p>2GROW 15-3-3 integra nutrientes minerales y materia orgánica en una matriz ocluida, diseñada para acompañar el crecimiento vegetativo con disponibilidad gradual según el suelo y el manejo.</p>
          </blockquote>
          <Link className={styles.solidMatrixLink} href="/wondergreen/ciencia/#wg-matrix-story-title">Explorar la explicación técnica y sus límites →</Link>
        </div>
      </section> : null}

      {product.slug === "2balance" ? <section className={styles.balanceSolid} id="balance-solido" aria-labelledby="balance-solid-title">
        <div className={styles.balanceSolidInner}>
          <header className={styles.balanceSolidHeading}>
            <h2 id="balance-solid-title">El equilibrio de la fórmula se interpreta junto al lote.</h2>
            <p>2BALANCE 7-7-7 está orientado a programas de mantenimiento nutricional. Los tres valores declarados aparecen iguales en la referencia; la necesidad real de cada nutriente cambia con el cultivo, su etapa, el suelo y los aportes previos.</p>
          </header>

          <div className={styles.balanceSolidReading}>
            <figure className={styles.balanceSolidFormula}>
              <dl aria-label="Lectura de la referencia N-P-K 7-7-7">
                <div><dt>Nitrógeno</dt><dd><strong>7</strong><span>N</span></dd></div>
                <div><dt>Fósforo</dt><dd><strong>7</strong><span>P</span></dd></div>
                <div><dt>Potasio</dt><dd><strong>7</strong><span>K</span></dd></div>
              </dl>
              <figcaption>7-7-7 · valores declarados de la referencia sólida. La relación 1:1:1 compara su notación; no determina por sí sola concentración, aporte disponible o dosis.</figcaption>
            </figure>

            <div className={styles.balanceSolidCopy}>
              <h3>Una relación numérica no sustituye el balance del cultivo.</h3>
              <p>La lectura equivalente de N, P y K sirve para describir la fórmula. La proporción de fertilizante que requiere un lote se decide con diagnóstico de suelo, demanda del cultivo y balance de fuentes; no porque el envase presente los tres números iguales.</p>
              <p>Un ensayo de largo plazo con maíz en la Llanura del Norte de China evaluó tratamientos con omisiones de N, P y K entre 2005 y 2022. En ese sitio, el tratamiento NPK mantuvo un balance de nutrientes más equilibrado que los tratamientos con nutrientes omitidos. El resultado contextualiza el valor de considerar N-P-K en conjunto; no prueba la eficacia de 2BALANCE ni define una dosis para Colombia.</p>
              <a href="https://doi.org/10.1016/j.fcr.2024.109616" target="_blank" rel="noopener noreferrer">Wang et al. · Field Crops Research, ensayo de largo plazo ↗<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
            </div>
          </div>

          <div className={styles.balanceSolidClaim}>
            <span>Propuesta de claim para revisión agronómica</span>
            <p>“2BALANCE 7-7-7 integra valores declarados equivalentes de N, P y K en una matriz organomineral ocluida para acompañar programas de mantenimiento nutricional, según la demanda del cultivo y las condiciones del lote.”</p>
          </div>
        </div>
      </section> : null}

      {product.slug === "2bloom" ? <section className={styles.bloomSolid} id="bloom-solido" aria-labelledby="bloom-solid-title">
        <div className={styles.bloomSolidInner}>
          <header className={styles.bloomSolidHeading}>
            <h2 id="bloom-solid-title">El fósforo destaca en la fórmula; el lote determina su pertinencia.</h2>
            <p>2BLOOM 3-8-3 declara el valor más alto en P dentro de su notación N-P-K y se orienta a acompañar la transición reproductiva. La fórmula permite describir el perfil del producto; no anticipa cuánto nutriente estará disponible ni qué respuesta tendrá un cultivo específico.</p>
          </header>

          <div className={styles.bloomSolidReading}>
            <figure className={styles.bloomSolidFormula}>
              <figcaption><strong>Lectura de la referencia sólida</strong><span>N-P-K · comparación de valores declarados</span></figcaption>
              <div className={styles.bloomSolidRows} role="img" aria-label="La referencia 3-8-3 declara N 3, P 8 y K 3. El valor de fósforo es el más alto; la notación no expresa porcentaje, concentración disponible ni dosis.">
                {[
                  { label: "N · nitrógeno", value: 3 },
                  { label: "P · fósforo", value: 8 },
                  { label: "K · potasio", value: 3 },
                ].map((item) => <div className={styles.bloomSolidRow} key={item.label}>
                  <span>{item.label}</span><span className={styles.bloomSolidTrack} aria-hidden="true"><i style={{ width: `${(item.value / 8) * 100}%` }} /></span><strong>{item.value}</strong>
                </div>)}
              </div>
              <p>La relación visual compara los números de la fórmula. No representa porcentajes, disponibilidad en suelo ni una pauta de aplicación.</p>
            </figure>

            <div className={styles.bloomSolidEvidence} aria-label="Evidencia contextual de respuesta al fósforo">
              <article>
                <strong>+32,6 %</strong>
                <div><h3>Una respuesta en naranja sobre suelo ácido</h3><p>En un ensayo de tres años con naranja Navelina en China, el tratamiento de fósforo de mayor tasa aumentó el rendimiento frente al control sin P, principalmente por número de frutos. La acidez y la toxicidad por aluminio eran restricciones del sitio.</p><a href="https://doi.org/10.1016/j.scienta.2020.109596" target="_blank" rel="noopener noreferrer">Li et al. · <i>Scientia Horticulturae</i> ↗<span className="sr-only"> (se abre en una pestaña nueva)</span></a></div>
              </article>
              <article>
                <strong>Respuesta variable</strong>
                <div><h3>En café colombiano no hubo un efecto general</h3><p>El ensayo de Cenicafé comparó fórmulas con y sin fósforo. Las respuestas productivas fueron ocasionales, de poca magnitud y no consistentes bajo las condiciones evaluadas.</p><a href="https://biblioteca.cenicafe.org/handle/10778/4297" target="_blank" rel="noopener noreferrer">Uribe H. · Cenicafé, 1983 ↗<span className="sr-only"> (se abre en una pestaña nueva)</span></a></div>
              </article>
            </div>
          </div>

          <p className={styles.bloomSolidSynthesis}>Son cultivos, suelos y tratamientos distintos; los estudios no miden 2BLOOM. En conjunto muestran que un valor alto de P no sustituye el diagnóstico nutricional, ni permite anticipar por sí solo floración, cuajado o rendimiento.</p>

          <div className={styles.bloomSolidClaim}>
            <span>Propuesta de claim para revisión agronómica</span>
            <p>“2BLOOM 3-8-3 integra una relación N-P-K con mayor valor declarado de fósforo en una matriz organomineral ocluida para acompañar programas de transición reproductiva, según el estado nutricional y las condiciones del lote.”</p>
          </div>
        </div>
      </section> : null}

      {product.slug === "2fruit" ? <section className={styles.fruitSolid} id="fruit-solido" aria-labelledby="fruit-solid-title">
        <div className={styles.fruitSolidInner}>
          <header className={styles.fruitSolidHeading}>
            <h2 id="fruit-solid-title">El potasio destaca en la fórmula; la carga y el lote definen el manejo.</h2>
            <p>2FRUIT sólido 3-3-8 está orientado a programas de desarrollo y llenado. El 8 es el valor declarado más alto en la notación N-P-K; describe el perfil de la referencia, no la concentración disponible, la dosis ni una respuesta garantizada.</p>
          </header>

          <div className={styles.fruitSolidReading}>
            <figure className={styles.fruitSolidFormula}>
              <figcaption><strong>Cómo leer la referencia</strong><span>N-P-K · valores declarados</span></figcaption>
              <div className={styles.fruitSolidRows} role="img" aria-label="La referencia sólida 2FRUIT 3-3-8 declara N 3, P 3 y K 8. El valor relativo de potasio es el más alto; la gráfica no expresa porcentajes ni dosis.">
                {[
                  { label: "N · nitrógeno", value: 3 },
                  { label: "P · fósforo", value: 3 },
                  { label: "K · potasio", value: 8 },
                ].map((item) => <div className={styles.fruitSolidRow} key={item.label}>
                  <span>{item.label}</span><span className={styles.fruitSolidTrack} aria-hidden="true"><i style={{ width: `${(item.value / 8) * 100}%` }} /></span><strong>{item.value}</strong>
                </div>)}
              </div>
              <p>La longitud compara los números de la fórmula, no porcentajes, disponibilidad en el suelo ni una pauta de aplicación.</p>
            </figure>

            <article className={styles.fruitSolidEvidence} aria-labelledby="fruit-solid-evidence-title">
              <div>
                <span>CONTEXTO DE CULTIVO · AGUACATE</span>
                <h3 id="fruit-solid-evidence-title">La cosecha también exporta nutrientes.</h3>
                <p>Una tabla técnica de UC ANR, basada en Cutting (Nueva Zelanda, 2000), estima la extracción asociada a 10.000 lb de aguacate por acre (≈11,2 t/ha):</p>
              </div>
              <div className={styles.fruitSolidExport} role="img" aria-label="Extracción aproximada de nutrientes por hectárea, convertida desde la fuente: nitrógeno 39,9 kilogramos, fósforo 6,1 y potasio 67,7, para un escenario de 11,2 toneladas de aguacate por hectárea.">
                {[
                  { label: "N · nitrógeno", value: 39.9 },
                  { label: "P · fósforo", value: 6.1 },
                  { label: "K · potasio", value: 67.7 },
                ].map((item) => <div className={styles.fruitSolidExportRow} key={item.label}>
                  <span>{item.label}</span><span className={styles.fruitSolidExportTrack} aria-hidden="true"><i style={{ width: `${(item.value / 67.7) * 100}%` }} /></span><strong>{item.value.toFixed(1)} kg/ha</strong>
                </div>)}
              </div>
              <p className={styles.fruitSolidEvidenceNote}>Conversión aproximada desde los valores de la tabla original (N 35,6; P 5,4; K 60,4 lb/acre). Es una referencia de extracción para ese rendimiento y cultivo: no es una recomendación de fertilización, no se transfiere automáticamente a Colombia y no mide 2FRUIT.</p>
              <a href="https://ucanr.edu/sites/alternativefruits/files/291780.pdf" target="_blank" rel="noopener noreferrer">UC ANR · <i>Avocado Fertilization</i>, tabla de extracción ↗<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
            </article>
          </div>

          <div className={styles.fruitSolidClaim}>
            <span>Propuesta de claim para revisión agronómica</span>
            <p>“2FRUIT 3-3-8 integra una relación N-P-K con el potasio como valor declarado más alto, en una matriz organomineral ocluida orientada a acompañar programas de desarrollo y llenado según la carga productiva y las condiciones del lote.”</p>
          </div>
        </div>
      </section> : null}

      {product.slug === "2balance-liquido" ? <section className={styles.balanceProfile} id="perfil-npk" aria-labelledby="balance-profile-title">
        <div className={styles.balanceProfileInner}>
          <div className={styles.balanceProfileFormula} role="img" aria-label="La graduación declarada 70-70-70 expresa una relación numérica equivalente 1 a 1 a 1 entre nitrógeno, fósforo y potasio.">
            <span>LECTURA DE LA FÓRMULA</span>
            <div className={styles.balanceProfileNumbers}><strong>70</strong><i aria-hidden="true">:</i><strong>70</strong><i aria-hidden="true">:</i><strong>70</strong></div>
            <div className={styles.balanceProfileNutrients}><span>N · nitrógeno</span><span>P · fósforo</span><span>K · potasio</span></div>
            <small>Relación numérica declarada · 1 : 1 : 1</small>
          </div>
          <div className={styles.balanceProfileCopy}>
            <span>2BALANCE · 70-70-70</span>
            <h2 id="balance-profile-title">Tres nutrientes esenciales, un perfil de proporciones equivalentes.</h2>
            <p>La notación de 2BALANCE presenta valores equivalentes de N, P y K. En la planta, el nitrógeno participa en proteínas y clorofila; el fósforo forma parte del ATP y de los ácidos nucleicos; el potasio activa enzimas y ayuda a regular el equilibrio hídrico. La proporción de la fórmula describe el producto; el análisis y la etiqueta ayudan a decidir si el lote requiere ese perfil.</p>
            <a href="https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/what-is-the-right-fertilizer-for-your-lawn-and-garden" target="_blank" rel="noopener noreferrer">UMN Extension · funciones de N, P y K ↗</a>
          </div>
          <blockquote className={styles.balanceProfileClaim}>
            <p>2BALANCE 70-70-70 integra N, P y K en proporciones declaradas equivalentes para programas de nutrición que buscan equilibrio durante transición y mantenimiento.</p>
          </blockquote>
          <p className={styles.balanceProfileNote}>La relación 1:1:1 no expresa porcentaje, concentración en g/L, dosis ni respuesta de cultivo. Esos datos se determinan con la etiqueta vigente y las condiciones del sistema productivo.</p>
        </div>
      </section> : null}

      {product.slug === "2bloom-liquido" ? <section className={styles.bloomEvidence} id="evidencia-fosforo" aria-labelledby="bloom-evidence-title">
        <div className={styles.bloomEvidenceInner}>
          <header className={styles.bloomEvidenceHeading}>
            <h2 id="bloom-evidence-title">Un perfil alto en fósforo. La respuesta se define en cada lote.</h2>
            <p>2BLOOM 30-80-30 pone el mayor valor declarado en P dentro de su fórmula N-P-K. Ese perfil da una base concreta para programas de transición reproductiva y floración; suelo, agua, estado nutricional y clima determinan si el cultivo responde.</p>
          </header>

          <div className={styles.bloomEvidenceGrid}>
            <figure className={styles.bloomFormula} aria-labelledby="bloom-formula-title">
              <figcaption id="bloom-formula-title"><strong>Lectura comparativa de la fórmula</strong><span>N-P-K · valores declarados, sin unidad analítica en esta ficha</span></figcaption>
              <div className={styles.bloomFormulaRows} role="img" aria-label="La notación 30-80-30 presenta nitrógeno 30, fósforo 80 y potasio 30; el valor escrito para fósforo es el mayor. No indica porcentaje, gramos por litro ni dosis.">
                {[
                  { label: "N · nitrógeno", value: 30 },
                  { label: "P · fósforo", value: 80 },
                  { label: "K · potasio", value: 30 },
                ].map((item) => <div className={styles.bloomFormulaRow} key={item.label}>
                  <span>{item.label}</span><div aria-hidden="true"><i style={{ width: `${(item.value / 80) * 100}%` }} /></div><strong>{item.value}</strong>
                </div>)}
              </div>
              <p>El 80 supera los otros valores de la fórmula. La notación no expresa porcentaje, g/L, disponibilidad, dosis ni la proporción que absorberá la planta.</p>
            </figure>

            <div className={styles.bloomStudies} aria-label="Evidencia de campo sobre respuesta al fósforo">
              <article className={styles.bloomStudy}>
                <strong className={styles.bloomStudyFigure}>+32,6%</strong>
                <div>
                  <h3>Más producción en un ensayo de naranja con suelo ácido</h3>
                  <p>En un ensayo de campo de tres años con naranja Navelina, la aplicación de P aumentó el rendimiento 32,6 % frente al tratamiento sin P. Los autores identificaron la acidez y la toxicidad por aluminio como restricciones principales del sitio.</p>
                  <a href="https://doi.org/10.1016/j.scienta.2020.109596" target="_blank" rel="noopener noreferrer">Ensayo de campo en Scientia Horticulturae · 2020 ↗</a>
                </div>
              </article>
              <article className={styles.bloomStudy}>
                <strong className={styles.bloomStudyFinding}>Sin respuesta general</strong>
                <div>
                  <h3>El ensayo de Cenicafé en café tuvo otra conclusión</h3>
                  <p>Al comparar 12-6-22 con 12-0-22, el estudio no encontró un efecto productivo general del P bajo las condiciones evaluadas. Las respuestas aisladas fueron pequeñas y no consistentes.</p>
                  <a href="https://biblioteca.cenicafe.org/handle/10778/4297" target="_blank" rel="noopener noreferrer">Uribe H. · Cenicafé, 1983 ↗</a>
                </div>
              </article>
            </div>
          </div>

          <p className={styles.bloomEvidenceSynthesis}>Los resultados no son comparables entre sí: cambian cultivo, suelo y manejo. Juntos muestran por qué un número alto de P en la fórmula no sustituye el diagnóstico ni demuestra, por sí solo, una respuesta de 2BLOOM.</p>

          <blockquote className={styles.bloomClaim}>
            <p>2BLOOM 30-80-30: nutrición líquida de base biológica, con fósforo como valor destacado de la fórmula, para acompañar programas de transición reproductiva y floración.</p>
          </blockquote>

          <div className={styles.bloomTrial}>
            <div>
              <h3>Qué medir para respaldar la respuesta de 2BLOOM</h3>
              <p>Antes de comparar tratamientos, documentar fósforo disponible del suelo, análisis foliar, etapa, carga floral, agua y el aporte total N-P-K del programa. Contrastar el manejo habitual con el mismo manejo más 2BLOOM, usando únicamente etiqueta y pauta técnica vigentes.</p>
            </div>
            <div>
              <p>Registrar brotes reproductivos y flores por rama, porcentaje de cuajado, caída de frutos, número y peso a cosecha. Repetir en bloques comparables y más de un ciclo permite separar la respuesta del producto de las variaciones de clima, suelo y carga.</p>
              <Link className="button button--primary" href={contactHref}>Consultar 2BLOOM para mi cultivo</Link>
            </div>
          </div>
        </div>
      </section> : null}

      {product.category === "liquidos" ? <section className={styles.liquidSystem} id="biol" aria-labelledby="liquid-system-title">
        <div className={styles.liquidSystemInner}>
          <div className={styles.liquidSystemHeading}>
            <div>
              <span className={styles.liquidSystemEyebrow}>La base biológica de la línea líquida</span>
              <h2 id="liquid-system-title">Del biol a una fórmula para cada etapa.</h2>
            </div>
            <p>Las referencias líquidas parten de bioles obtenidos mediante digestión anaerobia multietapa. Luego se formulan y estabilizan para construir perfiles nutricionales propios de cada familia Wondergreen.</p>
          </div>
          {liquidScene ? <figure className={styles.liquidSystemVisual}>
            <Image className={styles.liquidSystemScene} src={liquidScene.src} alt={liquidScene.alt} width={liquidScene.width} height={liquidScene.height} sizes="(max-width: 800px) 100vw, 90vw" loading="lazy" decoding="async" />
            <figcaption className={styles.liquidSystemArtCaption}>
              <Image className={styles.liquidSystemBrand} src="/brand/wondergreen-nutrients-transparent.png" alt="Wondergreen Nutrients" width={746} height={392} sizes="(max-width: 600px) 150px, 184px" />
              <span><strong>{liquidScene.title}</strong><span>{liquidScene.detail}</span></span>
            </figcaption>
          </figure> : null}
          <div className={styles.liquidSystemSteps}>
            <article><h3>Bioles de digestión anaerobia</h3><p>La ruta multietapa transforma corrientes orgánicas; la fase metanogénica hace parte de este proceso.</p></article>
            <article><h3>Formulación y estabilización</h3><p>La base se formula para obtener referencias líquidas con concentraciones y propósitos nutricionales diferenciados.</p></article>
            <article><h3>Nutrición del sistema suelo-planta</h3><p>La línea aporta nutrientes, materia orgánica y microorganismos benéficos. Cada referencia se orienta a {product.stage || product.focus}; concentración, vía, dosis y compatibilidad se definen con su ficha y las condiciones del cultivo.</p></article>
          </div>
        </div>
      </section> : null}

      {product.slug === "2fruit-liquido" ? <section className={styles.fruitEvidence} id="nutricion-fruto" aria-labelledby="fruit-evidence-title">
        <div className={styles.fruitEvidenceInner}>
          <header className={styles.fruitEvidenceHeading}>
            <span>2FRUIT · 30-30-80</span>
            <h2 id="fruit-evidence-title">Una fórmula con potasio protagonista para acompañar el desarrollo del fruto.</h2>
            <p>2FRUIT reúne una base biológica formulada para la fase productiva y un perfil declarado de N-P-K 30-30-80. Su lectura agronómica empieza por la demanda real del cultivo, la carga de frutos y el aporte total de nutrientes del programa.</p>
          </header>

          <div className={styles.fruitEvidenceGrid}>
            <figure className={styles.fruitFormula} aria-labelledby="fruit-formula-title">
              <figcaption id="fruit-formula-title"><strong>El potasio tiene el mayor valor declarado</strong><span>Lectura comparativa de la notación 30-30-80</span></figcaption>
              <div className={styles.fruitFormulaRows} role="img" aria-label="En la notación declarada 30-30-80, nitrógeno y fósforo muestran valor 30, y potasio muestra valor 80. La unidad de concentración no está especificada en esta ficha.">
                {[
                  { label: "N · nitrógeno", value: 30 },
                  { label: "P · fósforo", value: 30 },
                  { label: "K · potasio", value: 80 },
                ].map((item) => <div className={styles.fruitFormulaRow} key={item.label}>
                  <span>{item.label}</span><div aria-hidden="true"><i style={{ width: `${(item.value / 80) * 100}%` }} /></div><strong>{item.value}</strong>
                </div>)}
              </div>
              <p>Las barras comparan únicamente los valores escritos en la fórmula. No representan porcentaje, g/L, disponibilidad, proporción absorbida ni dosis.</p>
            </figure>

            <figure className={styles.fruitFieldEvidence} aria-labelledby="fruit-field-title">
              <figcaption id="fruit-field-title"><strong>La demanda de K también cambia durante el desarrollo</strong><span>Hass · observaciones de acumulación de K en fruto · California</span></figcaption>
              <div className={styles.fruitSeasonBar} role="img" aria-label="En un estudio de aguacate Hass en California, alrededor del 30 por ciento del potasio acumulado en el fruto se incorporó entre mediados de mayo y noviembre, y cerca del 70 por ciento restante entre abril y julio del año siguiente.">
                <div><strong>≈30%</strong><span>mediados de mayo–noviembre</span></div>
                <div><strong>≈70%</strong><span>abril–julio siguiente</span></div>
              </div>
              <p>El estudio siguió frutos Hass durante dos ciclos y muestra una ventana de alta acumulación de K. Es evidencia de fenología y demanda del cultivo, no de eficacia, calendario colombiano ni dosis de 2FRUIT.</p>
              <a href="https://journals.ashs.org/downloadpdf/view/journals/hortsci/45/8S/article-pS1.pdf" target="_blank" rel="noopener noreferrer">Rosecrance, Lovatt &amp; Faber · ASHS/HortScience ↗</a>
            </figure>
          </div>

          <div className={styles.fruitPhysiology}>
            <p>En la fisiología vegetal, el K participa en la regulación osmótica, la actividad enzimática y el movimiento de azúcares entre órganos fuente y sumidero. Esa función ayuda a explicar por qué el nutriente importa durante el desarrollo; la respuesta observada depende del estado nutricional, el agua, el suelo y la carga de cada lote.</p>
            <a href="https://ucanr.edu/sites/alternativefruits/files/291780.pdf" target="_blank" rel="noopener noreferrer">UC ANR · potasio y desarrollo de fruto ↗</a>
          </div>

          <blockquote className={styles.fruitClaim}>
            <p>2FRUIT 30-30-80: una formulación de base biológica con potasio protagonista para acompañar el crecimiento y llenado del fruto.</p>
          </blockquote>

          <div className={styles.fruitTrial}>
            <div><span>VALIDACIÓN EN LOTE · PROPUESTA TÉCNICA</span><h3>Pasar de un perfil de fórmula a una pauta defendible.</h3><p>Para definir dosis y momento, primero se requiere la concentración analítica por unidad de producto y la pauta de etiqueta. Después se puede contrastar el programa local con tratamientos graduados por aporte de K, manteniendo constantes las demás fuentes y registrando carga, crecimiento del fruto, calibre y calidad a cosecha.</p></div>
            <ol className={styles.fruitDoseLevels} aria-label="Tratamientos relativos preliminares para un ensayo de dosis">
              <li><strong>50%</strong><span>del objetivo de K definido para el lote</span></li>
              <li><strong>75%</strong><span>del objetivo de K definido para el lote</span></li>
              <li><strong>100%</strong><span>del objetivo de K definido para el lote</span></li>
            </ol>
            <p className={styles.fruitTrialNote}>Diseño de evaluación, no recomendación de uso: establecer niveles a partir del objetivo de K calculado para el lote y expresarlos con análisis de etiqueta. No convertir el 80 de la fórmula a litros por hectárea sin conocer su base analítica.</p>
          </div>
        </div>
      </section> : null}

      {product.slug === "2grow-liquido" ? <section className={styles.nitrogenEvidence} id="eficiencia-n" aria-labelledby="nitrogen-evidence-title">
        <div className={styles.nitrogenEvidenceInner}>
          <div className={styles.nitrogenEvidenceHeading}>
            <h2 id="nitrogen-evidence-title">Dos concentraciones para crecer; tres preguntas para leer el <span className={styles.nitrogenAccent}>nitrógeno.</span></h2>
            <p>2GROW combina el perfil NPK 100-20-20 con 200-0-0, la concentración de mayor nitrógeno de la línea. La decisión técnica mira la dosis de N, cuánto recupera el cultivo y qué pérdidas ocurren. La eficiencia de uso, la disponibilidad en suelo y la volatilización de NH₃ se miden por separado.</p>
          </div>
          <div className={styles.nitrogenEvidenceBody}>
            <figure className={styles.nueFigure} aria-labelledby="nue-chart-title">
              <figcaption id="nue-chart-title"><strong>La aplicación cambia la eficiencia observada.</strong><span>Uso de N (NUE) en un ensayo de trigo de invierno · 2 años · 2 fincas · 47 ha</span></figcaption>
              <div className={styles.nueBars} role="img" aria-label="En un ensayo de trigo de invierno, la eficiencia de uso de nitrógeno fue 69 por ciento con fertilizante mineral, 43 por ciento con digestato líquido más inhibidor de nitrificación y 49 por ciento con digestato líquido aplicado a tasa variable.">
                {[
                  { label: "Fertilizante mineral", value: 69 },
                  { label: "Digestato líquido + inhibidor", value: 43 },
                  { label: "Digestato líquido · tasa variable", value: 49 },
                ].map((item) => <div className={styles.nueBarRow} key={item.label}>
                  <span>{item.label}</span><div className={styles.nueBarTrack} aria-hidden="true"><i style={{ width: `${(item.value / 80) * 100}%` }} /></div><strong>{item.value}%</strong>
                </div>)}
              </div>
              <p>En ese ensayo, los tratamientos con digestato alcanzaron rendimientos superiores a 5,9 t/ha y proteína superior a 5,3 %, comparables con el fertilizante mineral. Sin embargo, la recuperación de N no fue igual: la NUE fue 69 % con la fuente mineral, 43 % con digestato líquido más inhibidor y 49 % con digestato líquido a tasa variable. Una cosecha comparable no significa que el cultivo haya recuperado la misma proporción del N aplicado.</p>
              <p className={styles.nueDefinition}>En este estudio, NUE = N absorbido por el cultivo ÷ N aplicado con el fertilizante. Es un indicador de eficiencia del sistema ensayado, no una propiedad transferible a 2GROW.</p>
              <a href="https://link.springer.com/article/10.1007/s11119-025-10275-9" target="_blank" rel="noopener noreferrer">Piccoli et al. (2025) · leer el ensayo de campo ↗</a>
            </figure>
          <div className={styles.nitrogenEvidenceReadout}>
              <h3>Dos perfiles para acompañar el crecimiento vegetativo</h3>
              <div className={styles.concentrationProfiles}>
                {[
                  {
                    formula: "100-20-20",
                    title: "Aporte N-P-K en una sola fórmula",
                    description: "Combina los tres valores declarados en la referencia para integrar nitrógeno, fósforo y potasio al programa de crecimiento. La proporción aporta opciones para construir una estrategia vegetativa con más de un nutriente.",
                    values: [100, 20, 20],
                  },
                  {
                    formula: "200-0-0",
                    title: "Mayor concentración de nitrógeno de la línea",
                    description: "Prioriza el aporte nitrogenado dentro de 2GROW y se orienta a momentos de alta demanda vegetativa. La selección depende del cultivo, el análisis y los otros aportes del lote.",
                    values: [200, 0, 0],
                  },
                ].map((profile) => (
                  <article key={profile.formula} id={`perfil-${profile.formula}`}>
                    <span>{profile.formula}</span>
                    <h4>{profile.title}</h4>
                    <figure className={styles.profileValues} aria-label={`Perfil declarado N-P-K ${profile.formula}: nitrógeno ${profile.values[0]}, fósforo ${profile.values[1]}, potasio ${profile.values[2]}`}>
                      <figcaption>Perfil declarado · N — P — K · escala visual común 0–200</figcaption>
                      <div className={styles.profileValueRows}>
                        {[
                          { nutrient: "N", label: "Nitrógeno", value: profile.values[0] },
                          { nutrient: "P", label: "Fósforo", value: profile.values[1] },
                          { nutrient: "K", label: "Potasio", value: profile.values[2] },
                        ].map((item) => (
                          <div className={styles.profileValueRow} key={item.nutrient}>
                            <span aria-label={item.label}>{item.nutrient}</span>
                            <div aria-hidden="true"><i style={{ width: `${(item.value / 200) * 100}%` }} /></div>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </figure>
                    <p>{profile.description}</p>
                  </article>
                ))}
              </div>
              <p className={styles.concentrationProfileNote}>Los números identifican el perfil declarado; por sí solos no expresan porcentaje, g/L, densidad ni dosis. La base de bioles, después de formulación y estabilización, integra nutrientes, materia orgánica y microorganismos benéficos al sistema suelo-planta. La respuesta y el balance de pérdidas se deben evaluar para cada concentración, cultivo y vía de aplicación.</p>
              <blockquote className={styles.nitrogenEvidenceClaim}>
                <p>Dos perfiles de 2GROW para acompañar el crecimiento vegetativo: 100-20-20 integra N, P y K; 200-0-0 concentra el mayor nitrógeno de la línea. Ambos parten de bioles de digestión anaerobia multietapa, formulados y estabilizados para aportar nutrientes, materia orgánica y microorganismos benéficos al sistema suelo-planta.</p>
              </blockquote>
              <Link href="/wondergreen/ciencia/#wg-volatilization-title">Ver estudios sobre eficiencia y volatilización de N →</Link>
            </div>
          </div>
          <section className={styles.volatilizationContext} aria-labelledby="volatilization-title">
            <div className={styles.volatilizationHeading}>
              <span>QUÉ MUEVE LA VOLATILIZACIÓN</span>
              <h3 id="volatilization-title">El nitrógeno amoniacal responde a la fuente, el suelo y la aplicación.</h3>
              <p>En digestatos, un pH más alto puede elevar la fracción de NH₃ libre, mientras menor materia seca puede favorecer la infiltración. Como estos factores interactúan, la digestión anaerobia no implica por sí sola menos emisiones.</p>
            </div>
            <div className={styles.volatilizationFactors}>
              <article><h4>pH y nitrógeno amoniacal</h4><p>La química del biol y la concentración de N amoniacal condicionan cuánto N queda como NH₄⁺ y cuánto puede pasar a NH₃.</p></article>
              <article><h4>Suelo, humedad y clima</h4><p>Textura, humedad, temperatura, viento y lluvia alteran infiltración y permanencia del fertilizante en la superficie.</p></article>
              <article><h4>Vía y equipo de aplicación</h4><p>Colocación, contacto con el aire y tiempo de incorporación cambian la exposición; la vía se define con etiqueta y asesoría del cultivo.</p></article>
            </div>
            <figure className={styles.volatilizationStudy}>
              <div className={styles.volatilizationStat}><strong>34–39%</strong><span>menos emisión acumulada en una comparación de técnicas de aplicación</span></div>
              <figcaption>
                <strong>Un resultado de campo, no un resultado de 2GROW.</strong>
                <span>En 12 ensayos con digestato de alta materia seca, una zapata modificada con rastra redujo la emisión frente a una zapata simple. La respuesta varió entre fuentes; el estudio no recomienda una técnica universal.</span>
                <a href="https://doi.org/10.1016/j.aeaoa.2026.100415" target="_blank" rel="noopener noreferrer">Pedersen et al. (2026) · leer el estudio ↗</a>
              </figcaption>
            </figure>
          </section>
          <section className={styles.doseTrial} aria-labelledby="dose-trial-title">
            <div><span>MARCO DE CÁLCULO · SUJETO A FICHA Y ENSAYO</span><h3 id="dose-trial-title">La dosis se calcula por nutriente aportado, no por litros iguales.</h3><p>Primero se estima cuánto N falta por aportar al cultivo (kg N/ha), considerando análisis, suelo, agua y otras fuentes. Para expresar ese objetivo como volumen de producto se requiere la concentración de N declarada en la ficha y etiqueta de la presentación seleccionada.</p></div>
            <div className={styles.doseCalculation} aria-label="Método para estimar volumen de producto por hectárea">
              <span>Conversión orientadora</span>
              <p><strong>Litros de producto/ha</strong> = N objetivo por cubrir (kg/ha) ÷ N declarado en el producto (kg/L)</p>
              <small>La etiqueta debe permitir convertir la graduación a kg de N por litro. Sin esa base —y sin definir cultivo, vía y eficiencia de aplicación— no se puede derivar una dosis numérica responsable para 2GROW.</small>
            </div>
            <p className={styles.doseTrialContext}>Protocolo experimental propuesto: comparar un programa de referencia del cultivo con tratamientos de 50 %, 75 % y 100 % del objetivo de N por cubrir, usando cada concentración de 2GROW por separado y registrando el N, P y K total aplicado.</p>
            <ol aria-label="Tratamientos experimentales de referencia">
              <li><strong>50%</strong><span>de la dosis de N definida</span></li>
              <li><strong>75%</strong><span>de la dosis de N definida</span></li>
              <li><strong>100%</strong><span>de la dosis de N definida</span></li>
            </ol>
            <p className={styles.doseTrialNote}>Las tasas son tratamientos de investigación, no dosis de uso. Medir NH₃ acumulado, N mineral en suelo, absorción de N, rendimiento y calidad; comparar resultados por concentración y vía de aplicación.</p>
          </section>
          <p className={styles.nitrogenEvidenceFootnote}><strong>Dos indicadores distintos:</strong> la eficiencia de uso del N describe la relación entre el nutriente aplicado y el recuperado por el cultivo; la volatilización de NH₃ se cuantifica por separado. Ninguno se deduce de la graduación NPK.</p>
        </div>
      </section> : null}

      <section className="product-application-section" id="aplicacion"><div className="container product-application-grid"><div><h2>{isBioinput ? "Confirma la referencia y su uso autorizado antes de definir una aplicación." : "La decisión se construye desde el lote, no solo desde la fórmula."}</h2><ol className={styles.applicationList}>{product.application.map((item,index)=><li className={styles.applicationStep} key={item}><span aria-hidden="true">{String(index + 1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol></div><div><h3>{isBioinput ? "Cultivos autorizados por confirmar" : "Cultivos y sistemas de referencia"}</h3><p className="product-section-lead">{isBioinput ? "No se publican cultivos recomendados para esta referencia hasta confirmar el uso autorizado en la ficha, etiqueta y registro vigentes." : "Consulta la guía del cultivo cuando exista; en los demás casos, valida suelo, agua, etapa y objetivo."}</p>{product.crops.length > 0 ? <div className="product-crop-pills">{product.crops.map((crop)=>{ const cropRoute = getCropForProductLabel(crop); return cropRoute ? <Link className="product-crop-pill" href={`/wondergreen/cultivos/${cropRoute.slug}/`} key={crop}>{crop}<span aria-hidden="true"> ↗</span></Link> : <span className="product-crop-pill" key={crop}>{crop}</span>; })}</div> : null}<div className="product-caution-card" id="criterio"><strong>Antes de aplicar</strong><ul>{handlingNotes.map((item)=><li key={item}>{item}</li>)}</ul><Link className="text-link" href="/biblioteca/manual-uso-wondergreen/">Abrir manual de aplicación →</Link></div></div></div></section>

      <section className="presentation-section" id="presentaciones">
        <div className="container">
          <div className="presentation-grid">
            <div>
              <span className="eyebrow">Presentaciones</span>
              <h2>Referencias y formatos.</h2>
              <p>{publication.availability}</p>
            </div>
            <div className="presentation-groups">
              {publication.presentationGroups.length > 0 ? publication.presentationGroups.map((group) => (
                <div className="presentation-group" key={group.label}>
                  <h3>{group.label}</h3>
                  <div className="presentation-pills">{group.items.map((item) => <span key={item}>{item}</span>)}</div>
                  {product.slug === "2grow-liquido" ? (() => {
                    const is200 = group.label.includes("200-0-0");
                    const variant = is200 ? "Wondergreen 2GROW 200-0-0" : "Wondergreen 2GROW 100-20-20";
                    const priority = is200
                      ? "200-0-0 · presentación y suministro por consultar"
                      : "100-20-20 · elegir entre 1 L, 3,75 L, 20 L, 200 L o 1.000 L";
                    const href = `/contacto/?interes=wondergreen&perfil=agro&diagnostico=${encodeURIComponent(variant)}&prioridad=${encodeURIComponent(priority)}`;
                    return <Link className="text-link" href={href}>Consultar {is200 ? "2GROW 200-0-0" : "2GROW 100-20-20"} →</Link>;
                  })() : null}
                </div>
              )) : <p>Consulta con el equipo las presentaciones disponibles para esta referencia.</p>}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? <section className="product-related-section" id="comparar" aria-labelledby="product-related-title"><div className="container"><div className="product-related-heading"><div><span className="eyebrow">Comparar dentro del sistema</span><h2 id="product-related-title">Otras referencias de la línea {product.category === "solidos" ? "sólida" : product.category === "liquidos" ? "líquida" : "biológica"}.</h2></div><p>La etapa orienta la familia, pero no reemplaza el diagnóstico. Revisa el papel de cada referencia y confirma con el equipo la fórmula, presentación, dosis o frecuencia adecuadas para tu cultivo.</p></div><div className="product-related-grid">{relatedProducts.map((related) => <Link className="product-related-card" href={`/wondergreen/productos/${related.slug}/`} key={related.slug}><div className="product-related-card__media"><ProductVisual product={related} context="card" /></div><div className="product-related-card__body"><span>{related.stage || related.focus}</span><strong>{related.name}</strong><small>{related.formula || related.format}</small><em>Ver ficha →</em></div></Link>)}</div><div className="product-related-actions"><Link className="text-link" href="/wondergreen/ciencia/">Leer la ciencia Wondergreen →</Link><Link className="text-link" href="/wondergreen/#productos">Volver al portafolio →</Link></div></div></section> : null}

    </>
  );
}
