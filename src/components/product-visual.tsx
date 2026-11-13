import type { Product } from "@/data/products";
import { canRenderPublicPackshot, getProductMedia } from "@/data/product-media";

type ProductVisualProps = {
  product: Product;
  context: "card" | "detail";
};

export function ProductVisual({ product, context }: ProductVisualProps) {
  const visualSlug = product.category === "solidos" ? `${product.slug}-solido-40kg` : product.slug;
  const media = getProductMedia(visualSlug);

  const candidates = media.candidateVariants ?? (media.candidate ? [media.candidate] : []);
  if (candidates.length > 0 && candidates.every((candidate) => candidate.status === "CANDIDATE_LOCAL")) {
    return (
      <figure className={`product-reference-visual product-reference-visual--${context} product-reference-visual--candidate-local${candidates.length > 1 ? " product-reference-visual--2grow-liquid" : ""}`}>
        {candidates.length > 1 ? <div className="product-reference-visual__2grow-labels">{candidates.map((candidate) => <div className="product-reference-visual__2grow-variant" key={candidate.src}>
          <div className="product-reference-visual__2grow-frame">
            <img src={candidate.src} alt={candidate.alt} width={1254} height={1254} loading={context === "card" ? "lazy" : "eager"} decoding="async" />
          </div>
          <strong>{candidate.alt.replace("Envase Wondergreen ", "").replace(", presentación visual de 1 L.", "")}</strong>
          {candidate.displayNote ? <p className="product-reference-visual__2grow-status">{candidate.displayNote}</p> : null}
        </div>)}</div> : <img src={candidates[0].src} alt={candidates[0].alt} width={1254} height={1254} loading={context === "card" ? "lazy" : "eager"} decoding="async" />}
        <figcaption>
          <strong>{candidates.length > 1 ? "Dos formulaciones de la línea 2GROW" : candidates[0].alt.replace("Envase Wondergreen ", "").replace(", presentación visual de 1 L.", "")}</strong>
          <span>{candidates.length > 1 ? "El perfil se elige según la etapa, el aporte total de nutrientes y la demanda del cultivo." : candidates[0].displayNote ?? "Consulta con el equipo las presentaciones y condiciones de suministro."}</span>
        </figcaption>
      </figure>
    );
  }

  if (canRenderPublicPackshot(media) && media.src && media.alt) {
    return (
      <div className={`product-packshot product-packshot--${context}`}>
        <img src={media.src} alt={media.alt} width={760} height={1074} loading={context === "card" ? "lazy" : "eager"} decoding="async" />
      </div>
    );
  }

  const familyEditorial = product.category === "solidos" || product.slug === "compost"
    ? getProductMedia(product.slug).editorial
    : undefined;

  if (familyEditorial && context === "card") {
    return (
      <img
        className="product-visual-card__image"
        src={familyEditorial.src}
        alt={familyEditorial.alt}
        width={1280}
        height={1280}
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (context === "card" && media.editorial) {
    const isBioinput = product.category === "bioinsumos";
    return (
      <img
        className="product-visual-card__image"
        src={media.editorial.src}
        alt={media.editorial.alt}
        width={isBioinput ? 1448 : 1254}
        height={isBioinput ? 1086 : 1254}
        loading="lazy"
        decoding="async"
      />
    );
  }

  if (familyEditorial && context === "detail") {
    const isCompost = product.slug === "compost";
    return (
      <figure className="product-reference-visual product-reference-visual--detail">
        <img src={familyEditorial.src} alt={familyEditorial.alt} width={1280} height={1280} loading="eager" decoding="async" />
        <figcaption>
          <strong>{isCompost ? "Materia orgánica estabilizada para suelo y sustrato." : "Nutrición según cultivo, etapa y manejo del lote."}</strong>
          <span>Consulta la ficha para revisar composición, presentación y uso recomendado.</span>
        </figcaption>
      </figure>
    );
  }

  if (context === "detail" && media.editorial) {
    const isBioinput = product.category === "bioinsumos";
    return (
      <figure className="product-reference-visual product-reference-visual--detail">
        <img src={media.editorial.src} alt={media.editorial.alt} width={isBioinput ? 1448 : 1254} height={isBioinput ? 1086 : 1254} loading="eager" decoding="async" />
        <figcaption>
          <strong>Contexto agronómico · {product.family}</strong>
          <span>{isBioinput ? "La etiqueta y la ficha vigentes definen especie, uso y condiciones." : "La ficha vigente define composición, presentación y uso recomendado."}</span>
        </figcaption>
      </figure>
    );
  }

  if (media.reference) {
    return (
      <figure className={`product-reference-visual product-reference-visual--${context}`}>
        <img src={media.reference.src} alt={media.reference.alt} width={1254} height={1254} loading={context === "card" ? "lazy" : "eager"} decoding="async" />
        <figcaption>
          <strong>Consulta la presentación disponible</strong>
          <span>Te confirmamos el envase, la etiqueta y la disponibilidad vigentes de esta formulación.</span>
        </figcaption>
      </figure>
    );
  }

  if (context === "card") {
    return <div className={`product-orb product-orb--${product.family.toLowerCase()}`} aria-hidden="true"><span>{product.family}</span></div>;
  }

  return (
    <div className={`product-stage family-${product.family.toLowerCase()}`} aria-label={`${product.name}: representación gráfica de la familia de producto`}>
      <span>{product.category === "bioinsumos" ? "BIOINSUMOS WONDERGREEN" : product.family}</span>
      <strong>{product.family}</strong>
      <em>{product.formula || "Materia orgánica"}</em>
    </div>
  );
}
