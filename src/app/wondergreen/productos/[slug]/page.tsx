import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWondergreenReference, wondergreenReferences } from "@/data/wondergreen-public";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { getWondergreenVisualTone } from "@/data/wondergreen-visual";
import styles from "./product.module.css";

export function generateStaticParams() {
  return wondergreenReferences.map((reference) => ({ slug: reference.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const reference = getWondergreenReference(slug);
  if (!reference) return { title: "Producto | Wondergreen" };
  return {
    title: `${reference.name}${reference.formula ? ` ${reference.formula}` : ""} | Wondergreen`,
    description: `${reference.role} Estado público: ${reference.publicStatus}.`,
    alternates: { canonical: `/wondergreen/productos/${reference.slug}` },
  };
}

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function relatedCrops(family: string) {
  const target = family.toLowerCase();
  return wondergreenCrops.filter((crop) => crop.stages.some((stage) => stage.lines.some((line) => line.toLowerCase() === target)));
}

function formatLabel(format: string) {
  const labels: Record<string, string> = {
    solid: "Sólido",
    liquid: "Líquido",
    compost: "Compost",
    biological: "Biológico",
    botanical: "Botánico",
  };
  return labels[format] ?? format;
}

export default async function WondergreenProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reference = getWondergreenReference(slug);
  if (!reference) notFound();

  const crops = relatedCrops(reference.family);
  const isCommercial = reference.truthStatus === "commercial-reconciled";
  const contactHref = `/contacto?producto=${encodeURIComponent(reference.slug)}#wondergreen`;
  const visualTone = getWondergreenVisualTone(reference);

  return (
    <div className={styles.page} data-tone={visualTone}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <Link className={styles.back} href="/wondergreen#portafolio">← Volver al portafolio</Link>
              <span className={styles.eyebrow}>Wondergreen · {reference.family}</span>
              <h1>{reference.name}{reference.formula ? <em>{reference.formula}</em> : null}</h1>
              <p className={styles.lead}>{reference.role}</p>
              <div className={styles.heroMeta}>
                <span>{formatLabel(reference.format)}</span>
                <span>{reference.stage}</span>
              </div>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Consultar esta referencia</Link>
                {crops.length > 0 ? <Link className={`${styles.button} ${styles.ghost}`} href={`/wondergreen/cultivos/${crops[0].slug}`}>Ver en cultivo</Link> : null}
              </div>
            </div>

            <aside className={styles.identityPlate} aria-label={`Identidad técnica de ${reference.name}`}>
              <div className={styles.plateTop}>
                <span>Product Master público</span>
                <small>{reference.publicStatus}</small>
              </div>
              <div className={styles.familyMark}>{reference.family}</div>
              {reference.formula ? <strong className={styles.formula}>{reference.formula}</strong> : <strong className={styles.formula}>{formatLabel(reference.format)}</strong>}
              <p>Representación editorial. El packshot se publicará únicamente cuando exista maestro vigente vinculado a esta referencia.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={`${styles.container} ${styles.truthGrid}`}>
            <div>
              <span className={styles.eyebrow}>Estado de producto</span>
              <h2>Qué sabemos hoy y qué todavía debe confirmarse.</h2>
            </div>
            <div className={styles.truthPanel}>
              <div className={styles.statusRow}><span>Estado público</span><strong>{reference.publicStatus}</strong></div>
              <div className={styles.statusRow}><span>Formato</span><strong>{formatLabel(reference.format)}</strong></div>
              <div className={styles.statusRow}><span>Momento / función</span><strong>{reference.stage}</strong></div>
              <div className={styles.statusRow}><span>Condición comercial</span><strong>{isCommercial ? "Reconciliada" : "Requiere confirmación"}</strong></div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Presentaciones y condición comercial</span>
              <h2>Información visible sin fingir disponibilidad.</h2>
              <p>Una presentación documentada no equivale automáticamente a inventario. El equipo confirma existencia, versión, despacho y recomendación antes de cerrar la venta.</p>
            </div>
            <div className={styles.commercialGrid}>
              <article className={styles.infoCard}>
                <span>Presentaciones documentadas</span>
                <div className={styles.tags}>{reference.presentations?.map((item) => <strong key={item}>{item}</strong>) ?? <strong>Por confirmar</strong>}</div>
              </article>
              <article className={styles.infoCard}>
                <span>Precio público reconciliado</span>
                {reference.priceCop ? <><strong className={styles.price}>{money(reference.priceCop)}</strong><small>Base indicada en las notas de la referencia.</small></> : <><strong className={styles.price}>Consultar</strong><small>No se publica precio hasta reconciliar condición comercial.</small></>}
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Product Truth</span>
              <h2>Lo que esta página deliberadamente no promete.</h2>
            </div>
            <div className={styles.notesGrid}>
              {reference.notes.map((note, index) => <article key={note}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></article>)}
              <article><span>{String(reference.notes.length + 1).padStart(2, "0")}</span><p>Dosis, frecuencia, compatibilidad y eficacia se cierran únicamente con la versión técnica vigente y el contexto real del lote.</p></article>
            </div>
          </div>
        </section>

        {crops.length > 0 ? (
          <section className={`${styles.section} ${styles.white}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeading}>
                <span className={styles.eyebrow}>Cultivos relacionados</span>
                <h2>Esta familia aparece dentro de programas por etapa.</h2>
                <p>La relación indica pertinencia potencial dentro de una ruta agronómica; no una receta automática.</p>
              </div>
              <div className={styles.cropGrid}>
                {crops.map((crop) => <Link key={crop.slug} href={`/wondergreen/cultivos/${crop.slug}`}><span>Programa</span><h3>{crop.name}</h3><p>{crop.headline}</p><strong>Explorar cultivo →</strong></Link>)}
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.resources}>
          <div className={`${styles.container} ${styles.resourceGrid}`}>
            <div><span className={styles.eyebrow}>Usar mejor el producto</span><h2>Producto + contexto + aplicación + seguimiento.</h2></div>
            <div className={styles.resourceLinks}>
              <Link href="/biblioteca/manual-uso-wondergreen"><strong>Manual de uso Wondergreen</strong><span>Preparar, aplicar, registrar y revisar →</span></Link>
              <Link href="/biblioteca/criterios-nutricionales"><strong>Criterios de revisión nutricional</strong><span>Qué comprobar antes de recomendar →</span></Link>
              <Link href="/biblioteca/guia-deficiencias"><strong>Guía de deficiencias</strong><span>Leer síntomas y confundidores →</span></Link>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>¿Quieres validar esta referencia para tu cultivo o negocio?</h2></div>
            <div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Hablar con Greenatics</Link><Link className={`${styles.button} ${styles.ghost}`} href="/wondergreen">Ver Wondergreen</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
