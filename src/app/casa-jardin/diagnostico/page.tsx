import type { Metadata } from "next";
import Link from "next/link";
import { HomeGardenDiagnostic } from "./home-garden-diagnostic";
import styles from "../casa-jardin.module.css";

export const metadata: Metadata = {
  title: "Diagnóstico orientativo | Casa, Jardín y Vivero",
  description: "Identifica etapa y condición antes de elegir una línea Wondergreen. El diagnóstico detiene la recomendación si encuentra señales de estrés, exceso de agua, raíces o sanidad.",
  alternates: { canonical: "/casa-jardin/diagnostico" },
  robots: { index: false, follow: true },
};

type DiagnosticSearchParams = {
  plant?: string | string[];
  stage?: string | string[];
  condition?: string | string[];
  count?: string | string[];
  pots?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CasaJardinDiagnosticoPage({ searchParams }: { searchParams: Promise<DiagnosticSearchParams> }) {
  const query = await searchParams;
  const initial = {
    plantType: firstParam(query.plant),
    stage: firstParam(query.stage),
    condition: firstParam(query.condition),
    plantCount: firstParam(query.count),
    potSizes: firstParam(query.pots),
  };

  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · diagnóstico</span>
              <h1>Deja de fertilizar a ciegas.</h1>
              <p className={styles.lead}>Este flujo no intenta diagnosticar una planta por una sola señal. Primero identifica etapa y condición; si hay un factor de riesgo, la recomendación es detener la fertilización y revisar la causa.</p>
              <div className={styles.actions}><Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin">← Volver a Casa, Jardín y Vivero</Link></div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>NO NECESITA MÁS. NECESITA LO CORRECTO.</p>
              <strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 1 }}>Observa antes de aplicar.</strong>
            </aside>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Flujo orientativo</span><h2>Etapa + condición antes de producto.</h2></div>
              <p>La cantidad de plantas se captura únicamente para preparar una futura recomendación de formato. No se traduce todavía en gramos, cucharadas, cobertura ni frecuencia.</p>
            </div>
            <HomeGardenDiagnostic initial={initial} />
          </div>
        </section>
      </main>
    </div>
  );
}
