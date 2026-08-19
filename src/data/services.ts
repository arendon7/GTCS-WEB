export type ServiceAudience = "Municipios y ESP" | "Empresas" | "Ambos";
export type ServiceCategory = "Planeación" | "Recolección" | "Infraestructura" | "Operación" | "Datos";

export type GreenaticsService = {
  slug: string;
  name: string;
  category: ServiceCategory;
  audience: ServiceAudience;
  summary: string;
  solves: string;
  includes: string[];
  deliverables: string[];
  cta: string;
  scopeNote?: string;
};

export const services: GreenaticsService[] = [
  {
    slug: "diagnostico-caracterizacion",
    name: "Diagnóstico y caracterización de residuos orgánicos",
    category: "Planeación",
    audience: "Ambos",
    summary: "Construimos la línea base técnica antes de decidir rutas, equipos o infraestructura.",
    solves: "Evita dimensionar una solución con supuestos incompletos sobre cantidad, calidad, frecuencia, impropios, origen y destino de las corrientes.",
    includes: ["levantamiento de generadores y corrientes", "mediciones de generación y caracterización", "frecuencias y puntos de generación", "infraestructura disponible", "brechas operativas y logísticas", "alternativas preliminares de gestión, tratamiento o valorización"],
    deliverables: ["línea base", "mapa de flujos", "matriz de brechas", "recomendación de siguiente fase"],
    cta: "Solicitar diagnóstico",
    scopeNote: "Las mediciones técnicas y caracterizaciones no constituyen por sí solas un aforo regulatorio del servicio público de aseo. Si se requiere aforo tarifario, se estructura como un alcance independiente conforme al procedimiento aplicable.",
  },
  {
    slug: "pgirs",
    name: "PGIRS · formulación, actualización y fortalecimiento operativo",
    category: "Planeación",
    audience: "Municipios y ESP",
    summary: "Apoyamos a municipios y distritos en la planeación territorial y conectamos sus decisiones con capacidades, proyectos e información que las ESP puedan articular en la prestación.",
    solves: "Conecta el instrumento de planeación territorial con proyectos, metas, logística, tratamiento, valorización e indicadores que puedan implementarse y medirse.",
    includes: ["revisión de línea base y programas", "gestión diferenciada de orgánicos: separación, tratamiento y valorización cuando aplique", "metas e indicadores", "rutas selectivas y articulación de actores según el esquema aplicable", "necesidades de infraestructura", "hoja de ruta de implementación"],
    deliverables: ["documentos técnicos según alcance contratado", "matrices de programas y metas", "portafolio de proyectos", "plan de implementación y seguimiento"],
    cta: "Revisar mi PGIRS",
    scopeNote: "El PGIRS es un instrumento territorial cuya formulación, implementación y actualización corresponde al municipio o distrito. Greenatics presta apoyo técnico; la adopción del instrumento y las responsabilidades de cada prestador permanecen en cabeza de los actores competentes.",
  },
  {
    slug: "pmirs",
    name: "PMIRS y planes internos de gestión de residuos",
    category: "Planeación",
    audience: "Empresas",
    summary: "Ordenamos la gestión interna de residuos según las obligaciones aplicables y las necesidades operativas de cada organización.",
    solves: "Ayuda a pasar de prácticas dispersas a un sistema documentado con responsables, separación, almacenamiento, rutas, gestores e indicadores.",
    includes: ["diagnóstico del generador", "inventario de corrientes", "procedimientos de separación y almacenamiento", "rutas internas y externas", "roles y responsabilidades", "indicadores y evidencias"],
    deliverables: ["plan según alcance aplicable", "protocolos operativos", "matriz de indicadores", "ruta de mejora"],
    cta: "Evaluar mi gestión de residuos",
    scopeNote: "La exigibilidad, denominación y contenido del plan se verifican según actividad, ubicación, tipo de residuo y normativa aplicable. El servicio no presume que exista un mismo PMIRS obligatorio para toda organización.",
  },
  {
    slug: "prefactibilidad",
    name: "Prefactibilidad de plantas y sistemas de tratamiento y valorización",
    category: "Planeación",
    audience: "Ambos",
    summary: "Definimos si existe una base razonable para avanzar antes de comprometer inversión en ingeniería o construcción.",
    solves: "Reduce el riesgo de comprar una tecnología sin validar generación, suministro, localización, logística, salidas de producto y modelo operativo.",
    includes: ["demanda y oferta de residuos", "alternativas de proceso y tecnología", "dimensionamiento preliminar", "implantación y servicios requeridos", "modelo operativo", "CAPEX/OPEX preliminar", "riesgos y ruta de maduración"],
    deliverables: ["informe de prefactibilidad", "alternativas comparadas", "esquema conceptual", "hoja de ruta hacia factibilidad"],
    cta: "Solicitar prefactibilidad",
    scopeNote: "La prefactibilidad orienta una decisión; no equivale a factibilidad, ingeniería de detalle, concepto de uso del suelo, licencia, permiso o autorización, ni presupone que construir sea la alternativa recomendada.",
  },
  {
    slug: "factibilidad-ingenieria",
    name: "Factibilidad, APU e ingeniería de detalle",
    category: "Infraestructura",
    audience: "Ambos",
    summary: "Maduramos el proyecto hasta un nivel técnico, económico y operativo apto para estructuración, contratación o construcción según alcance.",
    solves: "Convierte una alternativa conceptual en un proyecto con capacidades, equipos, implantación, cantidades y criterios de operación definidos.",
    includes: ["balances de masa", "ingeniería de proceso", "dimensionamiento de equipos", "implantación", "APU y cantidades de obra según alcance", "servicios auxiliares", "seguridad y operación"],
    deliverables: ["memorias y planos según contrato", "presupuesto y APU", "especificaciones", "bases operativas", "cronograma de implementación"],
    cta: "Madurar un proyecto",
    scopeNote: "Los permisos, licencias, conceptos, autorizaciones y trámites ante autoridades se incluyen únicamente cuando el contrato lo establezca y resulten aplicables; la ingeniería no los sustituye.",
  },
  {
    slug: "rutas-selectivas",
    name: "Diseño e implementación de rutas selectivas y microrrutas",
    category: "Recolección",
    audience: "Ambos",
    summary: "Diseñamos la logística que conecta al generador con el destino de gestión definido sin perder calidad del material ni trazabilidad.",
    solves: "Un sistema de tratamiento o valorización no funciona sin suministro separado, frecuencias realistas, puntos de recolección y disciplina operativa.",
    includes: ["censo y priorización de generadores", "georreferenciación", "frecuencias", "microrrutas", "protocolos de entrega y recepción", "sensibilización", "captura de datos de ruta"],
    deliverables: ["diseño de ruta", "mapa de generadores", "frecuencias y secuencias", "protocolos", "tablero básico de seguimiento"],
    cta: "Diseñar ruta selectiva",
    scopeNote: "Cuando la ruta se integra al servicio público de aseo, su operación, responsables y relación con usuarios se estructuran con la persona prestadora y conforme a las reglas aplicables a cada corriente. El diseño o acompañamiento técnico no transfiere por sí solo la calidad de prestador a Greenatics.",
  },
  {
    slug: "motocarguero",
    name: "Pilotos logísticos con motocarguero y toma de datos",
    category: "Recolección",
    audience: "Ambos",
    summary: "Herramienta de implementación para probar, estabilizar o ampliar microrrutas de orgánicos o corrientes previamente definidas.",
    solves: "Permite validar en operación tiempos, volúmenes, generadores, frecuencias y condiciones de una ruta antes de escalar la logística.",
    includes: ["vehículo según modalidad contratada", "operación de ruta piloto", "registro de puntos y tiempos", "medición de material recolectado", "observaciones de separación y calidad", "ajustes de recorrido"],
    deliverables: ["bitácora de ruta", "base de generadores atendidos", "datos de operación", "recomendaciones de escalamiento"],
    cta: "Evaluar un piloto",
    scopeNote: "El piloto produce información operacional; no constituye por sí mismo un aforo regulatorio ni implica automáticamente la prestación del servicio público de aseo frente a usuarios.",
  },
  {
    slug: "plantas-nuevas",
    name: "Diseño, construcción e implementación de plantas de tratamiento y valorización",
    category: "Infraestructura",
    audience: "Ambos",
    summary: "Integramos recepción, tratamiento biológico, manejo de productos, servicios auxiliares y lógica operacional en una solución dimensionada para cada proyecto.",
    solves: "Evita tratar la planta como una suma de máquinas: cada módulo se diseña alrededor del residuo, el territorio, la salida de productos y la capacidad real de operación.",
    includes: ["recepción y pretratamiento", "compostaje cuando aplica", "digestión anaerobia cuando aplica", "manejo de biogás y efluentes", "maduración y acondicionamiento", "zonas de producto", "instrumentación y control", "puesta en marcha"],
    deliverables: ["infraestructura según contrato", "protocolos", "capacitación", "manuales", "plan de arranque y estabilización"],
    cta: "Diseñar una planta",
    scopeNote: "La localización, construcción y operación pueden requerir verificaciones de uso del suelo, permisos, licencias u otras autorizaciones según el proyecto. Estos componentes se definen expresamente en el alcance y no se presumen incluidos.",
  },
  {
    slug: "rehabilitacion",
    name: "Diagnóstico, rehabilitación y puesta en marcha de infraestructura existente",
    category: "Infraestructura",
    audience: "Ambos",
    summary: "Recuperamos plantas, composteras o sistemas subutilizados antes de recomendar reemplazarlos.",
    solves: "Permite separar fallas de infraestructura, proceso, personal, suministro y gestión para invertir donde realmente hace falta.",
    includes: ["auditoría técnica y operacional", "inventario de activos", "brechas de proceso", "plan de adecuaciones", "rehabilitación según alcance", "protocolos", "capacitación y arranque"],
    deliverables: ["diagnóstico", "plan de intervención", "adecuaciones contratadas", "manuales y puesta en marcha"],
    cta: "Revisar infraestructura existente",
    scopeNote: "Las adecuaciones se definen después del diagnóstico. Cuando una intervención requiera permisos, licencias, conceptos o autorizaciones, su gestión debe quedar expresamente incluida en el contrato.",
  },
  {
    slug: "direccion-operacion",
    name: "Dirección técnica y coordinación de operación",
    category: "Operación",
    audience: "Ambos",
    summary: "Acompañamos la planta como sistema: proceso, personas, mantenimiento, calidad, administración, productos, inventarios y reporte.",
    solves: "Cierra la brecha entre tener infraestructura y sostener una operación disciplinada, documentada y con responsabilidades claras.",
    includes: ["parámetros y protocolos", "roles y perfiles", "programación", "mantenimiento", "control de calidad", "productos e inventarios", "informes", "acompañamiento técnico, administrativo, jurídico y comercial de productos según alcance"],
    deliverables: ["modelo de operación", "manuales y procedimientos", "programación", "informes de seguimiento", "plan de mejora"],
    cta: "Fortalecer mi operación",
    scopeNote: "La dirección técnica de una planta no transfiere por sí sola a Greenatics la condición de prestador del servicio público de aseo ni las obligaciones tarifarias, de facturación, atención a usuarios o reporte sectorial que correspondan a la persona prestadora.",
  },
  {
    slug: "operacion-integral",
    name: "Operación integral de plantas de tratamiento y valorización",
    category: "Operación",
    audience: "Ambos",
    summary: "Podemos asumir un alcance integral dentro de la planta cuando el proyecto requiere personal, coordinación, mantenimiento y gestión bajo un solo modelo.",
    solves: "Reduce fragmentación entre operación física, mantenimiento, administración, control, producto y seguimiento.",
    includes: ["estructura de personal según contrato", "coordinación operacional", "mantenimiento", "seguridad y procedimientos", "control de ingreso y proceso", "producto e inventarios", "reportes e indicadores"],
    deliverables: ["operación bajo alcance contractual", "informes", "indicadores", "registro de novedades", "planes de mejora"],
    cta: "Evaluar modelo de operación",
    scopeNote: "“Integral” describe el alcance de operación de la planta contratado. No significa, por sí mismo, que Greenatics asuma integralmente el servicio público de aseo, la relación con usuarios, la facturación o las obligaciones regulatorias de una ESP.",
  },
  {
    slug: "recoleccion-tratamiento",
    name: "Gestión, recolección y tratamiento de residuos orgánicos para generadores",
    category: "Operación",
    audience: "Empresas",
    summary: "Servicio especializado para generadores que necesitan separar, entregar y tratar su corriente orgánica con evidencia de recepción, proceso y destino.",
    solves: "Integra logística y tratamiento para evitar que la gestión termine en una simple recolección sin trazabilidad del destino.",
    includes: ["diagnóstico de generación", "programación de recolección", "criterios de aceptación", "registro de recepción", "tratamiento", "trazabilidad de la corriente", "evidencia o reporte según alcance"],
    deliverables: ["registro de servicios", "evidencia de recepción y tratamiento", "consolidado periódico según contrato", "recomendaciones de separación"],
    cta: "Cotizar gestión de orgánicos",
    scopeNote: "Este servicio especializado no sustituye por sí mismo las obligaciones del servicio público de aseo ni convierte automáticamente a Greenatics en prestador frente al usuario. El esquema de recolección, tratamiento y destino se verifica para cada caso.",
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
    scopeNote: "GREENATICS OPS soporta captura, trazabilidad y análisis. No sustituye automáticamente reportes regulatorios, certificaciones, facturación ni sistemas oficiales; cualquier integración o salida con efecto sectorial debe definirse y validarse de forma expresa.",
  },
];

export const serviceCategories: ServiceCategory[] = ["Planeación", "Recolección", "Infraestructura", "Operación", "Datos"];
export const municipalServices = services.filter((service) => service.audience !== "Empresas");
export const companyServices = services.filter((service) => service.audience !== "Municipios y ESP");
export const getService = (slug: string) => services.find((service) => service.slug === slug);
