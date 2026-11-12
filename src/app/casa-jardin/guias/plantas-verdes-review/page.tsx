import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./review.module.css";

export const metadata: Metadata = {
  title: "Revisión local · Borrador visual Plantas Verdes | Wondergreen",
  description: "Vista de revisión interna de seis páginas del borrador visual Plantas Verdes de diez páginas.",
  robots: { index: false, follow: false },
};

const revisedPages = [
  { number: "01", title: "Plantas Verdes", alt: "Portada revisada de Plantas Verdes con el kit Wondergreen completo en un espacio doméstico con plantas." },
  { number: "02", title: "Siete elementos, distintas funciones", alt: "Composición revisada del kit Plantas Verdes con sus productos y accesorios." },
  { number: "05", title: "Antes de regar, mira las raíces", alt: "Una mano revisa las raíces y el drenaje de una planta junto al producto Compost." },
  { number: "06", title: "Nutrir no es aplicar por rutina", alt: "Los productos 2GROW y 2BALANCE junto a una guía de observación y lectura de etiqueta." },
  { number: "07", title: "Sustancias Húmicas: revisa la fórmula", alt: "El producto Sustancias Húmicas junto a raíces y recordatorios para revisar su etiqueta." },
  { number: "09", title: "Jabón Potásico: identifica antes de aplicar", alt: "Una persona examina una hoja con lupa junto al producto Jabón Potásico." },
] as const;

const firstVersionPages = [
  { number: "01", title: "Portada", alt: "Portada de la primera versión de la guía Plantas Verdes, con un kit sobre una mesa entre plantas de interior." },
  { number: "02", title: "Los siete elementos", alt: "Presentación de los siete elementos que aparecen en la primera propuesta del kit Plantas Verdes." },
  { number: "03", title: "Cada planta tiene su ritmo", alt: "Plantas ornamentales en distintos espacios y materas." },
  { number: "04", title: "La luz también dibuja el follaje", alt: "Plantas de interior cerca de una ventana con distintas condiciones de luz." },
  { number: "05", title: "Antes de regar, mira las raíces", alt: "Raíces visibles y compost junto a una matera con salida de drenaje." },
  { number: "06", title: "Nutrir no es aplicar por rutina", alt: "Referencias 2GROW y 2BALANCE incluidas en una página de orientación." },
  { number: "07", title: "Sustancias Húmicas: revisa la fórmula", alt: "Envase de Sustancias Húmicas junto a una planta y sus raíces." },
  { number: "08", title: "Una hoja amarilla no es un diagnóstico", alt: "Una persona observa con lupa una hoja amarilla." },
  { number: "09", title: "Jabón Potásico: identifica antes de aplicar", alt: "Una persona examina una hoja con una lupa y tiene cerca el envase de Jabón Potásico." },
  { number: "10", title: "Observa, anota y vuelve a mirar", alt: "Cuaderno de observación junto a una planta de interior." },
] as const;

