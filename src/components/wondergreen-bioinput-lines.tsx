import Link from "next/link";
import { products } from "@/data/products";
import { getProductMedia } from "@/data/product-media";

const bioinputProducts = products.filter((product) => product.category === "bioinsumos" && product.slug !== "bioinsumos");
const bioinputGroups = [
  { name: "Microbiológicos", slugs: ["bioinsumo-trichoderma", "bioinsumo-bacillus-subtilis", "bioinsumo-beauveria", "bioinsumo-metarhizium"] },
  { name: "Botánicos", slugs: ["bioinsumo-ajo-aji", "bioinsumo-neem"] },
] as const;
const bioinputSummaries: Record<string, string> = {
  "bioinsumo-trichoderma": "Especie, ficha, etiqueta y alcance autorizado por confirmar.",
  "bioinsumo-bacillus-subtilis": "Referencia microbiológica. Confirma su alcance en la ficha, etiqueta y registro vigentes.",
  "bioinsumo-beauveria": "Referencia microbiológica. Confirma su alcance en la ficha, etiqueta y registro vigentes.",
  "bioinsumo-metarhizium": "Referencia microbiológica. Confirma su alcance en la ficha, etiqueta y registro vigentes.",
  "bioinsumo-ajo-aji": "Referencia botánica. Confirma su alcance en la ficha, etiqueta y registro vigentes.",
  "bioinsumo-neem": "Referencia botánica. Confirma su alcance en la ficha, etiqueta y registro vigentes.",
};

export function WondergreenBioinputLines() {
  return (
    <section className="wg-bio-lines" id="bioinsumos" aria-labelledby="wg-bio-lines-title">
      <div className="wg-bio-lines__heading">
        <div>
          <h3 id="wg-bio-lines-title">Seis referencias botánicas y microbiológicas.</h3>
          <p>Los grupos ayudan a reconocer cada referencia; su alcance y uso autorizado se confirman en la ficha, etiqueta y registro vigentes.</p>
        </div>
        <figure className="wg-bio-lines__media wg-bio-lines__media--family">
          <img src="/products/wondergreen-line-bioinsumos-v2.jpg" alt="Persona revisa las raíces de una plántula en un vivero." width={1448} height={1086} loading="lazy" decoding="async" />
          <figcaption>Revisa la documentación vigente antes de definir el uso de una referencia.</figcaption>
        </figure>
      </div>

      <p className="wg-bio-lines__presentation-note">Las imágenes muestran contextos de cultivo, no empaques. El alcance y el uso autorizado se confirman en la ficha, etiqueta y registro vigentes de cada referencia.</p>
      <div className="wg-bio-lines__groups">
        {bioinputGroups.map((group) => (
          <section className="wg-bio-lines__group" key={group.name} aria-labelledby={`wg-bio-group-${group.name.toLowerCase()}`}>
            <header className="wg-bio-lines__group-heading">
              <h4 id={`wg-bio-group-${group.name.toLowerCase()}`}>{group.name}</h4>
              <span>{group.slugs.length} referencias</span>
            </header>
            <div className="wg-bio-lines__items">
              {group.slugs.map((slug) => {
                const product = bioinputProducts.find((candidate) => candidate.slug === slug);
                if (!product) return null;
                const media = getProductMedia(product.slug);
                const visual = media.editorial;

                return (
                  <article className="wg-bio-lines__item" key={product.slug}>
                    {visual ? (
                      <figure className="wg-bio-lines__product-visual">
                        <img src={visual.src} alt={visual.alt} width={1448} height={1086} loading="lazy" decoding="async" />
                      </figure>
                    ) : null}
                    <div className="wg-bio-lines__item-copy">
                      <h5>{product.name.replace("Wondergreen ", "")}</h5>
                      <p>{bioinputSummaries[product.slug] ?? product.technicalRole}</p>
                      <Link className="wg-bio-lines__link" href={`/wondergreen/productos/${product.slug}/`}>Ver ficha técnica →</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="wg-bio-lines__footer">
        <span>La elección depende del objetivo, el monitoreo, la compatibilidad y la ficha vigente de cada referencia.</span>
        <Link href="/wondergreen/fitosanidad/">Revisar la ruta de manejo integrado →</Link>
      </div>
    </section>
  );
}
