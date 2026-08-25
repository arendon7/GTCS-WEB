import type { HomeGardenEvidenceGateId } from "./home-garden-evidence";

export type HomeGardenReadinessStatus = "ready" | "pending" | "blocked";

export type HomeGardenReadinessItem = {
  id: string;
  area: string;
  status: HomeGardenReadinessStatus;
  publicLabel: string;
  publicCopy: string;
  gate: string;
  evidenceGate?: HomeGardenEvidenceGateId;
};

export const homeGardenLaunchReadiness: readonly HomeGardenReadinessItem[] = [
  {
    id: "technical-product-truth",
    area: "Producto",
    status: "ready",
    publicLabel: "Referencias y fórmulas",
    publicCopy: "Las cinco etapas visibles están conectadas con referencias Wondergreen documentadas; el nombre doméstico no reemplaza la referencia técnica.",
    gate: "Conservar correspondencia con Product Truth y no derivar nuevos claims desde el arte.",
    evidenceGate: "technical-product-truth",
  },
  {
    id: "kit-composition-v1",
    area: "Kits",
    status: "ready",
    publicLabel: "Composición de los cinco kits visibles",
    publicCopy: "La composición y secuencia de los kits de pre-lanzamiento ya están estructuradas por etapa.",
    gate: "No interpretar composición como disponibilidad, precio, ahorro, cobertura o uso simultáneo.",
  },
  {
    id: "safe-diagnostic",
    area: "Uso",
    status: "ready",
    publicLabel: "Orientación y límites de seguridad",
    publicCopy: "El orientador puede detener una recomendación cuando hay señales de encharcamiento, daño sanitario, raíces comprometidas o marchitez severa.",
    gate: "Mantener deshabilitada la calculadora de dosis hasta completar calibración doméstica.",
  },
  {
    id: "household-skus",
    area: "Presentaciones",
    status: "pending",
    publicLabel: "Presentaciones domésticas previstas para venta",
    publicCopy: "Los tamaños 500 g, 1 kg, 2 kg y 5 kg están previstos para la línea doméstica; todavía no equivalen a inventario disponible para venta.",
    gate: "Cerrar SKU, stock, empaque, etiqueta y trazabilidad por presentación.",
    evidenceGate: "household-skus",
  },
  {
    id: "regulatory",
    area: "Regulatorio",
    status: "pending",
    publicLabel: "Cobertura regulatoria de cada presentación",
    publicCopy: "Antes de vender una nueva presentación debe verificarse que registro de venta, etiquetado y condición aplicable de envasado/empacado la cubran.",
    gate: "Verificación documental ICA por referencia y presentación antes de activar compra.",
    evidenceGate: "regulatory",
  },
  {
    id: "dose-and-dosifier",
    area: "Dosificación",
    status: "pending",
    publicLabel: "Dosis doméstica y dosificador",
    publicCopy: "S/M/L/XL ya se capturan como tamaños de matera, pero todavía no se convierten a gramos ni frecuencia universal.",
    gate: "Validar tabla por formulación, tamaño de planta/contenedor y equivalencia real del dosificador.",
    evidenceGate: "dose-and-dosifier",
  },
  {
    id: "all-in-cost",
    area: "Economía unitaria",
    status: "pending",
    publicLabel: "Costo total y PVP por definir",
    publicCopy: "El costo de producto es solo una parte. El PVP se publicará únicamente cuando exista costo total puesto a venta y una política de margen verificable.",
    gate: "Cerrar el checklist all-in completo antes de calcular margen, ahorro, descuento o precio público.",
    evidenceGate: "all-in-cost",
  },
  {
    id: "fulfillment",
    area: "Operación",
    status: "pending",
    publicLabel: "Armado, inventario y logística",
    publicCopy: "La tienda requiere una promesa operativa real: disponibilidad, armado, embalaje, despacho y tratamiento del flete.",
    gate: "Definir stock vendible, punto de armado, tiempos, cobertura logística y manejo de incidencias.",
    evidenceGate: "fulfillment",
  },
  {
    id: "public-assets",
    area: "Activos",
    status: "pending",
    publicLabel: "Imágenes, guías y QR finales",
    publicCopy: "Hay activos candidatos y guías fuente, pero el arte no sustituye la información técnica vigente ni puede usar QR o pesos inconsistentes.",
    gate: "Publicar solo binarios auditados contra fórmula, peso, composición, etiqueta y destino QR final.",
    evidenceGate: "public-assets",
  },
  {
    id: "transplant-kit",
    area: "Kits",
    status: "blocked",
    publicLabel: "Kit Trasplanta & Arranca",
    publicCopy: "Permanece fuera del catálogo vendible mientras el componente radicular o bioinsumo no tenga documentación técnica, condición regulatoria y condición comercial confirmadas.",
    gate: "No exponer como SKU ni habilitar checkout hasta cerrar el componente faltante.",
  },
] as const;

export const homeGardenAllInCostChecklist = [
  "Contenido/fertilizante por presentación",
  "Empaque individual y cierre",
  "Etiqueta y material impreso",
  "Dosificador",
  "Contenedor del kit / fique",
  "Caja o embalaje exterior",
  "Guía, tarjeta e insertos",
  "Mano de obra y ensamble",
  "Control de calidad",
  "Energía y costos industriales asignables",
  "Merma y reproceso",
  "Pasarela de pago y comisiones",
  "Preparación de despacho",
  "Logística y flete según política comercial",
] as const;

export const readyHomeGardenLaunchItems = homeGardenLaunchReadiness.filter((item) => item.status === "ready");
export const pendingHomeGardenLaunchItems = homeGardenLaunchReadiness.filter((item) => item.status === "pending");
export const blockedHomeGardenLaunchItems = homeGardenLaunchReadiness.filter((item) => item.status === "blocked");

export const homeGardenCommerceGate = {
  indexable: false,
  checkoutEnabled: false,
  priceEnabled: false,
  canPublishPrice: false,
  canClaimMargin: false,
  rule: "No activar indexación comercial, precio, checkout, margen, ahorro o descuento hasta que los gates regulatorios, de dosificación, SKU, costo all-in, operación y activos estén reconciliados con la evidencia exigida para la misma referencia y presentación.",
} as const;
