import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldApplicationRules, fieldChecklist, getWondergreenCrop, wondergreenCrops } from "@/data/wondergreen-crops";
import { wondergreenReferences } from "@/data/wondergreen-public";
import { getWondergreenVisualTone } from "@/data/wondergreen-visual";
import styles from "../crops.module.css";
import refresh from "../crops-refresh.module.css";

export function generateStaticParams() {
  return wondergreenCrops.map((crop) => ({ slug: crop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) return { title: "Cultivo | Wondergreen" };
  return {
    title: `${crop.name} | Programa Wondergreen`,
    description: `${crop.headline} Programa orientativo por etapa, contexto del lote y seguimiento.`,
  };
}

function relatedReferences(lines: string[]) {
  const families = new Set(lines.map((line) => line.toLowerCase()));
  return wondergreenReferences.filter((reference) => families.has(reference.family.toLowerCase()));
}

export default async function WondergreenCropPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) notFound();

  const programFamilies = [...new Set(crop.stages.flatMap((stage) => stage.lines))];
  const references = relatedReferences(programFamilies);

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Programa Wondergreen · {crop.name}</span>
              <h1>{crop.headline}</h1>
              <p className={styles.lead}>{crop.intro}</p>
            </div>
            <aside className={styles.heroAside}>
              <strong>Contexto antes de producto.</strong>
              <p>{crop.context}</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionWhite}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Ruta por etapa</span>
              <h2>El programa cambia con el momento del cultivo.</h2>
              <p>Las familias indicadas son referencias potencialmente relevantes dentro de un programa. No sustituyen diagnóstico, ficha técnica ni recomendación final.</p>
            </div>
            <div className={styles.stageGrid}>
              {crop.stages.map((stage, index) => (
                <article className={styles.stageCard} key={stage.moment}>
                  <span>{String(index + 1).padStart(2, "0")} · {stage.moment}</span>
                  <div className={styles.tags}>{stage.lines.map((line) => <span className={styles.tag} key={line}>{line}</span>)}</div>
                  <p>{stage.goal}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Antes de recomendar</span>
              <h2>Seis comprobaciones de campo.</h2>
            </div>
            <div className={styles.guidanceGrid}>
              <article className={styles.guidanceCard}>
                <h3>Leer el lote</h3>
                <ul>{fieldChecklist.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
              <article className={styles.guidanceCard}>
                <h3>Aplicar con contexto</h3>
                <ul>{fieldApplicationRules.map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            </div>
            <div className={styles.truth}><strong>Regla Wondergreen:</strong> síntomas visuales, etapa y fórmula orientan la conversación, pero la dosis, compatibilidad, vía y frecuencia se cierran con la versión técnica vigente y el contexto real del lote.</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Alertas y seguimiento</span>
              <h2>Aplicar es solo una parte del programa.</h2>
              <p>El valor está en observar, registrar y ajustar antes de convertir una hipótesis en una recomendación repetida.</p>
            </div>
            <div className={styles.darkGrid}>
              <article className={styles.darkCard}><h3>Precauciones</h3><ul>{crop.cautions.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className={styles.darkCard}><h3>Alertas de diagnóstico</h3><ul>{crop.alerts.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className={styles.darkCard}><h3>Qué seguir</h3><ul>{crop.followUp.map((item) => <li key={item}>{item}</li>)}</ul></article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionWhite}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Product Master relacionado</span>
              <h2>Referencias que aparecen en este programa.</h2>
              <p>El estado comercial se muestra de forma explícita para no confundir una referencia técnica con un SKU confirmado para compra. Cada tarjeta abre la ficha gobernada de la referencia exacta.</p>
            </div>
            <div className={styles.referenceGrid}>
              {references.map((reference) => {
                const tone = getWondergreenVisualTone(reference);
                return (
                  <Link className={`${styles.referenceCard} ${refresh.referenceCard}`} data-tone={tone} href={`/wondergreen/productos/${reference.slug}`} key={reference.slug}>
                    <span>{reference.publicStatus}</span>
                    <h3>{reference.name}{reference.formula ? ` · ${reference.formula}` : ""}</h3>
                    <p>{reference.role}</p>
                    <small>{reference.stage}</small>
                    <strong>Ver ficha →</strong>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente decisión</span><h2>¿Quieres convertir esta ruta en un programa para tu lote?</h2></div>
            <div><Link className={`${styles.button} ${styles.primary}`} href="/wondergreen#contacto">Hablar con equipo técnico</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
