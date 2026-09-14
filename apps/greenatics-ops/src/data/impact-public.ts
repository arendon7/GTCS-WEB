export type PublicImpactStatus = "pending_publication" | "published";

export type PublicImpactMetric = {
  id: string;
  label: string;
  unit: string;
  value: number | null;
  status: PublicImpactStatus;
  source: "GREENATICS OPS";
  cutoff: string | null;
  note: string;
  methodologyRequired: boolean;
};

export const publicImpactMetrics: PublicImpactMetric[] = [
  {
    id: "received-mass",
    label: "Residuos orgánicos recibidos",
    unit: "t",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Se publica desde registros de recepción validados para un periodo y alcance identificados.",
    methodologyRequired: false,
  },
  {
    id: "recovered-mass",
    label: "Material orgánico aprovechado",
    unit: "t",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Requiere balance de masa, control de rechazos y definición consistente de aprovechamiento para el corte publicado.",
    methodologyRequired: true,
  },
  {
    id: "solid-product",
    label: "Productos sólidos generados",
    unit: "t",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Se alimenta desde registros de producto terminado e inventario conciliados.",
    methodologyRequired: false,
  },
  {
    id: "liquid-product",
    label: "Productos líquidos generados",
    unit: "L",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Se publica por periodo y planta cuando exista validación técnica de la categoría y las unidades.",
    methodologyRequired: false,
  },
  {
    id: "rejection-rate",
    label: "Tasa de rechazo",
    unit: "%",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Depende de masa recibida, impropios, criterios de aceptación y cobertura de medición del periodo.",
    methodologyRequired: true,
  },
  {
    id: "climate-impact",
    label: "Impacto climático estimado",
    unit: "t CO₂-eq",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Solo se publicará con metodología, factores, escenario de referencia, límites del sistema y supuestos explícitos.",
    methodologyRequired: true,
  },
];

export function isPublishableMetric(metric: PublicImpactMetric) {
  if (metric.status !== "published") return false;
  if (metric.value === null || metric.cutoff === null) return false;
  return true;
}
