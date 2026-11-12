export type EditorialBlock =
  | { type: "paragraph"; text: string; sourceRefs?: readonly number[] }
  | { type: "heading"; id: string; text: string }
  | { type: "list"; items: readonly string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "studyComparison"; caption: string; sourceRefs?: readonly number[]; panels: readonly EditorialStudyPanel[] };

export type EditorialStudyPanel =
  | {
      kind: "metricBars";
      id: string;
      title: string;
      context: string;
      scaleMax: number;
      metrics: readonly { label: string; value: number; displayValue: string }[];
      note: string;
    }
  | {
      kind: "highlight";
      id: string;
      eyebrow: string;
      value: string;
      description: string;
      note: string;
      boundary: string;
    };

export type EditorialSource = {
  title: string;
  publisher: string;
  href: string;
  year?: string;
};

export type EditorialPost = {
  slug: string;
  status: "published" | "draft";
  category: string;
  title: string;
  description: string;
  cardVisual?: { src: string; alt: string };
  publishedAt?: string;
  readingMinutes: number;
  blocks: readonly EditorialBlock[];
  sources: readonly EditorialSource[];
  sourceNote: string;
  relatedTitle: string;
  relatedHref: string;
  relatedLabel: string;
};

type PublishedEditorialPost = EditorialPost & {
  status: "published";
  publishedAt: string;
  cardVisual: NonNullable<EditorialPost["cardVisual"]>;
};

