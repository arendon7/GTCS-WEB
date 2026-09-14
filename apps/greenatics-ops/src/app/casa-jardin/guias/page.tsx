import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import {
  homeGardenPublicDocuments,
  publicDocumentDownloadHref,
  publicDocumentHref,
} from "@/data/home-garden-public-documents";
import styles from "../casa-jardin.module.css";

export const metadata: Metadata = {
  title: "Guías PDF | Casa, Jardín y Vivero",
  description: "Biblioteca documental Wondergreen Casa & Jardín con PDFs públicos para etapas, huerta y trasplante, conectados con productos y guardrails de uso.",
  alternates: { canonical: "/casa-jardin/guias" },
  robots: { index: false, follow: true },
};

export default function CasaJardinGuiasPage() {
  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Casa & Jardín", path: "/casa-jardin" },
        { name: "Guías PDF", path: "/casa-jardin/guias" },
      ]} />
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin">← Casa & Jardín</Link>
              <span className={styles.eyebrow}>Wondergreen Casa & Jardín · documentos</span>
              <h1>Las guías se consultan como documentos completos.</h1>
              <p className={styles.lead}>
                Esta sección deja de reconstruir cada guía como una sucesión de extractos web. La página sirve para descubrir, relacionar y abrir el documento; el PDF público conserva la pieza completa y puede abrirse o descargarse directamente.
              </p>
              <div className={styles.actions}>
                <a className={`${styles.button} ${styles.primary}`} href="#documentos">Ver guías PDF</a>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/productos">Ver productos</Link>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/kits">Ver kits</Link>
              </div>
            </div>
            <aside className={styles.heroVisual}>
              <p className={styles.heroNote}>WEB = CONTEXTO · PDF = DOCUMENTO</p>
              <strong style={{ color: "white", fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 1 }}>
                Abrir. Leer. Descargar.
              </strong>
              <p style={{ color: "#d5e2dc", maxWidth: "28rem" }}>
                Los PDFs públicos actuales fueron reconstruidos y verificados desde contenido gobernado y activos aprobados. No se presentan como copias byte a byte de los binarios históricos del handoff.
              </p>
            </aside>
          </div>
        </section>

        <section className={styles.section} id="documentos">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Biblioteca PDF</span><h2>Cuatro documentos públicos. Sin sustituirlos por resúmenes.</h2></div>
              <p>Cada tarjeta identifica el master fuente, abre el PDF inline y ofrece descarga directa. El contenido técnico de producto sigue gobernado por Product Truth y los límites de uso siguen vigentes aunque la guía sea pública.</p>
            </div>
            <div className={styles.productGrid}>
              {homeGardenPublicDocuments.map((document, index) => (
                <article className={styles.card} id={document.id} key={document.id}>
                  <small>Guía {String(index + 1).padStart(2, "0")} · PDF público verificado</small>
                  <h3>{document.title}</h3>
                  <p>{document.summary}</p>
                  <p><strong>Master fuente</strong><br />{document.sourceMaster}</p>
                  <div className={styles.actions}>
                    <a className={`${styles.button} ${styles.primary}`} href={publicDocumentHref(document)} target="_blank" rel="noreferrer">Abrir PDF ↗</a>
                    <a className={`${styles.button} ${styles.ghost}`} href={publicDocumentDownloadHref(document)}>Descargar ↓</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Conectar documento y producto</span><h2>La guía acompaña; la ficha de producto profundiza la referencia.</h2></div>
              <p>Si una guía menciona una etapa, puedes volver al catálogo Casa & Jardín y abrir la ficha correspondiente para revisar referencia técnica, fórmula cuando aplique, formatos domésticos propuestos, kits relacionados y estado comercial.</p>
            </div>
            <div className={styles.actions}>
              <Link className={`${styles.button} ${styles.primary}`} href="/casa-jardin/productos">Explorar productos por etapa</Link>
              <Link className={`${styles.button} ${styles.ghost}`} href="/wondergreen/productos">Abrir Product Master Wondergreen</Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.release}`}>
          <div className={styles.container}>
            <div className={styles.guardrail}>
              <strong>Las guías no convierten una etapa en prescripción.</strong>
              <p>Dosis domésticas, frecuencia, equivalencias del dosificador, presentaciones B2C y claims finales siguen subordinados a validación técnica, comercial y regulatoria. Si la condición de la planta no está clara, el orientador permanece disponible como ruta secundaria.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.ghost}`} href="/casa-jardin/diagnostico">Usar orientador solo si hay duda</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
