import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

const bioinputProducts = products.filter((product) => product.category === "bioinsumos" && product.slug !== "bioinsumos");

function imagePosition(slug: string) {
  return slug === "bioinsumo-bacillus-subtilis" || slug === "bioinsumo-metarhizium" ? "wg-bio-lines__media--bottom" : "wg-bio-lines__media--top";
}

export function WondergreenBioinputLines() {
  return (
    <section className="wg-bio-lines" id="bioinsumos" aria-labelledby="wg-bio-lines-title">
      <div className="wg-bio-lines__heading">
        <div>
          <span className="eyebrow">Bioinsumos · referencias actuales</span>
          <h3 id="wg-bio-lines-title">Biología que fortalece programas de manejo integrado.</h3>
        </div>
        <p>Las referencias microbiológicas y botánicas se integran a programas definidos por cultivo, objetivo, momento y calidad de aplicación. La ficha técnica de cada presentación entrega concentración, dosis, frecuencia, compatibilidad y condición de uso.</p>
      </div>

      <div className="wg-bio-lines__grid">
        {bioinputProducts.map((product) => (
          <article key={product.slug}>
            {product.image ? (
              <Link className={`wg-bio-lines__media ${imagePosition(product.slug)}`} href={`/wondergreen/productos/${product.slug}/`} aria-label={`Abrir ficha de ${product.name}`}>
                <Image src={product.image} alt={`Etiqueta de referencia de ${product.name} en presentación de 1 L`} fill sizes="(max-width: 760px) 100vw, 19vw" />
                <span>Referencia visual · 1 L</span>
              </Link>
            ) : null}
            <div className="wg-bio-lines__top"><span>{product.family}</span><small>Portafolio técnico</small></div>
            <h4>{product.name.replace("Wondergreen ", "")}</h4>
            <p>{product.technicalRole}</p>
            <div className="wg-bio-lines__tags">
              {product.idealFor.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className="wg-bio-lines__truth"><strong>Aplicación técnica</strong><span>Protocolo, concentración, dosis y frecuencia definidos para el cultivo y la presentación.</span></div>
            <Link className="wg-bio-lines__link" href={`/wondergreen/productos/${product.slug}/`}>Abrir ficha técnica →</Link>
          </article>
        ))}
      </div>

      <div className="wg-bio-lines__footer">
        <strong>Una herramienta biológica necesita contexto.</strong>
        <span>Diagnóstico, monitoreo, oportunidad, calidad del agua, compatibilidad y seguimiento forman parte de la decisión.</span>
        <Link href="/wondergreen/fitosanidad/">Ver la ruta de manejo integrado →</Link>
      </div>
    </section>
  );
}
