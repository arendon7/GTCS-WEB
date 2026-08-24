import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getHomeGardenKit,
  getHomeGardenProduct,
  homeGardenKits,
  homeGardenRelease,
} from "@/data/home-garden";
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
    description: `${kit.promise} Composición de pre-lanzamiento; compra y precio aún no habilitados.`,
    alternates: { canonical: `/casa-jardin/kits/${kit.id}` },
    robots: { index: false, follow: true },
  };
}

export default async function HomeGardenKitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const kit = getHomeGardenKit(slug);
  if (!kit || kit.availability === "blocked") notFound();

  return (
    <div className={styles.page}>
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
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">Explorar productos por etapa</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/diagnostico">No sé si este kit encaja</Link>
              </div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>COMPOSICIÓN V1 · SIN CHECKOUT</p>
              <strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 1 }}>Un sistema por etapas, no una mezcla para aplicar de una vez.</strong>
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
              <div><span className={styles.eyebrow}>Ruta del kit</span><h2>Cada etapa se usa cuando corresponde.</h2></div>
              <p>El kit agrupa posibilidades para distintas etapas. No implica aplicación simultánea ni reemplaza la lectura de condición de cada planta.</p>
            </div>
            <div className={styles.flow}>
              {kit.pathway.map((stage, index) => {
                const product = getHomeGardenProduct(stage);
                return (
                  <article key={stage}>
                    <strong>{String(index + 1).padStart(2, "0")} · {product?.consumerName ?? stage}</strong>
                    <p>{product?.role}</p>
                    {product ? <Link href={`/casa-jardin/productos/${product.id}`}>Ver producto →</Link> : null}
                  </article>
                );
              })}
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
      </main>
    </div>
  );
}
