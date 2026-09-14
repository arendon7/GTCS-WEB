import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldApplicationRules, fieldChecklist, getWondergreenCrop, wondergreenCrops } from "@/data/wondergreen-crops";
import { getWondergreenCropDocument } from "@/data/wondergreen-crop-documents";
import { wondergreenReferences } from "@/data/wondergreen-public";
import { getWondergreenVisualTone } from "@/data/wondergreen-visual";
import styles from "../crops.module.css";
import refresh from "../crops-refresh.module.css";
import docStyles from "./crop-document.module.css";

export function generateStaticParams() {
  return wondergreenCrops.map((crop) => ({ slug: crop.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) return { title: "Cultivo | Wondergreen" };
  const guide = getWondergreenCropDocument(slug);
  return {
    title: `${crop.name} | Programa Wondergreen`,
    description: guide
      ? `${crop.headline} Consulta el programa navegable y abre la guía Wondergreen completa en PDF.`
      : `${crop.headline} Programa por etapa, contexto del lote y seguimiento.`,
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
  const guide = getWondergreenCropDocument(slug);

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero} aria-labelledby="crop-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>{guide ? "Guía oficial Wondergreen" : "Programa Wondergreen"} · {crop.name}</span>
              <h1 id="crop-title">{crop.headline}</h1>
              <p className={styles.lead}>{crop.intro}</p>
              <p className={styles.lead}>{crop.context}</p>
            </div>

            {guide ? (
              <aside className={docStyles.documentPanel} aria-label={`Documento oficial para ${crop.name}`}>
                <div className={docStyles.coverWrap}>
                  <Image
                    className={docStyles.cover}
                    src={guide.coverImage}
                    alt={`Portada de ${guide.title}`}
                    width={640}
                    height={905}
                    sizes="(max-width: 640px) 72vw, (max-width: 900px) 180px, 250px"
                    priority
                    unoptimized
                  />
                </div>
                <div className={docStyles.documentCopy}>
                  <span className={docStyles.documentStatus}>Documento completo publicado</span>
                  <h2>{guide.title}</h2>
                  <p>{guide.copy}</p>
                  <div className={docStyles.documentMeta}>
                    <div><span>Master</span><strong>{guide.masterLabel}</strong></div>
                    <div><span>Autoridad</span><strong>{guide.sourceAuthority}</strong></div>
                    <div><span>Entrega</span><strong>PDF público same-origin + contexto web navegable</strong></div>
                  </div>
                  <div className={docStyles.documentActions}>
                    <a className={docStyles.openButton} href={guide.openHref} target="_blank" rel="noreferrer">Abrir PDF original ↗</a>
                    <a className={docStyles.downloadButton} href={guide.attachmentHref}>Descargar PDF ↓</a>
                    <Link className={docStyles.libraryButton} href="/biblioteca#recursos">Ver en Biblioteca →</Link>
                  </div>
                  <p className={docStyles.authorityNote}><strong>Autoridad documental:</strong> esta página organiza la navegación y el contexto. El PDF conserva el desarrollo editorial completo publicado.</p>
                </div>
              </aside>
            ) : (
              <aside className={styles.heroAside}>
                <strong>Contexto antes de producto.</strong>
                <p>{crop.context}</p>
              </aside>
            )}
          </div>
        </section>

        {guide ? (
          <nav className={docStyles.documentNav} aria-label={`Contenido del programa ${crop.name}`}>
            <div className={`${styles.container} ${docStyles.documentNavInner}`}>
              <strong>En esta ruta</strong>
              <a href="#etapas">Etapas</a>
              <a href="#comprobaciones">Comprobaciones</a>
              <a href="#seguimiento">Seguimiento</a>
              <a href="#referencias">Productos relacionados</a>
              <a href={guide.openHref} target="_blank" rel="noreferrer">PDF completo ↗</a>
            </div>
          </nav>
        ) : null}

        {guide ? (
          <section className={docStyles.documentAuthority} aria-labelledby="document-authority-title">
            <div className={`${styles.container} ${docStyles.authorityGrid}`}>
              <div>
                <span className={`${styles.eyebrow} ${refresh.eyebrowLight}`}>Documento + navegación</span>
                <h2 id="document-authority-title">La web no reemplaza la guía. La hace más fácil de encontrar y recorrer.</h2>
              </div>
              <div>
                <p>El programa web conecta etapas, comprobaciones de campo, alertas, seguimiento y referencias exactas del Product Master. Cuando necesitas el desarrollo editorial completo, la fuente publicada es la guía PDF asociada a este cultivo.</p>
                <div className={docStyles.authorityFacts}>
                  <article><span>01 · Documento</span><strong>{guide.masterLabel}</strong></article>
                  <article><span>02 · Web</span><strong>Contexto navegable y enlaces a referencias gobernadas.</strong></article>
                  <article><span>03 · Uso</span><strong>Orientación técnica; no sustituye una recomendación específica para el lote.</strong></article>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className={`${styles.section} ${styles.sectionWhite}`} id="etapas">
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

        <section className={styles.section} id="comprobaciones">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Antes de recomendar</span>
              <h2>Seis comprobaciones de campo.</h2>
            </div>
            <div className={styles.guidanceGrid}>
              <article className={styles.guidanceCard}><h3>Leer el lote</h3><ul>{fieldChecklist.map((item) => <li key={item}>{item}</li>)}</ul></article>
              <article className={styles.guidanceCard}><h3>Aplicar con contexto</h3><ul>{fieldApplicationRules.map((item) => <li key={item}>{item}</li>)}</ul></article>
            </div>
            <div className={styles.truth}><strong>Programa Wondergreen:</strong> la ruta web permite navegar por etapa y conectar referencias; {guide ? "la guía PDF conserva el desarrollo técnico editorial completo del cultivo." : "la recomendación final exige contexto de lote."}</div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionDark}`} id="seguimiento">
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

        <section className={`${styles.section} ${styles.sectionWhite}`} id="referencias">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Product Master relacionado</span>
              <h2>Referencias que aparecen en este programa.</h2>
              <p>Cada tarjeta abre la ficha pública de la referencia exacta. El PDF y el Product Master siguen siendo fuentes distintas: uno desarrolla el programa por cultivo y el otro gobierna la referencia de producto.</p>
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
            <div><span className={styles.eyebrow}>Siguiente decisión</span><h2>¿Quieres llevar esta guía al contexto real de tu lote?</h2></div>
            <div className={styles.guideActions}>
              {guide ? <a className={`${styles.button} ${styles.primary}`} href={guide.openHref} target="_blank" rel="noreferrer">Abrir guía PDF</a> : null}
              {guide ? <a className={styles.button} href={guide.attachmentHref}>Descargar PDF</a> : null}
              <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen#contacto">Hablar con equipo técnico</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
