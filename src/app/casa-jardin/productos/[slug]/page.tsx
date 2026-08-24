import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHomeGardenProduct,
  homeGardenProducts,
  homeGardenRegulatoryGate,
  homeGardenRelease,
} from "@/data/home-garden";
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
    description: `${product.role} Presentaciones domésticas en validación; compra y precio aún no habilitados.`,
    alternates: { canonical: `/casa-jardin/productos/${product.id}` },
    robots: { index: false, follow: true },
  };
}

export default async function HomeGardenProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getHomeGardenProduct(slug);
  if (!product) notFound();

  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">← Volver a productos</Link>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · {product.id === "prepara" ? "suelo" : "etapa"}</span>
              <h1>{product.consumerName}</h1>
              <p className={styles.lead}>{product.role}</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href={`/wondergreen/productos/${product.technicalSlug}`}>Ver Product Truth técnico</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/kits">Ver kits por uso</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/diagnostico">No sé si corresponde a mi planta</Link>
              </div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>PRESENTACIÓN DOMÉSTICA EN VALIDACIÓN</p>
              <strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3.2rem", lineHeight: 1 }}>{product.technicalName}</strong>
              <p style={{ color: "#d5e2dc", maxWidth: "26rem" }}>{product.formula ? `Fórmula técnica: ${product.formula}` : "Base orgánica para el sistema de suelo."}</p>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Formatos del handoff B2C</span><h2>Propuestos, todavía no vendidos como SKU.</h2></div>
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

        <section className={`${styles.section} ${styles.soft}`}>
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
      </main>
    </div>
  );
}
