import Image from "next/image";
import Link from "next/link";
import { getWondergreenProductArtwork } from "@/data/wondergreen-product-assets";
import {
  getWondergreenLineCommercialReferences,
  getWondergreenLineReferences,
  getWondergreenLineTechnicalReferences,
  wondergreenProductLines,
} from "@/data/wondergreen-product-lines";
import styles from "./lines.module.css";

export default function WondergreenProductLinesPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero} aria-labelledby="lines-title">
          <div className={styles.heroAccent} aria-hidden="true" />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · Líneas de producto</span>
              <h1 id="lines-title">Cuatro líneas. Cada una abre hasta sus referencias.</h1>
              <p>
                2Grow, 2Balance, 2Bloom y 2Fruit tienen identidad visual aprobada de línea y pueden reunir más de una formulación o formato. Entra por la familia para entender qué referencias existen y luego abre el producto concreto para revisar formulación, presentación, documentos y condición comercial.
              </p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/productos">Ver catálogo completo</Link>
                <Link className={styles.button} href="/wondergreen/tecnologia">Entender la tecnología</Link>
              </div>
            </div>
            <aside className={styles.heroAside}>
              <span>Jerarquía de producto</span>
              <strong>Línea → referencia → presentación → documento.</strong>
              <p>La identidad de una línea no sustituye la ficha de la referencia. Formulación, formato, estado comercial y documentación se verifican en el producto específico.</p>
            </aside>
          </div>
        </section>

        <section className={styles.lines} aria-labelledby="line-grid-title">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div>
                <span className={styles.eyebrow}>Identidad visual aprobada</span>
                <h2 id="line-grid-title">Entra por la línea y baja hasta el producto exacto.</h2>
              </div>
              <p>La web usa el arte maestro aprobado de cada familia. No lo presenta como packshot específico de una formulación cuando ese master individual todavía no está vinculado.</p>
            </div>
            <div className={styles.lineGrid}>
              {wondergreenProductLines.map((line) => {
                const artwork = getWondergreenProductArtwork({ family: line.family });
                const all = getWondergreenLineReferences(line);
                const commercial = getWondergreenLineCommercialReferences(line);
                const technical = getWondergreenLineTechnicalReferences(line);
                return (
                  <article className={styles.lineCard} key={line.slug}>
                    {artwork ? (
                      <Image
                        className={styles.artwork}
                        src={artwork.href}
                        alt={artwork.alt}
                        width={900}
                        height={560}
                        sizes="(max-width: 680px) 92vw, 46vw"
                        unoptimized
                      />
                    ) : null}
                    <div className={styles.lineBody}>
                      <span>{artwork?.label ?? "Identidad de línea"}</span>
                      <h3>{line.family}</h3>
                      <p>{all[0]?.role ?? "Referencias gobernadas por Product Truth."}</p>
                      <div className={styles.counts} aria-label={`Resumen de ${line.family}`}>
                        <span>{all.length} {all.length === 1 ? "referencia" : "referencias"}</span>
                        <span>{commercial.length} comerciales</span>
                        {technical.length > 0 ? <span>{technical.length} por confirmar</span> : null}
                      </div>
                      <Link href={`/wondergreen/lineas/${line.slug}`}>Abrir {line.label} →</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.closing} aria-labelledby="lines-next-title">
          <div className={`${styles.container} ${styles.closingGrid}`}>
            <div>
              <span className={styles.eyebrow}>También puedes entrar directo</span>
              <h2 id="lines-next-title">Si ya conoces la formulación, no necesitas pasar por la línea.</h2>
            </div>
            <div>
              <p>El catálogo por referencia sigue siendo la ruta más directa cuando ya sabes qué producto buscas. Las líneas agregan contexto e identidad; no crean una etapa obligatoria de navegación.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/productos">Buscar producto</Link>
                <Link className={styles.button} href="/wondergreen/cultivos">Explorar por cultivo</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
