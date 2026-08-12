export type PublicProjectStatus = "documented-case" | "historical-assessment";

export type PublicProject = {
  slug: string;
  name: string;
  region: string;
  status: PublicProjectStatus;
  statusLabel: string;
  summary: string;
  publicationContext: string;
  capabilities: Array<[string,string]>;
  learnings: Array<[string,string]>;
};

export const publicProjects: PublicProject[] = [
  {
    slug: "yarumal",
    name: "Yarumal",
    region: "Norte de Antioquia",
    status: "documented-case",
    statusLabel: "Caso documentado",
    summary: "Experiencia documentada en recepción e inspección, segregación de impropios, lotes, compostaje, digestión anaerobia, productos, mantenimiento y construcción de una capa digital de seguimiento.",
    publicationContext: "Esta página documenta experiencia técnica y aprendizajes del proyecto. No afirma por sí sola el estado operativo presente de la instalación. Cualquier cifra o condición actual requiere un corte y validación específicos.",
    capabilities: [
      ["Recepción técnica", "Inspección, descarga, almacenamiento temporal y criterios de aceptación de residuos."],
      ["Control de impropios", "Segregación y control de calidad de la corriente que entra al proceso."],
      ["Trazabilidad", "Identificación y seguimiento por lotes desde la recepción hasta el tratamiento."],
      ["Tratamiento biológico", "Compostaje y digestión anaerobia con control operativo según destino del material."],
      ["Maduración y acondicionamiento", "Estabilización, manejo y acondicionamiento de productos derivados."],
      ["Capa digital", "Registros operativos, evidencias, mantenimiento, inventarios e indicadores conectados progresivamente a GREENATICS OPS."],
    ],
    learnings: [
      ["El dato nace en la operación", "Recepción, bitácoras, lotes y mantenimiento deben dejar evidencia en el momento en que ocurren."],
      ["El producto empieza en la materia prima", "La calidad de las salidas depende de recepción, separación, proceso y control; no solo de una formulación final."],
      ["Operar es un sistema", "Proceso, personas, activos, inventarios, calidad y datos deben trabajar juntos."],
    ],
  },
  {
    slug: "tamesis",
    name: "Támesis",
    region: "Suroeste de Antioquia",
    status: "historical-assessment",
    statusLabel: "Diagnóstico y rehabilitación documentados",
    summary: "Documentación de diagnóstico y propuesta de intervención para recuperar una planta existente mediante puesta en marcha, estabilización y escalabilidad, conectando ruta selectiva, biorefinería, compostaje, operación y territorio.",
    publicationContext: "La página reconstruye aprendizajes y alcance documentado de evaluaciones y propuestas históricas. No presenta presupuestos, capacidades nominales, registros, licencias o rendimientos antiguos como estado actual de la planta.",
    capabilities: [
      ["Ruta selectiva", "La evaluación integró calidad del material, impropios, educación al generador y logística con la planta."],
      ["Infraestructura", "Se documentaron necesidades de repotenciación, drenajes, lixiviados, recepción, seguridad y servicios de apoyo."],
      ["Reactivación biológica", "El sistema anaerobio requería revisión de equipos y una estrategia progresiva de recuperación del proceso."],
      ["Compostaje", "Se revisaron áreas, secuencia, manejo de lixiviados, maduración, granulometría e impropios."],
      ["Operación", "El alcance contempló personal, procedimientos, capacitación, mantenimiento, analítica y trazabilidad."],
      ["Escalabilidad", "La ampliación se entiende como una decisión posterior a la estabilización y a la evidencia operacional."],
    ],
    learnings: [
      ["Una planta parada se pone en marcha", "La recuperación de procesos biológicos exige diagnóstico, seguimiento y tiempo; no solo mantenimiento mecánico."],
      ["La ruta forma parte de la tecnología", "Si el material llega mezclado, el problema se transfiere a proceso, costos y calidad del producto."],
      ["Escalar después de estabilizar", "La capacidad nominal no sustituye evidencia sobre suministro, proceso, personal y destino."],
      ["Infraestructura y biología se condicionan", "Drenajes, cubiertas, energía, equipos y lixiviados afectan directamente el control del proceso."],
    ],
  },
];

export const getPublicProject = (slug: string) => publicProjects.find((project) => project.slug === slug);
