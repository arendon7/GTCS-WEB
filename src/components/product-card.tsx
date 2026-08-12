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

export function ProductCard({ product }: { product: Product }) {
  const hasPrice = typeof product.priceCop === "number";
  return (
    <article className={`product-card family-${product.family.toLowerCase()}`}>
      <div className="product-card-top">
        <span className="eyebrow">{product.category}</span>
        <span className={`product-pill ${hasPrice ? "" : "product-pill--technical"}`}>{hasPrice ? "Precio validado" : "Portafolio técnico"}</span>
      </div>
      <ProductVisual product={product} context="card" />
      <h3>{product.name}</h3>
      <p>{product.objective}</p>
      {product.formula ? <span className="formula">Referencia {product.formula}</span> : null}
      <span className="product-presentations">{product.presentations.join(" · ")}</span>
      <div className="product-card-footer">
        <strong>{hasPrice ? cop(product.priceCop!) : "Consultar"}</strong>
        <Link href={`/wondergreen/productos/${product.slug}/`}>Ver producto →</Link>
      </div>
    </article>
  );
}
