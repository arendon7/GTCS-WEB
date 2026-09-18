import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

const liquidProducts = products.filter((product) => product.category === "liquidos");

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function WondergreenLiquidLines() {
  return (
    <div className="wg-liquid-lines" id="liquidos">
      <div className="wg-liquid-lines__intro">
        <div className="wg-liquid-lines__visual" aria-label="Mosaico de etiquetas de las formulaciones líquidas Wondergreen">
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--grow"><Image src="/products/wondergreen-liquids/labels-2grow-1l.jpeg" alt="Etiqueta Wondergreen 2GROW Líquido" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--balance"><Image src="/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg" alt="Etiqueta Wondergreen 2BALANCE Líquido" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--bloom"><Image src="/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg" alt="Etiqueta Wondergreen 2BLOOM Líquido" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--fruit"><Image src="/products/wondergreen-liquids/label-2fruit-1l.jpeg" alt="Etiqueta Wondergreen 2FRUIT Líquido" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <span className="wg-liquid-lines__visual-caption">4 referencias líquidas · presentación 1 L</span>
        </div>
        <div>
          <span className="eyebrow">Línea líquida</span>
          <h3>Soluble para la operación. Biológica cuando la ficha lo confirma.</h3>
          <p>Las presentaciones líquidas amplían el sistema Wondergreen para diferentes escalas y vías de aplicación. Hay referencias de nutrición soluble y otras con actividad biológica; la composición, concentración, microorganismos, compatibilidades y condición regulatoria se leen por separado en cada ficha.</p>
          <div className="wg-liquid-lines__split" aria-label="Funciones de la línea líquida">
            <div><span>01 · Nutrición soluble</span><p>Fórmulas N-P-K para acompañar crecimiento, equilibrio, floración o fase productiva.</p></div>
            <div><span>02 · Bioinsumo documentado</span><p>Biol Wondergreen aporta carbono, nutrientes y actividad biológica según la ficha técnica consultada.</p></div>
          </div>
          <div className="wg-liquid-lines__signal"><span>Referencia con soporte documental</span><strong>Biol Wondergreen</strong><p>La ficha consultada describe un fertilizante líquido con carbono orgánico, nutrientes y actividad biológica. Se puede integrar a la relación suelo-planta: favorece la actividad microbiana, la absorción de nutrientes y el desarrollo radicular cuando se incorpora a un programa técnico.</p><Link href="/wondergreen/productos/biol/">Leer ficha técnica de Biol →</Link></div>
          <div className="wg-liquid-lines__dose-note"><div><span>Dato de aplicación documentado</span><strong>1 L en 100 L de agua</strong></div><p>Referencia de dilución para Biol Wondergreen en fertirriego o aplicación edáfica. La dosis total, frecuencia y vía final se ajustan a cultivo, etapa, suelo, clima, concentración y etiqueta vigente.</p></div>
          <Link className="text-link" href="/biblioteca/catalogo-wondergreen/">Consultar el Product Master →</Link>
        </div>
      </div>

      <div className="wg-liquid-lines__grid">
        {liquidProducts.map((product) => (
          <article key={product.slug}>
            {product.image ? (
              <div className={`wg-liquid-lines__card-media ${product.slug === "2bloom-liquido" ? "wg-liquid-lines__card-media--bottom" : "wg-liquid-lines__card-media--top"}`}>
                <Image src={product.image} alt={`Etiqueta de referencia de ${product.name} en presentación de 1 L`} fill sizes="(max-width: 760px) 100vw, 24vw" />
                <span>Referencia visual · 1 L</span>
              </div>
            ) : null}
            <div className="wg-liquid-lines__top"><span>{product.family}</span><small>{product.stage}</small></div>
            <h4>{product.name.replace("Wondergreen ", "")}</h4>
            <strong>{product.formula}</strong>
            <p>{product.technicalRole}</p>
            <div className="wg-liquid-lines__meta"><span>{product.presentations.join(" · ")}</span><span>{typeof product.priceCop === "number" ? `Desde ${cop(product.priceCop)}` : "Disponible bajo cotización"}</span></div>
            <Link href={`/wondergreen/productos/${product.slug}/`}>Abrir ficha líquida →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
