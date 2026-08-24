import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { homeGardenProducts } from "@/data/home-garden";
import styles from "../casa-jardin.module.css";

export const metadata: Metadata = {
  title: "Productos por etapa | Wondergreen Casa & Jardín",
  description:
    "Catálogo Casa & Jardín organizado por etapa: compost, crecimiento, equilibrio, floración y fructificación, con referencias técnicas gobernadas y formatos domésticos aún en validación.",
  alternates: { canonical: "/casa-jardin/productos" },
  robots: { index: false, follow: true },
};

export default function HomeGardenProductsPage() {
  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Casa & Jardín", path: "/casa-jardin" },
        { name: "Productos", path: "/casa-jardin/productos" },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin">← Casa & Jardín</Link>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · productos</span>
              <h1>Primero la etapa. Después la referencia.</h1>
              <p className={styles.lead}>
                El catálogo doméstico organiza cinco entradas gobernadas: suelo, crecimiento, equilibrio, floración y fructificación. Cada una se conecta con una referencia técnica Wondergreen existente; los formatos pequeños siguen en validación y no se publican como SKU comprable.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#catalogo">Ver productos</a>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/kits">Ver kits por uso</Link>
              </div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>PRODUCT TRUTH TÉCNICO · B2C EN PRE-LANZAMIENTO</p>
              <strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 1 }}>
                Cinco entradas. Una lógica por etapa.
              </strong>
              <p style={{ color: "#d5e2dc", maxWidth: "26rem" }}>
                Explorar una etapa no equivale a prescribir fertilización. Agua, drenaje, raíces, estrés y sanidad siguen gobernando si corresponde aplicar o detenerse.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.section} id="catalogo">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Catálogo por etapa</span>
                <h2>Producto visible antes que orientador.</h2>
              </div>
              <p>
                Si ya reconoces la etapa, entra directamente a la referencia. El orientador se reserva para cuando la etapa o la condición de la planta no estén claras.
              </p>
            </div>
            <div className={styles.productGrid}>
              {homeGardenProducts.map((product) => (
                <article className={`${styles.card} ${styles[product.accent]}`} key={product.id}>
                  <div className={styles.stageBar} />
                  <small>{product.id === "prepara" ? "Suelo" : "Etapa"}</small>
                  <h3>{product.consumerName}</h3>
                  <span className={styles.formula}>{product.formula ?? "Compost"}</span>
                  <p>{product.role}</p>
                  <p><strong>{product.prompt}</strong></p>
                  <Link href={`/casa-jardin/productos/${product.id}`}>Ver producto y formatos propuestos →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Cuando hay duda</span>
                <h2>El orientador entra después, no antes.</h2>
              </div>
              <p>
                Si no puedes reconocer la etapa, o hay encharcamiento, raíces comprometidas, marchitez severa, estrés o señales sanitarias, primero revisa la condición. El sistema no calcula dosis universales ni convierte un síntoma aislado en una receta.
              </p>
            </div>
            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Usar orientador de etapa y condición</Link>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/guias">Consultar guías</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
