import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { HomeGardenKitStageRail } from "@/components/home-garden-kit-stage-rail";
import {
  getHomeGardenKit,
  getHomeGardenProduct,
  homeGardenKits,
  homeGardenRelease,
} from "@/data/home-garden";
import {
  getHomeGardenDocumentsForKit,
  publicDocumentDownloadHref,
  publicDocumentHref,
} from "@/data/home-garden-public-documents";
import styles from "../../casa-jardin.module.css";

export function generateStaticParams() {
  return homeGardenKits.filter((kit) => kit.availability === "prelaunch").map((kit) => ({ slug: kit.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const kit = getHomeGardenKit(slug);
  if (!kit || kit.availability === "blocked") return { title: "Kit Casa & Jardín | Wondergreen" };
  return {
    title: `${kit.name} | Wondergreen Casa, Jardín y Vivero`,
    description: `${kit.promise} Composición, productos relacionados y documentación de pre-lanzamiento; compra y precio aún no habilitados.`,
    alternates: { canonical: `/casa-jardin/kits/${kit.id}` },
    robots: { index: false, follow: true },
  };
}

export default async function HomeGardenKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = getHomeGardenKit(slug);
  if (!kit || kit.availability === "blocked") notFound();

  const documents = getHomeGardenDocumentsForKit(kit.id);

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Casa & Jardín", path: "/casa-jardin" },
        { name: "Kits", path: "/casa-jardin/kits" },
        { name: kit.name, path: `/casa-jardin/kits/${kit.id}` as `/${string}` },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/kits">← Volver a kits</Link>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · kit de pre-lanzamiento</span>
              <h1>{kit.name}</h1>
              <p className={styles.lead}>{kit.audience}. <strong>{kit.promise}</strong></p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#ruta-kit">Ver productos del kit</a>
                <a className={`${styles.button} ${styles.ghost}`} href="#documentacion-kit">Ver documentación</a>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">Explorar todos los productos</Link>
              </div>
            </div>
            <aside className={styles.heroVisual} aria-label={`Composición ${kit.name}`}>
              <p className={styles.heroNote}>COMPOSICIÓN V1 · SIN CHECKOUT</p>
              <HomeGardenKitStageRail stages={kit.pathway} label={`Etapas incluidas en ${kit.name}`} tone="dark" />
              <p style={{ color: "#d5e2dc", maxWidth: "28rem" }}>
                Los artes identifican las líneas Wondergreen que componen la ruta. No son packshots finales del kit ni implican aplicación simultánea.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Qué incluye la propuesta V1</span><h2>Composición recuperada del handoff.</h2></div>
              <p>{kit.guardrail}</p>
            </div>
            <div className={styles.decisionGrid}>
              {kit.contents.map((content, index) => (
                <article className={styles.decisionCard} key={content}>
                  <span className={styles.eyebrow}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{content}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`} id="ruta-kit">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Productos del kit</span><h2>Cada etapa abre su propia ficha antes de cualquier orientación.</h2></div>
              <p>El kit agrupa posibilidades para distintas etapas. No implica aplicación simultánea ni reemplaza la lectura de condición de cada planta. Puedes abrir cada producto para revisar referencia técnica, formatos propuestos, documentación y estado B2C.</p>
            </div>
            <div className={styles.flow}>
              {kit.pathway.map((stage, index) => {
                const product = getHomeGardenProduct(stage);
                return (
                  <article key={stage}>
                    <strong>{String(index + 1).padStart(2, "0")} · {product?.consumerName ?? stage}</strong>
                    <p>{product?.role}</p>
                    {product ? <Link href={`/casa-jardin/productos/${product.id}`}>Abrir ficha de producto →</Link> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.section} id="documentacion-kit">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Documentación relacionada</span><h2>El kit también debe poder abrirse hasta sus guías.</h2></div>
              <p>Los documentos públicos actuales son reconstrucciones verificadas desde contenido gobernado y activos aprobados. Conservamos visible su master fuente para no confundir la publicación web con el binario histórico del handoff.</p>
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
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/guias">Ver todas las guías</Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Lo que todavía falta</span><h2>El kit no es comprable hasta cerrar sus dependencias.</h2></div>
              <p>El handoff contiene una hipótesis comercial de precios, pero no se publica porque aún falta validar costos reales y márgenes. Tampoco se anuncia ahorro sin una comparación verificable de componentes y accesorios.</p>
            </div>
            <div className={styles.flow}>
              {homeGardenRelease.blockedReasons.map((reason, index) => <article key={reason}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{reason}</p></article>)}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="kit-orientation-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Orientación secundaria</span><h2 id="kit-orientation-title">¿No sabes si este kit encaja con tus plantas?</h2></div>
              <p>Conoce primero qué contiene el kit. Si después sigue sin estar clara la etapa o la condición de una planta, usa el orientador; puede detener la fertilización cuando primero corresponda revisar agua, drenaje, raíces, estrés o sanidad.</p>
            </div>
            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Usar orientador de etapa y condición</Link>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/kits">Comparar otros kits</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
