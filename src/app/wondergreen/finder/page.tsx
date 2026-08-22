import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { WondergreenFinder } from "./finder-client";
import styles from "./finder.module.css";

export const metadata: Metadata = {
  title: "Finder Wondergreen | Cultivo, etapa y contexto",
  description: "Organiza cultivo, etapa y evidencia disponible antes de revisar un programa Wondergreen o llevar el contexto al equipo técnico.",
  alternates: { canonical: "/wondergreen/finder" },
  robots: { index: false, follow: true },
};

function FinderFallback() {
  return (
    <div className={styles.finderShell} aria-busy="true">
      <div className={styles.result}>
        <div><span>Finder Wondergreen</span><h2>Cargando contexto…</h2><p>Estamos preparando los cinco programas publicados sin generar recomendaciones automáticas.</p></div>
      </div>
    </div>
  );
}

export default function WondergreenFinderPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · Finder V1</span>
              <h1>Empieza por el cultivo y la etapa.</h1>
              <p className={styles.lead}>Este Finder organiza una ruta ya publicada. No intenta diagnosticar por síntomas, calcular dosis ni convertir una familia del programa en una prescripción automática.</p>
              <Link className={styles.back} href="/wondergreen/cultivos">← Ver todos los programas por cultivo</Link>
            </div>
            <aside className={styles.heroAside}>
              <strong>Alcance gobernado.</strong>
              <p>V1 trabaja únicamente con Café, Cacao, Aguacate, Limón Tahití y Pastos/Gramíneas. Si el cultivo o la etapa no están claros, el flujo se detiene y deriva a programa o soporte técnico.</p>
            </aside>
          </div>
        </section>

        <section className={styles.section} aria-label="Finder Wondergreen">
          <div className={styles.container}>
            <Suspense fallback={<FinderFallback />}>
              <WondergreenFinder />
            </Suspense>
          </div>
        </section>
      </main>
    </div>
  );
}
