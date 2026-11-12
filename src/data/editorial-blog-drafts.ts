import type { EditorialPost } from "./editorial-blog";

// Internal editorial drafts only. Public route modules must not import this file.
// Promotion to editorial-blog.ts requires an editorial/technical review.
export const editorialDrafts: readonly EditorialPost[] = [
  {
    slug: "del-biogas-potencial-al-biogas-aprovechable",
    status: "draft",
    category: "Biomasa y valorización",
    title: "Del biogás potencial al biogás aprovechable: qué hace falta medir.",
    description:
      "Un marco para separar el potencial teórico de la producción real y ordenar las mediciones que conectan biomasa, gas capturado y energía útil.",
    readingMinutes: 5,
    sourceNote:
      "AgSTAR aporta referencias técnicas para proyectos y operación de digestión anaerobia en Estados Unidos. Se usan aquí para estructurar preguntas; no son normativa colombiana ni describen el desempeño de una planta o corriente específica de GREENATICS.",
    relatedTitle: "¿Necesitas estudiar una corriente agroindustrial y sus posibles destinos?",
    relatedHref: "/agroindustria/",
    relatedLabel: "Explorar Agroindustria",
    blocks: [
      {
        type: "paragraph",
        text: "Un cálculo de potencial puede mostrar que una biomasa merece estudiarse. Para saber si la planta producirá gas de forma continua y si ese gas tendrá un uso útil, hay que seguir la cadena completa: material recibido, condiciones de digestión, biogás capturado, calidad del gas, uso final y energía consumida por el propio sistema. La EPA organiza la evaluación de proyectos de digestión anaerobia alrededor de factibilidad, selección del uso del gas, operación y mantenimiento; el potencial por sí solo no responde todas esas preguntas.",
        sourceRefs: [1, 2],
      },
      { type: "heading", id: "potencial", text: "1. ¿Potencial de qué material y bajo qué condiciones?" },
      {
        type: "paragraph",
        text: "Empieza por nombrar la corriente: origen, masa, humedad, composición y variación entre lotes o temporadas. El potencial bioquímico de metano se determina mediante ensayos del material bajo condiciones controladas; funciona como referencia para comparar sustratos, pero no equivale automáticamente a la producción de una instalación a escala real. Diseño, pretratamiento, mezcla, régimen de alimentación y operación cambian la lectura que puede hacerse de ese resultado.",
        sourceRefs: [1, 2],
      },
      { type: "heading", id: "flujo", text: "2. ¿Cuánto gas se produce y cuánto se captura?" },
      {
        type: "paragraph",
        text: "Registra por periodo la cantidad y el tipo de material que realmente entra, las condiciones relevantes del proceso, el volumen de biogás y las paradas o cambios de operación. Distingue producción estimada, gas generado y gas medido en el punto de captura. Una cifra mensual sin periodo, método, punto de medición y disponibilidad del sistema no permite comparar con claridad semanas o escenarios distintos.",
        sourceRefs: [2],
      },
      { type: "heading", id: "calidad", text: "3. ¿Qué calidad tiene el gas en el punto de uso?" },
      {
        type: "paragraph",
        text: "El biogás contiene metano y otros componentes; su composición afecta el uso previsto y el acondicionamiento necesario. Por eso, volumen total y energía potencial no deben tratarse como si fueran el mismo indicador. Identifica qué se midió, dónde y durante qué periodo; define además las variables de calidad que requiere el equipo o uso que se está evaluando. La elección del sistema debe responder al sustrato y al sitio.",
        sourceRefs: [3, 4],
      },
      { type: "heading", id: "energia", text: "4. ¿Cuánta energía llega a ser útil?" },
      {
        type: "paragraph",
        text: "Conecta el gas que puede entregarse con una demanda real y con el equipo que lo aprovecharía. Revisa acondicionamiento, conducción, almacenamiento, conversión, continuidad y consumo auxiliar. Una producción de gas no demuestra por sí sola electricidad o calor disponibles: el balance necesita registrar entradas, pérdidas y energía usada para operar. Si el destino depende de una conexión, comprador o permiso, conserva esa condición como supuesto pendiente hasta verificarla.",
        sourceRefs: [1, 2],
      },
      { type: "heading", id: "seguimiento", text: "5. ¿Qué registro permitirá aprender y decidir?" },
      {
        type: "paragraph",
        text: "El seguimiento debe unir alimentación, parámetros del proceso, caudal y calidad del gas, uso final, paradas, mantenimiento y responsables. Una bitácora consistente ayuda a distinguir una caída por menor alimentación de un cambio de proceso o una falla del equipo. También permite revisar si la alternativa acompaña la demanda y las condiciones económicas definidas para el sitio.",
        sourceRefs: [2],
      },
      {
        type: "callout",
        title: "Una base mínima para comparar periodos",
        text: "Anota fuente y masa de cada corriente, fecha y condición de recepción, alimentación al digestor, periodo observado, método y punto de medición del biogás, calidad analizada, disponibilidad, destino del gas, consumo auxiliar, incidentes y responsable del registro. Separa mediciones, estimaciones y supuestos.",
      },
      {
        type: "paragraph",
        text: "Este recorrido sirve para estructurar una evaluación y detectar qué información falta; no predice el rendimiento de una planta concreta ni sustituye ensayos, ingeniería, análisis de seguridad, evaluación financiera u obligaciones aplicables en Colombia. Los resultados deben interpretarse para el material, equipo, sitio y periodo evaluados.",
      },
    ],
    sources: [
      {
        title: "AgSTAR Project Development Handbook, 3rd edition",
        publisher: "U.S. Environmental Protection Agency",
        href: "https://www.epa.gov/agstar/agstar-project-development-handbook",
        year: "2020",
      },
      {
        title: "Anaerobic Digester/Biogas System Operator Guidebook",
        publisher: "U.S. Environmental Protection Agency · AgSTAR",
        href: "https://www.epa.gov/agstar/anaerobic-digesterbiogas-system-operator-guidebook",
        year: "2020",
      },
      {
        title: "Anaerobic System Design and Technology",
        publisher: "U.S. Environmental Protection Agency · AgSTAR",
        href: "https://www.epa.gov/agstar/anaerobic-system-design-and-technology",
      },
      {
        title: "How Does Anaerobic Digestion Work?",
        publisher: "U.S. Environmental Protection Agency · AgSTAR",
        href: "https://www.epa.gov/agstar/how-does-anaerobic-digestion-work",
      },
    ],
  },
];
