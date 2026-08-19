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
  file: string;
  status: "web-ready";
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
    householdFormatStatus: "Las presentaciones domésticas siguen en cierre; la referencia técnica/comercial vigente conserva su Product Truth propio.",
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
    householdFormatStatus: "El formato doméstico propuesto requiere cierre de empaque, etiqueta, stock y dosificación antes de habilitar compra.",
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
    householdFormatStatus: "El formato doméstico propuesto requiere cierre de empaque, etiqueta, stock y dosificación antes de habilitar compra.",
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
    householdFormatStatus: "El formato doméstico propuesto requiere cierre de empaque, etiqueta, stock y dosificación antes de habilitar compra.",
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
    householdFormatStatus: "El formato doméstico propuesto requiere cierre de empaque, etiqueta, stock y dosificación antes de habilitar compra.",
  },
] as const;

export const homeGardenMethod = ["OBSERVA", "IDENTIFICA", "ELIGE", "APLICA", "REVISA"] as const;

export const homeGardenKits: readonly HomeGardenKit[] = [
  {
    id: "plantas-verdes",
    name: "Kit Plantas Verdes",
    audience: "Plantas de follaje, interior y exterior",
    promise: "Crece cuando lo necesita. Equilibra cuando está estable.",
    pathway: ["crece", "equilibra"],
    contents: ["CRECE", "EQUILIBRA", "dosificador pendiente de calibración final", "guía de uso"],
    availability: "prelaunch",
    guardrail: "Concepto de kit validado para la arquitectura web. Precio, formatos domésticos, dosificador y checkout permanecen bloqueados hasta cierre comercial y técnico.",
  },
  {
    id: "plantas-con-flor",
    name: "Kit Plantas con Flor",
    audience: "Plantas ornamentales con transición a floración",
    promise: "Si cambia a floración, cambia su nutrición.",
    pathway: ["equilibra", "florece"],
    contents: ["EQUILIBRA", "FLORECE", "dosificador pendiente de calibración final", "guía de uso"],
    availability: "prelaunch",
    guardrail: "El kit no promete inducir floración. Es una lógica de nutrición por etapa y no sustituye la evaluación de luz, agua, edad, especie o sanidad.",
  },
  {
    id: "mi-huerta",
    name: "Kit Mi Huerta",
    audience: "Huertas domésticas, aromáticas y plantas productivas",
    promise: "Del sustrato al fruto.",
    pathway: ["prepara", "crece", "florece", "fructifica"],
    contents: ["COMPOST", "CRECE", "FLORECE", "FRUCTIFICA", "dosificador pendiente de calibración final", "guía Mi Huerta"],
    availability: "prelaunch",
    guardrail: "La secuencia representa etapas; no significa aplicar todos los productos simultáneamente ni garantiza floración, cuajado o cosecha.",
  },
  {
    id: "casa-completa",
    name: "Kit Casa Completa",
    audience: "Hogares con plantas en distintas etapas",
    promise: "4 etapas. 1 sistema. Cero adivinanzas.",
    pathway: ["crece", "equilibra", "florece", "fructifica"],
    contents: ["CRECE", "EQUILIBRA", "FLORECE", "FRUCTIFICA", "dosificador pendiente de calibración final", "guía + diagnóstico"],
    availability: "prelaunch",
    guardrail: "Tener las cuatro etapas no significa usarlas juntas. Cada planta entra al sistema según su etapa y condición.",
  },
  {
    id: "casa-completa-xl",
    name: "Casa Completa XL",
    audience: "Colecciones más amplias, jardines y viveros pequeños",
    promise: "Muchas plantas. Una sola lógica.",
    pathway: ["crece", "equilibra", "florece", "fructifica"],
    contents: ["CRECE", "EQUILIBRA", "FLORECE", "FRUCTIFICA", "dosificador pendiente de calibración final", "guía de uso"],
    availability: "prelaunch",
    guardrail: "El tamaño XL es una propuesta B2C/B2B liviana en cierre; cobertura, presentaciones y PVP no se publican hasta reconciliar dosificación, empaque, stock y logística.",
  },
  {
    id: "trasplanta-arranca",
    name: "Kit Trasplanta & Arranca",
    audience: "Trasplantes y establecimiento",
    promise: "Primero raíz, drenaje y estabilidad; después nutrición por etapa.",
    pathway: ["prepara"],
    contents: ["componente radicular por validar", "guía de trasplante"],
    availability: "blocked",
    guardrail: "No se publica como SKU ni se habilita compra mientras el componente radicular/bioinsumo no tenga Product Truth técnico, regulatorio y comercial reconciliado.",
  },
] as const;

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
  stages: {
    growing: "crece",
    stable: "equilibra",
    flowering: "florece",
    fruiting: "fructifica",
    mixed: "casa-completa",
  } as const,
} as const;

export const homeGardenGuides: readonly HomeGardenGuide[] = [
  { id: "casa-jardin", title: "Guía Wondergreen Casa & Jardín", summary: "Etapas, método de observación, aplicación, semáforo y errores frecuentes.", file: "/casa-jardin/guias/guia-casa-jardin.pdf", status: "web-ready" },
  { id: "mi-huerta", title: "Guía Mi Huerta", summary: "PREPARA → CRECE → FLORECE → FRUCTIFICA para una huerta doméstica por etapas.", file: "/casa-jardin/guias/guia-mi-huerta.pdf", status: "web-ready" },
  { id: "etapas", title: "Guía rápida de etapas", summary: "Una referencia visual corta para identificar la etapa antes de elegir producto.", file: "/casa-jardin/guias/guia-rapida-etapas.pdf", status: "web-ready" },
  { id: "trasplante", title: "Guía de trasplante", summary: "Drenaje, raíces, sustrato, estabilidad y observación antes de decidir nutrición.", file: "/casa-jardin/guias/guia-trasplante.pdf", status: "web-ready" },
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
  blockedReasons: [
    "Cerrar dosis domésticas por formulación y tamaño de planta/contenedor.",
    "Calibrar equivalencias reales del dosificador por producto.",
    "Cerrar etiquetas, textos legales y presentaciones B2C.",
    "Reconciliar costos, PVP, márgenes, stock, empaque, armado y logística de envío.",
  ],
} as const;
