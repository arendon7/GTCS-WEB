export type PublicImpactMetric = {
  id: string;
  label: string;
  unit: string;
  value: number | null;
  status: "pending_publication" | "published";
  source: "GREENATICS OPS";
  cutoff: string | null;
  note: string;
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
    note: "Se publica desde registros de recepción validados.",
  },
  {
    id: "recovered-mass",
    label: "Material orgánico aprovechado",
    unit: "t",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Requiere balance de masa y control de rechazos del periodo.",
  },
  {
    id: "solid-product",
    label: "Productos sólidos generados",
    unit: "t",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Se alimenta desde producto terminado e inventario.",
  },
  {
    id: "liquid-product",
    label: "Productos líquidos generados",
    unit: "L",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Se publica por periodo y planta cuando exista validación técnica.",
  },
  {
    id: "rejection-rate",
    label: "Tasa de rechazo",
    unit: "%",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Depende de masa recibida, impropios y criterios del periodo.",
  },
  {
    id: "climate-impact",
    label: "Impacto climático estimado",
    unit: "t CO₂-eq",
    value: null,
    status: "pending_publication",
    source: "GREENATICS OPS",
    cutoff: null,
    note: "Solo se publicará con metodología, factores y supuestos explícitos.",
  },
];
