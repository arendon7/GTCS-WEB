export type ProductPresentationGroup = {
  label: string;
  shortLabel?: string;
  items: string[];
  status: "commercial" | "technical";
};

export type ProductPublication = {
  label: "Catálogo comercial" | "Portafolio técnico";
  summary: string;
  availability: string;
  presentationGroups: ProductPresentationGroup[];
  showPublicPrice: false;
};

const COMMERCIAL_SOLID_PRESENTATIONS = ["40 kg"];
const COMMERCIAL_LIQUID_PRESENTATIONS = ["1 L", "3,75 L", "20 L", "200 L", "1.000 L"];
const BIOINPUT_TECHNICAL_PRESENTATIONS = ["1 L", "5 L", "20 L"];

const commercial = (
  summary: string,
  presentationGroups: ProductPresentationGroup[],
): ProductPublication => ({
  label: "Catálogo comercial",
  summary,
  availability: "El equipo confirma inventario, logística y condiciones de suministro para cada solicitud.",
  presentationGroups,
  showPublicPrice: false,
});

const technical = (
  summary: string,
  presentationGroups: ProductPresentationGroup[] = [],
): ProductPublication => ({
  label: "Portafolio técnico",
  summary,
  availability: "Consulta con el equipo la presentación, disponibilidad y condiciones de suministro de esta referencia.",
  presentationGroups,
  showPublicPrice: false,
});

const solidCommercial = (summary: string) => commercial(
  `La referencia ${summary} está incluida en el catálogo comercial Wondergreen.`,
  [
    { label: "Presentación en catálogo comercial", items: COMMERCIAL_SOLID_PRESENTATIONS, status: "commercial" },
    { label: "Otras presentaciones del portafolio técnico", items: ["5 kg"], status: "technical" },
  ],
);

const liquidCommercial = (summary: string) => commercial(
  `La referencia ${summary} está incluida en el catálogo comercial Wondergreen.`,
  [{ label: "Presentaciones en catálogo comercial", items: COMMERCIAL_LIQUID_PRESENTATIONS, status: "commercial" }],
);

const BIOINPUT_PUBLICATION = technical(
  "Referencia botánica o microbiológica documentada en el portafolio técnico Wondergreen.",
  [{ label: "Presentaciones de referencia técnica", items: BIOINPUT_TECHNICAL_PRESENTATIONS, status: "technical" }],
);

const PUBLICATION_BY_SLUG: Record<string, ProductPublication> = {
  compost: commercial("Acondicionador orgánico incluido en el catálogo comercial Wondergreen.", [
    { label: "Presentación en catálogo comercial", items: COMMERCIAL_SOLID_PRESENTATIONS, status: "commercial" },
  ]),
  "2grow": solidCommercial("2GROW 15-3-3"),
  "2balance": solidCommercial("2BALANCE 7-7-7"),
  "2bloom": solidCommercial("2BLOOM 3-8-3"),
  "2fruit": solidCommercial("2FRUIT 3-3-8"),
  bioinsumos: BIOINPUT_PUBLICATION,
  "bioinsumo-trichoderma": BIOINPUT_PUBLICATION,
  "bioinsumo-bacillus-subtilis": BIOINPUT_PUBLICATION,
  "bioinsumo-beauveria": BIOINPUT_PUBLICATION,
  "bioinsumo-metarhizium": BIOINPUT_PUBLICATION,
  "bioinsumo-ajo-aji": BIOINPUT_PUBLICATION,
  "bioinsumo-neem": BIOINPUT_PUBLICATION,
  "2grow-liquido": commercial(
    "La línea líquida 2GROW incluye 100-20-20 para crecimiento vegetativo y 200-0-0, su formulación de mayor concentración de nitrógeno, para momentos de alta demanda vegetativa. Los formatos comerciales publicados corresponden a 100-20-20; consulta al equipo por el formato y suministro de 200-0-0.",
    [
      { label: "2GROW 100-20-20 · catálogo comercial", items: COMMERCIAL_LIQUID_PRESENTATIONS, status: "commercial" },
      { label: "2GROW 200-0-0 · mayor concentración de nitrógeno de la línea", shortLabel: "2GROW 200-0-0", items: ["Formato por consultar"], status: "technical" },
    ],
  ),
  "2balance-liquido": liquidCommercial("2BALANCE líquido 70-70-70"),
  "2bloom-liquido": technical(
    "2BLOOM líquido 30-80-30 hace parte del portafolio técnico Wondergreen.",
    [{ label: "2BLOOM líquido 30-80-30", items: ["Formato por consultar"], status: "technical" }],
  ),
  "2fruit-liquido": liquidCommercial("2FRUIT líquido 30-30-80"),
};

export function getProductPublication(slug: string): ProductPublication {
  return PUBLICATION_BY_SLUG[slug] ?? technical("Referencia del portafolio técnico Wondergreen.");
}

export function hasExplicitProductPublication(slug: string): boolean {
  return Object.hasOwn(PUBLICATION_BY_SLUG, slug);
}

export function getPresentationSummary(slug: string): string {
  return getProductPublication(slug).presentationGroups
    .map((group) => `${group.label}: ${group.items.join(" · ")}`)
    .join(". ");
}

export function getCommercialPresentations(slug: string): string[] {
  return getProductPublication(slug).presentationGroups
    .filter((group) => group.status === "commercial")
    .flatMap((group) => group.items);
}
