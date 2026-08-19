export type StrategicProgram = {
  slug: "esp-ready" | "pmirs-red";
  name: string;
  audience: string;
  headline: string;
  summary: string;
  principle: string;
  primaryLabel: string;
  primaryItems: readonly string[];
  secondaryLabel?: string;
  secondaryItems?: readonly string[];
  outputs: readonly string[];
  relatedServiceSlugs: readonly string[];
  sourceNote: string;
  cta: string;
};

export const strategicPrograms: readonly StrategicProgram[] = [
  {
    slug: "esp-ready",
    name: "ESP READY",
    audience: "Empresas de servicios públicos y operaciones de aseo",
    headline: "¿Qué tan preparada está la empresa para iniciar y crecer?",
    summary: "Diagnóstico integral para ordenar el estado real de una operación, sus brechas, prioridades y decisiones antes de acelerar cobertura, infraestructura o valorización.",
    principle: "No es una auditoría para buscar errores. Es un diagnóstico para saber qué está listo y qué conviene cerrar.",
    primaryLabel: "Revisamos diez dimensiones de preparación",
    primaryItems: [
      "Regulación",
      "Clientes",
      "Operación",
      "Tarifa",
      "Facturación",
      "Rutas",
      "Flota",
      "Datos",
      "Contingencias",
      "Infraestructura futura",
    ],
    outputs: ["Estado actual", "Brechas", "Prioridades", "Hoja de ruta"],
    relatedServiceSlugs: [
      "diagnostico-caracterizacion",
      "rutas-selectivas",
      "trazabilidad-datos",
      "prefactibilidad",
      "direccion-operacion",
    ],
    sourceNote: "Producto consultivo derivado de la metodología ESP READY. El alcance final se define según actividades, responsabilidades e información disponible en cada ESP.",
    cta: "Evaluar preparación de una ESP",
  },
  {
    slug: "pmirs-red",
    name: "PMIRS RED",
    audience: "Redes de propiedad horizontal, grandes generadores y operadores",
    headline: "De PMIRS individuales a una arquitectura común de información.",
    summary: "Metodología para formular e implementar PMIRS bajo un estándar común, de modo que cada unidad reciba su plan y la red pueda consolidar información comparable para operación y decisiones posteriores.",
    principle: "El cumplimiento puede convertirse en inteligencia operativa cuando la información se levanta bajo una estructura común.",
    primaryLabel: "Cada unidad puede recibir",
    primaryItems: ["Diagnóstico", "Caracterización", "Programas", "Implementación", "Indicadores", "Seguimiento"],
    secondaryLabel: "La red puede consolidar",
    secondaryItems: ["Demanda", "Ubicación", "Composición", "Accesos", "Horarios", "Orgánicos", "Aprovechables", "Oportunidades"],
    outputs: ["PMIRS implementables", "Base consolidada", "Indicadores comparables", "Ruta de seguimiento"],
    relatedServiceSlugs: [
      "pmirs",
      "diagnostico-caracterizacion",
      "rutas-selectivas",
      "trazabilidad-datos",
      "recoleccion-tratamiento",
    ],
    sourceNote: "PMIRS RED generaliza la metodología desarrollada para el caso PMIRS RED 24. El número de unidades, fases y entregables se define en cada alcance; 24 no es un mínimo ni una promesa universal.",
    cta: "Estructurar una red PMIRS",
  },
] as const;

export const getStrategicProgram = (slug: string) => strategicPrograms.find((program) => program.slug === slug);
