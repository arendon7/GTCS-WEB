export type ServiceJourney = {
  number: string;
  kicker: string;
  title: string;
  copy: string;
  services: readonly { slug: string; label: string }[];
};

// UX/business grouping only: the governed service registry remains the source of contractual scope.
// Every governed service appears exactly once in this commercial layer.
export const serviceJourneys: readonly ServiceJourney[] = [
  {
    number: "01",
    kicker: "Necesito entender el sistema",
    title: "Diagnóstico y datos",
    copy: "Para construir línea base, ordenar evidencia y convertir la operación en información útil antes de tomar decisiones de inversión, cumplimiento o crecimiento.",
    services: [
      { slug: "diagnostico-caracterizacion", label: "Diagnóstico y caracterización" },
      { slug: "trazabilidad-datos", label: "Trazabilidad, indicadores y datos" },
    ],
  },
  {
    number: "02",
    kicker: "Necesito convertir obligaciones en gestión",
    title: "Planeación y gestión",
    copy: "Para llevar PGIRS y PMIRS desde el documento hacia programas, responsables, indicadores, implementación y seguimiento.",
    services: [
      { slug: "pgirs", label: "PGIRS" },
      { slug: "pmirs", label: "PMIRS" },
    ],
  },
  {
    number: "03",
    kicker: "Necesito que la operación funcione",
    title: "Operación de aseo y logística",
    copy: "Para conectar generadores, rutas, frecuencias, vehículos, tiempos y evidencia operacional antes de ampliar cobertura o capacidad.",
    services: [
      { slug: "rutas-selectivas", label: "Rutas selectivas y microrrutas" },
      { slug: "motocarguero", label: "Pilotos de recolección y toma de datos" },
    ],
  },
  {
    number: "04",
    kicker: "Necesito aprovechar mejor las corrientes",
    title: "Circularidad y valorización",
    copy: "Para integrar separación, recolección, trazabilidad y tratamiento de orgánicos de modo que la gestión no termine en una simple entrega sin evidencia de destino.",
    services: [
      { slug: "recoleccion-tratamiento", label: "Recolección, trazabilidad y tratamiento" },
    ],
  },
  {
    number: "05",
    kicker: "Necesito decidir si invertir y en qué",
    title: "Infraestructura y proyectos",
    copy: "Para comparar alternativas, madurar ingeniería, construir o recuperar capacidad solo después de validar residuos, logística, localización y modelo operativo.",
    services: [
      { slug: "prefactibilidad", label: "Prefactibilidad" },
      { slug: "factibilidad-ingenieria", label: "Factibilidad e ingeniería" },
      { slug: "plantas-nuevas", label: "Plantas nuevas" },
      { slug: "rehabilitacion", label: "Rehabilitación y puesta en marcha" },
    ],
  },
  {
    number: "06",
    kicker: "Necesito sostener y mejorar",
    title: "Acompañamiento y operación",
    copy: "Para convertir infraestructura y procesos en una operación disciplinada, medible y mejorable con responsabilidades, mantenimiento, calidad y seguimiento.",
    services: [
      { slug: "direccion-operacion", label: "Dirección técnica y coordinación" },
      { slug: "operacion-integral", label: "Operación integral" },
    ],
  },
] as const;
