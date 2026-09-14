export type HomeGardenStage = "prepara" | "crece" | "equilibra" | "florece" | "fructifica";
export type HomeGardenAvailability = "technical-truth" | "prelaunch" | "blocked";

export type HomeGardenProduct = {
  id: HomeGardenStage;
  consumerName: string;
  technicalName: string;
  formula?: string;
  role: string;
  prompt: string;
  accent: "earth" | "orange" | "violet" | "blue" | "coral";
  technicalSlug: string;
  availability: HomeGardenAvailability;
  plannedHouseholdVariants: readonly string[];
  householdFormatStatus: string;
};

export type HomeGardenKit = {
  id: string;
  name: string;
  audience: string;
  promise: string;
  pathway: readonly HomeGardenStage[];
  contents: readonly string[];
  availability: "prelaunch" | "blocked";
  guardrail: string;
};

export type HomeGardenGuide = {
  id: string;
  title: string;
  summary: string;
  sourceFile: string;
  sourceStatus: "handoff-validated";
  deployedDownload?: string;
};

export const homeGardenProducts: readonly HomeGardenProduct[] = [
  {
    id: "prepara",
    consumerName: "COMPOST",
    technicalName: "Wondergreen Compost",
    role: "Materia orgánica y acondicionamiento del sustrato antes de pensar en la siguiente etapa de nutrición.",
    prompt: "Empieza por el suelo.",
    accent: "earth",
    technicalSlug: "compost",
    availability: "technical-truth",
    plannedHouseholdVariants: ["2 kg", "5 kg"],
    householdFormatStatus: "2 kg y 5 kg provienen del handoff B2C como presentaciones propuestas. No equivalen a SKUs comerciales reconciliados ni sustituyen la presentación técnica vigente.",
  },
  {
    id: "crece",
    consumerName: "CRECE",
    technicalName: "2Grow Sólido",
    formula: "15-3-3",
    role: "Crecimiento, brotación y recuperación vegetativa dentro del sistema Wondergreen.",
    prompt: "Cuando la planta está creciendo, cambia lo que necesita.",
    accent: "orange",
    technicalSlug: "2grow-solido-15-3-3",
    availability: "technical-truth",
    plannedHouseholdVariants: ["500 g", "1 kg", "2 kg", "5 kg"],
    householdFormatStatus: "Los cuatro formatos provienen del handoff B2C y siguen sujetos a cierre de empaque, etiqueta, stock, dosificación y condición regulatoria antes de habilitar compra.",
  },
  {
    id: "equilibra",
    consumerName: "EQUILIBRA",
    technicalName: "2Balance Sólido",
    formula: "7-7-7",
    role: "Mantenimiento y nutrición balanceada cuando la planta se encuentra estable.",
    prompt: "No siempre necesita empuje. A veces necesita equilibrio.",
    accent: "violet",
    technicalSlug: "2balance-solido-7-7-7",
    availability: "technical-truth",
    plannedHouseholdVariants: ["500 g", "1 kg", "2 kg", "5 kg"],
    householdFormatStatus: "Los cuatro formatos provienen del handoff B2C y siguen sujetos a cierre de empaque, etiqueta, stock, dosificación y condición regulatoria antes de habilitar compra.",
  },
  {
    id: "florece",
    consumerName: "FLORECE",
    technicalName: "2Bloom Sólido",
    formula: "3-8-3",
    role: "Etapas de transición reproductiva, prefloración y floración, sin convertir nutrición en una promesa de floración.",
    prompt: "Si cambia a floración, cambia su nutrición.",
    accent: "blue",
    technicalSlug: "2bloom-solido-3-8-3",
    availability: "technical-truth",
    plannedHouseholdVariants: ["500 g", "1 kg", "2 kg", "5 kg"],
    householdFormatStatus: "Los cuatro formatos provienen del handoff B2C y siguen sujetos a cierre de empaque, etiqueta, stock, dosificación y condición regulatoria antes de habilitar compra.",
  },
  {
    id: "fructifica",
    consumerName: "FRUCTIFICA",
    technicalName: "2Fruit Sólido",
    formula: "3-3-8",
    role: "Etapas productivas, cuajado, desarrollo y llenado, sin prometer rendimiento, calibre o cosecha.",
    prompt: "La etapa productiva tiene otra lógica nutricional.",
    accent: "coral",
    technicalSlug: "2fruit-solido-3-3-8",
    availability: "technical-truth",
    plannedHouseholdVariants: ["500 g", "1 kg", "2 kg", "5 kg"],
    householdFormatStatus: "Los cuatro formatos provienen del handoff B2C y siguen sujetos a cierre de empaque, etiqueta, stock, dosificación y condición regulatoria antes de habilitar compra.",
  },
] as const;