// Public posts are code-reviewed and versioned here. Only `published` entries
// are eligible for the public index and statically generated routes.
export const editorialPosts: readonly EditorialPost[] = [
  {
    slug: "antes-de-invertir-en-biogas",
    status: "published",
    category: "Biomasa y valorización",
    title: "Antes de invertir en biogás, entiende la corriente orgánica.",
    description:
      "Cinco preguntas para evaluar disponibilidad, calidad, logística, tecnología, destinos y operación antes de dimensionar un proyecto de digestión anaerobia.",
    cardVisual: {
      src: "/tools/organic-valorization-pathways.svg",
      alt: "Esquema conceptual: una corriente de biomasa puede llevar a comparar compostaje, digestión anaerobia y posibles destinos agronómicos.",
    },
    publishedAt: "2026-10-31",
    readingMinutes: 7,
    sourceNote: "Las guías de AgSTAR aportan criterios de evaluación para digestión anaerobia; no sustituyen el diseño del sitio, la normativa colombiana aplicable ni la revisión profesional.",
    relatedTitle: "¿Tienes una corriente orgánica y necesitas comparar alternativas?",
    relatedHref: "/agroindustria/",
    relatedLabel: "Explorar Agroindustria",
    blocks: [
      {
        type: "paragraph",
        text: "Una cifra de capacidad o producción potencial puede parecer suficiente para empezar. Pero un proyecto de digestión anaerobia necesita responder primero qué material llegará, en qué cantidad y condiciones, cómo se preparará, quién operará el sistema y qué uso tendrán el biogás y el digestato. La guía de desarrollo de proyectos de AgSTAR organiza precisamente estas preguntas entre suministro, factibilidad técnica y financiera, operación, seguridad y permisos.",
        sourceRefs: [1, 2],
      },
      { type: "heading", id: "corriente", text: "1. ¿Qué corriente existe y con qué continuidad?" },
      {
        type: "paragraph",
        text: "Identifica de dónde viene cada material, cuánto se genera, cómo cambia por semana o temporada y qué prácticas actuales afectan su composición. Separa datos medidos de estimaciones: una cifra anual, una semana de alta producción o el volumen que alguien espera entregar no cuentan la misma historia. Si el abastecimiento depende de terceros, aclara responsables, volúmenes y condiciones de entrega antes de dar por disponible el recurso.",
      },
      { type: "heading", id: "calidad", text: "2. ¿Qué preparación requiere antes del proceso?" },
      {
        type: "paragraph",
        text: "La presencia de impropios, arena, empaques o cambios de humedad y carga puede modificar la recepción, el acondicionamiento y el almacenamiento. La EPA describe cómo el pretratamiento y la ecualización dependen del material y del tipo de sistema; también advierte que la selección debe responder a la corriente específica. Por eso conviene definir qué se inspecciona, qué se retira, qué se mezcla y cuánto tiempo puede permanecer almacenado.",
        sourceRefs: [3],
      },
      { type: "heading", id: "sitio", text: "3. ¿El sitio y la alternativa técnica son compatibles?" },
      {
        type: "paragraph",
        text: "La factibilidad técnica relaciona el material de entrada con las condiciones del sitio, el tipo y tamaño del sistema, los equipos auxiliares y el destino del biogás. No basta con comparar capacidades nominales: hay que verificar accesos, agua y energía requeridas, espacio, pretratamiento, conexiones posibles y condiciones de operación. Las opciones se comparan con la información de cada proyecto, no con un rendimiento supuesto de otra instalación.",
        sourceRefs: [2, 3],
      },
      { type: "heading", id: "salidas", text: "4. ¿Quién aprovechará las salidas del proceso?" },
      {
        type: "paragraph",
        text: "Define si el biogás se usará para calor, electricidad, combustible u otra alternativa técnicamente viable, y cómo se manejará el digestato. La demanda energética, el acondicionamiento del gas, la calidad requerida y el uso o destino del material digerido forman parte del análisis. Cuando una salida dependa de un comprador, una conexión o un permiso, esa condición debe quedar explícita como supuesto pendiente hasta contar con respaldo.",
        sourceRefs: [1, 2],
      },
      { type: "heading", id: "operacion", text: "5. ¿Quién sostendrá la operación y sus costos?" },
      {
        type: "paragraph",
        text: "Un proyecto necesita personas responsables, rutinas de control, mantenimiento, seguridad y respuesta ante fallas. También debe estimar inversión, energía consumida por el propio proceso, transporte, operación, mantenimiento, monitoreo y reposición de equipos. La EPA presenta la factibilidad financiera como un proceso iterativo: los supuestos técnicos y económicos se refinan antes de pasar a implementación.",
        sourceRefs: [1, 2],
      },
      {
        type: "callout",
        title: "Una ficha inicial útil",
        text: "Reúne ubicación, fuentes de biomasa, registros disponibles por periodo, análisis de composición, manejo actual, distancias, infraestructura existente, posibles usos de energía y responsables de operación. Con esa base se puede acordar qué medir, qué alternativa comparar y qué incertidumbre resolver primero.",
      },
      {
        type: "paragraph",
        text: "Este marco ayuda a estructurar una conversación de prefactibilidad; no sustituye el muestreo, el diseño de ingeniería, los permisos aplicables, la evaluación económica de sitio ni la revisión profesional. Las referencias de AgSTAR son guías técnicas estadounidenses: las reglas y autorizaciones deben verificarse para cada proyecto en Colombia.",
      },
    ],
    sources: [
      {
        title: "AgSTAR Project Development Handbook, 3.ª edición",
        publisher: "U.S. Environmental Protection Agency",
        href: "https://www.epa.gov/agstar/agstar-project-development-handbook",
        year: "2020",
      },
      {
        title: "Project Planning and Financing",
        publisher: "U.S. Environmental Protection Agency · AgSTAR",
        href: "https://www.epa.gov/agstar/project-planning-and-financing",
      },
      {
        title: "Anaerobic System Design and Technology",
        publisher: "U.S. Environmental Protection Agency · AgSTAR",
        href: "https://www.epa.gov/agstar/anaerobic-system-design-and-technology",
      },
    ],
  },
  {
    slug: "ruta-municipal-organicos-antes-de-invertir",
    status: "published",
    category: "Municipios y ESP",
    title: "¿Qué necesita una ruta municipal de orgánicos antes de pasar a infraestructura?",
    description:
      "Una guía de decisión para conectar actores, datos, recolección, alternativa técnica, destino de las salidas y capacidad de operación antes de proponer una planta.",
    cardVisual: {
      src: "/tools/selective-collection-route.svg",
      alt: "Esquema conceptual de microrruta que conecta generadores, recorrido y frecuencia, tipo y volumen de carga, y recepción con pesaje.",
    },
    publishedAt: "2026-11-02",
    readingMinutes: 8,
    sourceNote:
      "La guía UAESP–Universidad Nacional aborda compostaje y lombricultura en Bogotá. AgSTAR aporta preguntas de evaluación para digestión anaerobia. Son referencias técnicas de alcances distintos; no reemplazan la normativa aplicable, los datos del territorio ni los estudios del sitio.",
    relatedTitle: "¿Necesitas decidir qué alternativa estudiar para tu territorio?",
    relatedHref: "/municipios/",
    relatedLabel: "Ver soluciones para municipios y ESP",
    blocks: [
      {
        type: "paragraph",
        text: "Una cifra de residuos y una tecnología de referencia no bastan para definir infraestructura. La decisión requiere conectar quién genera y separa el material, cómo se recoge, qué llega realmente al sitio, quién puede operarlo y qué destino tendrían las salidas. La guía de UAESP y la Universidad Nacional ofrece criterios para compostaje y lombricultura en Bogotá; AgSTAR organiza la evaluación de digestión anaerobia alrededor del material, el sitio, el sistema y sus usos. Son referencias para formular preguntas, no una solución lista para copiar a otro territorio.",
        sourceRefs: [1, 2, 3],
      },
      { type: "heading", id: "decision", text: "1. Define la decisión y los actores del caso" },
      {
        type: "paragraph",
        text: "Delimita el territorio o sistema, la corriente orgánica y la decisión que está abierta: mejorar la separación, ajustar una ruta, evaluar una instalación, comparar alternativas o preparar un estudio. Identifica por separado quién administra los datos, quién puede contratar el siguiente paso, quién participaría en la operación y quién recibiría las salidas. No des por hecho que municipio, prestador, operador y propietario del sitio son la misma parte; sus responsabilidades y facultades deben verificarse para el caso.",
      },
      { type: "heading", id: "datos", text: "2. Convierte los registros en una base comparable" },
      {
        type: "paragraph",
        text: "Para cada cifra registra fuente, unidad, cobertura, periodo y método. Separa pesajes observados de estimaciones, promedios de picos y generación total de material separado o efectivamente recibido. Si las fuentes cubren periodos o áreas diferentes, no las sumes como si describieran un solo flujo. La guía de UAESP incluye la separación y los tipos de material entre los asuntos de partida para aprovechar orgánicos; la composición local y su variación deben confirmarse con datos del territorio.",
        sourceRefs: [1],
      },
      { type: "heading", id: "ruta", text: "3. Dibuja el recorrido hasta la recepción" },
      {
        type: "paragraph",
        text: "Describe quién separa, con qué orientación, cómo se presenta y recoge el material, qué frecuencia aplica y qué ocurre entre recolección y recepción. Registra distancias como hipótesis logística hasta contrastarlas con recorridos, vehículos, horarios y condiciones de acceso. Anota impropios, rechazos, almacenamiento y puntos donde el flujo puede mezclarse o perder trazabilidad. Una tasa de captura o una ruta propuesta no equivale por sí sola a una cantidad disponible para una planta.",
      },
      { type: "heading", id: "alternativas", text: "4. Compara el material con el sitio y la alternativa" },
      {
        type: "paragraph",
        text: "Solo después de entender el flujo tiene sentido preguntar qué alternativas podrían estudiarse. Compostaje, lombricultura o digestión anaerobia requieren condiciones y controles distintos. Para digestión, AgSTAR recomienda evaluar el material, el sitio, el tipo y tamaño del sistema y el uso del biogás; esos criterios no determinan cuál tecnología conviene en un municipio colombiano. Compara alternativas con las restricciones reales de área, acceso, servicios, pretratamiento y operación, y deja explícitos los datos que todavía faltan.",
        sourceRefs: [2, 3],
      },
      { type: "heading", id: "salidas", text: "5. Comprueba quién usará las salidas y sostendrá el proceso" },
      {
        type: "paragraph",
        text: "Para compost o lombricompost, define qué calidad, uso, usuario y logística de salida deben investigarse. Para biogás o digestato, verifica demanda o conexión, acondicionamiento, manejo y responsables antes de contar esos productos como ingresos o beneficios. En todos los casos estima qué equipo humano, monitoreo, mantenimiento, seguridad y recursos necesita cada alternativa. Si no hay destinatario, operador o condición de salida verificable, esa incertidumbre debe permanecer visible en la comparación.",
        sourceRefs: [1, 2],
      },
      {
        type: "callout",
        title: "Una ficha para decidir el siguiente paso",
        text: "Reúne mapa del flujo; fuentes y periodos de los datos; composición e impropios conocidos; ruta y distancias por verificar; sitio candidato; actores y responsabilidades por validar; destinos posibles; y preguntas abiertas. Con esa ficha se puede acordar si conviene caracterizar, comparar alternativas, delimitar un piloto o detener el análisis hasta contar con mejores datos.",
      },
      {
        type: "paragraph",
        text: "Este marco ayuda a ordenar una conversación de prefactibilidad; no prueba disponibilidad de biomasa, viabilidad económica, reducción de costos, cumplimiento ni autorización de una obra. La guía UAESP–Universidad Nacional corresponde a compostaje y lombricultura en Bogotá y fue desarrollada en 2014; AgSTAR es una guía técnica estadounidense para digestión anaerobia. El diseño, los requisitos y los permisos deben revisarse para el territorio y alcance concretos.",
        sourceRefs: [1, 2],
      },
    ],
    sources: [
      {
        title: "Guía técnica para el aprovechamiento de residuos orgánicos a través de metodologías de compostaje y lombricultura",
        publisher: "UAESP · Universidad Nacional de Colombia",
        href: "https://www.uaesp.gov.co/images/Guia-UAESP_SR.pdf",
        year: "2014",
      },
      {
        title: "AgSTAR Project Development Handbook, 3.ª edición",
        publisher: "U.S. Environmental Protection Agency",
        href: "https://www.epa.gov/agstar/agstar-project-development-handbook",
        year: "2020",
      },
      {
        title: "Project Planning and Financing",
        publisher: "U.S. Environmental Protection Agency · AgSTAR",
        href: "https://www.epa.gov/agstar/project-planning-and-financing",
      },
    ],
  },
  {
    slug: "digestato-nitrogeno-eficiencia-volatilizacion",
    status: "published",
    category: "Wondergreen · ciencia aplicada",
    title: "Digestato y nitrógeno: eficiencia de uso y volatilización se miden por separado.",
    description:
      "Dos ensayos de campo muestran por qué la absorción del cultivo y la pérdida de amoníaco describen procesos distintos, y qué datos hacen falta para interpretar cada resultado.",
    cardVisual: {
      src: "/editorial/digestato-nitrogeno-portada.svg",
      alt: "Ilustración botánica abstracta junto a las siglas NUE y NH₃, que representan preguntas agronómicas distintas.",
    },
    publishedAt: "2026-11-05",
    readingMinutes: 7,
    sourceNote:
      "Los resultados descritos pertenecen a digestatos y manejos evaluados en Italia y Pensilvania. No son ensayos con productos Wondergreen ni estimaciones para Colombia. Las condiciones del material, suelo, cultivo y método de aplicación limitan la transferencia de cada valor.",
    relatedTitle: "¿Quieres revisar la formulación y el alcance de la línea líquida Wondergreen?",
    relatedHref: "/wondergreen/productos/2grow-liquido/",
    relatedLabel: "Conocer 2GROW líquido",
    blocks: [
      {
        type: "paragraph",
        text: "Una fertilización puede producir una cosecha comparable y, aun así, mostrar diferencias en la fracción del nitrógeno aplicada que recupera el cultivo. También puede haber pérdidas de amoníaco que una medición de eficiencia de uso no describe por sí sola. Para evaluar un digestato con criterio agronómico conviene separar el rendimiento y la calidad del cultivo, la absorción de N y las emisiones medidas después de aplicar.",
      },
      { type: "heading", id: "metricas", text: "Qué responde cada indicador" },
      {
        type: "paragraph",
        text: "En el ensayo de trigo de Piccoli y colaboradores, la eficiencia de uso del nitrógeno (NUE) se calculó como nitrógeno absorbido por el cultivo dividido por nitrógeno aplicado. Esa razón integra la absorción observada respecto del aporte fertilizante; no equivale a una medición directa de volatilización de NH₃. La volatilización cuantifica una vía concreta de pérdida gaseosa durante un periodo de monitoreo. Ninguna de las dos métricas, aislada, describe todas las pérdidas posibles ni demuestra por sí sola una respuesta comercial universal.",
        sourceRefs: [1],
      },
      {
        type: "studyComparison",
        caption:
          "Dos estudios distintos y dos preguntas diferentes. Piccoli et al. evaluaron trigo de invierno en dos fincas italianas durante dos años; Sigdel et al. compararon inyección y aplicación superficial de digestato líquido separado en seis ensayos de maíz en Pensilvania. Los valores no deben combinarse ni atribuirse a 2GROW.",
        sourceRefs: [1, 2],
        panels: [
          {
            kind: "metricBars",
            id: "nue-chart-title",
            title: "Eficiencia de uso del N (NUE)",
            context: "Trigo de invierno · dos fincas · Italia",
            scaleMax: 70,
            metrics: [
              { label: "Fertilizante mineral", value: 69, displayValue: "69%" },
              { label: "Digestato líquido · tasa variable", value: 49, displayValue: "49%" },
              { label: "Digestato líquido + inhibidor", value: 43, displayValue: "43%" },
              { label: "Digestato sólido", value: 25, displayValue: "25%" },
            ],
            note: "47 ha · dos años · Piccoli et al. (2025)",
          },
          {
            kind: "highlight",
            id: "ammonia-metric-title",
            eyebrow: "PÉRDIDA DE NH₃ · 24 HORAS",
            value: "+58%",
            description: "más NH₃ acumulado con aplicación superficial frente a inyección.",
            note: "Seis ensayos de maíz en Pensilvania · Sigdel et al. (2025)",
            boundary: "Digestato líquido separado. Resultado externo; no corresponde a 2GROW.",
          },
        ],
      },
      { type: "heading", id: "nue-trigo", text: "En trigo, rendimiento comparable no significó igual NUE" },
      {
        type: "paragraph",
        text: "El ensayo en finca de Piccoli et al. cubrió 47 hectáreas en dos explotaciones de la región del Véneto, Italia, durante dos años. Los tratamientos con digestato alcanzaron rendimientos superiores a 5,9 t/ha y proteína superior a 5,3 %, comparables con el fertilizante mineral. Sin embargo, la NUE reportada fue 69 % con fertilizante mineral, 43 % con digestato líquido más inhibidor de nitrificación y 25 % con digestato sólido; el digestato líquido con aplicación a tasa variable llegó a 49 %. El comportamiento del digestato sólido también cambió entre sitios. La comparación muestra por qué rendimiento, proteína y recuperación de N deben leerse juntos y dentro de sus condiciones de ensayo.",
        sourceRefs: [1],
      },
      { type: "heading", id: "nh3-aplicacion", text: "En digestato líquido, el método de aplicación cambió la pérdida de NH₃" },
      {
        type: "paragraph",
        text: "Sigdel et al. estudiaron seis ensayos de maíz para ensilaje en fincas lecheras comerciales de Pensilvania entre 2021 y 2023. Durante las primeras seis horas, la aplicación superficial del digestato líquido separado perdió el doble de NH₃ que la inyección; en las 24 horas monitoreadas, la pérdida acumulada fue 58 % mayor con aplicación superficial. En promedio, el rendimiento de ensilaje fue 3,8 % mayor con inyección. Son diferencias observadas en ese sistema de manejo, material, cultivo y entorno; no un factor de corrección universal ni una predicción para otra formulación.",
        sourceRefs: [2],
      },
      { type: "heading", id: "interpretar", text: "Qué registrar antes de comparar una formulación" },
      {
        type: "list",
        items: [
          "Material y análisis: origen, fracción, N total, N amoniacal, sólidos y pH del lote evaluado.",
          "Cultivo y sitio: especie, etapa, suelo, clima, manejo previo y objetivo de producción.",
          "Aplicación: dosis de N comparable, distribución, incorporación o inyección y tiempo hasta la medición.",
          "Resultados separados: N absorbido y NUE, rendimiento y calidad, NH₃ durante el periodo definido y, cuando corresponda, otras vías de pérdida.",
          "Diseño de comparación: testigo, fertilizante de referencia, replicación, periodo, unidades y método analítico.",
        ],
      },
      {
        type: "callout",
        title: "Una cifra alta en una métrica no cierra el balance",
        text: "La NUE informa cuánto nitrógeno absorbió el cultivo respecto de lo aplicado bajo el método definido; NH₃ cuantifica una emisión y ventana de monitoreo concretas. Para atribuir una mejora a un producto se necesita un ensayo de esa formulación, con comparador, análisis, cultivo y manejo identificados. Los estudios citados aquí no prueban desempeño de 2GROW ni reemplazan la ficha técnica y validación agronómica de cada uso.",
      },
    ],
    sources: [
      {
        title: "On-farm experimentation of anaerobic digestate distribution methods for advancing circular economy in the agroecosystem",
        publisher: "Piccoli et al. · Precision Agriculture",
        href: "https://link.springer.com/article/10.1007/s11119-025-10275-9",
        year: "2025",
      },
      {
        title: "Ammonia emissions and corn yield response from injected versus surface-applied liquid-separated anaerobic digestate",
        publisher: "Sigdel et al. · Agronomy Journal",
        href: "https://acsess.onlinelibrary.wiley.com/doi/full/10.1002/agj2.70050",
        year: "2025",
      },
    ],
  },
];

export function getPublishedEditorialPosts(): PublishedEditorialPost[] {
  return [...editorialPosts]
    .filter((post): post is PublishedEditorialPost => post.status === "published" && Boolean(post.publishedAt) && Boolean(post.cardVisual))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPublishedEditorialPost(slug: string): PublishedEditorialPost | undefined {
  return getPublishedEditorialPosts().find((post) => post.slug === slug);
}
