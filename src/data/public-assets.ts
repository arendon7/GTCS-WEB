import { wondergreenReferences } from "@/data/wondergreen-public";

export type PublicAssetStatus = "APPROVED_PUBLIC" | "PENDING_PRODUCT_TRUTH" | "REFERENCE_ONLY" | "LEGACY_EXCLUDE";

export type BrandAsset = {
  id: string;
  brand: "Greenatics" | "Wondergreen";
  role: "logo-horizontal" | "symbol" | "logo-wondergreen";
  path: string;
  status: "APPROVED_PUBLIC";
  notes: string;
};

export type ProductAssetPolicy = {
  referenceSlug: string;
  status: PublicAssetStatus;
  publicPath: string | null;
  presentation: string | null;
  formula: string | null;
  notes: string[];
};

export const brandAssets: BrandAsset[] = [
  {
    id: "greenatics-horizontal",
    brand: "Greenatics",
    role: "logo-horizontal",
    path: "/brand/greenatics-horizontal.webp",
    status: "APPROVED_PUBLIC",
    notes: "Activo web autoritativo; no redibujar, deformar ni recolorear mediante filtros.",
  },
  {
    id: "greenatics-symbol",
    brand: "Greenatics",
    role: "symbol",
    path: "/brand/greenatics-symbol.svg",
    status: "APPROVED_PUBLIC",
    notes: "Símbolo autoritativo para usos web aprobados.",
  },
  {
    id: "wondergreen-nutrients",
    brand: "Wondergreen",
    role: "logo-wondergreen",
    path: "/brand/wondergreen-nutrients.webp",
    status: "APPROVED_PUBLIC",
    notes: "Logo Wondergreen autoritativo disponible en el repositorio actual.",
  },
];

const candidateNotes: Record<string, string[]> = {
  "2grow-solido-15-3-3": [
    "Existe antecedente visual real de 2GROW sólido 5 kg, pero no se promueve a packshot público hasta reconciliar versión, fórmula, presentación y etiqueta.",
  ],
  "2grow-liquido-100-20-20": [
    "Existe antecedente visual real de 2GROW líquido 20 L, pero no se usa para representar otras presentaciones ni se promueve sin reconciliación de etiqueta/formulación.",
  ],
};

export const productAssetPolicies: ProductAssetPolicy[] = wondergreenReferences.map((reference) => ({
  referenceSlug: reference.slug,
  status: "PENDING_PRODUCT_TRUTH",
  publicPath: null,
  presentation: null,
  formula: reference.formula ?? null,
  notes: [
    "Fail-closed: sin activo exacto aprobado, la web usa representación neutral y nunca inventa un empaque.",
    ...(candidateNotes[reference.slug] ?? []),
  ],
}));

export function getBrandAsset(id: string) {
  return brandAssets.find((asset) => asset.id === id) ?? null;
}

export function getProductAssetPolicy(referenceSlug: string) {
  return productAssetPolicies.find((policy) => policy.referenceSlug === referenceSlug) ?? null;
}

export function getPublicProductAsset(referenceSlug: string) {
  const policy = getProductAssetPolicy(referenceSlug);
  if (!policy || policy.status !== "APPROVED_PUBLIC" || !policy.publicPath) return null;
  return policy;
}