export function getHomeGardenProduct(id: string) {
  return homeGardenProducts.find((product) => product.id === id);
}

export const homeGardenMethod = ["OBSERVA", "IDENTIFICA", "ELIGE", "APLICA", "REVISA"] as const;

export const homeGardenKits: readonly HomeGardenKit[] = [
  {
    id: "plantas-verdes",
    name: "Kit Plantas Verdes",
    audience: "Plantas de follaje, interior y exterior",
    promise: "Crece cuando lo necesita. Equilibra cuando está estable.",
    pathway: ["crece", "equilibra"],
    contents: ["CRECE · 500 g", "EQUILIBRA · 500 g", "Dosificador · calibración pendiente", "Guía de uso · QR pendiente"],
    availability: "prelaunch",
    guardrail: "Composición propuesta V1 del handoff. Precio, formatos, dosificador, QR y checkout permanecen bloqueados hasta cierre comercial, técnico y regulatorio.",
  },
  {
    id: "plantas-con-flor",
    name: "Kit Plantas con Flor",
    audience: "Plantas ornamentales con transición a floración",
    promise: "Si cambia a floración, cambia su nutrición.",
    pathway: ["equilibra", "florece"],
    contents: ["EQUILIBRA · 500 g", "FLORECE · 500 g", "Dosificador · calibración pendiente", "Guía de uso · QR pendiente"],
    availability: "prelaunch",
    guardrail: "Composición propuesta V1. El kit no promete inducir floración y no sustituye la evaluación de luz, agua, edad, especie o sanidad.",
  },
  {
    id: "mi-huerta",
    name: "Kit Mi Huerta",
    audience: "Huertas domésticas, aromáticas y plantas productivas",
    promise: "Del sustrato al fruto.",
    pathway: ["prepara", "crece", "florece", "fructifica"],
    contents: ["COMPOST · 2 kg", "CRECE · 500 g", "FLORECE · 500 g", "FRUCTIFICA · 500 g", "Dosificador · calibración pendiente", "Guía Mi Huerta · QR pendiente"],
    availability: "prelaunch",
    guardrail: "Composición propuesta V1. La secuencia representa etapas; no significa aplicar todos los productos simultáneamente ni garantiza floración, cuajado o cosecha.",
  },
  {
    id: "casa-completa",
    name: "Kit Casa Completa",
    audience: "Hogares con plantas en distintas etapas",
    promise: "4 etapas. 1 sistema. Cero adivinanzas.",
    pathway: ["crece", "equilibra", "florece", "fructifica"],
    contents: ["CRECE · 500 g", "EQUILIBRA · 500 g", "FLORECE · 500 g", "FRUCTIFICA · 500 g", "Dosificador · calibración pendiente", "Guía + diagnóstico · QR pendiente"],
    availability: "prelaunch",
    guardrail: "Composición propuesta V1. Tener las cuatro etapas no significa usarlas juntas. Cada planta entra al sistema según su etapa y condición.",
  },
  {
    id: "casa-completa-xl",
    name: "Casa Completa XL",
    audience: "Colecciones más amplias, jardines y viveros pequeños",
    promise: "Muchas plantas. Una sola lógica.",
    pathway: ["crece", "equilibra", "florece", "fructifica"],
    contents: ["CRECE · 1 kg", "EQUILIBRA · 1 kg", "FLORECE · 1 kg", "FRUCTIFICA · 1 kg", "Dosificador · calibración pendiente", "Guía de uso · QR pendiente"],
    availability: "prelaunch",
    guardrail: "Composición propuesta V1. Cobertura, PVP, stock, empaque y logística siguen en cierre antes de convertirlo en SKU comercial.",
  },
  {
    id: "trasplanta-arranca",
    name: "Kit Trasplanta & Arranca",
    audience: "Trasplantes y establecimiento",
    promise: "Primero raíz, drenaje y estabilidad; después nutrición por etapa.",
    pathway: ["prepara"],
    contents: ["COMPOST · 2 kg", "CRECE · 500 g", "Componente radicular · por validar", "Dosificador · por calibrar", "Guía de trasplante"],
    availability: "blocked",
    guardrail: "No se publica como SKU ni se habilita compra mientras el componente radicular/bioinsumo no tenga Product Truth técnico, regulatorio y comercial reconciliado.",
  },
] as const;

