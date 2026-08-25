import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getWondergreenProductArtwork } from "@/data/wondergreen-product-assets";
import { getCommercialWondergreenLineReferences, getWondergreenLineReferences, wondergreenProductLines } from "@/data/wondergreen-product-lines";
import { publicSocialMetadata } from "@/lib/public-social-metadata";
import styles from "./lines.module.css";

const title = "Líneas Wondergreen | Familias y referencias";
const description = "Explora 2Grow, 2Balance, 2Bloom y 2Fruit como familias visuales y abre cada formulación para revisar formato, presentaciones, estado comercial y documentación vinculada.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/wondergreen/lineas" },
  ...publicSocialMetadata({ title, description, path: "/wondergreen/lineas" }),
};

function uniqueFormats(line: (typeof wondergreenProductLines)[number]) {
  return [...new Set(getWondergreenLineReferences(line).map((reference) => reference.format === "solid" ? "Sólido" : reference.format === "liquid" ? "Líquido" : reference.format))];
}

export default function WondergreenLinesPage() {
  return (
    <div className={styles.page}>
      <main>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div>
              <span className={styles.eyebrow}>Wondergreen · Líneas de producto</span>
              <h1>Una identidad por línea. Una ficha exacta por referencia.</h1>
              <p className={styles.lead}>2Grow, 2Balance, 2Bloom y 2Fruit tienen una identidad visual propia, pero cada familia puede reunir más de una formulación o formato. Entra por la línea para entender su arquitectura y después abre la referencia exacta que quieres revisar.</p>
              <div className={styles.actions}>
                <Link className={`${styles.button} ${styles.primary}`} href="#lineas">Ver líneas</Link>
                <Link className={styles.button} href="/wondergreen/productos">Ver todas las referencias</Link>
              </div>
            </div>
            <div className={styles.guardrail}>
              <span className={styles.eyebrow}>Jerarquía comercial</span>
              <h2>Línea ≠ formulación ≠ presentación.</h2>
              <p>La identidad de una familia ayuda a navegar el portafolio. Product Truth sigue gobernando fórmula, formato, presentaciones, condición comercial y documentación de cada referencia individual.</p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.white}`} id="lineas">
          <div className={styles.container}>
            <div className={styles.sectionHead}>
              <div><span className={styles.eyebrow}>Cuatro familias visuales</span><h2>Conoce la línea antes de bajar a la formulación.</h2></div>
              <p>Los artes se usan como identidad aprobada de línea. No se presentan como packshots de una formulación o presentación específica mientras ese master no esté vinculado.</p>
            </div>
            <div className={styles.lineGrid}>
              {wondergreenProductLines.map((line) => {
                const references = getWondergreenLineReferences(line);
                const commercial = getCommercialWondergreenLineReferences(line);
                const artwork = references[0] ? getWondergreenProductArtwork(references[0]) : null;
                return (
                  <Link className={styles.lineCard} href={`/wondergreen/lineas/${line.slug}`} key={line.slug}>
                    {artwork ? <Image src={artwork.href} alt={artwork.alt} width={420} height={420} unoptimized /> : <div />}
                    <div>
                      <span className={styles.eyebrow}>{line.number} · {line.family}</span>
                      <h2>{line.headline}</h2>
                      <p>{line.description}</p>
                      <div className={styles.lineMeta}>
                        <span>{references.length} {references.length === 1 ? "referencia" : "referencias"}</span>
                        <span>{commercial.length} comerciales reconciliadas</span>
                        {uniqueFormats(line).map((format) => <span key={format}>{format}</span>)}
                      </div>
                      <strong>Explorar línea →</strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.guardrail}>
              <span className={styles.eyebrow}>Truth Lock</span>
              <h2>La familia organiza. La referencia específica demuestra.</h2>
              <p>No trasladamos automáticamente una formulación, tecnología, estado comercial, dosis, frecuencia, eficacia o disponibilidad de una referencia a todas las demás que comparten nombre de línea.</p>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <div className={`${styles.container} ${styles.closingInner}`}>
            <div><span className={styles.eyebrow}>Siguiente profundidad</span><h2>Abre la formulación exacta o revisa la tecnología Wondergreen.</h2></div>
            <div className={styles.actions}><Link className={`${styles.button} ${styles.primary}`} href="/wondergreen/productos">Ver productos</Link><Link className={styles.button} href="/wondergreen/tecnologia">Ver tecnología</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
