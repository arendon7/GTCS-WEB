export type ServiceJourney = {
  number: string;
  kicker: string;
  title: string;
  copy: string;
  services: readonly { slug: string; label: string }[];
};

export const serviceJourneys: readonly ServiceJourney[] = [
  {
    number: "01",
    kicker: "Necesito entender y decidir",
    title: "Diagnosticar y planear",
    copy: "Para proyectos que todavía necesitan una línea base, un instrumento de planeación o una decisión de prefactibilidad antes de invertir.",
    services: [
      { slug: "diagnostico-caracterizacion", label: "Diagnóstico y caracterización" },
      { slug: "pgirs", label: "PGIRS" },
      { slug: "pmirs", label: "PMIRS" },
      { slug: "prefactibilidad", label: "Prefactibilidad" },
    ],
  },
  {
    number: "02",
    kicker: "Necesito mover material separado",
    title: "Separar y recolectar",
    copy: "Para conectar generadores, frecuencias, microrrutas y criterios de aceptación con un destino real de aprovechamiento.",
    services: [
      { slug: "rutas-selectivas", label: "Rutas selectivas" },
      { slug: "motocarguero", label: "Motocarguero / piloto" },
      { slug: "recoleccion-tratamiento", label: "Recolección y tratamiento" },
    ],
  },
  {
    number: "03",
    kicker: "Necesito infraestructura",
    title: "Construir o recuperar capacidad",
    copy: "Para madurar ingeniería, construir una planta nueva o recuperar infraestructura existente antes de reemplazarla.",
    services: [
      { slug: "factibilidad-ingenieria", label: "Factibilidad e ingeniería" },
      { slug: "plantas-nuevas", label: "Plantas nuevas" },
      { slug: "rehabilitacion", label: "Rehabilitación" },
    ],
  },
  {
    number: "04",
    kicker: "Necesito que funcione y se pueda demostrar",
    title: "Operar, controlar y medir",
    copy: "Para convertir infraestructura y procesos en una operación disciplinada con mantenimiento, inventarios, evidencia y trazabilidad.",
    services: [
      { slug: "direccion-operacion", label: "Dirección de operación" },
      { slug: "operacion-integral", label: "Operación integral" },
      { slug: "trazabilidad-datos", label: "Trazabilidad y datos" },
    ],
  },
] as const;
