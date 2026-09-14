import Link from "next/link";
import { ProductVisual } from "@/components/product-visual";
import type { Product } from "@/data/products";

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

const FAMILY_TAGS: Record<string, { label: string; stage: string }> = {
  "2grow": { label: "2GROW", stage: "Vegetativo" },
  "2balance": { label: "2BALANCE", stage: "Equilibrio" },
  "2bloom": { label: "2BLOOM", stage: "Floración" },
  "2fruit": { label: "2FRUIT", stage: "Llenado" },
  "compost": { label: "COMPOST", stage: "Suelo & Estructura" },
  "bioinsumos": { label: "BIOINSUMO", stage: "Manejo Integrado" },
};

export function ProductCard({ product }: { product: Product }) {
  const hasPrice = typeof product.priceCop === "number";
  const familyKey = product.family.toLowerCase();
  const familyInfo = FAMILY_TAGS[familyKey] || { label: product.family, stage: product.stage };

  return (
    <article className={`product-card family-${familyKey}`}>
      <div className="product-card-top">
        <span className="product-family-badge">{familyInfo.label} · {familyInfo.stage}</span>
        <span className={`product-pill ${hasPrice ? "" : "product-pill--technical"}`}>
          {hasPrice ? "Precio validado" : "Técnico"}
        </span>
      </div>

      <ProductVisual product={product} context="card" />

      <div className="product-card-content">
        <h3>{product.name}</h3>
        <p>{product.objective}</p>
        
        {product.formula ? (
          <span className="formula-badge">
            <strong>Fórmula N-P-K:</strong> {product.formula}
          </span>
        ) : null}

        <div className="product-card-meta">
          <span className="product-format-tag">{product.format}</span>
          <span className="product-presentations">{product.presentations.join(" · ")}</span>
        </div>
      </div>

      <div className="product-card-footer">
        <div className="product-price-box">
          <small>{hasPrice ? "Precio ref." : "Cotización"}</small>
          <strong>{hasPrice ? cop(product.priceCop!) : "Consultar"}</strong>
        </div>
        <Link 
          href={`/wondergreen/productos/${product.slug}/`} 
          className="product-card-cta"
          aria-label={`Ver ficha de ${product.name}`}
        >
          Ficha →
        </Link>
      </div>
    </article>
  );
}
