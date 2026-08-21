import Image from "next/image";
import Link from "next/link";
import styles from "./wondergreen-visual-band.module.css";

const productVisuals = [
  { id: "2Grow", stage: "Crece", src: "/api/public-media/wondergreen-2grow", alt: "Línea Wondergreen 2Grow" },
  { id: "2Balance", stage: "Equilibra", src: "/api/public-media/wondergreen-2balance", alt: "Línea Wondergreen 2Balance" },
  { id: "2Bloom", stage: "Florece", src: "/api/public-media/wondergreen-2bloom", alt: "Línea Wondergreen 2Bloom" },
  { id: "2Fruit", stage: "Fructifica", src: "/api/public-media/wondergreen-2fruit", alt: "Línea Wondergreen 2Fruit" },
] as const;

export function WondergreenVisualBand() {
  return (
    <section className={styles.section} aria-labelledby="wondergreen-visual-band-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Wondergreen · sistema visual</span>
            <h2 id="wondergreen-visual-band-title">Del suelo a cada etapa de la planta.</h2>
          </div>
          <p>
            Explora el sistema completo, conoce las líneas Wondergreen y lleva contigo el catálogo y las guías técnicas.
          </p>
        </div>

        <div className={styles.systemGrid}>
          <figure className={styles.systemVisual}>
            <Image
              src="/api/public-media/wondergreen-system-stages"
              alt="Sistema Wondergreen por etapas"
              width={760}
              height={1074}
              sizes="(max-width: 860px) 88vw, 390px"
              unoptimized
            />
            <figcaption>Suelo · crecimiento · equilibrio · floración · fruto · biología</figcaption>
          </figure>

          <div className={styles.systemCopy}>
            <span className={styles.number}>01—05</span>
            <h3>Un portafolio que se entiende por función y etapa.</h3>
            <p>
              Compost, fertilizantes organominerales, líneas líquidas y bioinsumos conviven dentro de un mismo sistema. La web permite entrar por cultivo, por producto o por necesidad.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href="/api/public-resources/wondergreen-product-master" target="_blank" rel="noreferrer">
                Descargar catálogo PDF ↓
              </a>
              <Link href="/wondergreen/productos">Ver Product Master →</Link>
            </div>
          </div>
        </div>

        <div className={styles.productGrid} aria-label="Líneas organominerales Wondergreen">
          {productVisuals.map((product) => (
            <article className={styles.productCard} key={product.id}>
              <div className={styles.productImage}>
                <Image
                  src={product.src}
                  alt={product.alt}
                  width={760}
                  height={1074}
                  sizes="(max-width: 620px) 84vw, (max-width: 980px) 42vw, 22vw"
                  unoptimized
                />
              </div>
              <div className={styles.productMeta}>
                <span>{product.stage}</span>
                <strong>{product.id}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.bioGrid}>
          <div className={styles.bioVisual}>
            <Image
              src="/api/public-media/wondergreen-bioinsumos"
              alt="Bioinsumos Wondergreen"
              width={760}
              height={1074}
              sizes="(max-width: 760px) 88vw, 360px"
              unoptimized
            />
          </div>
          <div className={styles.bioCopy}>
            <span className={styles.eyebrow}>Otra capa del manejo</span>
            <h3>Bioinsumos Wondergreen.</h3>
            <p>Microorganismos y extractos botánicos complementan el portafolio nutricional y amplían las rutas de manejo.</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/wondergreen#bioinsumos">Explorar bioinsumos</Link>
              <Link href="/biblioteca">Abrir Biblioteca →</Link>
              <Link href="/casa-jardin">Casa & Jardín →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
