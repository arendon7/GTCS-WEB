import type { Metadata } from "next";
import Link from "next/link";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import styles from "./crops.module.css";

export const metadata: Metadata = {
  title: "Cultivos | Wondergreen",
  description: "Programas orientativos Wondergreen por cultivo, etapa, condición del lote y objetivo agronómico.",
};

export default function WondergreenCropsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <Link href="/wondergreen" aria-label="Volver a Wondergreen">
            <img className={styles.logo} src="/brand/greenatics-horizontal.webp" alt="Greenatics" width="360" height="66" />
          </Link>
          <Link className={styles.headerLink} href="/wondergreen">Wondergreen</Link>
          <Link className={`${styles.button} ${styles.primary}`} href="/app">Acceder a Greenatics</Link>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · por cultivo</span>
              <h1>El cultivo cambia la pregunta.</h1>
              <p className={styles.lead}>Una misma referencia no debe explicarse igual para café, cacao, aguacate, cítricos o pastos. Estas rutas convierten las guías ya construidas en programas web orientativos, con alertas y seguimiento.</p>
            </div>
            <aside className={styles.heroAside}>
              <strong>No es una receta automática.</strong>
              <p>Cada programa debe cruzarse con etapa real, suelo, agua, manejo, carga productiva y análisis disponibles antes de cerrar una recomendación.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionWhite}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Biblioteca inicial</span>
              <h2>Cinco programas técnicos ya estructurados.</h2>
              <p>Los conservamos desde el trabajo previo y los hacemos navegables sin forzarlos a una secuencia idéntica.</p>
            </div>
            <div className={styles.cropGrid}>
              {wondergreenCrops.map((crop) => (
                <article className={styles.cropCard} key={crop.slug}>
                  <span className={styles.eyebrow}>Programa de campo</span>
                  <h3>{crop.name}</h3>
                  <p>{crop.headline}</p>
                  <p>{crop.intro}</p>
                  <Link href={`/wondergreen/cultivos/${crop.slug}`}>Abrir programa →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Principio de uso</span>
              <h2>Cultivo → etapa → objetivo → contexto → solución potencial.</h2>
              <p>Las páginas de cultivo son una capa de orientación. El siguiente paso será conectar síntomas, análisis, Product Master y bioinsumos para formar el Finder sin convertirlo en prescripción autónoma.</p>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Wondergreen</span><h2>¿No encuentras tu cultivo?</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen#contacto">Hablar con equipo técnico</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerInner}`}><span>© Greenatics S.A.S. · Wondergreen</span><Link href="/">Volver a Greenatics</Link></div>
      </footer>
    </div>
  );
}
