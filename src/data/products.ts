export type Product = {
  slug: string;
  name: string;
  family: "Compost" | "2GROW" | "2BALANCE" | "2BLOOM" | "2FRUIT";
  format: "Sólido" | "Líquido";
  formula?: string;
  objective: string;
  stage: string;
  presentation: string;
  priceCop: number;
  notes: string[];
};

export const products: Product[] = [
  {
    slug: "compost-40kg",
    name: "Wondergreen Compost",
    family: "Compost",
    format: "Sólido",
    objective: "Acondicionamiento y aporte de materia orgánica al suelo.",
    stage: "Preparación y manejo del suelo",
    presentation: "40 kg",
    priceCop: 20200,
    notes: ["Uso sujeto a recomendación agronómica", "Ficha técnica y disponibilidad por validar antes del checkout"],
  },
  {
    slug: "2grow-solido-40kg",
    name: "Wondergreen 2GROW",
    family: "2GROW",
    format: "Sólido",
    formula: "15-3-3",
    objective: "Línea orientada a crecimiento, brotación y recuperación vegetativa.",
    stage: "Crecimiento vegetativo",
    presentation: "40 kg",
    priceCop: 147400,
    notes: ["No publicar dosis sin ficha técnica validada", "La selección final depende del cultivo y análisis agronómico"],
  },
  {
    slug: "2balance-solido-40kg",
    name: "Wondergreen 2BALANCE",
    family: "2BALANCE",
    format: "Sólido",
    formula: "7-7-7",
    objective: "Línea orientada a mantenimiento y nutrición balanceada.",
    stage: "Mantenimiento",
    presentation: "40 kg",
    priceCop: 147400,
    notes: ["No publicar dosis sin ficha técnica validada", "La selección final depende del cultivo y análisis agronómico"],
  },
  {
    slug: "2bloom-solido-40kg",
    name: "Wondergreen 2BLOOM",
    family: "2BLOOM",
    format: "Sólido",
    formula: "3-8-3",
    objective: "Línea orientada a floración y transición reproductiva.",
    stage: "Floración",
    presentation: "40 kg",
    priceCop: 115500,
    notes: ["No publicar dosis sin ficha técnica validada", "La selección final depende del cultivo y análisis agronómico"],
  },
  {
    slug: "2fruit-solido-40kg",
    name: "Wondergreen 2FRUIT",
    family: "2FRUIT",
    format: "Sólido",
    formula: "3-3-8",
    objective: "Línea orientada a llenado, engrose y fase productiva.",
    stage: "Producción y llenado",
    presentation: "40 kg",
    priceCop: 121900,
    notes: ["No publicar dosis sin ficha técnica validada", "La selección final depende del cultivo y análisis agronómico"],
  },
  {
    slug: "2grow-liquido-1l",
    name: "Wondergreen 2GROW Líquido",
    family: "2GROW",
    format: "Líquido",
    formula: "100-20-20",
    objective: "Alternativa líquida de la línea de crecimiento y desarrollo vegetativo.",
    stage: "Crecimiento vegetativo",
    presentation: "1 L",
    priceCop: 17000,
    notes: ["También existen presentaciones mayores", "Confirmar disponibilidad y recomendación antes de compra"],
  },
  {
    slug: "2balance-liquido-1l",
    name: "Wondergreen 2BALANCE Líquido",
    family: "2BALANCE",
    format: "Líquido",
    formula: "70-70-70",
    objective: "Alternativa líquida para programas de nutrición balanceada.",
    stage: "Mantenimiento",
    presentation: "1 L",
    priceCop: 19100,
    notes: ["También existen presentaciones mayores", "Confirmar disponibilidad y recomendación antes de compra"],
  },
  {
    slug: "2fruit-liquido-1l",
    name: "Wondergreen 2FRUIT Líquido",
    family: "2FRUIT",
    format: "Líquido",
    formula: "30-30-80",
    objective: "Alternativa líquida orientada a fase productiva y llenado.",
    stage: "Producción y llenado",
    presentation: "1 L",
    priceCop: 18000,
    notes: ["También existen presentaciones mayores", "Confirmar disponibilidad y recomendación antes de compra"],
  },
];

export const featuredProducts = products.filter((product) =>
  ["compost-40kg", "2grow-solido-40kg", "2balance-solido-40kg", "2bloom-solido-40kg", "2fruit-solido-40kg"].includes(product.slug),
);

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
