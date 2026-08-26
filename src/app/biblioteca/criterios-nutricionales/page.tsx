import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { publicSocialMetadata } from "@/lib/public-social-metadata";
import styles from "../library.module.css";

const title = "Criterios de revisión nutricional | Greenatics";
const description =
  "Criterios técnicos para revisar suelo, etapa, densidad, historial de fertilización y objetivo productivo antes de orientar un programa Wondergreen.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/biblioteca/criterios-nutricionales" },
  ...publicSocialMetadata({ title, description, path: "/biblioteca/criterios-nutricionales" }),
};

const criteria = [
  ["Análisis de suelo", "Fecha, representatividad, pH, materia orgánica, nutrientes, acidez, textura, drenaje y profundidad efectiva.", "Distinguir si el lote necesita corrección, construcción, mantenimiento o recuperación."],
  ["Etapa del cultivo", "Establecimiento, formación, crecimiento, floración, cuajado, llenado, cosecha, renovación o recuperación.", "Ordenar la prioridad fisiológica antes de elegir una familia de producto."],
  ["Densidad y arreglo", "Plantas por hectárea, distancias, edad, sombreo, competencia o intensidad de uso.", "Entender demanda por área y cómo distribuir una aplicación."],
  ["Historial de fertilización", "Fuentes, dosis, frecuencia, vía, épocas, mezclas, enmiendas y respuesta observada.", "Evitar duplicidades y reconocer posibles carencias, excesos o bloqueos."],
  ["Objetivo productivo", "Rendimiento, calidad, calibre, biomasa, carga animal, sostenimiento, renovación o recuperación.", "Definir qué resultado se pretende mover y cómo se medirá."],
] as const;

export default function NutritionalReviewCriteriaPage() {
  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Biblioteca", path: "/biblioteca" },
        { name: "Criterios de revisión nutricional", path: "/biblioteca/criterios-nutricionales" },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Greenatics · criterio técnico</span>
              <h1>Antes de recomendar, hay que entender el lote.</h1>
              <p className={styles.lead}>
                Una fórmula por sí sola no describe la necesidad del cultivo. Esta guía organiza la revisión mínima que conviene hacer antes de definir dosis, frecuencia, mezcla o vía de aplicación.
              </p>
            </div>
            <aside className={styles.warning}>
              <strong>Alcance.</strong>
              <p>Es una herramienta de revisión técnica. No reemplaza análisis de suelo, análisis foliar, ficha técnica vigente ni criterio agronómico local.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Cinco variables</span>
              <h2>La recomendación empieza con información, no con una bolsa.</h2>
            </div>
            <div className={styles.tableWrap} role="region" aria-label="Criterios de revisión nutricional" tabIndex={0}>
              <table className={styles.table}>
                <thead><tr><th>Variable</th><th>Qué revisar</th><th>Qué decisión orienta</th></tr></thead>
                <tbody>
                  {criteria.map(([variable, review, decision]) => (
                    <tr key={variable}><td><strong>{variable}</strong></td><td>{review}</td><td>{decision}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Aplicación por cultivo</span>
              <h2>La misma revisión cambia de énfasis según el sistema productivo.</h2>
              <p>Los programas Wondergreen desarrollan esas diferencias por etapa, alertas y seguimiento.</p>
            </div>
            <div className={styles.libraryGrid}>
              {wondergreenCrops.map((crop) => (
                <article className={styles.libraryCard} key={crop.slug}>
                  <span className={styles.status}>Programa por cultivo</span>
                  <h3>{crop.name}</h3>
                  <p>{crop.context}</p>
                  <Link href={`/wondergreen/cultivos/${crop.slug}`}>Revisar {crop.name} →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sourceGrid}>
              <div><span className={styles.eyebrow}>Principio de decisión</span><h2>Cuando falta una variable, la recomendación debe declararse orientativa.</h2></div>
              <div><p>La web puede ayudar a ordenar la conversación y proponer referencias potencialmente relevantes, pero no debe fingir precisión cuando faltan suelo, etapa, historial o contexto del lote.</p><Link href="/biblioteca/guia-deficiencias">Complementar con guía de deficiencias →</Link></div>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Wondergreen</span><h2>Pasa del criterio general al programa del cultivo.</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/cultivos">Explorar cultivos</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
