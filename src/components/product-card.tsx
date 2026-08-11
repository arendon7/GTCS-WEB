import Link from "next/link";
import type { Product } from "@/data/products";

function cop(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={`product-card family-${product.family.toLowerCase()}`}>
      <div className="product-card-top">
        <span className="eyebrow">{product.family} · {product.format}</span>
        <span className="product-pill">{product.presentation}</span>
      </div>
      <div className="product-orb" aria-hidden="true"><span>{product.family}</span></div>
      <h3>{product.name}</h3>
      <p>{product.stage}</p>
      {product.formula ? <span className="formula">{product.formula}</span> : null}
      <div className="product-card-footer">
        <strong>{cop(product.priceCop)}</strong>
        <Link href={`/wondergreen/productos/${product.slug}/`}>Ver producto →</Link>
      </div>
    </article>
  );
}
