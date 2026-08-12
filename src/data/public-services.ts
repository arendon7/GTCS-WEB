export type PublicServiceAudience = "Municipios y ESP" | "Empresas" | "Ambos";
export type PublicServiceCategory = "Planeación" | "Recolección" | "Infraestructura" | "Operación" | "Datos";

export type PublicService = {
  slug: string;
  name: string;
  category: PublicServiceCategory;
  audience: PublicServiceAudience;
  summary: string;
  solves: string;
  includes: string[];
  deliverables: string[];
  cta: string;
};

export const publicServices: PublicService[] = [
  {
    slug: "diagnostico-caracterizacion",
    name: "Diagnóstico y caracterización de residuos orgánicos",
    category: "Planeación",
    audience: "Ambos",
    summary: "Construimos la línea base antes de decidir rutas, equipos o infraestructura.",
    solves: "Reduce el riesgo de dimensionar una solución con supuestos incompletos sobre cantidad, calidad, frecuencia, impropios, origen y destino de las corrientes.",
    includes: ["levantamiento de generadores y corrientes", "aforos y caracterización", "frecuencias y puntos de generación", "infraestructura disponible", "brechas operativas y logísticas", "alternativas preliminares de aprovechamiento"],
    deliverables: ["línea base", "mapa de flujos", "matriz de brechas", "recomendación de siguiente fase"],
    cta: "Solicitar diagnóstico",
  },
  {
    slug: "pgirs",
    name: "PGIRS · formulación, actualización y fortalecimiento operativo",
    category: "Planeación",
    audience: "Municipios y ESP",
    summary: "Conectamos la planeación territorial con decisiones implementables de separación, recolección selectiva, aprovechamiento e indicadores.",
    solves: "Ayuda a traducir programas y metas en proyectos, rutas y capacidades que puedan ejecutarse y medirse dentro del alcance contratado.",
    includes: ["revisión de línea base y programas", "componente de aprovechamiento de orgánicos", "metas e indicadores", "rutas selectivas y actores", "necesidades de infraestructura", "hoja de ruta de implementación"],
    deliverables: ["documentos técnicos según alcance", "matrices de programas y metas", "portafolio de proyectos", "plan de implementación y seguimiento"],
    cta: "Revisar mi PGIRS",
  },
  {
    slug: "pmirs",
    name: "PMIRS · gestión para organizaciones y grandes generadores",
    category: "Planeación",
    audience: "Empresas",
    summary: "Ordenamos la gestión interna desde la generación hasta el aprovechamiento y la evidencia de ejecución.",
    solves: "Ayuda a pasar de prácticas dispersas a un sistema documentado con separación, almacenamiento, rutas, responsables, gestores e indicadores.",
    includes: ["diagnóstico del generador", "inventario de corrientes", "procedimientos de separación y almacenamiento", "rutas internas y externas", "roles y responsabilidades", "indicadores y evidencias"],
    deliverables: ["plan según alcance aplicable", "protocolos operativos", "matriz de indicadores", "ruta de mejora"],
    cta: "Evaluar PMIRS",
  },
  {
    slug: "prefactibilidad",
    name: "Prefactibilidad de plantas y sistemas de aprovechamiento",
    category: "Planeación",
    audience: "Ambos",
    summary: "Validamos si existe una base razonable para avanzar antes de comprometer inversión en ingeniería o construcción.",
    solves: "Reduce el riesgo de seleccionar tecnología sin validar generación, suministro, localización, logística, salidas de producto y modelo operativo.",
    includes: ["oferta de residuos", "alternativas tecnológicas", "dimensionamiento preliminar", "implantación y servicios requeridos", "modelo operativo", "estimaciones preliminares según alcance", "riesgos y ruta de maduración"],
    deliverables: ["informe de prefactibilidad", "alternativas comparadas", "esquema conceptual", "hoja de ruta hacia factibilidad"],
    cta: "Solicitar prefactibilidad",
  },
  {
    slug: "factibilidad-ingenieria",
    name: "Factibilidad e ingeniería de detalle",
    category: "Infraestructura",
    audience: "Ambos",
    summary: "Maduramos el proyecto hasta el nivel técnico, económico y operativo definido en cada alcance.",
    solves: "Convierte una alternativa conceptual en un proyecto con capacidades, equipos, implantación, cantidades y criterios de operación mejor definidos.",
    includes: ["balances de masa", "ingeniería de proceso", "dimensionamiento de equipos", "implantación", "cantidades y análisis de costos cuando aplique", "servicios auxiliares", "seguridad y operación", "documentación de estructuración según alcance"],
    deliverables: ["memorias y planos contratados", "presupuesto y análisis aplicables", "especificaciones", "bases operativas", "cronograma de implementación"],
    cta: "Madurar un proyecto",
  },
  {
    slug: "rutas-selectivas",
    name: "Diseño e implementación de rutas selectivas y microrrutas",
    category: "Recolección",
    audience: "Ambos",
    summary: "Diseñamos la logística que conecta al generador con el sistema de aprovechamiento sin perder calidad del material.",
    solves: "Una planta necesita suministro separado, frecuencias realistas, puntos de recolección y disciplina operativa para sostener el proceso.",
    includes: ["censo y priorización de generadores", "georreferenciación", "frecuencias", "microrrutas", "protocolos de entrega y recepción", "sensibilización", "captura de datos de ruta"],
    deliverables: ["diseño de ruta", "mapa de generadores", "frecuencias y secuencias", "protocolos", "tablero básico de seguimiento"],
    cta: "Diseñar ruta selectiva",
  },
  {
    slug: "piloto-recoleccion",
    name: "Pilotos de recolección selectiva y toma de datos",
    category: "Recolección",
    audience: "Ambos",
    summary: "Probamos, medimos y ajustamos microrrutas antes de escalar la logística.",
    solves: "Permite validar en operación tiempos, volúmenes, generadores, frecuencias, impropios y condiciones reales de una ruta.",
    includes: ["ruta piloto según alcance", "registro de puntos y tiempos", "medición de material", "observaciones de separación y calidad", "ajustes de recorrido"],
    deliverables: ["bitácora de ruta", "base de generadores atendidos", "datos de operación", "recomendaciones de escalamiento"],
    cta: "Evaluar un piloto",
  },
  {
    slug: "plantas-nuevas",
    name: "Diseño e implementación de plantas de aprovechamiento",
    category: "Infraestructura",
    audience: "Ambos",
    summary: "Integramos recepción, tratamiento biológico, manejo de productos, servicios auxiliares y lógica operacional en una solución dimensionada para cada proyecto.",
    solves: "Evita tratar la planta como una suma de máquinas: los módulos se definen alrededor del residuo, territorio, salidas de producto y capacidad real de operación.",
    includes: ["recepción y pretratamiento", "compostaje cuando aplica", "digestión anaerobia cuando aplica", "manejo de biogás y efluentes", "maduración y acondicionamiento", "zonas de producto", "instrumentación y control", "puesta en marcha"],
    deliverables: ["infraestructura según contrato", "protocolos", "capacitación", "manuales", "plan de arranque y estabilización"],
    cta: "Diseñar una planta",
  },
  {
    slug: "rehabilitacion",
    name: "Diagnóstico, rehabilitación y puesta en marcha de infraestructura existente",
    category: "Infraestructura",
    audience: "Ambos",
    summary: "Revisamos plantas, composteras o sistemas subutilizados antes de recomendar reemplazarlos.",
    solves: "Permite separar fallas de infraestructura, proceso, personal, suministro y gestión para intervenir donde realmente hace falta.",
    includes: ["auditoría técnica y operacional", "inventario de activos", "brechas de proceso", "plan de adecuaciones", "rehabilitación según alcance", "protocolos", "capacitación y arranque"],
    deliverables: ["diagnóstico", "plan de intervención", "adecuaciones contratadas", "manuales y puesta en marcha"],
    cta: "Revisar infraestructura existente",
  },
  {
    slug: "direccion-operacion",
    name: "Dirección técnica y coordinación de operación",
    category: "Operación",
    audience: "Ambos",
    summary: "Acompañamos la planta como sistema: proceso, personas, mantenimiento, calidad, administración, comercialización y reporte.",
    solves: "Cierra la brecha entre tener infraestructura y sostener una operación disciplinada, documentada y con responsabilidades claras.",
    includes: ["parámetros y protocolos", "roles y perfiles", "programación", "mantenimiento", "control de calidad", "inventarios", "informes", "acompañamiento transversal según alcance"],
    deliverables: ["modelo de operación", "manuales y procedimientos", "programación", "informes de seguimiento", "plan de mejora"],
    cta: "Fortalecer mi operación",
  },
  {
    slug: "operacion-integral",
    name: "Operación integral de plantas",
    category: "Operación",
    audience: "Ambos",
    summary: "Podemos asumir un alcance integral cuando el proyecto requiere personal, coordinación y gestión bajo un solo modelo.",
    solves: "Reduce fragmentación entre operación física, mantenimiento, administración, control, producto y seguimiento.",
    includes: ["estructura de personal según contrato", "coordinación operacional", "mantenimiento", "seguridad y procedimientos", "control de ingreso y proceso", "producto e inventarios", "reportes e indicadores"],
    deliverables: ["operación bajo alcance contractual", "informes", "indicadores", "registro de novedades", "planes de mejora"],
    cta: "Evaluar modelo de operación",
  },
  {
    slug: "recoleccion-tratamiento",
    name: "Recolección, trazabilidad y tratamiento de residuos orgánicos",
    category: "Operación",
    audience: "Empresas",
    summary: "Servicio para generadores que necesitan separar, entregar y aprovechar su corriente orgánica con evidencia del proceso.",
    solves: "Integra logística y tratamiento para evitar que la gestión termine en una simple recolección sin trazabilidad del destino.",
    includes: ["diagnóstico de generación", "programación de recolección", "criterios de aceptación", "registro de recepción", "tratamiento", "trazabilidad de la corriente", "evidencia o reporte según alcance"],
    deliverables: ["registro de servicios", "evidencia de recepción/tratamiento", "consolidado periódico según contrato", "recomendaciones de separación"],
    cta: "Cotizar gestión de orgánicos",
  },
  {
    slug: "trazabilidad-datos",
    name: "Trazabilidad digital, indicadores y GREENATICS OPS",
    category: "Datos",
    audience: "Ambos",
    summary: "Conectamos generador, ruta, recepción, proceso, producto, inventario y destino para que la operación pueda entenderse y auditarse.",
    solves: "Evita reprocesar hojas aisladas y permite que la información nazca en la actividad operacional que la produce.",
    includes: ["registros operativos", "lotes y evidencias", "actividades y tiempos", "mantenimiento", "inventarios", "alertas", "dashboard día/mes/histórico", "indicadores publicables bajo aprobación"],
    deliverables: ["modelo de datos según alcance", "tableros", "trazabilidad", "reportes", "contratos de publicación de indicadores cuando aplique"],
    cta: "Conocer la capa digital",
  },
];

export const serviceCategories: PublicServiceCategory[] = ["Planeación", "Recolección", "Infraestructura", "Operación", "Datos"];
export const municipalServices = publicServices.filter((service) => service.audience !== "Empresas");
export const companyServices = publicServices.filter((service) => service.audience !== "Municipios y ESP");

export const environmentalParkModules = [
  ["Separación y educación", "Generadores, cultura de separación, protocolos y activación territorial."],
  ["Recolección selectiva", "Rutas, microrrutas y datos desde el origen."],
  ["Recepción y control", "Pesaje, inspección, impropios, lotes y evidencia."],
  ["Aprovechamiento biológico", "Compostaje y/o digestión anaerobia según caracterización y escala."],
  ["Biofábrica y productos", "Maduración, acondicionamiento y rutas de fertilizantes, biol y otros productos validados."],
  ["Biogás y energía", "Recuperación energética cuando el balance técnico y económico lo justifica."],
  ["Formación y demostración", "Capacitación, transferencia de conocimiento y apropiación territorial."],
  ["Datos e impacto", "Operación trazable, indicadores, mantenimiento y mejora continua mediante GREENATICS OPS."],
] as const;
