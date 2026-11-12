import Link from "next/link";
import { products } from "@/data/products";
import { getCommercialPresentations } from "@/data/product-publication";
import { canRenderPublicPackshot, getProductMedia } from "@/data/product-media";

const solidProducts = products.filter((product) => product.category === "solidos");

export function WondergreenSolidLines() {
  return (
    <section className="wg-solid-showcase" id="solidos" aria-labelledby="wg-solid-showcase-title">
      <header className="wg-solid-showcase__header">
        <h3 id="wg-solid-showcase-title">Nutrición organomineral por etapa del cultivo.</h3>
        <p>Los cuatro fertilizantes sólidos Wondergreen son organominerales ocluidos. La matriz aporta materia orgánica y está orientada a favorecer una liberación gradual de nutrientes. La disponibilidad que alcanza el cultivo depende del suelo, el agua, el clima y el manejo; la ficha de cada línea explica su función dentro del programa por cultivo y etapa.</p>
      </header>

      <div className="wg-solid-showcase__grid" aria-label="Cuatro fertilizantes sólidos organominerales Wondergreen">
        {solidProducts.map((product) => {
          const skuMedia = getProductMedia(`${product.slug}-solido-40kg`);
          const familyMedia = getProductMedia(product.slug);
          const visual = canRenderPublicPackshot(skuMedia) && skuMedia.src && skuMedia.alt
            ? { src: skuMedia.src, alt: skuMedia.alt }
            : familyMedia.editorial ?? skuMedia.reference;
          const presentation = getCommercialPresentations(product.slug)[0];

          return (
            <article className={`wg-solid-showcase__item wg-solid-showcase__item--${product.slug}`} key={product.slug}>
              {visual ? (
                <figure className="wg-solid-showcase__visual">
                  <img src={visual.src} alt={visual.alt} width={1254} height={1254} loading="lazy" decoding="async" />
                </figure>
              ) : null}
              <div className="wg-solid-showcase__copy">
                <div className="wg-solid-showcase__identity">
                  <h4>{product.family}</h4>
                  <span>{product.stage}</span>
                </div>
                <p className="wg-solid-showcase__formula">{product.formula} <span>·</span> {presentation ?? product.format}</p>
                <p className="wg-solid-showcase__focus">{product.focus}</p>
                <Link href={`/wondergreen/productos/${product.slug}/`}>Ver ficha de {product.family} →</Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
