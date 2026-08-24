import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { HomeGardenKitStageRail } from "@/components/home-garden-kit-stage-rail";
import { getHomeGardenProduct, visibleHomeGardenKits } from "@/data/home-garden";
import styles from "../casa-jardin.module.css";

export const metadata: Metadata = {
  title: "Kits por uso | Wondergreen Casa & Jardín",
  description:
    "Kits Casa & Jardín organizados por contexto de uso y etapas Wondergreen, en pre-lanzamiento y sin checkout, PVP ni dosis universales publicadas.",
  alternates: { canonical: "/casa-jardin/kits" },
  robots: { index: false, follow: true },
};

export default function HomeGardenKitsPage() {
  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Casa & Jardín", path: "/casa-jardin" },
        { name: "Kits", path: "/casa-jardin/kits" },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin">← Casa & Jardín</Link>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · kits</span>
              <h1>Kits por uso. Etapas separadas.</h1>
              <p className={styles.lead}>
                Los kits reúnen referencias Wondergreen para contextos concretos —plantas verdes, floración, huerta o colecciones más amplias— sin convertir el conjunto en una mezcla ni en una secuencia obligatoria. Cada planta entra por su etapa y condición.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#catalogo">Ver kits</a>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">Ver productos por etapa</Link>
              </div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>PRE-LANZAMIENTO · SIN CHECKOUT</p>
              <strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 1 }}>
                El kit organiza opciones. No prescribe aplicaciones.
              </strong>
              <p style={{ color: "#d5e2dc", maxWidth: "26rem" }}>
                Las composiciones visuales usan artes aprobados de las líneas Wondergreen para identificar etapas. No son packshots finales de los futuros kits domésticos.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.section} id="catalogo">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Kits visibles</span>
                <h2>Elige por contexto. Después revisa cada etapa.</h2>
              </div>
              <p>
                Solo aparecen las composiciones V1 con estado de pre-lanzamiento. Trasplanta & Arranca permanece bloqueado y no se presenta como kit disponible mientras su componente radicular siga sin Product Truth reconciliado.
              </p>
            </div>
            <div className={styles.kitGrid}>
              {visibleHomeGardenKits.map((kit) => (
                <article className={styles.kitCard} key={kit.id}>
                  <HomeGardenKitStageRail stages={kit.pathway} label={`Composición visual ${kit.name}`} />
                  <span className={styles.eyebrow}>{kit.audience}</span>
                  <h3>{kit.name}</h3>
                  <p><strong>{kit.promise}</strong></p>
                  <ul>
                    {kit.pathway.map((stage) => {
                      const product = getHomeGardenProduct(stage);
                      return <li key={stage}>{product?.consumerName ?? stage}</li>;
                    })}
                  </ul>
                  <p>{kit.guardrail}</p>
                  <Link href={`/casa-jardin/kits/${kit.id}`}>Ver composición y ruta →</Link>
                  <div className={styles.status}>Pre-lanzamiento · compra deshabilitada</div>
                </article>
              ))}
            </div>
            <div className={styles.guardrail}>
              <strong>Trasplanta & Arranca sigue fuera del catálogo visible.</strong>
              <p>La guía educativa de trasplante puede consultarse, pero el kit no se publica hasta que el componente radicular/bioinsumo tenga soporte técnico, regulatorio y comercial suficiente.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Si no sabes cuál encaja</span>
                <h2>La orientación es una capa secundaria.</h2>
              </div>
              <p>
                El orientador ayuda cuando no está clara la etapa o cuando una condición de agua, drenaje, raíces, estrés o sanidad puede hacer que fertilizar todavía no sea el siguiente paso.
              </p>
            </div>
            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/diagnostico">Usar orientador</Link>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/guias">Consultar guías</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
