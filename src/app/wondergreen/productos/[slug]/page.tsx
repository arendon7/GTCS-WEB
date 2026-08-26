import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WondergreenProductJsonLd } from "@/components/wondergreen-product-json-ld";
import {
  getWondergreenProductArtwork,
  getWondergreenProductCrops,
  getWondergreenProductDocuments,
} from "@/data/wondergreen-product-assets";
import { getWondergreenReference, wondergreenReferences } from "@/data/wondergreen-public";
import { getWondergreenVisualTone } from "@/data/wondergreen-visual";
import styles from "./product.module.css";
import depth from "./product-depth.module.css";

export function generateStaticParams() {
  return wondergreenReferences.map((reference) => ({ slug: reference.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const reference = getWondergreenReference(slug);
  if (!reference) return { title: "Producto | Wondergreen" };
  return {
    title: `${reference.name}${reference.formula ? ` ${reference.formula}` : ""} | Wondergreen`,
    description: `${reference.role} Consulta formulación, presentaciones, estado público y documentación Wondergreen vinculada.`,
    alternates: { canonical: `/wondergreen/productos/${reference.slug}` },
  };
}

function money(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
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

function publicStatusLabel(status: string) {
  if (status === "commercial-reconciled") return "Estado comercial confirmado";
  if (status === "technical-portfolio") return "Portafolio técnico · condición comercial por confirmar";
  if (status === "development") return "En desarrollo · no disponible comercialmente";
  return "Estado por confirmar";
}

function forceDownloadHref(href: string) {
  return `${href}${href.includes("?") ? "&" : "?"}download=1`;
}

export default async function WondergreenProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reference = getWondergreenReference(slug);
  if (!reference) notFound();

  const crops = getWondergreenProductCrops(reference);
  const artwork = getWondergreenProductArtwork(reference);
  const documents = getWondergreenProductDocuments(reference);
  const isCommercial = reference.truthStatus === "commercial-reconciled";
  const publicStatus = publicStatusLabel(reference.truthStatus);
  const contactHref = `/contacto?producto=${encodeURIComponent(reference.slug)}&source=wondergreen-producto`;
  const visualTone = getWondergreenVisualTone(reference);

  return (
    <div className={styles.page} data-tone={visualTone}>
      <WondergreenProductJsonLd reference={reference} publicStatus={publicStatus} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <Link className={styles.back} href="/wondergreen/productos">← Volver a productos</Link>
              <span className={styles.eyebrow}>Wondergreen · {reference.family}</span>
              <h1>{reference.name}{reference.formula ? <em>{reference.formula}</em> : null}</h1>
              <p className={styles.lead}>{reference.role}</p>
              <div className={styles.heroMeta}>
                <span>{formatLabel(reference.format)}</span>
                <span>{reference.stage}</span>
                <span>{publicStatus}</span>
              </div>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Consultar esta referencia</Link>
                {documents.catalog?.downloadHref ? (
                  <a className={`${styles.button} ${styles.ghost}`} href={documents.catalog.downloadHref} target="_blank" rel="noreferrer">Ver catálogo PDF</a>
                ) : null}
              </div>
            </div>

            {artwork ? (
              <aside className={depth.visualPlate} aria-label={`Activo visual de ${reference.family}`}>
                <Image
                  className={depth.productArtwork}
                  src={artwork.href}
                  alt={artwork.alt}
                  width={900}
                  height={900}
                  sizes="(max-width: 900px) 92vw, 520px"
                  priority
                  unoptimized
                />
                <div className={depth.visualCaption}>
                  <strong>{artwork.label}</strong>
                  <span>Activo aprobado de línea. No se presenta como packshot específico si ese recurso todavía no está vinculado.</span>
                </div>
              </aside>
            ) : (
              <aside className={styles.identityPlate} aria-label={`Identidad técnica de ${reference.name}`}>
                <div className={styles.plateTop}>
                  <span>Información pública de referencia</span>
                  <small>{publicStatus}</small>
                </div>
                <div className={styles.familyMark}>{reference.family}</div>
                {reference.formula ? <strong className={styles.formula}>{reference.formula}</strong> : <strong className={styles.formula}>{formatLabel(reference.format)}</strong>}
                <p>La web mantiene una representación editorial hasta que exista un recurso visual específico aprobado para esta referencia.</p>
              </aside>
            )}
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={`${styles.container} ${styles.truthGrid}`}>
            <div>
              <span className={styles.eyebrow}>Ficha de producto</span>
              <h2>La referencia, su formulación y su condición comercial en un solo lugar.</h2>
            </div>
            <div className={styles.truthPanel}>
              <div className={styles.statusRow}><span>Estado público</span><strong>{publicStatus}</strong></div>
              <div className={styles.statusRow}><span>Familia</span><strong>{reference.family}</strong></div>
              {reference.formula ? <div className={styles.statusRow}><span>Formulación declarada</span><strong>{reference.formula}</strong></div> : null}
              <div className={styles.statusRow}><span>Formato</span><strong>{formatLabel(reference.format)}</strong></div>
              <div className={styles.statusRow}><span>Momento / función</span><strong>{reference.stage}</strong></div>
              <div className={styles.statusRow}><span>Condición comercial</span><strong>{isCommercial ? "Confirmada" : "Requiere confirmación"}</strong></div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Presentaciones</span>
              <h2>Tamaños documentados, separados de inventario y disponibilidad.</h2>
              <p>Que una presentación esté documentada no equivale automáticamente a inventario disponible. La cotización confirma versión, despacho y condición comercial.</p>
            </div>
            <div className={styles.commercialGrid}>
              <article className={styles.infoCard}>
                <span>Presentaciones documentadas</span>
                <div className={styles.tags}>{reference.presentations?.map((item) => <strong key={item}>{item}</strong>) ?? <strong>Por confirmar</strong>}</div>
              </article>
              <article className={styles.infoCard}>
                <span>Precio público</span>
                {reference.priceCop ? <><strong className={styles.price}>{money(reference.priceCop)}</strong><small>Base indicada en las notas de la referencia.</small></> : <><strong className={styles.price}>Consultar</strong><small>No se publica precio hasta confirmar la condición comercial.</small></>}
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Documentación oficial</span>
              <h2>Abre o descarga los documentos aprobados, no una reconstrucción de ellos.</h2>
              <p>La página web organiza la referencia y sus relaciones. Los PDF publicados conservan el diseño y contenido del documento editorial aprobado, con acciones separadas para lectura y descarga.</p>
            </div>
            <div className={depth.documentGrid}>
              {documents.catalog?.downloadHref ? (
                <article className={depth.documentCard}>
                  {documents.catalog.coverImage ? <Image src={documents.catalog.coverImage} alt={`Portada de ${documents.catalog.title}`} width={520} height={735} unoptimized /> : null}
                  <div>
                    <span>{documents.catalog.statusLabel}</span>
                    <h3>{documents.catalog.title}</h3>
                    <p>{documents.catalog.masterLabel}</p>
                    <div className={depth.documentActions}>
                      <a href={documents.catalog.downloadHref} target="_blank" rel="noreferrer">Abrir catálogo PDF →</a>
                      <a href={forceDownloadHref(documents.catalog.downloadHref)}>{documents.catalog.downloadLabel ?? "Descargar catálogo PDF"} ↓</a>
                    </div>
                  </div>
                </article>
              ) : null}

              {documents.guides.map((guide) => (
                <article className={depth.documentCard} key={guide.id}>
                  {guide.coverImage ? <Image src={guide.coverImage} alt={`Portada de ${guide.title}`} width={520} height={735} unoptimized /> : null}
                  <div>
                    <span>{guide.statusLabel}</span>
                    <h3>{guide.title}</h3>
                    <p>{guide.masterLabel}</p>
                    <div className={depth.documentActions}>
                      <Link href={guide.href}>Ver programa web</Link>
                      {guide.downloadHref ? <a href={guide.downloadHref} target="_blank" rel="noreferrer">Abrir PDF →</a> : null}
                      {guide.downloadHref ? <a href={forceDownloadHref(guide.downloadHref)}>{guide.downloadLabel ?? "Descargar guía PDF"} ↓</a> : null}
                    </div>
                  </div>
                </article>
              ))}

              <article className={`${depth.documentCard} ${depth.pendingDocument}`}>
                <div><span>Documento individual</span><h3>{documents.technicalSheet.label}</h3><p>{documents.technicalSheet.note}</p><strong>Pendiente de vincular documento público</strong></div>
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Condiciones y cautelas</span>
              <h2>La ficha pública no convierte el producto en una receta universal.</h2>
              <p>Dosis, frecuencia, compatibilidad, vía y eficacia solo se publican cuando la documentación vigente y el contexto agronómico las soportan.</p>
            </div>
            <div className={styles.notesGrid}>
              {reference.notes.map((note, index) => <article key={note}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></article>)}
              <article><span>{String(reference.notes.length + 1).padStart(2, "0")}</span><p>La recomendación final debe cruzar cultivo, etapa, suelo, agua, manejo y documentación técnica vigente.</p></article>
            </div>
          </div>
        </section>

        {crops.length > 0 ? (
          <section className={`${styles.section} ${styles.white}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeading}>
                <span className={styles.eyebrow}>Cultivos relacionados</span>
                <h2>Esta familia aparece dentro de programas por etapa.</h2>
                <p>Cada programa abre también su guía PDF editorial cuando existe un documento público aprobado.</p>
              </div>
              <div className={styles.cropGrid}>
                {crops.map((crop) => <Link key={crop.slug} href={`/wondergreen/cultivos/${crop.slug}`}><span>Programa</span><h3>{crop.name}</h3><p>{crop.headline}</p><strong>Explorar cultivo →</strong></Link>)}
              </div>
            </div>
          </section>
        ) : null}

        <section className={styles.resources}>
          <div className={`${styles.container} ${styles.resourceGrid}`}>
            <div><span className={styles.eyebrow}>Conocimiento relacionado</span><h2>Producto, criterio técnico y seguimiento.</h2></div>
            <div className={styles.resourceLinks}>
              {documents.webResources.map((resource) => (
                <Link href={resource.href} key={resource.id}><strong>{resource.title}</strong><span>{resource.cta} →</span></Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>¿Quieres confirmar esta referencia para tu cultivo o negocio?</h2></div>
            <div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href={contactHref}>Hablar con Greenatics</Link><Link className={`${styles.button} ${styles.ghost}`} href="/wondergreen/productos">Ver todos los productos</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