export default function PlantasVerdesReviewPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className="container">
          <Link className="back-link" href="/casa-jardin/guias/">← Volver a las guías</Link>
          <p className={styles.eyebrow}>Wondergreen · Casa &amp; Jardín</p>
          <h1>Plantas Verdes: revisión visual del primer borrador.</h1>
          <p className={styles.intro}>Aquí está la iteración visual más reciente recuperada de MKT Studio: seis páginas refinadas del primer borrador de diez. La guía ampliada a 16 páginas es otro entregable; su guion sigue en desarrollo y aún no tiene páginas finales.</p>
          <aside className={styles.notice} aria-label="Estado de revisión">
            <strong>Estas seis páginas V2 pertenecen al borrador visual de diez páginas; no corresponden a la numeración de la guía nueva.</strong>
            <span>La guía de 16 páginas tiene un guion separado. La composición exacta del kit y sus recomendaciones de uso requieren conciliación o fuentes técnicas vigentes antes de convertirse en páginas finales.</span>
          </aside>
          <section className={styles.reviewFocus} aria-labelledby="review-focus-title">
            <h2 id="review-focus-title">En esta revisión, mira sobre todo</h2>
            <ul>
              <li>La portada, los empaques y la composición visual propuesta del kit.</li>
              <li>La lectura de textos e imágenes en una pantalla pequeña.</li>
              <li>El tono: orientar a observar y consultar la etiqueta, sin prometer resultados.</li>
            </ul>
          </section>
          <nav className={styles.contents} aria-label="Revisiones visuales">
            {revisedPages.map((page) => <a key={page.number} href={`#v2-pagina-${page.number}`}>{page.number} <span>{page.title}</span></a>)}
            <a href="#primera-version">Ver el primer lote</a>
          </nav>
        </div>
      </header>

      <section className={styles.gallery} aria-labelledby="v2-gallery-title">
        <div className="container">
          <div className={styles.galleryHeading}>
            <h2 id="v2-gallery-title">Seis refinamientos del borrador de diez páginas</h2>
            <p>La numeración conserva la composición de trabajo anterior. No debe leerse como una previsualización de las 16 páginas nuevas.</p>
          </div>
          {revisedPages.map((page) => {
            const src = `/guides/plantas-verdes-review/v2-pagina-${page.number}.webp`;
            return (
              <figure className={styles.pageFigure} id={`v2-pagina-${page.number}`} key={page.number}>
                <a className={styles.imageLink} href={src} target="_blank" rel="noreferrer" aria-label={`Abrir la página ${page.number} a tamaño completo`}>
                  <Image src={src} alt={page.alt} width={1024} height={1536} sizes="(max-width: 760px) 100vw, 48vw" priority={page.number === "01"} />
                </a>
                <figcaption><span>Página {page.number} · V2 del borrador de 10</span><strong>{page.title}</strong></figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <details className={styles.previousVersion} id="primera-version">
        <summary>Ver la primera composición visual de 10 páginas</summary>
        <div className="container">
          <p>Este lote es el antecedente de las seis revisiones V2 de arriba. Ambos pertenecen al borrador de diez páginas, anterior al guion ampliado.</p>
          <div className={styles.previousGrid}>
            {firstVersionPages.map((page) => {
              const src = `/guides/plantas-verdes-review/pagina-${page.number}.webp`;
              return (
                <figure className={styles.pageFigure} id={`v1-pagina-${page.number}`} key={page.number}>
                  <a className={styles.imageLink} href={src} target="_blank" rel="noreferrer" aria-label={`Abrir la página ${page.number} de la primera versión a tamaño completo`}>
                    <Image src={src} alt={page.alt} width={1024} height={1536} sizes="(max-width: 760px) 100vw, 48vw" />
                  </a>
                  <figcaption><span>Página {page.number} · primer lote</span><strong>{page.title}</strong></figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </details>

      <section className={styles.guidePlan} aria-labelledby="guide-plan-title">
        <div className="container">
          <div className={styles.galleryHeading}>
            <h2 id="guide-plan-title">La guía ampliada de 16 páginas sigue otra secuencia.</h2>
            <p>Este es el estado del guion de MKT Studio. Las imágenes de arriba no llenan estas páginas ni sustituyen sus validaciones.</p>
          </div>
          <div className={styles.planGrid}>
            <article>
              <span>Contenido general</span>
              <h3>Observar antes de actuar</h3>
              <p>Portada y uso de la guía; entorno, luz, agua y drenaje. Páginas 1, 2 y 4–6; se pueden cerrar después de afinar el texto.</p>
            </article>
            <article>
              <span>Composición por conciliar</span>
              <h3>Confirmar qué trae el kit</h3>
              <p>La página 3 y la selección entre referencias de la página 8 deben coincidir con el kit y sus maestros vigentes.</p>
            </article>
            <article>
              <span>Validación técnica pendiente</span>
              <h3>Indicar cómo usar cada producto</h3>
              <p>Compost, 2GROW, 2BALANCE, Sustancias Húmicas, Jabón Potásico y dilución. Páginas 7 y 9–13 esperan etiqueta o ficha técnica vigente.</p>
            </article>
            <article>
              <span>Contenido general</span>
              <h3>Registrar y volver a mirar</h3>
              <p>Una intervención a la vez, seguimiento de la planta y bitácora. Páginas 14–16; se pueden desarrollar sin inventar dosis o compatibilidades.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className="container">
          <p>El borrador visual de diez páginas y sus seis refinamientos V2 son activos de trabajo. La guía de 16 páginas sigue en contenido; ninguna de estas imágenes representa su versión final.</p>
          <Link className="button button--dark" href="/casa-jardin/guias/">Volver a las guías</Link>
        </div>
      </footer>
    </main>
  );
}
