import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { HomeGardenStageVisual } from "@/components/home-garden-stage-visual";
import {
  getHomeGardenProduct,
  homeGardenProducts,
  homeGardenRegulatoryGate,
  homeGardenRelease,
} from "@/data/home-garden";
import {
  getHomeGardenDocumentsForStage,
  getRelatedHomeGardenKitsForStage,
  publicDocumentDownloadHref,
  publicDocumentHref,
} from "@/data/home-garden-public-documents";
import styles from "../../casa-jardin.module.css";

export function generateStaticParams() {
  return homeGardenProducts.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getHomeGardenProduct(slug);
  if (!product) return { title: "Producto Casa & Jardín | Wondergreen" };
  return {
    title: `${product.consumerName} | Wondergreen Casa, Jardín y Vivero`,
    description: `${product.role} Referencia técnica, formatos domésticos propuestos, documentación y kits relacionados; compra y precio aún no habilitados.`,
    alternates: { canonical: `/casa-jardin/productos/${product.id}` },
    robots: { index: false, follow: true },
  };
}

export default async function HomeGardenProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getHomeGardenProduct(slug);
  if (!product) notFound();

  const documents = getHomeGardenDocumentsForStage(product.id);
  const relatedKits = getRelatedHomeGardenKitsForStage(product.id);

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Casa & Jardín", path: "/casa-jardin" },
        { name: "Productos", path: "/casa-jardin/productos" },
        { name: product.consumerName, path: `/casa-jardin/productos/${product.id}` as `/${string}` },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">← Volver a productos</Link>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · {product.id === "prepara" ? "suelo" : "etapa"}</span>
              <h1>{product.consumerName}</h1>
              <p className={styles.lead}>{product.role}</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href={`/wondergreen/productos/${product.technicalSlug}`}>Ver referencia técnica</Link>
                <a className={`${styles.button} ${styles.ghost}`} href="#documentacion">Ver documentación</a>
                <a className={`${styles.button} ${styles.ghost}`} href="#kits-relacionados">Ver kits relacionados</a>
              </div>
            </div>
            <aside className={styles.heroVisual} aria-label={`Identidad visual ${product.consumerName}`}>
              <p className={styles.heroNote}>PRODUCTO DEFINIDO · FORMATO DOMÉSTICO EN VALIDACIÓN</p>
              <HomeGardenStageVisual stage={product.id} size="hero" />
              <p style={{ color: "#d5e2dc", maxWidth: "26rem" }}>
                Referencia técnica: {product.technicalName}{product.formula ? ` · ${product.formula}` : ""}. El arte de línea identifica la familia aprobada; no representa un packshot específico de los formatos domésticos propuestos.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Qué es este producto</span><h2>La referencia existe antes que la presentación doméstica.</h2></div>
              <p>Casa & Jardín traduce una referencia Wondergreen ya gobernada a una lectura por etapa. La fórmula, identidad técnica y Product Truth permanecen en Wondergreen; el empaque pequeño, precio, stock, dosificador y condiciones de venta se habilitan únicamente cuando su cierre B2C esté reconciliado.</p>
            </div>
            <div className={styles.decisionGrid}>
              <article className={styles.decisionCard}>
                <span className={styles.eyebrow}>Nombre Casa & Jardín</span>
                <h3>{product.consumerName}</h3>
                <p>{product.prompt}</p>
              </article>
              <article className={styles.decisionCard}>
                <span className={styles.eyebrow}>Referencia técnica</span>
                <h3>{product.technicalName}</h3>
                <p>{product.formula ? `Formulación ${product.formula}.` : "Compost / acondicionamiento del sustrato."}</p>
                <Link href={`/wondergreen/productos/${product.technicalSlug}`}>Abrir Product Truth →</Link>
              </article>
              <article className={styles.decisionCard}>
                <span className={styles.eyebrow}>Estado comercial B2C</span>
                <h3>Pre-lanzamiento</h3>
                <p>Sin PVP, checkout, disponibilidad ni promesa de stock hasta cerrar las dependencias pendientes.</p>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Presentaciones domésticas propuestas</span><h2>Tamaños visibles sin convertirlos todavía en SKUs comprables.</h2></div>
              <p>{product.householdFormatStatus}</p>
            </div>
            <div className={styles.decisionGrid}>
              {product.plannedHouseholdVariants.map((variant) => (
                <article className={styles.decisionCard} key={variant}>
                  <span className={styles.eyebrow}>Formato propuesto</span>
                  <h3>{variant}</h3>
                  <p>Sin precio público, cobertura ni dosis hasta completar validación técnica, comercial y regulatoria.</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="documentacion">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Documentación relacionada</span><h2>Producto, guía y Product Truth permanecen conectados, pero no se confunden.</h2></div>
              <p>Los PDFs públicos sirven como material educativo y de acompañamiento. La referencia técnica exacta se consulta en Wondergreen. Los binarios públicos actuales fueron reconstruidos y verificados desde contenido gobernado; no se presentan como copias byte a byte de los masters históricos del handoff.</p>
            </div>
            <div className={styles.decisionGrid}>
              {documents.map((document) => (
                <article className={styles.decisionCard} key={document.id}>
                  <span className={styles.eyebrow}>PDF público verificado</span>
                  <h3>{document.title}</h3>
                  <p>{document.summary}</p>
                  <p><small>Master fuente: {document.sourceMaster}</small></p>
                  <div className={styles.actions}>
                    <a className={`${styles.button} ${styles.primary}`} href={publicDocumentHref(document)} target="_blank" rel="noreferrer">Abrir PDF ↗</a>
                    <a className={`${styles.button} ${styles.ghost}`} href={publicDocumentDownloadHref(document)}>Descargar ↓</a>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/guias">Ver biblioteca Casa & Jardín</Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} id="kits-relacionados">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Kits relacionados</span><h2>Este producto puede aparecer dentro de rutas de uso distintas.</h2></div>
              <p>La presencia de una etapa dentro de un kit no significa aplicación simultánea con las demás. Cada planta entra a la secuencia según su etapa y condición.</p>
            </div>
            <div className={styles.decisionGrid}>
              {relatedKits.map((kit) => (
                <article className={styles.decisionCard} key={kit.id}>
                  <span className={styles.eyebrow}>Kit de pre-lanzamiento</span>
                  <h3>{kit.name}</h3>
                  <p>{kit.audience}</p>
                  <p><strong>{kit.promise}</strong></p>
                  <Link href={`/casa-jardin/kits/${kit.id}`}>Ver composición del kit →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Cómo decidir</span><h2>{product.prompt}</h2></div>
              <p>La etapa orienta la selección, pero no reemplaza la revisión de agua, drenaje, raíces, sanidad, luz y condición general. Si la planta está severamente estresada, el siguiente paso puede ser no fertilizar.</p>
            </div>
            <div className={styles.guardrail}>
              <strong>Dosis y cobertura todavía no se calculan.</strong>
              <p>Tamaño de matera, volumen de sustrato, formulación y equivalencia real del dosificador deben validarse antes de publicar gramos, medidas o frecuencia.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Gate regulatorio</span><h2>La presentación pequeña no se presume habilitada.</h2></div>
              <p>{homeGardenRegulatoryGate.rule}</p>
            </div>
            <div className={styles.flow}>
              {homeGardenRegulatoryGate.sourceNotes.map((note, index) => <article key={note}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{note}</p></article>)}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.release}`}>
          <div className={`${styles.container} ${styles.releaseGrid}`}>
            <div><span className={styles.eyebrow}>Estado B2C</span><h2>Producto definido. Variante doméstica todavía en cierre.</h2></div>
            <div><ul>{homeGardenRelease.blockedReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="product-orientation-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Solo si todavía hay duda</span><h2 id="product-orientation-title">¿No sabes si {product.consumerName} corresponde a tu planta?</h2></div>
              <p>El orientador entra después de conocer el producto. Puede detener la ruta de fertilización si primero corresponde revisar agua, drenaje, raíces, estrés o sanidad; no calcula dosis ni convierte síntomas aislados en diagnóstico.</p>
            </div>
            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Usar orientador de etapa y condición</Link>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">Comparar otros productos</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
