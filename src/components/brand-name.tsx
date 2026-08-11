type BrandNameProps = {
  brand?: "greenatics" | "wondergreen";
  inverse?: boolean;
};

export function BrandName({ brand = "greenatics", inverse = false }: BrandNameProps) {
  return (
    <span
      className={`brand-name brand-name--${brand}${inverse ? " brand-name--inverse" : ""}`}
      aria-label={brand === "greenatics" ? "Greenatics" : "Wondergreen"}
    >
      {brand}
    </span>
  );
}
