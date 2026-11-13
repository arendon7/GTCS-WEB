export type CatalogOffer = {
  id: string;
  product: string;
  family: string;
  formula?: string;
  presentation: string;
};

export const catalogOffers: CatalogOffer[] = [
  { id: "compost-40kg", product: "Wondergreen Compost", family: "Compost", presentation: "40 kg" },
  { id: "2grow-s-40kg", product: "Wondergreen 2GROW", family: "2GROW", formula: "15-3-3", presentation: "40 kg" },
  { id: "2balance-s-40kg", product: "Wondergreen 2BALANCE", family: "2BALANCE", formula: "7-7-7", presentation: "40 kg" },
  { id: "2bloom-s-40kg", product: "Wondergreen 2BLOOM", family: "2BLOOM", formula: "3-8-3", presentation: "40 kg" },
  { id: "2fruit-s-40kg", product: "Wondergreen 2FRUIT", family: "2FRUIT", formula: "3-3-8", presentation: "40 kg" },
  { id: "2grow-l-1l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "1 L" },
  { id: "2grow-l-375l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "3,75 L" },
  { id: "2grow-l-20l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "20 L" },
  { id: "2grow-l-200l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "200 L" },
  { id: "2grow-l-1000l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "1.000 L" },
  { id: "2balance-l-1l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "1 L" },
  { id: "2balance-l-375l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "3,75 L" },
  { id: "2balance-l-20l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "20 L" },
  { id: "2balance-l-200l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "200 L" },
  { id: "2balance-l-1000l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "1.000 L" },
  { id: "2fruit-l-1l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "1 L" },
  { id: "2fruit-l-375l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "3,75 L" },
  { id: "2fruit-l-20l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "20 L" },
  { id: "2fruit-l-200l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "200 L" },
  { id: "2fruit-l-1000l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "1.000 L" },
];

export type CatalogQuoteGroup = {
  label: string;
  offerIds: readonly string[];
  note?: string;
};

// Only references already present in the commercial quote catalog are mapped here.
// Technical references with supply to confirm remain outside the selectable group.
export const catalogQuoteGroups: Record<string, CatalogQuoteGroup> = {
  compost: { label: "Wondergreen Compost · 40 kg", offerIds: ["compost-40kg"] },
  "2grow": { label: "Wondergreen 2GROW sólido · 15-3-3", offerIds: ["2grow-s-40kg"] },
  "2balance": { label: "Wondergreen 2BALANCE sólido · 7-7-7", offerIds: ["2balance-s-40kg"] },
  "2bloom": { label: "Wondergreen 2BLOOM sólido · 3-8-3", offerIds: ["2bloom-s-40kg"] },
  "2fruit": { label: "Wondergreen 2FRUIT sólido · 3-3-8", offerIds: ["2fruit-s-40kg"] },
  "2grow-liquido": {
    label: "Wondergreen 2GROW líquido · 100-20-20",
    offerIds: ["2grow-l-1l", "2grow-l-375l", "2grow-l-20l", "2grow-l-200l", "2grow-l-1000l"],
    note: "Estas son las presentaciones comerciales registradas para 100-20-20. La referencia 200-0-0 se consulta por separado.",
  },
  "2balance-liquido": {
    label: "Wondergreen 2BALANCE líquido · 70-70-70",
    offerIds: ["2balance-l-1l", "2balance-l-375l", "2balance-l-20l", "2balance-l-200l", "2balance-l-1000l"],
  },
  "2fruit-liquido": {
    label: "Wondergreen 2FRUIT líquido · 30-30-80",
    offerIds: ["2fruit-l-1l", "2fruit-l-375l", "2fruit-l-20l", "2fruit-l-200l", "2fruit-l-1000l"],
  },
};

export type TechnicalCatalogInquiry = {
  id: string;
  productSlug: string;
  label: string;
  note: string;
};

export const technicalCatalogInquiries: readonly TechnicalCatalogInquiry[] = [
  { id: "2grow-5kg", productSlug: "2grow", label: "2GROW sólido 15-3-3 · referencia de 5 kg", note: "Presentación del portafolio técnico; confirmar si puede suministrarse." },
  { id: "2balance-5kg", productSlug: "2balance", label: "2BALANCE sólido 7-7-7 · referencia de 5 kg", note: "Presentación del portafolio técnico; confirmar si puede suministrarse." },
  { id: "2bloom-5kg", productSlug: "2bloom", label: "2BLOOM sólido 3-8-3 · referencia de 5 kg", note: "Presentación del portafolio técnico; confirmar si puede suministrarse." },
  { id: "2fruit-5kg", productSlug: "2fruit", label: "2FRUIT sólido 3-3-8 · referencia de 5 kg", note: "Presentación del portafolio técnico; confirmar si puede suministrarse." },
  { id: "2grow-200-0-0", productSlug: "2grow-liquido", label: "2GROW líquido 200-0-0", note: "Formato y suministro por consultar; no se añade como presentación comercial del 100-20-20." },
  { id: "2bloom-liquido", productSlug: "2bloom-liquido", label: "2BLOOM líquido 30-80-30", note: "Referencia técnica; presentación, disponibilidad y suministro por consultar." },
  { id: "bioinsumo-trichoderma", productSlug: "bioinsumo-trichoderma", label: "Trichoderma", note: "Referencia técnica; confirmar especie/cepa, ficha, etiqueta, registro y condiciones." },
  { id: "bioinsumo-bacillus-subtilis", productSlug: "bioinsumo-bacillus-subtilis", label: "Bacillus subtilis", note: "Referencia técnica; confirmar cepa, ficha, etiqueta, registro y condiciones." },
  { id: "bioinsumo-beauveria", productSlug: "bioinsumo-beauveria", label: "Beauveria", note: "Referencia técnica; confirmar especie/cepa, ficha, etiqueta, registro y condiciones." },
  { id: "bioinsumo-metarhizium", productSlug: "bioinsumo-metarhizium", label: "Metarhizium", note: "Referencia técnica; confirmar especie/cepa, ficha, etiqueta, registro y condiciones." },
  { id: "bioinsumo-ajo-aji", productSlug: "bioinsumo-ajo-aji", label: "Extracto de ajo y ají", note: "Referencia técnica; confirmar composición, ficha, etiqueta, registro y condiciones." },
  { id: "bioinsumo-neem", productSlug: "bioinsumo-neem", label: "Extracto de Neem", note: "Referencia técnica; confirmar composición, ficha, etiqueta, registro y condiciones." },
];

export function getTechnicalCatalogInquiries(productSlug: string): TechnicalCatalogInquiry[] {
  return technicalCatalogInquiries.filter((inquiry) => inquiry.productSlug === productSlug);
}
