export type StrategicProgram = {
  slug: "esp-ready" | "greenatics-base" | "pmirs-red";
  name: string;
  audience: string;
  headline: string;
  summary: string;
  principle: string;
  primaryLabel: string;
  primaryHeading: string;
  primaryItems: readonly string[];
  secondaryLabel?: string;
  secondaryHeading?: string;
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
    primaryHeading: "La preparación se revisa como un sistema.",
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
    slug: "greenatics-base",
    name: "GREENATICS BASE",
    audience: "ESP, redes multiunidad y organizaciones que necesitan producir una línea base",
    headline: "Empieza a producir información real mientras estructuras lo que sigue.",
    summary: "Sistema dirigido de línea base, caracterización y lectura operativa para convertir trabajo de campo en información comparable, reutilizable y sometida a control de calidad.",
    principle: "Empezamos ya, pero con método: campo y estructuración pueden avanzar en paralelo sin confundir medición técnica con conclusiones regulatorias.",
    primaryLabel: "Sistema dirigido de información",
    primaryHeading: "No es solo medir. Es construir una primera base técnica reutilizable.",
    primaryItems: [
      "Línea base de generación",
      "Caracterización de residuos",
      "Diagnóstico de infraestructura",
      "Lectura operativa del proyecto",
      "Captura digital y evidencia",
      "Consolidación y análisis",
    ],
    secondaryLabel: "Alcance y precisión",
    secondaryHeading: "La línea base técnica no sustituye otros estudios o procedimientos.",
    secondaryItems: [
      "PMIRS completo",
      "Aforo regulatorio",
      "Estudio tarifario",
      "Diseño final de rutas",
      "Ingeniería",
      "Permisos",
    ],
    outputs: ["Ficha GREENATICS BASE", "Base consolidada", "Evidencias organizadas", "Insumos para PMIRS y operación"],
    relatedServiceSlugs: [
      "diagnostico-caracterizacion",
      "pmirs",
      "rutas-selectivas",
      "trazabilidad-datos",
    ],
    sourceNote: "GREENATICS BASE generaliza la metodología desarrollada para RED BELLO: línea base técnica, medición, caracterización, diagnóstico operativo, consolidación y análisis. No es por sí misma PMIRS, aforo regulatorio, estudio tarifario, diseño final de rutas, ingeniería ni permiso. Si se requiere aforo regulatorio, debe estructurarse como un alcance independiente conforme al procedimiento aplicable.",
    cta: "Activar una línea base técnica",
  },
  {
    slug: "pmirs-red",
    name: "PMIRS RED",
    audience: "Redes de propiedad horizontal, grandes generadores y operadores",
    headline: "De PMIRS individuales a una arquitectura común de información.",
    summary: "Metodología para formular e implementar PMIRS bajo un estándar común, de modo que cada unidad reciba su plan y la red pueda consolidar información comparable para operación y decisiones posteriores.",
    principle: "El cumplimiento puede convertirse en inteligencia operativa cuando la información se levanta bajo una estructura común.",
    primaryLabel: "Cada unidad puede recibir",
    primaryHeading: "Cada unidad conserva su propio plan.",
    primaryItems: ["Diagnóstico", "Caracterización", "Programas", "Implementación", "Indicadores", "Seguimiento"],
    secondaryLabel: "La red puede consolidar",
    secondaryHeading: "La red transforma planes separados en información comparable.",
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
