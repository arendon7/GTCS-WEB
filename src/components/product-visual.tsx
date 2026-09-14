import type { Product } from "@/data/products";
import { canRenderPublicPackshot, getProductMedia } from "@/data/product-media";

type ProductVisualProps = {
  product: Product;
  context: "card" | "detail";
};

export function ProductVisual({ product, context }: ProductVisualProps) {
  const media = getProductMedia(product.slug);

  if (canRenderPublicPackshot(media) && media.src && media.alt) {
    return (
      <div className={`product-packshot product-packshot--${context}`}>
        <img src={media.src} alt={media.alt} />
      </div>
    );
  }

  if (context === "card") {
    return <div className="product-orb" aria-hidden="true"><span>{product.family}</span></div>;
  }

  if (product.image) {
    return (
      <figure className="product-reference-visual">
        <img src={product.image} alt={`Ficha visual de la familia ${product.family}`} />
        <figcaption>Material visual de orientación de la línea. La cotización y la ficha técnica definen la presentación y el programa de uso adecuados.</figcaption>
      </figure>
    );
  }

  return (
    <div className={`product-stage family-${product.family.toLowerCase()}`} aria-label={`${product.name}: representación gráfica de la familia de producto`}>
      <span>{product.family}</span>
      <strong>{product.format}</strong>
      <em>{product.formula || "Materia orgánica"}</em>
    </div>
  );
}
