import Image from "next/image";
import Link from "next/link";
import { getWondergreenProductArtwork } from "@/data/wondergreen-product-assets";
import { solidFertilizers } from "@/data/wondergreen-public";
import styles from "./wondergreen-commercial.module.css";

const featuredProducts = solidFertilizers.filter((reference) => reference.truthStatus === "commercial-reconciled");

export function WondergreenCommercialShowcase() {
  return (
    <section className={styles.showcase} id="productos-destacados" aria-labelledby="wondergreen-commercial-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>Productos Wondergreen</span>
            <h2 id="wondergreen-commercial-title">Empieza por los productos que ya puedes revisar.</h2>
          </div>
          <div className={styles.headingCopy}>
            <p>Estas referencias sólidas tienen condición comercial reconciliada en Product Truth. Cada una abre su ficha con formulación, presentaciones, cultivos relacionados y documentación pública vinculada.</p>
            <Link href="/wondergreen/productos">Ver todos los productos →</Link>
            <Link href="/wondergreen/tecnologia">Profundizar en la tecnología →</Link>
          </div>
        </div>

        <div className={styles.grid}>
          {featuredProducts.map((product) => {
            const artwork = getWondergreenProductArtwork(product);
            return (
              <Link className={styles.card} href={`/wondergreen/productos/${product.slug}`} key={product.slug}>
                {artwork ? (
                  <Image
                    className={styles.artwork}
                    src={artwork.href}
                    alt={artwork.alt}
                    width={760}
                    height={520}
                    sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 24vw"
                    unoptimized
                  />
                ) : null}
                <div className={styles.cardBody}>
                  <span>{product.publicStatus}</span>
                  <div className={styles.identity}>
                    <strong>{product.family}</strong>
                    {product.formula ? <em>{product.formula}</em> : null}
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.role}</p>
                  <div className={styles.meta}>
                    <small>{product.presentations?.join(" · ") ?? "Presentación por confirmar"}</small>
                    <b>Ver ficha completa →</b>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className={styles.truthLock}>
          <strong>Producto primero, sin confundir producto con recomendación.</strong>
          <span>La página permite conocer la referencia y sus documentos; dosis, frecuencia, compatibilidad y uso específico siguen dependiendo de la versión técnica vigente y del contexto real.</span>
        </div>
      </div>
    </section>
  );
}