export function getHomeGardenKit(id: string) {
  return homeGardenKits.find((kit) => kit.id === id);
}

export const visibleHomeGardenKits = homeGardenKits.filter((kit) => kit.availability === "prelaunch");

export const homeGardenApplication = [
  { step: "HUMEDECE", copy: "Trabaja con humedad adecuada y buen drenaje; evita fertilizar una planta encharcada o severamente estresada." },
  { step: "DOSIFICA", copy: "La dosis doméstica final se publicará solo después de calibrar formulación y dosificador. No apliques a ojo." },
  { step: "DISTRIBUYE", copy: "Distribuye alrededor de la zona radicular. No acumules pellets contra el tallo." },
  { step: "OBSERVA", copy: "Revisa respuesta, humedad, etapa y condición antes de repetir una aplicación." },
] as const;

export const homeGardenTrafficLight = [
  { level: "VERDE", title: "Puedes evaluar nutrición", copy: "Planta activa, drenaje funcional, humedad adecuada y etapa reconocible." },
  { level: "AMARILLO", title: "Primero confirma la causa", copy: "Trasplante reciente, estrés, sustrato demasiado seco o síntomas que todavía no entiendes." },
  { level: "ROJO", title: "No empieces fertilizando", copy: "Encharcamiento, pudrición, problema radicular, marchitez severa o daño sanitario evidente." },
] as const;

export const homeGardenDiagnostic = {
  calculatorEnabled: false,
  safetyTriggers: ["very-wilted", "waterlogged", "pest-damage", "root-problem"] as const,
  safetyMessage: "NO EMPIECES FERTILIZANDO. Revisa primero agua, drenaje, raíces y sanidad.",
  potSizes: ["S", "M", "L", "XL"] as const,
  stages: { growing: "crece", stable: "equilibra", flowering: "florece", fruiting: "fructifica", mixed: "casa-completa" } as const,
} as const;

export const homeGardenRegulatoryGate = {
  status: "pending-verification",
  checkedAt: "2026-08-19",
  authority: "ICA",
  rule: "No presumir que una nueva presentación B2C queda habilitada por existir la referencia técnica/comercial de mayor tamaño. Antes de comercializar debe confirmarse que registro de venta, etiquetado aprobado y condición de fabricante/formulador/envasador/empacador aplicables cubren la presentación que se pretende vender.",
  sourceNotes: [
    "El ICA exige registro de venta previo a la comercialización de fertilizantes y acondicionadores de suelo.",
    "El trámite contempla proyecto de etiquetado y permite solicitar modificaciones o adiciones al registro de venta.",
    "La actividad de envasar o empacar fertilizantes para comercialización está sujeta al registro empresarial correspondiente ante ICA.",
  ],
} as const;

