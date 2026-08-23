import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getWondergreenCropDocument } from "@/data/wondergreen-crop-documents";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import styles from "./crops.module.css";
import refresh from "./crops-refresh.module.css";
import library from "./crops-library.module.css";

export const metadata: Metadata = {
  title: "Cultivos | Wondergreen",
  description: "Programas Wondergreen por cultivo con guías PDF publicadas, lectura por etapa, contexto agronómico y referencias relacionadas.",
};

export default function WondergreenCropsPage() {
  const entries = wondergreenCrops.map((crop) => ({ crop, guide: getWondergreenCropDocument(crop.slug) }));
  const publishedGuides = entries.filter((entry) => entry.guide).length;

  return (
    <div className={`${styles.page} ${refresh.page}`}>
      <main>
        <section className={styles.hero} aria-labelledby="crop-library-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · cultivos + documentos</span>
              <h1 id="crop-library-title">El cultivo cambia la pregunta.</h1>
              <p className={styles.lead}>Café, cacao, aguacate, limón Tahití y pastos tienen recorridos distintos. Aquí puedes entrar al programa web o abrir directamente la guía PDF publicada de cada cultivo, sin convertir una orientación general en una receta automática.</p>
              <div className={library.heroActions}>
                <a className={`${styles.button} ${styles.primary}`} href="#guias">Explorar guías</a>
                <Link className={`${styles.button} ${library.heroSecondary}`} href="/wondergreen/finder">Usar Finder Wondergreen</Link>
                <Link className={`${styles.button} ${library.heroSecondary}`} href="/wondergreen/productos">Ver Product Master</Link>
              </div>
              <div className={library.librarySummary} aria-label="Resumen de la biblioteca por cultivo">
                <article><strong>{wondergreenCrops.length}</strong><span>programas por cultivo publicados</span></article>
                <article><strong>{publishedGuides}</strong><span>guías PDF vinculadas a sus rutas</span></article>
                <article><strong>3</strong><span>capas separadas: guía, programa web y Product Master</span></article>
              </div>
            </div>
            <aside className={styles.heroAside}>
              <strong>Documento primero cuando necesitas profundidad.</strong>
              <p>La guía conserva el desarrollo editorial completo. La ruta web ayuda a navegar etapas, alertas y seguimiento. El Product Master gobierna la referencia concreta de producto.</p>
            </aside>
          </div>
        </section>

        <section className={`${styles.section} ${styles.sectionWhite}`} id="guias" aria-labelledby="guide-library-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Biblioteca por cultivo</span>
              <h2 id="guide-library-title">Cinco programas. Cinco guías completas.</h2>
              <p>Cada entrada mantiene visibles el documento publicado y la ruta web. Puedes leer el contexto navegable, abrir el PDF original o descargarlo sin pasar por una fuente privada.</p>
            </div>

            <div className={library.guideGrid}>
              {entries.map(({ crop, guide }) => guide ? (
                <article className={library.guideCard} key={crop.slug}>
                  <div className={library.guideVisual}>
                    <Image
                      className={library.guideCover}
                      src={guide.coverImage}
                      alt={`Portada de ${guide.title}`}
                      width={640}
                      height={905}
                      sizes="(max-width: 520px) 58vw, 176px"
                      unoptimized
                    />
                  </div>
                  <div className={library.guideBody}>
                    <span className={library.guideStatus}>Guía PDF publicada</span>
                    <h3>{crop.name}</h3>
                    <p className={library.guideHeadline}>{crop.headline}</p>
                    <p className={library.guideIntro}>{crop.intro}</p>
                    <div className={library.guideMeta}>
                      <span><strong>Documento:</strong> {guide.masterLabel}</span>
                      <span><strong>Fuente:</strong> {guide.sourceAuthority}</span>
                    </div>
                    <div className={library.guideActions}>
                      <Link className={library.programLink} href={`/wondergreen/cultivos/${crop.slug}`}>Abrir programa →</Link>
                      <a className={library.pdfLink} href={guide.openHref} target="_blank" rel="noreferrer">Abrir PDF ↗</a>
                      <a className={library.downloadLink} href={guide.attachmentHref}>Descargar ↓</a>
                    </div>
                  </div>
                </article>
              ) : (
                <article className={library.fallbackCard} key={crop.slug}>
                  <span className={styles.eyebrow}>Programa web</span>
                  <h3>{crop.name}</h3>
                  <p>{crop.headline}</p>
                  <p>La ruta está disponible, pero no se publica un PDF hasta que exista una relación documental gobernada.</p>
                  <Link href={`/wondergreen/cultivos/${crop.slug}`}>Abrir programa →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={library.authorityBand} aria-labelledby="crop-authority-title">
          <div className={`${styles.container} ${library.authorityGrid}`}>
            <div>
              <span className={`${styles.eyebrow} ${library.authorityEyebrow}`}>Cómo leer esta biblioteca</span>
              <h2 id="crop-authority-title">Tres capas, tres responsabilidades distintas.</h2>
            </div>
            <div>
              <p>Wondergreen conecta conocimiento, contexto de campo y referencias de producto, pero no los fusiona en una sola fuente. La separación evita que una guía general se interprete como dosis cerrada o que una ficha comercial se convierta en recomendación agronómica automática.</p>
              <div className={library.authorityList}>
                <article><span>01</span><div><strong>Guía PDF</strong><small>Conserva el desarrollo editorial completo publicado para el cultivo.</small></div></article>
                <article><span>02</span><div><strong>Programa web</strong><small>Organiza etapa, contexto, alertas, seguimiento y navegación hacia referencias relacionadas.</small></div></article>
                <article><span>03</span><div><strong>Product Master</strong><small>Gobierna formulación, formato, condición pública y ficha exacta de cada referencia.</small></div></article>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="crop-flow-title">
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>Cuando todavía no sabes qué revisar</span>
              <h2 id="crop-flow-title">Cultivo → etapa → objetivo → contexto → solución potencial.</h2>
              <p>Si ya conoces el cultivo, entra a su guía o programa. Si todavía necesitas organizar etapa y evidencia disponible, el Finder funciona como orientación secundaria. Después puedes revisar la referencia exacta en Product Master.</p>
            </div>
            <div className={library.heroActions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/finder">Usar Finder Wondergreen</Link>
              <Link className={styles.button} href="/wondergreen/productos">Explorar Product Master</Link>
              <Link className={styles.button} href="/biblioteca">Abrir Biblioteca técnica</Link>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Wondergreen</span><h2>¿No encuentras tu cultivo?</h2></div>
            <Link className={`${styles.button} ${styles.primary}`} href="/contacto?audience=wondergreen&need=nutricion&source=wondergreen-cultivos">Hablar con equipo técnico</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
