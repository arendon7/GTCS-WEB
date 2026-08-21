import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicResources } from "@/data/public-resources";
import { fieldApplicationRules, fieldChecklist, getWondergreenCrop, wondergreenCrops } from "@/data/wondergreen-crops";
import { wondergreenReferences } from "@/data/wondergreen-public";
import { getWondergreenVisualTone } from "@/data/wondergreen-visual";
import styles from "../crops.module.css";
import refresh from "../crops-refresh.module.css";

const cropGuideResourceIds: Record<string, string> = {
  cafe: "wondergreen-guide-cafe",
  cacao: "wondergreen-guide-cacao",
  aguacate: "wondergreen-guide-aguacate",
  "limon-tahiti": "wondergreen-guide-limon-tahiti",
  "pastos-gramineas": "wondergreen-guide-pastos",
};

export function generateStaticParams() {
  return wondergreenCrops.map((crop) => ({ slug: crop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) return { title: "Cultivo | Wondergreen" };
  return {
    title: `${crop.name} | Programa Wondergreen`,
    description: `${crop.headline} Programa por etapa, contexto del lote, seguimiento y guía Wondergreen descargable.`,
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
  const guideResourceId = cropGuideResourceIds[slug];
  const guide = guideResourceId ? publicResources.find((resource) => resource.id === guideResourceId) : undefined;

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
            <aside className={`${styles.heroAside} ${guide?.coverImage ? styles.guideAside : ""}`}>
              {guide?.coverImage ? (
                <Image className={styles.guideCover} src={guide.coverImage} alt={`Portada de ${guide.title}`} width={640} height={905} sizes="(max-width: 900px) 50vw, 320px" priority unoptimized />
              ) : null}
              <div>
                <strong>{guide ? "Guía completa disponible." : "Contexto antes de producto."}</strong>
                <p>{guide ? `Consulta este programa en la web o abre la guía editorial completa para ${crop.name}.` : crop.context}</p>
                {guide?.downloadHref ? (
                  <div className={styles.guideActions}>
                    <a className={`${styles.button} ${styles.primary}`} href={guide.downloadHref} target="_blank" rel="noreferrer">Descargar guía PDF ↓</a>
                    <Link className={styles.guideLibraryLink} href="/biblioteca#recursos">Ver en Biblioteca →</Link>
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionWhite}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Ruta por etapa</span>
              <h2>El programa cambia con el momento del cultivo.</h2>
              <p>Las familias indicadas conectan el cultivo con las referencias Wondergreen y con la guía técnica completa.</p>
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
              <article className={styles.guidanceCard}><h3>Leer el lote</h3><ul>{fieldChecklist.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className={styles.guidanceCard}><h3>Aplicar con contexto</h3><ul>{fieldApplicationRules.map((item) => <li key={item}>{item}</li>)}</ul></article>
            </div>
            <div className={styles.truth}><strong>Programa Wondergreen:</strong> usa la ruta web para navegar por etapa y la guía descargable para consultar el desarrollo técnico completo del cultivo.</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Alertas y seguimiento</span>
              <h2>Aplicar es solo una parte del programa.</h2>
              <p>El valor está en observar, registrar y ajustar con la respuesta real del cultivo.</p>
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
              <p>Cada tarjeta abre la ficha pública de la referencia exacta y complementa la guía descargable.</p>
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
            <div className={styles.guideActions}>
              {guide?.downloadHref ? <a className={`${styles.button} ${styles.primary}`} href={guide.downloadHref} target="_blank" rel="noreferrer">Descargar PDF</a> : null}
              <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen#contacto">Hablar con equipo técnico</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