export const homeGardenGuides: readonly HomeGardenGuide[] = [
  { id: "casa-jardin", title: "Guía Wondergreen Casa & Jardín", summary: "Etapas, método de observación, aplicación, semáforo y errores frecuentes.", sourceFile: "GUIA_WONDERGREEN_CASA_Y_JARDIN_IMAGEGEN_V1.pdf", sourceStatus: "handoff-validated" },
  { id: "mi-huerta", title: "Guía Mi Huerta", summary: "PREPARA → CRECE → FLORECE → FRUCTIFICA para una huerta doméstica por etapas.", sourceFile: "Guia_Mi_Huerta_Wondergreen_V1_optimizada.pdf", sourceStatus: "handoff-validated" },
  { id: "etapas", title: "Guía rápida de etapas", summary: "Una referencia visual corta para identificar la etapa antes de elegir producto.", sourceFile: "GUIA_RAPIDA_ETAPAS_WONDERGREEN_IMAGEGEN_V1.pdf", sourceStatus: "handoff-validated" },
  { id: "trasplante", title: "Guía de trasplante", summary: "Drenaje, raíces, sustrato, estabilidad y observación antes de decidir nutrición.", sourceFile: "GUIA_TRASPLANTE_WONDERGREEN_IMAGEGEN_V1.pdf", sourceStatus: "handoff-validated" },
] as const;

export const homeGardenFaq = [
  { q: "¿Necesito usar CRECE, EQUILIBRA, FLORECE y FRUCTIFICA al mismo tiempo?", a: "No. El sistema existe para elegir según etapa y condición, no para aplicar todo junto." },
  { q: "¿FLORECE hace que cualquier planta florezca?", a: "No. La floración también depende de especie, edad, luz, temperatura, agua, poda y condición general. La nutrición no es una garantía de floración." },
  { q: "¿FRUCTIFICA garantiza más frutos o mejor cosecha?", a: "No. Es una línea orientada a etapas productivas; rendimiento, calibre y cosecha dependen de múltiples variables de manejo y ambiente." },
  { q: "¿El compost reemplaza toda la nutrición?", a: "No. Aporta materia orgánica y acondicionamiento dentro del sistema de suelo, pero no sustituye automáticamente los requerimientos nutricionales de cada etapa." },
  { q: "¿Cada cuánto debo aplicar?", a: "La frecuencia doméstica final sigue pendiente de validación por formulación, tamaño de planta, contenedor y dosificador. Por ahora no publicamos una frecuencia universal." },
  { q: "¿Más producto produce mejores resultados?", a: "No. La lógica de Casa & Jardín es precisamente evitar la aplicación por exceso o a ojo." },
  { q: "¿Debo fertilizar justo después de trasplantar?", a: "No automáticamente. Primero revisa drenaje, raíces, humedad y establecimiento; cuando la planta se estabilice, identifica su etapa." },
  { q: "¿Una hoja amarilla significa falta de fertilizante?", a: "No necesariamente. Agua, raíces, plagas, enfermedades, luz y otros factores pueden producir síntomas similares." },
] as const;

export const homeGardenRelease = {
  route: "/casa-jardin",
  indexable: false,
  checkoutEnabled: false,
  priceEnabled: false,
  householdDoseCalculatorEnabled: false,
  householdVariantsReconciled: false,
  binaryAssetsDeployed: false,
  blockedReasons: [
    "Cerrar dosis domésticas por formulación y tamaño de planta/contenedor.",
    "Calibrar equivalencias reales del dosificador por producto.",
    "Confirmar que registro de venta, etiquetado y condición de envasado/empacado cubran cada presentación B2C.",
    "Reconciliar costos, PVP, márgenes, stock, empaque, armado y logística de envío.",
  ],
} as const;
