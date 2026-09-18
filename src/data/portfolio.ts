export type PortfolioEntry = {
  slug: string;
  name: string;
  eyebrow: string;
  promise: string;
  detail: string;
  benefits: string[];
  image: string;
  imageAlt: string;
  href: string;
  cta: string;
};

export type PortfolioGroup = {
  slug: string;
  shortName: string;
  name: string;
  eyebrow: string;
  headline: string;
  intro: string;
  statement: string;
  image: string;
  imageAlt: string;
  color: "forest" | "soil" | "leaf" | "sky" | "ink";
  entries: PortfolioEntry[];
};

export const portfolioGroups: PortfolioGroup[] = [
  {
    slug: "territorio",
    shortName: "Territorio",
    name: "Greenatics Territorio",
    eyebrow: "Aseo, territorio y capacidad pública",
    headline: "Del problema territorial a un sistema que se puede ejecutar.",
    intro: "Ayudamos a municipios, ESP, autoridades y organizaciones a entender sus flujos de residuos, ordenar las decisiones y convertirlas en rutas, plantas, proyectos, contratos y capacidades que permanecen en el territorio.",
    statement: "La infraestructura solo funciona cuando el suministro, la operación, los datos, las personas y el destino del producto están conectados.",
    image: "/projects/routes/route-evidence-03.webp",
    imageAlt: "Equipo realizando recolección diferenciada de residuos orgánicos en territorio",
    color: "forest",
    entries: [
      { slug: "diagnostico-territorial", name: "Diagnóstico Territorial Circular", eyebrow: "La primera decisión", promise: "Saber qué existe antes de invertir.", detail: "Levantamos generación, composición, actores, rutas, infraestructura, costos y oportunidades para construir una línea base útil, no un documento aislado.", benefits: ["Balance de masa y calidad de la biomasa", "Mapa de brechas, actores y decisiones", "Hoja de ruta conectada con presupuesto y próximos pasos"], image: "/projects/plant/plant-evidence-10.webp", imageAlt: "Material orgánico preparado para caracterización y tratamiento", href: "/servicios/diagnostico-residuos/", cta: "Ver el diagnóstico" },
      { slug: "ruta-organica", name: "Ruta Orgánica", eyebrow: "Separación y logística", promise: "Mover mejor el material desde la fuente.", detail: "Diseñamos microrrutas con frecuencia, recipientes, vehículos, protocolos, pesaje y control de calidad. El motocarguero es una herramienta de proximidad dentro de un sistema mayor.", benefits: ["Rutas ajustadas a topografía y generación", "Mayor calidad del material en recepción", "Datos de recorrido para corregir frecuencia y costo"], image: "/projects/routes/motocarguero-verde-operacion-real.webp", imageAlt: "Motocarguero verde para recolección diferenciada de orgánicos", href: "/servicios/microrrutas-motocarguero/", cta: "Diseñar una ruta" },
      { slug: "planta-en-marcha", name: "Planta en Marcha", eyebrow: "Infraestructura operable", promise: "Poner a producir la capacidad instalada.", detail: "Revisamos suministro, proceso, equipos, personal, mantenimiento, olores, lixiviados, rechazos y destino del producto para recuperar la continuidad de una planta.", benefits: ["Diagnóstico de la causa real de la falla", "Puesta en marcha por etapas y protocolos", "Indicadores para sostener la operación"], image: "/projects/plant/plant-evidence-01.webp", imageAlt: "Planta de aprovechamiento de residuos orgánicos", href: "/servicios/operacion-delegada/", cta: "Revisar una planta" },
      { slug: "direccion-tecnica", name: "Dirección Técnica Multiplanta", eyebrow: "Continuidad y transferencia", promise: "Una capacidad técnica compartida para varias plantas.", detail: "Greenatics combina supervisión remota, visitas, procedimientos, control de variables, GREENATICS OPS y acompañamiento al equipo local para dirigir y mejorar la operación.", benefits: ["Dirección técnica sin sustituir la capacidad local", "POE, mantenimiento, QA/QC y revisión mensual", "Ruta de transferencia para que el territorio conserve control"], image: "/projects/tamesis/planta-aerea.jpg", imageAlt: "Vista aérea de infraestructura de tratamiento en Támesis", href: "/servicios/operacion-delegada/", cta: "Conocer el modelo" },
      { slug: "proyectos-publicos", name: "Estructuración de Proyectos Públicos", eyebrow: "De la necesidad al presupuesto", promise: "Convertir una oportunidad en un proyecto financiable.", detail: "Integramos diagnóstico territorial, prefactibilidad, alternativas tecnológicas, modelo operativo, CAPEX/OPEX, regulación, indicadores y estrategia de implementación.", benefits: ["Alternativas comparables y explicables", "Presupuesto y fases de ejecución", "Proyectos listos para conversación institucional y financiación"], image: "/projects/yarumal/aerial-01.webp", imageAlt: "Vista territorial de Yarumal y su contexto de proyecto", href: "/municipios/", cta: "Explorar proyectos" },
    ],
  },
  {
    slug: "valorizacion",
    shortName: "Valorización",
    name: "Greenatics Valorización",
    eyebrow: "Biomasa, productos y energía",
    headline: "Lo que se recupera vuelve como producto, energía y oportunidad.",
    intro: "Diseñamos rutas para que los residuos orgánicos dejen de ser únicamente un costo de recolección y disposición. Conectamos proceso, calidad, demanda, uso agronómico, energía y economía del proyecto.",
    statement: "No elegimos la tecnología por moda: la seleccionamos después de entender la corriente, la escala, la operación y el mercado de salida.",
    image: "/projects/tamesis/reactor-uasb.jpeg",
    imageAlt: "Reactor anaerobio UASB del proyecto de Támesis",
    color: "soil",
    entries: [
      { slug: "biofabrica", name: "Biofábrica Territorial", eyebrow: "Producto desde el territorio", promise: "Transformar bases orgánicas en insumos con identidad y control.", detail: "Estructuramos nodos de formulación y acondicionamiento que convierten compost, digestatos y otras bases en productos para suelo y agricultura, con calidad, trazabilidad y ruta regulatoria.", benefits: ["Aprovechamiento productivo de la base generada", "Productos propios o desarrollados para terceros", "Conexión entre planta, registro, empaque y mercado"], image: "/projects/plant/plant-evidence-07.webp", imageAlt: "Material orgánico en proceso de acondicionamiento", href: "/servicios/aprovechamiento-productivo/", cta: "Explorar biofábrica" },
      { slug: "biogas-bioenergia", name: "Biogás y Bioenergía", eyebrow: "Támesis y agroindustria", promise: "Convertir corrientes compatibles en energía útil.", detail: "Evaluamos digestión anaerobia, captura de biogás, generación de energía, sustitución energética y manejo de digestatos cuando el balance técnico y económico lo justifica.", benefits: ["Producción y captura de biogás", "Bioenergía para autoconsumo o sustitución", "Indicadores de CH₄, energía y disponibilidad cuando se midan"], image: "/projects/tamesis/sistema-uasb.png", imageAlt: "Esquema del sistema UASB y la ruta de biogás en Támesis", href: "/soluciones/biogas-energia/", cta: "Evaluar bioenergía" },
      { slug: "compostaje", name: "Compost y Acondicionamiento", eyebrow: "Suelo y materia orgánica", promise: "Estabilizar la materia orgánica para devolverla al suelo.", detail: "Diseñamos mezclas, seguimiento de proceso, maduración, tamizado, almacenamiento y control de calidad para que el compost tenga un destino real.", benefits: ["Proceso aeróbico controlado y trazable", "Producto con uso definido antes de producir", "Puente directo hacia Wondergreen y programas de suelo"], image: "/projects/plant/plant-evidence-03.webp", imageAlt: "Proceso de compostaje de materia orgánica", href: "/servicios/aprovechamiento-productivo/", cta: "Conocer la ruta" },
      { slug: "parque-ambiental", name: "Parque Ambiental y Nodos Productivos", eyebrow: "Escala territorial", promise: "Integrar tratamiento, energía, producto y educación en un mismo sistema.", detail: "Estructuramos parques y nodos que combinan recepción, tratamiento, bioenergía, biofábrica, almacenamiento, formación y salidas de valor según el territorio.", benefits: ["Arquitectura modular por etapas", "Más de una salida para la biomasa", "Proyecto técnico, productivo y pedagógico"], image: "/projects/tamesis/planta-aerea.jpg", imageAlt: "Infraestructura territorial para un parque ambiental", href: "/parque-ambiental/", cta: "Explorar parque ambiental" },
    ],
  },
  {
    slug: "wondergreen",
    shortName: "Wondergreen",
    name: "Wondergreen Nutrients",
    eyebrow: "Nutrición, suelo y manejo biológico",
    headline: "Productos con una función clara, dentro de un programa que entiende el cultivo.",
    intro: "Wondergreen integra compost, fertilizantes organominerales sólidos y líquidos, y bioinsumos para acompañar suelo, crecimiento, equilibrio, floración, producción y manejo integrado. La formulación orienta; el diagnóstico y el seguimiento deciden cómo usarla.",
    statement: "La nutrición eficiente no empieza con una dosis genérica: empieza con suelo, cultivo, etapa, objetivo y capacidad de seguimiento.",
    image: "/products/wondergreen-system-stages.webp",
    imageAlt: "Sistema Wondergreen organizado por etapas del cultivo",
    color: "leaf",
    entries: [
      { slug: "solidos", name: "Fertilizantes sólidos organominerales", eyebrow: "Liberación gradual y suelo", promise: "Una base estable para nutrir por etapa.", detail: "2GROW 15-3-3, 2BALANCE 7-7-7, 2BLOOM 3-8-3 y 2FRUIT 3-3-8 organizan la nutrición sólida según establecimiento, mantenimiento, transición reproductiva y desarrollo del fruto.", benefits: ["Matriz organomineral que conecta nutriente y materia orgánica", "Lectura por etapa fisiológica, no por fórmula aislada", "Presentaciones y precios de referencia para cotización"], image: "/products/wondergreen-2grow.webp", imageAlt: "Producto sólido Wondergreen 2GROW", href: "/wondergreen/", cta: "Ver sólidos" },
      { slug: "liquidos", name: "Fertilizantes líquidos", eyebrow: "Respuesta y precisión", promise: "Ajustar el programa cuando el cultivo necesita oportunidad.", detail: "Las líneas líquidas permiten trabajar con aplicaciones dirigidas y programas por etapa. Se seleccionan según análisis, vía, agua, compatibilidad, frecuencia y etiqueta vigente.", benefits: ["Fórmulas 100-20-20, 70-70-70 y 30-30-80 en el portafolio", "Presentaciones desde 1 L hasta formatos de volumen", "Integración con recomendación, aplicación y seguimiento"], image: "/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg", imageAlt: "Etiquetas de fertilizantes líquidos Wondergreen", href: "/wondergreen/#liquidos", cta: "Explorar líquidos" },
      { slug: "bioinsumos", name: "Bioinsumos y bioles", eyebrow: "Microbiología y manejo integrado", promise: "Poner la biología del suelo y del cultivo dentro de la decisión.", detail: "Trichoderma, Bacillus subtilis, Beauveria, Metarhizium y Extracto Ajo-Ají son referencias diferenciadas. Cada una requiere ficha, concentración, objetivo, compatibilidad y protocolo propios.", benefits: ["Herramientas microbiológicas y botánicas diferenciadas", "Aplicación integrada con monitoreo y manejo del lote", "No se venden como sustituto universal del diagnóstico"], image: "/products/wondergreen-bioinsumos.webp", imageAlt: "Portafolio de bioinsumos Wondergreen", href: "/wondergreen/#bioinsumos", cta: "Ver bioinsumos" },
      { slug: "programas-cultivo", name: "Programas por cultivo", eyebrow: "Acompañamiento agronómico", promise: "Pasar de comprar un producto a mejorar una decisión de campo.", detail: "Construimos recorridos para café, aguacate, cacao, cítricos, pastos, plátano, hortalizas y pasifloras, con etapas, observaciones, documentos y seguimiento.", benefits: ["Lectura de suelo, cultivo, etapa y objetivo", "Plan de aplicación y seguimiento", "Biblioteca técnica con guías y manuales descargables"], image: "/guides/guia-cafe-cover.webp", imageAlt: "Manual técnico Wondergreen para café", href: "/wondergreen/cultivos/", cta: "Ver cultivos" },
      { slug: "casa-jardin", name: "Casa & Jardín", eyebrow: "Cuidado cotidiano", promise: "Llevar la ciencia del suelo vivo a macetas, huertas y jardines.", detail: "Kits, guías por etapas y herramientas de diagnóstico convierten la lógica Wondergreen en decisiones sencillas para plantas ornamentales, huertas urbanas y espacios domésticos.", benefits: ["Kits por necesidad y etapa de la planta", "Guías prácticas con imágenes y PDF", "Ruta de cuidado desde suelo, drenaje y establecimiento"], image: "/products/wondergreen-casa-jardin-hero.png", imageAlt: "Soluciones Wondergreen Casa y Jardín", href: "/casa-jardin/", cta: "Explorar Casa & Jardín" },
    ],
  },
  {
    slug: "clima-datos",
    shortName: "Clima y datos",
    name: "Greenatics Clima & Datos",
    eyebrow: "Medición, evidencia y decisión",
    headline: "Datos que explican qué ocurrió, qué falta medir y qué decisión sigue.",
    intro: "Integramos huella de carbono, trazabilidad, captura operativa e interpretación para que las organizaciones pasen de archivos dispersos a inventarios, indicadores, acciones y evidencia.",
    statement: "Un dato útil conserva su origen, su unidad, su periodo, su responsable y el nivel de revisión que recibió.",
    image: "/tools/huella/dashboard.png",
    imageAlt: "Dashboard de la plataforma Calcula tu Huella",
    color: "sky",
    entries: [
      { slug: "calcula-tu-huella", name: "Calcula tu Huella", eyebrow: "Inventario climático", promise: "Organizar las fuentes de emisión y convertirlas en una ruta de gestión.", detail: "La plataforma permite configurar un inventario, recolectar información, calcular escenarios, revisar evidencias y preparar resultados para decisiones de reducción y reporte.", benefits: ["Mapa de fuentes y cargas por periodo", "Validación, evidencia e historial de revisión", "Escenarios para priorizar reducción y mejora"], image: "/tools/huella/recorrido.png", imageAlt: "Recorrido de seis etapas de Calcula tu Huella", href: "/huella/", cta: "Entrar a Calcula tu Huella" },
      { slug: "greenatics-ops", name: "GREENATICS OPS", eyebrow: "Control operativo", promise: "Ver la planta como realmente funciona.", detail: "Bitácoras, ingresos, pesajes, lotes, actividades, equipos, mantenimiento, inventario, calidad del dato y dashboard en una estación de trabajo para la operación.", benefits: ["Control de actividades y responsables", "Volúmenes, lotes, inventario y novedades", "Dashboard para dirección técnica y mejora continua"], image: "/campaign/06_dashboard_indicadores.jpg", imageAlt: "Dashboard de indicadores operativos Greenatics", href: "/app/", cta: "Entrar a OPS" },
      { slug: "greenatics-red", name: "GREENATICS Red", eyebrow: "Territorio y PMIRS", promise: "Conectar personas, rutas, hallazgos y acciones.", detail: "Red organiza usuarios, generadores, recorridos, evidencia de campo, QA/QC, programas y responsables para convertir el diagnóstico territorial en una implementación visible.", benefits: ["Cobertura, generadores y trabajo de campo", "Novedades, evidencias y hallazgos", "Programas, responsables, indicadores y seguimiento"], image: "/projects/routes/route-evidence-01.webp", imageAlt: "Trabajo territorial de recolección diferenciada", href: "/red/", cta: "Explorar Red" },
      { slug: "agroway", name: "AGROWAY", eyebrow: "Trazabilidad agrícola", promise: "Seguir el lote desde el diagnóstico hasta la cosecha.", detail: "Registra productor, finca, lote, recomendación, abastecimiento, aplicación, evidencia, seguimiento y cosecha para que la historia productiva sea consultable.", benefits: ["Ficha viva de cada lote", "Aplicación y seguimiento con evidencia", "Datos listos para alimentar proyectos productivos"], image: "/guides/guia-aguacate-cover.webp", imageAlt: "Guía técnica de cultivo para trazabilidad agrícola", href: "/agroway/", cta: "Conocer AGROWAY" },
      { slug: "sana", name: "SANA", eyebrow: "Inversión productiva", promise: "Acompañar inversión con datos reales de campo.", detail: "SANA conecta oportunidades agrícolas, datos de AGROWAY, ciencia Greenatics, soluciones Wondergreen, actores y seguimiento para estructurar proyectos que puedan aprender y mejorar.", benefits: ["Lectura de oportunidad, riesgo y contexto", "Seguimiento de hitos y resultados", "Conexión entre capital, ciencia y ejecución"], image: "/projects/tamesis/paisaje-tamesis.jpg", imageAlt: "Paisaje productivo de Támesis", href: "/sana/", cta: "Conocer SANA" },
    ],
  },
  {
    slug: "operacion-digital",
    shortName: "Operación digital",
    name: "Greenatics Operations",
    eyebrow: "Plataformas que hacen usable el conocimiento",
    headline: "La tecnología se vuelve valiosa cuando la operación la adopta.",
    intro: "Esta línea reúne los entornos que convierten procedimientos, roles, registros y decisiones en una práctica diaria. Cada aplicación tiene una landing pública, una experiencia demo y un entorno real con usuarios, organizaciones y permisos.",
    statement: "Primero ocurre el trabajo. Después se captura, se valida, se interpreta y se comparte con quien debe decidir.",
    image: "/campaign/06_dashboard_indicadores.jpg",
    imageAlt: "Interfaz conceptual de las plataformas digitales Greenatics",
    color: "ink",
    entries: [
      { slug: "centro-herramientas", name: "Centro de herramientas", eyebrow: "Punto de entrada", promise: "Elegir la aplicación correcta sin perderse en el ecosistema.", detail: "Landing, demo pública y acceso a entornos conectados se organizan en un solo lugar para que cada usuario entienda qué resuelve cada plataforma.", benefits: ["Acceso directo a las experiencias disponibles", "Lectura por problema, módulo y usuario", "Entrada clara a demos y entornos reales"], image: "/brand/greenatics-horizontal.webp", imageAlt: "Marca Greenatics", href: "/herramientas/", cta: "Abrir centro" },
      { slug: "usuarios-permisos", name: "Usuarios y permisos", eyebrow: "Gobierno del acceso", promise: "Cada persona ve lo que necesita para cumplir su rol.", detail: "La administración de usuarios debe vincular organización, rol, aplicación, entorno y permisos; así una misma cuenta puede participar en una o varias herramientas sin mezclar datos.", benefits: ["Roles por aplicación y organización", "Usuarios demo y entornos reales diferenciados", "Trazabilidad sobre acceso y responsabilidad"], image: "/tools/greenatics-dashboard-concept.jpg", imageAlt: "Concepto visual de administración de plataformas", href: "/plataforma/usuarios/", cta: "Administrar usuarios" },
      { slug: "biblioteca-evidencia", name: "Biblioteca y evidencia", eyebrow: "Conocimiento reutilizable", promise: "Convertir documentos, datos y casos en decisiones disponibles.", detail: "La biblioteca reúne guías Wondergreen, manuales, casos, documentos de impacto y recursos que alimentan la venta, la ejecución y el aprendizaje de los equipos.", benefits: ["Documentos técnicos y comerciales conectados", "Casos y metodología para sustentar claims", "Recursos públicos para preparar conversaciones"], image: "/guides/catalogo-cover-hd.png", imageAlt: "Catálogo técnico Wondergreen", href: "/biblioteca/", cta: "Abrir biblioteca" },
    ],
  },
];

export const portfolioGroupSlugs = portfolioGroups.map((group) => ({ slug: group.slug }));

export function getPortfolioGroup(slug: string) {
  return portfolioGroups.find((group) => group.slug === slug);
}
