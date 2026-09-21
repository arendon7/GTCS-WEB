import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

const liquidProducts = products.filter((product) => product.category === "liquidos");

function imageNote(slug: string) {
  return slug === "2balance-liquido" || slug === "2bloom-liquido"
    ? "Referencia documental combinada · 1 L"
    : "Referencia visual · 1 L";
}

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

export function WondergreenLiquidLines() {
  return (
    <div className="wg-liquid-lines" id="liquidos">
      <div className="wg-liquid-lines__intro">
        <div className="wg-liquid-lines__visual" aria-label="Mosaico de etiquetas de las formulaciones líquidas Wondergreen">
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--grow"><Image src="/products/wondergreen-liquids/labels-2grow-1l.jpeg" alt="Etiqueta Wondergreen 2GROW Líquido" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--balance"><Image src="/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg" alt="Referencia documental combinada de Wondergreen 2BALANCE y 2BLOOM líquidos" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--bloom"><Image src="/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg" alt="Referencia documental combinada de Wondergreen 2BALANCE y 2BLOOM líquidos" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <div className="wg-liquid-lines__visual-tile wg-liquid-lines__visual-tile--fruit"><Image src="/products/wondergreen-liquids/label-2fruit-1l.jpeg" alt="Etiqueta Wondergreen 2FRUIT Líquido" fill sizes="(max-width: 760px) 45vw, 13vw" /></div>
          <span className="wg-liquid-lines__visual-caption">4 referencias líquidas · presentación 1 L</span>
        </div>
        <div>
          <span className="eyebrow">Línea líquida</span>
          <h3>Soluble para la operación. Biológica cuando la ficha lo confirma.</h3>
          <p>Las presentaciones líquidas amplían el sistema Wondergreen para diferentes escalas y vías de aplicación. La línea separa nutrición soluble de bioinsumos líquidos: la fórmula aporta una función y el Biol aporta una base de carbono, nutrientes y microorganismos eficientes según la ficha consultada. Composición, concentración, compatibilidades y condición regulatoria se leen por separado en cada referencia.</p>
          <div className="wg-liquid-lines__split" aria-label="Funciones de la línea líquida">
            <div><span>01 · Nutrición soluble</span><p>Fórmulas N-P-K para acompañar crecimiento, equilibrio, floración o fase productiva.</p></div>
            <div><span>02 · Bioinsumo documentado</span><p>Biol Wondergreen aporta carbono, nutrientes y actividad biológica según la ficha técnica consultada.</p></div>
          </div>
          <div className="wg-liquid-lines__signal"><span>Bioinsumo líquido con soporte documental</span><strong>Biol Wondergreen</strong><p>La ficha consultada describe un fertilizante líquido con carbono orgánico, nutrientes y una base de microorganismos eficientes. Puede integrarse a la relación suelo-planta para acompañar actividad microbiana, aprovechamiento de nutrientes y desarrollo radicular cuando se incorpora a un programa técnico.</p><Link href="/wondergreen/productos/biol/">Leer ficha técnica de Biol →</Link></div>
          <div className="wg-liquid-lines__dose-note"><div><span>Dato de aplicación documentado</span><strong>1 L en 100 L de agua</strong></div><p>Referencia de dilución para Biol Wondergreen en fertirriego o aplicación edáfica. La dosis total, frecuencia y vía final se ajustan a cultivo, etapa, suelo, clima, concentración y etiqueta vigente.</p></div>
          <Link className="text-link" href="/biblioteca/catalogo-wondergreen/">Consultar el Product Master →</Link>
        </div>
      </div>

      <div className="wg-liquid-lines__grid">
        {liquidProducts.map((product) => (
          <article key={product.slug}>
            {product.image ? (
              <div className={`wg-liquid-lines__card-media ${product.slug === "2bloom-liquido" ? "wg-liquid-lines__card-media--bottom" : "wg-liquid-lines__card-media--top"}`}>
                <Image src={product.image} alt={imageNote(product.slug).startsWith("Referencia documental") ? `Referencia documental combinada de ${product.name} y otra formulación líquida en presentación de 1 L` : `Etiqueta de referencia de ${product.name} en presentación de 1 L`} fill sizes="(max-width: 760px) 100vw, 24vw" />
                <span>{imageNote(product.slug)}</span>
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
