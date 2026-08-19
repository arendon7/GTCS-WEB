export type HomeGardenAssetStatus = "candidate-web" | "source-guide" | "blocked";

export type HomeGardenAsset = {
  id: string;
  sourceFile: string;
  kind: "hero" | "packshot" | "kit" | "education" | "pdf" | "draft";
  status: HomeGardenAssetStatus;
  use: string;
  guardrail: string;
};

// Inventory extracted from WONDERGREEN_CASA_JARDIN_WEB_HANDOFF_V1_2026-08-19.
// This manifest governs whether a source asset may enter the public web. It does not assert
// that the binary is already deployed, nor does artwork override Product Truth.
export const homeGardenAssets: readonly HomeGardenAsset[] = [
  {
    id: "hero-source",
    sourceFile: "hero_casa_y_jardin.png",
    kind: "hero",
    status: "blocked",
    use: "Aesthetic reference only until packaging text is reconciled.",
    guardrail: "The artwork shows a Compost household weight that conflicts with current/proposed structured product data. Do not publish as-is.",
  },
  ...[
    ["packshot-crece", "packshot_crece.png", "CRECE / 2Grow 15-3-3"],
    ["packshot-equilibra", "packshot_equilibra.png", "EQUILIBRA / 2Balance 7-7-7"],
    ["packshot-florece", "packshot_florece.png", "FLORECE / 2Bloom 3-8-3"],
    ["packshot-fructifica", "packshot_fructifica.png", "FRUCTIFICA / 2Fruit 3-3-8"],
    ["packshot-compost", "packshot_compost.png", "COMPOST 2 kg"],
  ].map(([id, sourceFile, use]) => ({
    id,
    sourceFile,
    kind: "packshot" as const,
    status: "candidate-web" as const,
    use,
    guardrail: "Use only as a prelaunch visual after checking visible formula/weight. It does not make a household pack a reconciled commercial SKU or final print label.",
  })),
  ...[
    ["kit-plantas-verdes", "kit_plantas_verdes.png", "Kit Plantas Verdes"],
    ["kit-plantas-flor", "kit_plantas_con_flor.png", "Kit Plantas con Flor"],
    ["kit-casa-completa", "kit_casa_completa.png", "Kit Casa Completa"],
    ["kit-casa-completa-xl", "kit_casa_completa_xl.png", "Casa Completa XL"],
  ].map(([id, sourceFile, use]) => ({
    id,
    sourceFile,
    kind: "kit" as const,
    status: "candidate-web" as const,
    use,
    guardrail: "Concept/prelaunch visual only. Visible weights were checked against the structured V1 composition, but the artwork is not a final commercial label. Do not infer price, savings, stock or checkout availability.",
  })),
  {
    id: "kit-mi-huerta",
    sourceFile: "kit_mi_huerta.png",
    kind: "kit",
    status: "blocked",
    use: "Aesthetic reference pending regeneration.",
    guardrail: "Structured Kit Mi Huerta V1 requires COMPOST 2 kg, while this artwork visibly shows COMPOST 1 kg. Product Truth wins: do not publish this image until corrected.",
  },
  {
    id: "education-pot-size",
    sourceFile: "C5_tamanos_matera.png",
    kind: "education",
    status: "candidate-web",
    use: "Explain pot-size classification for future diagnosis/sizing.",
    guardrail: "Do not convert S/M/L/XL into grams or dose until the household dose table is validated.",
  },
  {
    id: "education-stress",
    sourceFile: "C6_no_todo_estres.png",
    kind: "education",
    status: "candidate-web",
    use: "Safety education: symptoms are not automatically fertilizer deficiencies.",
    guardrail: "Use structured diagnostic copy as the source of truth if image text differs.",
  },
  ...[
    ["guide-master", "GUIA_WONDERGREEN_CASA_Y_JARDIN_IMAGEGEN_V1.pdf", "Master Casa & Jardín guide"],
    ["guide-huerta", "Guia_Mi_Huerta_Wondergreen_V1_optimizada.pdf", "Mi Huerta guide"],
    ["guide-etapas", "GUIA_RAPIDA_ETAPAS_WONDERGREEN_IMAGEGEN_V1.pdf", "Stage quick guide"],
    ["guide-trasplante", "GUIA_TRASPLANTE_WONDERGREEN_IMAGEGEN_V1.pdf", "Transplant education guide"],
  ].map(([id, sourceFile, use]) => ({
    id,
    sourceFile,
    kind: "pdf" as const,
    status: "source-guide" as const,
    use,
    guardrail: "Web content and structured Product Truth override generated-image text. Remove/replace any nonfunctional QR and reconcile visible weights before public binary deployment.",
  })),
  {
    id: "kit-transplant-source",
    sourceFile: "kit_trasplanta_arranca.png",
    kind: "draft",
    status: "blocked",
    use: "Reference only.",
    guardrail: "Do not publish or sell until the root/bioinput component has reconciled technical, regulatory and commercial truth.",
  },
  {
    id: "kit-card-qr",
    sourceFile: "TARJETA_KIT_WONDERGREEN_DOBLE_CARA_IMAGEGEN_V1.pdf",
    kind: "draft",
    status: "blocked",
    use: "Future physical kit card.",
    guardrail: "Contains/depends on QR and dosifier details that are not final. Do not publish as a functional asset.",
  },
] as const;

export const publishableHomeGardenAssets = homeGardenAssets.filter((asset) => asset.status !== "blocked");
export const blockedHomeGardenAssets = homeGardenAssets.filter((asset) => asset.status === "blocked");
