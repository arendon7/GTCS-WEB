export type TamesisImpactMetric = {
  value: string;
  label: string;
  detail: string;
  basis: string;
};

export const tamesisImpactScenario = {
  eyebrow: "Támesis · biogás, bioenergía e impacto potencial",
  title: "Cuando el orgánico entra en una cadena local, el valor también puede medirse.",
  intro:
    "La planta de Támesis permite comparar la ruta tradicional de recolección y disposición final con una cadena que recibe, acondiciona, digiere y valoriza la biomasa. La referencia combina infraestructura existente con rangos de diseño y un escenario inicial de CO₂e que puede precisarse con datos de operación.",
  metrics: [
    {
      value: "30 m³",
      label: "reactor UASB instalado",
      detail: "Activo documentado dentro de la infraestructura existente del caso Támesis.",
      basis: "Infraestructura existente",
    },
    {
      value: "60–90 t/mes",
      label: "corriente orgánica mensual de referencia",
      detail: "Rango de dimensionamiento para una cadena local de digestión y valorización; no es un promedio reportado del periodo actual.",
      basis: "Rango de referencia de diseño",
    },
    {
      value: "1.800–3.000 m³/mes",
      label: "biogás potencial",
      detail: "Escenario de diseño basado en caudal y carga orgánica de referencia. La producción efectiva depende del volumen capturado y de la composición del gas.",
      basis: "Escenario de diseño preliminar",
    },
    {
      value: "8–14 t CO₂e/mes",
      label: "CO₂e potencial · escenario inicial",
      detail: "Escenario comparativo de disposición final, transporte y energía sustituida. No es una medición, verificación ni reducción acreditada; el resultado depende de la línea base, los datos del proceso y los factores de emisión aplicables.",
      basis: "Escenario preliminar de CO₂e",
    },
  ] satisfies readonly TamesisImpactMetric[],
  method:
    "Los rangos de tratamiento y biogás son referencias de diseño, no resultados de operación. El escenario de CO₂e tampoco representa una reducción medida o verificada. Para evaluarlo se consideran masa y composición de entrada, destino de referencia, distancia y combustible, metano capturado, biogás medido, energía aprovechada, emisiones fugitivas, consumos del proceso, destino de digestatos y periodo del inventario.",
} as const;
