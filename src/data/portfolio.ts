export type PortfolioEntry = {
  slug: string;
  name: string;
  eyebrow: string;
  promise: string;
  detail: string;
  benefits: string[];
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
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
  entryHeading: string;
  entryIntro: string;
  proofLabel: string;
  proofTitle: string;
  proofCopy: string;
  image: string;
  imageAlt: string;
  imageCaption?: string;
  detailImage?: string;
  detailImageAlt?: string;
  detailStatement?: string;
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
    intro: "Planeación, recolección, infraestructura y operación para que el aprovechamiento orgánico funcione en el territorio.",
    statement: "Operación territorial de recolección diferenciada.",
    entryHeading: "Servicios para pasar del diagnóstico a la continuidad operativa.",
    entryIntro: "Elige según el punto de partida: información incompleta, logística por ajustar, una planta que requiere continuidad o un proyecto que debe estructurarse.",
    proofLabel: "Experiencia aplicada",
    proofTitle: "Experiencia aplicada, de la logística al aprovechamiento.",
    proofCopy: "En Yarumal, Greenatics ha acompañado microrrutas, recepción y aprovechamiento de orgánicos. En Támesis, la experiencia incorpora tratamiento anaerobio, captura de biogás y una ruta de bioenergía. Son contextos distintos; en ambos, el diseño debe conectar suministro, responsables, operación y destino del material.",
    image: "/projects/plant/plant-evidence-05.webp",
    imageAlt: "Material orgánico dispuesto en pilas durante un proceso de compostaje",
    imageCaption: "Compostaje en hileras bajo cubierta en Yarumal.",
    color: "forest",
    entries: [
      { slug: "diagnostico-territorial", name: "Diagnóstico Territorial Circular", eyebrow: "La primera decisión", promise: "Saber qué existe antes de invertir.", detail: "Levantamos generación, composición, actores, rutas, infraestructura, costos y oportunidades para construir una línea base útil, no un documento aislado.", benefits: ["Balance de masa y calidad de la biomasa", "Mapa de brechas, actores y decisiones", "Hoja de ruta conectada con presupuesto y próximos pasos"], href: "/servicios/diagnostico-residuos/", cta: "Ver el diagnóstico" },
      { slug: "ruta-organica", name: "Ruta Orgánica", eyebrow: "Separación y logística", promise: "Integrar el vehículo y la microrruta a una operación posible.", detail: "Greenatics y Auteco Mobility desarrollaron conjuntamente una configuración de motocarguero sobre base Ceronte, con un contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos. La microrruta se define con generadores, frecuencia, accesos, carga, protocolos y recepción; el vehículo es una parte del sistema, no toda la solución.", benefits: ["Configuración conjunta sobre base Ceronte y contenedor diseñado por Greenatics", "Microrrutas definidas por topografía, generación y recepción", "Datos de recorrido para ajustar frecuencia y operación"], href: "/servicios/microrrutas-motocarguero/", cta: "Diseñar una ruta" },
      { slug: "ingenieria-plantas", name: "Ingeniería de Plantas Modulares", eyebrow: "Infraestructura por etapas", promise: "Dimensionar el proceso para el suministro y la operación posibles.", detail: "Comparamos alternativas y configuraciones de planta con datos de generación, predio, servicios, equipos, responsables y destino de las salidas. El nivel de ingeniería se define por fase.", benefits: ["Criterios de diseño y capacidad con supuestos visibles", "Módulos conectados a recepción y operación", "Planos, memorias y presupuesto según alcance"], href: "/servicios/plantas-modulares/", cta: "Dimensionar infraestructura" },
      { slug: "operacion-y-direccion-tecnica", name: "Operación y Dirección Técnica de Plantas", eyebrow: "Continuidad y transferencia", promise: "Estabilizar una planta y sostener su operación con el equipo local.", detail: "Según la necesidad, Greenatics puede asumir la operación integral, trabajar en modalidad compartida o dirigir técnicamente al equipo de la entidad. Cada alcance conecta suministro, proceso, personal, mantenimiento, registros y destino de los productos.", benefits: ["Revisión de fallas y puesta en marcha por etapas", "Procedimientos, mantenimiento y control de proceso", "Dirección técnica y transferencia de capacidades locales"], href: "/servicios/operacion-delegada/", cta: "Ver modalidades de operación" },
      { slug: "proyectos-publicos", name: "Estructuración de Proyectos Públicos", eyebrow: "De la necesidad al presupuesto", promise: "Convertir una oportunidad en un proyecto financiable.", detail: "Integramos diagnóstico territorial, prefactibilidad, alternativas tecnológicas, modelo operativo, CAPEX/OPEX, regulación, indicadores y estrategia de implementación.", benefits: ["Alternativas comparables y explicables", "Presupuesto y fases de ejecución", "Proyectos listos para conversación institucional y financiación"], href: "/soluciones/viabilidad-municipal/", cta: "Evaluar la viabilidad del proyecto" },
    ],
  },
  {
    slug: "valorizacion",
    shortName: "Valorización",
    name: "Greenatics Valorización",
    eyebrow: "Biomasa, productos y energía",
    headline: "Lo que se recupera vuelve como producto, energía y oportunidad.",
    intro: "Diseño de rutas para tratar biomasa y obtener compost, bioenergía o insumos agrícolas.",
    statement: "Infraestructura para tratamiento y aprovechamiento de biomasa en Támesis.",
    entryHeading: "Alternativas de tratamiento y salidas para la biomasa.",
    entryIntro: "Explora qué incorpora cada módulo y qué salida permite evaluar. La ruta se define según composición, escala, continuidad del suministro y destino posible.",
    proofLabel: "Criterio de diseño",
    proofTitle: "Cada proceso debe responder a un flujo y a un destino.",
    proofCopy: "El balance considera calidad de entrada, operación, consumo energético, almacenamiento y uso final. Compostaje, digestión anaerobia y biofábrica pueden combinarse por etapas cuando el material y el modelo operativo lo permiten.",
    image: "/projects/tamesis/planta-aerea.jpg",
    imageAlt: "Vista aérea de instalaciones para aprovechamiento de biomasa en Támesis.",
    detailImage: "/projects/tamesis/reactor-uasb.jpeg",
    detailImageAlt: "Reactor anaerobio UASB de 30 m³ instalado en Támesis.",
    detailStatement: "Támesis · Reactor UASB de 30 m³",
    color: "soil",
    entries: [
      { slug: "agroindustria", name: "Caracterización y valorización agroindustrial", eyebrow: "Biomasa y procesos productivos", promise: "Comparar rutas antes de elegir una tecnología.", detail: "Caracterizamos biomasa, efluentes, lodos y subproductos; relacionamos composición, volumen y continuidad con infraestructura, operación, energía, productos y destinos posibles. El estudio identifica qué alternativa merece evaluarse y qué información hace falta.", benefits: ["Caracterización y balance de corrientes", "Evaluación de digestión anaerobia, compostaje y bioenergía", "Criterios para avanzar a un piloto, inversión o siguiente estudio"], image: "/services/valorization-characterization-editorial.jpg", imageAlt: "Una profesional compara muestras de subproductos orgánicos sobre una mesa de caracterización.", imageCaption: "La caracterización ayuda a comparar alternativas para cada corriente.", href: "/agroindustria/", cta: "Explorar la ruta agroindustrial" },
      { slug: "biofabrica", name: "Biofábrica Territorial", eyebrow: "Producto desde el territorio", promise: "Transformar bases orgánicas en insumos con identidad y control.", detail: "Estructuramos nodos de formulación y acondicionamiento que convierten compost, digestatos y otras bases en productos para suelo y agricultura, con calidad, trazabilidad y ruta regulatoria.", benefits: ["Aprovechamiento productivo de la base generada", "Productos propios o desarrollados para terceros", "Conexión entre planta, registro, empaque y mercado"], href: "/servicios/aprovechamiento-productivo/", cta: "Explorar biofábrica" },
      { slug: "biogas-bioenergia", name: "Biogás y Bioenergía", eyebrow: "Támesis y agroindustria", promise: "Convertir corrientes compatibles en energía útil.", detail: "Evaluamos digestión anaerobia, captura de biogás, generación de energía, sustitución energética y manejo de digestatos cuando el balance técnico y económico lo justifica.", benefits: ["Producción y captura de biogás", "Bioenergía para autoconsumo o sustitución", "Indicadores de CH₄, energía y disponibilidad cuando se midan"], href: "/soluciones/biogas-energia/", cta: "Evaluar bioenergía" },
      { slug: "compostaje", name: "Optimización técnica de composteras", eyebrow: "Compostaje en marcha", promise: "Mejorar un proceso de compostaje que ya está en operación.", detail: "Revisamos materiales, mezcla, humedad, aireación, volteo, maduración y controles para fortalecer el proceso existente. Este alcance no sustituye la rehabilitación de infraestructura ni la operación diaria de la planta.", benefits: ["Ajustes de mezcla, humedad, aireación y volteo", "Controles de proceso y maduración", "Alcance diferenciado de rehabilitación y operación diaria"], image: "/services/compost-optimization-concept-v1.jpg", imageAlt: "Material de compost en proceso bajo una cubierta.", imageCaption: "El acompañamiento revisa las condiciones del material y las etapas del proceso.", href: "/servicios/optimizacion-composteras/", cta: "Conocer el acompañamiento técnico" },
      { slug: "parque-ambiental", name: "Parque Ambiental y Nodos Productivos", eyebrow: "Escala territorial", promise: "Integrar tratamiento, energía, producto y educación en un mismo sistema.", detail: "Estructuramos parques y nodos que combinan recepción, tratamiento, bioenergía, biofábrica, almacenamiento, formación y salidas de valor según el territorio.", benefits: ["Arquitectura modular por etapas", "Más de una salida para la biomasa", "Proyecto técnico, productivo y pedagógico"], href: "/parque-ambiental/", cta: "Explorar parque ambiental" },
    ],
  },
  {
    slug: "wondergreen",
    shortName: "Wondergreen",
    name: "Wondergreen Nutrients",
    eyebrow: "Nutrición, suelo y manejo biológico",
    headline: "Wondergreen Nutrients: nutrición para cada etapa del cultivo.",
    intro: "Fertilizantes sólidos organominerales ocluidos y líquidos de base biológica, Compost, bioinsumos y programas por cultivo.",
    statement: "Wondergreen Nutrients: nutrición y manejo biológico para el suelo y el cultivo.",
    entryHeading: "Encuentra la familia que responde a tu cultivo y objetivo.",
    entryIntro: "Conoce las familias de producto, sus fichas técnicas, los programas por cultivo y la ruta para casa y jardín.",
    proofLabel: "Cómo actúan los productos",
    proofTitle: "La formulación se conecta con el manejo agronómico.",
    proofCopy: "Las guías ayudan a relacionar cada familia con cultivo, etapa y seguimiento.",
    image: "/brand/wondergreen-nutrients.webp",
    imageAlt: "Identidad de la línea Wondergreen Nutrients",
    detailImage: "/products/wondergreen-soil-roots-editorial.webp",
    detailImageAlt: "Suelo, raíces y cultivo andino.",
    detailStatement: "Nutrición y manejo conectados con el suelo y el cultivo.",
    color: "leaf",
    entries: [
      { slug: "solidos", name: "Fertilizantes sólidos organominerales ocluidos", eyebrow: "Liberación gradual y suelo", promise: "Nutrientes y materia orgánica en una matriz orientada a liberar gradualmente.", detail: "La oclusión está orientada a moderar la disponibilidad de nutrientes. Su comportamiento y las posibles pérdidas dependen del suelo, el agua, el clima y el manejo del lote. La ficha de cada referencia presenta su fórmula y etapa de uso.", benefits: ["Nutriente y materia orgánica dentro de una misma matriz", "Liberación gradual conectada con suelo, humedad y raíz", "Lectura por etapa fisiológica, no por fórmula aislada"], image: "/products/wondergreen-line-2grow.jpg", imageAlt: "Plántula en suelo junto a gránulos de fertilizante.", href: "/wondergreen/#solidos", cta: "Ver sólidos" },
      { slug: "liquidos", name: "Fertilizantes líquidos de base biológica", eyebrow: "Bioles, nutrientes y microbiología", promise: "Nutrición líquida que acompaña planta y bioma suelo-planta.", detail: "Se elaboran a partir de bioles de digestión anaerobia multietapa, incluida la metanogénesis, y aportan nutrientes, microorganismos y compuestos orgánicos. El catálogo distingue fórmulas y etapas de uso.", benefits: ["Base biológica proveniente de bioles de digestión anaerobia", "Microorganismos y compuestos orgánicos para acompañar el bioma del suelo", "Concentraciones por etapa: crecimiento, equilibrio, floración y desarrollo del fruto"], image: "/products/wondergreen-line-liquidos.jpg", imageAlt: "Planta de cultivo junto a un recipiente con fertilizante líquido ámbar.", href: "/wondergreen/#liquidos", cta: "Explorar líquidos" },
      { slug: "bioinsumos", name: "Bioinsumos y bioles", eyebrow: "Microbiología y manejo integrado", promise: "Opciones biológicas para el manejo del suelo y el cultivo.", detail: "La familia reúne bioles y referencias microbiológicas con objetivos de uso diferenciados. En el catálogo puedes consultar cada producto y su ficha técnica.", benefits: ["Base biológica y microbiológica diferenciada", "Aporte de microorganismos y materia orgánica al sistema suelo-planta", "Aplicación integrada con monitoreo y manejo del lote"], image: "/products/wondergreen-line-bioinsumos-v2.jpg", imageAlt: "Raíces de una plántula de café en un vivero.", href: "/wondergreen/#bioinsumos", cta: "Ver bioinsumos" },
      { slug: "programas-cultivo", name: "Programas por cultivo", eyebrow: "Acompañamiento agronómico", promise: "Pasar de comprar un producto a mejorar una decisión de campo.", detail: "Construimos recorridos para café, aguacate, cacao, cítricos, pastos, plátano, hortalizas y pasifloras, con etapas, observaciones, documentos y seguimiento.", benefits: ["Lectura de suelo, cultivo, etapa y objetivo", "Plan de aplicación y seguimiento", "Biblioteca técnica con guías y manuales descargables"], image: "/guides/guia-cafe-cover.webp", imageAlt: "Manual técnico Wondergreen para café", href: "/wondergreen/cultivos/", cta: "Ver cultivos" },
      { slug: "casa-jardin", name: "Casa & Jardín", eyebrow: "Cuidado cotidiano", promise: "Llevar la ciencia del suelo vivo a macetas, huertas y jardines.", detail: "Kits, guías por etapas y herramientas de diagnóstico convierten la lógica Wondergreen en decisiones sencillas para plantas ornamentales, huertas urbanas y espacios domésticos.", benefits: ["Kits por necesidad y etapa de la planta", "Guías prácticas con imágenes y PDF", "Ruta de cuidado desde suelo, drenaje y establecimiento"], image: "/guides/casa-transplante-planting-detail.jpg", imageAlt: "Planta con cepellón junto a una maceta preparada para trasplante.", href: "/casa-jardin/", cta: "Explorar Casa & Jardín" },
    ],
  },
  {
    slug: "clima-datos",
    shortName: "Clima y datos",
    name: "Greenatics Clima y Datos",
    eyebrow: "Medición, evidencia y decisión",
    headline: "Datos que explican qué ocurrió, qué falta medir y qué decisión sigue.",
    intro: "Herramientas para organizar inventarios climáticos, registrar operaciones, dar trazabilidad y convertir datos en decisiones.",
    statement: "Back 2 Green: inventario y seguimiento de información climática.",
    entryHeading: "Aplicaciones para medir, registrar y dar seguimiento.",
    entryIntro: "Elige según la tarea: inventariar emisiones, controlar una planta, gestionar trabajo territorial, seguir un lote agrícola o estructurar inversión productiva.",
    proofLabel: "Criterio de datos",
    proofTitle: "La trazabilidad conserva la historia de cada dato.",
    proofCopy: "Cada registro debe poder volver a su fuente, unidad, periodo y responsable. Los estados de revisión y las evidencias permiten distinguir información reportada, validada y pendiente de completar.",
    image: "/tools/huella/dashboard.png",
    imageAlt: "Vista de Back 2 Green con datos de ejemplo para organizar fuentes, periodos y evidencias de un inventario climático.",
    imageCaption: "Ejemplo de inventario climático · datos de muestra",
    color: "sky",
    entries: [
      { slug: "calcula-tu-huella", name: "Back 2 Green", eyebrow: "Inventario climático", promise: "Ordenar fuentes y datos para una gestión climática trazable.", detail: "La experiencia organiza fuentes, periodos y evidencias del inventario. El acompañamiento profesional acuerda el método de GEI, revisa supuestos y prepara el reporte según su alcance.", benefits: ["Organización de fuentes y datos por periodo", "Evidencias e historial de revisión", "Acompañamiento para priorizar y reportar con método"], image: "/tools/huella/recorrido.png", imageAlt: "Recorrido de seis etapas de Back 2 Green", href: "/huella/", cta: "Conocer Back 2 Green" },
      { slug: "greenatics-ops", name: "GREENATICS OPS", eyebrow: "Control operativo", promise: "Explorar cómo se conectan los registros de una planta.", detail: "Bitácoras, ingresos, pesajes, lotes, actividades, equipos, mantenimiento, inventario, calidad del dato y dashboard en una estación de trabajo para la operación.", benefits: ["Control de actividades y responsables", "Volúmenes, lotes, inventario y novedades", "Dashboard para dirección técnica y mejora continua"], image: "/tools/greenatics-ops-documentary-v01.jpg", imageAlt: "Dos trabajadores registran el pesaje y reciben material orgánico en una planta de compostaje.", imageCaption: "La recepción y el pesaje pueden integrarse con los registros de cada lote.", href: "/app/", cta: "Explorar muestra de OPS" },
      { slug: "greenatics-red", name: "GREENATICS Red", eyebrow: "Territorio y PMIRS", promise: "Conectar personas, rutas, hallazgos y acciones.", detail: "Red organiza usuarios, generadores, recorridos, evidencia de campo, QA/QC, programas y responsables para convertir el diagnóstico territorial en una implementación visible.", benefits: ["Cobertura, generadores y trabajo de campo", "Novedades, evidencias y hallazgos", "Programas, responsables, indicadores y seguimiento"], image: "/tools/red-territorial-workflow.svg", imageAlt: "Mapa de trabajo territorial que conecta organizaciones, generadores, cobertura, evidencia, hallazgos y acciones", href: "/red/", cta: "Explorar Red" },
      { slug: "agroway", name: "AGROWAY", eyebrow: "Trazabilidad y manejo del ciclo agrícola", promise: "Conectar lote, plan, trabajo de campo y cosecha en una historia que el equipo pueda revisar.", detail: "La demo navegable relaciona productor, finca, ciclo, cultivo, MIPFRE, labores, evidencia y cosecha. La visión de producto conecta esa información con Greenatics Control y SANA Data para acompañar proyectos y decisiones de inversión; las conexiones con fincas reales se validan por separado.", benefits: ["Productor, finca, ciclo y lote", "MIPFRE por zona, labores, evidencia y cosecha", "Trazabilidad agrícola conectada con el portafolio y los proyectos"], image: "/tools/agroway-field-editorial.jpg", imageAlt: "Productora técnica observa un cultivo de café y registra una nota en una finca andina.", href: "/agroway/", cta: "Explorar AgroWay" },
      { slug: "sana", name: "SANA", eyebrow: "Estructuración de proyectos agrícolas", promise: "Articular oportunidad agrícola, inversión y acompañamiento.", detail: "SANA conecta territorio, actores, criterio agronómico, capacidades Wondergreen, inversión y evidencia dentro de una ruta acordada para cada proyecto.", benefits: ["Lectura de oportunidad y contexto", "Estructuración de hitos, responsables y seguimiento", "Articulación entre inversión, conocimiento y campo"], href: "/sana/", cta: "Conocer SANA" },
    ],
  },
  {
    slug: "operacion-digital",
    shortName: "Operación digital",
    name: "Operación digital Greenatics",
    eyebrow: "Plataformas que hacen usable el conocimiento",
    headline: "La tecnología se vuelve valiosa cuando la operación la adopta.",
    intro: "Acceso, permisos y biblioteca para que las herramientas Greenatics se integren al trabajo diario.",
    statement: "Acceso a herramientas, administración de usuarios y conocimiento técnico.",
    entryHeading: "Una puerta de entrada clara al ecosistema Greenatics.",
    entryIntro: "Esta línea no duplica las aplicaciones de medición y operación: organiza cómo encontrarlas, administrar quién las usa y consultar los recursos que las respaldan.",
    proofLabel: "Criterio de acceso",
    proofTitle: "Cada persona necesita el entorno y el conocimiento adecuados.",
    proofCopy: "El centro de herramientas orienta el acceso; los roles y permisos asignan responsabilidades; la biblioteca conserva guías, casos y documentos técnicos para preparar y acompañar el trabajo.",
    image: "/tools/greenatics-ecosystem-map.svg",
    imageAlt: "Ilustración de cinco ámbitos de trabajo —planta, territorio, clima, agricultura y proyectos— con un proceso común de datos, evidencia y decisión.",
    color: "ink",
    entries: [
      { slug: "centro-herramientas", name: "Centro de herramientas", eyebrow: "Punto de entrada", promise: "Elegir la aplicación correcta sin perderse en el ecosistema.", detail: "Landing, entorno público y acceso a espacios conectados se organizan en un solo lugar para que cada usuario entienda qué resuelve cada plataforma.", benefits: ["Acceso directo a las experiencias disponibles", "Lectura por problema, módulo y usuario", "Entrada clara a entornos públicos y reales"], image: "/portfolio/greenatics-digital-tools-hub-v01.jpg", imageAlt: "Dos profesionales revisan en un portátil una interfaz visual de módulos y herramientas digitales.", href: "/herramientas/", cta: "Abrir centro" },
      { slug: "usuarios-permisos", name: "Usuarios y permisos", eyebrow: "Gobierno del acceso", promise: "Cada persona ve lo que necesita para cumplir su rol.", detail: "La administración de usuarios debe vincular organización, rol, aplicación, entorno y permisos; así una misma cuenta puede participar en una o varias herramientas sin mezclar datos.", benefits: ["Roles por aplicación y organización", "Usuarios de acceso público y entornos reales diferenciados", "Trazabilidad sobre acceso y responsabilidad"], image: "/tools/access-governance-map.svg", imageAlt: "Diagrama de acceso que relaciona organización, entorno, aplicación, rol y permiso", href: "/plataforma/usuarios/", cta: "Administrar usuarios" },
      { slug: "biblioteca-evidencia", name: "Biblioteca y evidencia", eyebrow: "Conocimiento reutilizable", promise: "Convertir documentos, datos y casos en decisiones disponibles.", detail: "La biblioteca reúne guías Wondergreen, manuales, casos, documentos de impacto y recursos que alimentan la venta, la ejecución y el aprendizaje de los equipos.", benefits: ["Documentos técnicos y comerciales conectados", "Casos y metodología para explicar resultados con contexto", "Recursos públicos para preparar conversaciones"], image: "/guides/catalogo-cover-hd.png", imageAlt: "Catálogo técnico Wondergreen", href: "/biblioteca/", cta: "Abrir biblioteca" },
    ],
  },
  {
    slug: "empresas",
    shortName: "Organizaciones y generadores",
    name: "Organizaciones y grandes generadores",
    eyebrow: "PMIRS, logística y aprovechamiento por sede",
    headline: "Organiza los residuos de cada sede y acuerda una rutina que el equipo pueda sostener.",
    intro: "PMIRS, logística interna, recolección y aprovechamiento para organizaciones con distintas sedes y corrientes.",
    statement: "De la gestión interna del material a una ruta de tratamiento y aprovechamiento.",
    entryHeading: "Servicios para organizar el manejo de orgánicos en cada sede.",
    entryIntro: "Unidades residenciales, centros comerciales, instituciones y empresas combinan espacios, horarios y corrientes distintas. El alcance parte de lo que generan, quién lo maneja y qué logística y destino tienen disponibles.",
    proofLabel: "Criterio de intervención",
    proofTitle: "El plan funciona cuando cabe en la operación real.",
    proofCopy: "Conectamos separación, responsables, almacenamiento, recolección, proceso y trazabilidad para que las rutinas acordadas correspondan a los espacios, turnos y corrientes de cada organización.",
    image: "/services/pmirs-large-generators-editorial.jpg",
    imageAlt: "Separación de residuos orgánicos en una unidad residencial.",
    imageCaption: "Organizar la separación por sede facilita coordinar equipos y gestores.",
    color: "soil",
    entries: [
      { slug: "pmirs-grandes-generadores", name: "PMIRS para grandes generadores", eyebrow: "Organización interna", promise: "Convertir el plan de residuos en tareas que el equipo puede ejecutar.", detail: "Definimos responsables, puntos de separación, recipientes, almacenamiento, recorridos internos, frecuencia, gestores, contingencias e indicadores para unidades residenciales, centros comerciales, instituciones y operaciones empresariales.", benefits: ["Rutinas por espacio y tipo de material", "Coordinación de personal y gestores", "Seguimiento con registros y evidencias"], image: "/services/pmirs-large-generators-editorial.jpg", imageAlt: "Separación de orgánicos en un conjunto residencial y traslado a un área de aprovechamiento.", imageCaption: "Acordar responsables y rutinas ayuda a llevar el PMIRS a cada sede.", href: "/servicios/pgirs-pmirs/?perfil=empresa#pmirs-organizacional", cta: "Ver alcance PMIRS" },
      { slug: "recoleccion-organica", name: "Recolección y tratamiento de orgánicos", eyebrow: "Cadena externa", promise: "Conectar separación en origen con recepción y destino del material.", detail: "Coordinamos la caracterización inicial, la frecuencia de entrega, los criterios de aceptación y la información que acompaña cada retiro y recepción.", benefits: ["Ruta de entrega adecuada al generador", "Criterios de calidad y trazabilidad", "Tratamiento y destino relacionados con la corriente"], image: "/projects/routes/motocarguero-verde-operacion-real.webp", imageAlt: "Representación del motocarguero sobre base Ceronte con contenedor verde diseñado por Greenatics junto con Auteco Mobility", imageCaption: "Diseño conjunto para recolección selectiva; la ruta y su adaptación se definen para cada proyecto.", href: "/contacto/?servicio=recoleccion-tratamiento&perfil=empresa", cta: "Solicitar una ruta" },
      { slug: "continuidad-operativa", name: "Operación y trazabilidad", eyebrow: "Control del día a día", promise: "Sostener el proceso y saber qué ocurre con cada lote.", detail: "Relacionamos actividades, recepción, pesajes, lotes, equipos, mantenimiento, inventarios y salidas en una operación con responsables y registros consultables.", benefits: ["Dirección técnica y rutinas de planta", "Control de ingresos, proceso y salidas", "Información útil para revisar y mejorar"], image: "/services/operation-follow-up-concept-v1.jpg", imageAlt: "Una persona registra el seguimiento de una pila de compostaje bajo cubierta.", imageCaption: "Relacionar materiales, actividades y seguimiento técnico aporta contexto para la operación diaria.", href: "/servicios/operacion-delegada/", cta: "Conocer operación de plantas" },
    ],
  },
];

export const portfolioGroupSlugs = portfolioGroups.map((group) => ({ slug: group.slug }));

export function getPortfolioGroup(slug: string) {
  return portfolioGroups.find((group) => group.slug === slug);
}
