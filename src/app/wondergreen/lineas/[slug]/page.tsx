import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getWondergreenProductArtwork, getWondergreenProductDocuments } from "@/data/wondergreen-product-assets";
import { getWondergreenLineReferences, getWondergreenProductLine, wondergreenProductLines } from "@/data/wondergreen-product-lines";
import { publicSocialMetadata } from "@/lib/public-social-metadata";
import styles from "../lines.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return wondergreenProductLines.map((line) => ({ slug: line.slug }));
}

function formatLabel(format: string) {
  return format === "solid" ? "Sólido" : format === "liquid" ? "Líquido" : format;
}

function uniqueGuides(line: NonNullable<ReturnType<typeof getWondergreenProductLine>>) {
  const byId = new Map<string, ReturnType<typeof getWondergreenProductDocuments>["guides"][number]>();
  for (const reference of getWondergreenLineReferences(line)) {
    for (const guide of getWondergreenProductDocuments(reference).guides) byId.set(guide.id, guide);
  }
  return [...byId.values()];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const line = getWondergreenProductLine(slug);
  if (!line) return { title: "Línea Wondergreen" };
  const title = `${line.family} | Línea Wondergreen`;
  const description = `${line.headline} Revisa sus formulaciones, formatos, presentaciones, estado comercial y documentación vinculada antes de elegir una referencia exacta.`;
  const path = `/wondergreen/lineas/${line.slug}` as `/${string}`;
  return { title, description, alternates: { canonical: path }, ...publicSocialMetadata({ title, description, path }) };
}

export default async function WondergreenLinePage({ params }: Props) {
  const { slug } = await params;
  const line = getWondergreenProductLine(slug);
  if (!line) notFound();

  const references = getWondergreenLineReferences(line);
  const artwork = references[0] ? getWondergreenProductArtwork(references[0]) : null;
  const guides = uniqueGuides(line);
  const catalog = references[0] ? getWondergreenProductDocuments(references[0]).catalog : null;
  const commercialCount = references.filter((reference) => reference.truthStatus === "commercial-reconciled").length;

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Wondergreen", path: "/wondergreen" },
        { name: "Líneas", path: "/wondergreen/lineas" },
        { name: line.family, path: `/wondergreen/lineas/${line.slug}` as `/${string}` },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={styles.back} href="/wondergreen/lineas">← Volver a líneas</Link>
              <span className={styles.eyebrow}>Wondergreen · Línea {line.number}</span>
              <h1>{line.family}</h1>
              <p className={styles.lead}>{line.headline} {line.description}</p>
              <div className={styles.lineMeta}>
                <span>{references.length} referencias documentadas</span>
                <span>{commercialCount} comerciales reconciliadas</span>
              </div>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#referencias">Ver referencias</a>
                <Link className={styles.button} href="/wondergreen/productos">Ver Product Master</Link>
              </div>
            </div>
            {artwork ? (
              <div className={styles.visual}>
                <Image src={artwork.href} alt={artwork.alt} width={700} height={700} unoptimized priority />
                <small>{artwork.label}. Identidad aprobada de familia; no se presenta como packshot específico de una formulación o presentación.</small>
              </div>
            ) : null}
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Cómo leer la línea</span><h2>La identidad es común. La verdad técnica sigue siendo individual.</h2></div>
              <p>Una misma familia puede contener sólidos y líquidos, formulaciones distintas y estados comerciales diferentes. Por eso esta página organiza la línea, pero cada referencia conserva su propia ficha pública.</p>
            </div>
            <div className={styles.truthPanel}>
              <div className={styles.truthRow}><span>Familia</span><strong>{line.family}</strong></div>
              <div className={styles.truthRow}><span>Referencias en Product Master</span><strong>{references.length}</strong></div>
              <div className={styles.truthRow}><span>Estado comercial</span><strong>{commercialCount} reconciliadas · {references.length - commercialCount} por confirmar o técnicas</strong></div>
              <div className={styles.truthRow}><span>Regla de lectura</span><strong>Fórmula, formato, presentación y documentación se confirman en la referencia exacta.</strong></div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="referencias">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Referencias de {line.family}</span><h2>Abre el producto exacto que quieres revisar.</h2></div>
              <p>Las referencias comerciales aparecen junto a las técnicas o pendientes de reconciliación, pero nunca comparten estado por asociación de familia.</p>
            </div>
            <div className={styles.referenceGrid}>
              {references.map((reference) => (
                <Link className={styles.referenceCard} href={`/wondergreen/productos/${reference.slug}`} key={reference.slug}>
                  <div className={styles.referenceTop}><span>{reference.publicStatus}</span><small>{formatLabel(reference.format)}</small></div>
                  <h3>{reference.name}</h3>
                  {reference.formula ? <strong className={styles.formula}>{reference.formula}</strong> : null}
                  <p>{reference.role}</p>
                  <div className={styles.referenceMeta}>
                    <span>{reference.stage}</span>
                    {reference.presentations?.map((presentation) => <span key={presentation}>{presentation}</span>)}
                  </div>
                  <strong>Ver ficha de producto →</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Documentación relacionada</span><h2>La línea conecta con documentos; no los reemplaza.</h2></div>
              <p>El catálogo y las guías publicadas mantienen su condición de documentos completos. La ficha individual sigue siendo el lugar para comprobar la referencia exacta.</p>
            </div>
            <div className={styles.docs}>
              {catalog?.downloadHref ? <article className={styles.docCard}><span className={styles.eyebrow}>Catálogo</span><h3>{catalog.title}</h3><p>{catalog.masterLabel}</p><a href={catalog.downloadHref} target="_blank" rel="noreferrer">Abrir PDF →</a></article> : null}
              {guides.map((guide) => <article className={styles.docCard} key={guide.id}><span className={styles.eyebrow}>Guía por cultivo</span><h3>{guide.title}</h3><p>{guide.masterLabel}</p><Link href={guide.href}>Abrir programa y guía →</Link></article>)}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.guardrail}>
              <span className={styles.eyebrow}>Tecnología y evidencia</span>
              <h2>Compartir una línea no significa compartir automáticamente una característica tecnológica.</h2>
              <p>Organomineral, oclusión y lenta liberación se vinculan únicamente a las referencias y versiones que realmente las documenten. La página de tecnología explica los conceptos y sus niveles de evidencia sin extenderlos por asociación.</p>
              <Link className={styles.button} href="/wondergreen/tecnologia">Profundizar en tecnología</Link>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente paso</span><h2>Elige una referencia exacta o conversa sobre la línea {line.family}.</h2></div>
            <div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href={`/contacto?linea=${encodeURIComponent(line.slug)}&source=wondergreen-linea#wondergreen`}>Consultar línea</Link><Link className={styles.button} href="/wondergreen/productos">Ver productos</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
