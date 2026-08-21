import type { Metadata } from "next";
import Link from "next/link";
import { homeGardenGuides } from "@/data/home-garden";
import styles from "../casa-jardin.module.css";

export const metadata: Metadata = {
  title: "Guías | Casa, Jardín y Vivero",
  description: "Guías Wondergreen Casa & Jardín sobre etapas, huerta y trasplante, acompañadas por contenido navegable y guardrails de uso.",
  alternates: { canonical: "/casa-jardin/guias" },
  robots: { index: false, follow: true },
};

const guideContent = {
  "casa-jardin": ["Identifica primero la etapa: suelo, crecimiento, mantenimiento, floración o producción.", "Usa OBSERVA → IDENTIFICA → ELIGE → APLICA → REVISA.", "No conviertas un síntoma aislado en una receta nutricional.", "Trabaja con humedad adecuada y no acumules pellets contra el tallo.", "Detén la fertilización si hay encharcamiento, raíces comprometidas o marchitez severa."],
  "mi-huerta": ["PREPARA: condición del sustrato antes de exigir producción.", "CRECE: etapa vegetativa.", "FLORECE: cambia de lógica cuando aparecen botones y flores.", "FRUCTIFICA: acompaña la etapa productiva sin prometer rendimiento.", "La secuencia es por etapas; no significa aplicar todo al mismo tiempo."],
  etapas: ["CRECE = 2Grow Sólido 15-3-3.", "EQUILIBRA = 2Balance Sólido 7-7-7.", "FLORECE = 2Bloom Sólido 3-8-3.", "FRUCTIFICA = 2Fruit Sólido 3-3-8.", "COMPOST = materia orgánica y acondicionamiento del sustrato."],
  trasplante: ["Prioriza drenaje y estructura del sustrato.", "Manipula raíces con cuidado y evita sobrecompactar.", "Mantén humedad adecuada sin encharcar.", "Espera estabilidad antes de escoger una etapa nutricional.", "La guía es educativa; no habilita el Kit Trasplanta & Arranca bloqueado."],
} as const;

const guideDownloads: Record<string, string> = {
  "casa-jardin": "/api/public-resources/home-garden-guide-casa-jardin",
  "mi-huerta": "/api/public-resources/home-garden-guide-mi-huerta",
  etapas: "/api/public-resources/home-garden-guide-etapas",
  trasplante: "/api/public-resources/home-garden-guide-trasplante",
};

export default function CasaJardinGuiasPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · biblioteca</span>
              <h1>Guías para observar antes de aplicar.</h1>
              <p className={styles.lead}>El conocimiento del handoff vive aquí de forma navegable y ahora se acompaña por cuatro masters públicos reconstruidos desde el contenido gobernado y los activos Wondergreen aprobados. La web sigue siendo la autoridad para límites, estados y actualizaciones.</p>
              <div className={styles.actions}><Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin">← Volver a Casa, Jardín y Vivero</Link></div>
            </div>
            <aside className={styles.heroVisual}><p className={styles.heroNote}>DEL PDF A CONTENIDO NAVEGABLE</p><strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 1 }}>Conocimiento que acompaña la decisión.</strong></aside>
          </div>
        </section>

        {homeGardenGuides.map((guide, index) => (
          <section className={`${styles.section} ${index % 2 ? styles.soft : ""}`} id={guide.id} key={guide.id}>
            <div className={styles.container}>
              <div className={styles.sectionHead}>
                <div><span className={styles.eyebrow}>Guía {String(index + 1).padStart(2, "0")}</span><h2>{guide.title}</h2></div>
                <p>{guide.summary}</p>
              </div>
              <div className={styles.decisionGrid}>
                {guideContent[guide.id as keyof typeof guideContent].map((item, itemIndex) => <article className={styles.decisionCard} key={item}><span className={styles.eyebrow}>{String(itemIndex + 1).padStart(2, "0")}</span><p><strong>{item}</strong></p></article>)}
              </div>
              <div className={styles.guardrail}>
                <strong>Master público reconstruido y verificado.</strong>
                <p>El PDF descargable fue reconstruido desde este contenido gobernado y activos Wondergreen aprobados, renderizado y revisado antes de publicación. No se presenta como una copia byte a byte del binario histórico del handoff.</p>
                <div className={styles.actions}>
                  <a className={`${styles.button} ${styles.primary}`} href={guideDownloads[guide.id]} target="_blank" rel="noreferrer">Descargar PDF →</a>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className={`${styles.section} ${styles.release}`}><div className={styles.container}><div className={styles.guardrail}><strong>Las guías no reemplazan diagnóstico ni Product Truth.</strong><p>Dosis domésticas, frecuencia, equivalencias del dosificador, presentaciones B2C y claims finales siguen subordinados a validación técnica y comercial.</p></div></div></section>
      </main>
    </div>
  );
}
