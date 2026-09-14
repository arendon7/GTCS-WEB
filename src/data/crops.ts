export interface CropStage {
  moment: string;
  goal: string;
  lines: string[];
}

export interface CropDeficiency {
  symptom: string;
  nutrient: string;
  solution: string;
}

export interface Crop {
  slug: string;
  name: string;
  scientificName: string;
  headline: string;
  intro: string;
  context: string;
  density: number;
  coverImage: string;
  pdfFile: string;
  stages: CropStage[];
  alerts: string[];
  followUp: string[];
  cautions: string[];
  deficiencies: CropDeficiency[];
}

export const fieldChecklist = [
  "¿Existe un análisis reciente de suelo, agua o tejido y se conoce su método?",
  "¿La humedad, el drenaje y la aireación permiten una aplicación al suelo?",
  "¿Se revisaron raíces, distribución del síntoma y patrón dentro del lote?",
  "¿La etapa fisiológica observada coincide con el objetivo del programa?",
  "¿Se conoce el historial de fertilización, enmiendas y manejo fitosanitario?",
  "¿La presentación, etiqueta y condición regulatoria del producto están vigentes?",
];

export const fieldApplicationRules = [
  "Definir la vía según etiqueta, producto, cultivo, equipo y condición del lote.",
  "Confirmar humedad y drenaje antes de una aplicación al suelo.",
  "Calibrar el equipo y verificar compatibilidades antes de preparar una mezcla.",
  "Registrar fecha, lote, producto, presentación, cantidad y responsable de la aplicación.",
  "Observar la respuesta y las variables de contexto antes de repetir o ajustar el programa.",
];

const standardStages = (productiveGoal: string): CropStage[] => [
  {
    moment: "Preparación y establecimiento",
    goal: "Revisar sustrato o suelo, raíz, humedad, drenaje y condiciones para el establecimiento.",
    lines: ["Wondergreen Compost", "Wondergreen 2GROW (15-3-3)"],
  },
  {
    moment: "Crecimiento vegetativo",
    goal: "Acompañar la construcción de estructura vegetativa y definir indicadores observables de desarrollo.",
    lines: ["Wondergreen 2GROW (15-3-3)"],
  },
  {
    moment: "Transición reproductiva",
    goal: "Leer floración, ambiente, sanidad, agua y nutrición previa antes de ajustar el programa.",
    lines: ["Wondergreen 2BLOOM (3-8-3)"],
  },
  {
    moment: "Fase productiva",
    goal: productiveGoal,
    lines: ["Wondergreen 2FRUIT (3-3-8)"],
  },
  {
    moment: "Recuperación y mantenimiento",
    goal: "Revisar extracción, condición del suelo, respuesta del ciclo anterior y objetivo de continuidad.",
    lines: ["Wondergreen 2BALANCE (7-7-7)"],
  },
];

const establishmentStages: CropStage[] = [
  {
    moment: "Preparación del suelo",
    goal: "Revisar materia orgánica, estructura, drenaje, compactación y análisis disponibles.",
    lines: ["Wondergreen Compost"],
  },
  {
    moment: "Establecimiento y crecimiento",
    goal: "Acompañar raíz y desarrollo vegetativo según especie, ambiente y objetivo de manejo.",
    lines: ["Wondergreen 2GROW (15-3-3)"],
  },
  {
    moment: "Balance y mantenimiento",
    goal: "Definir reposición y seguimiento con base en extracción, respuesta y condición del suelo.",
    lines: ["Wondergreen 2BALANCE (7-7-7)"],
  },
];

const commonDeficiencies: CropDeficiency[] = [
  {
    symptom: "Amarillamiento o cambio de color en el follaje",
    nutrient: "Nutrición, agua, raíz, pH o sanidad",
    solution: "Registrar dónde inicia y confirmar la causa antes de elegir una línea.",
  },
  {
    symptom: "Crecimiento lento, caída o deformación de órganos",
    nutrient: "Balance nutricional, ambiente o estrés",
    solution: "Cruzar observación con análisis, manejo previo y condición del lote.",
  },
];

export const crops: Crop[] = [
  {
    slug: "cafe",
    name: "Café",
    scientificName: "Coffea arabica",
    headline: "Establecimiento, crecimiento, floración, llenado de grano y recuperación.",
    intro: "Ruta de lectura para organizar el manejo nutricional del café por etapa, sin convertir el área o la apariencia del cultivo en una receta automática.",
    context: "En café deben leerse conjuntamente acidez, materia orgánica, humedad, sombra, carga productiva, raíces y antecedentes de fertilización.",
    density: 0,
    coverImage: "/guides/guia-cafe-cover.webp",
    pdfFile: "/downloads/guia-wondergreen-cafe.pdf",
    stages: standardStages("Acompañar el desarrollo y llenado del grano con indicadores definidos para el lote y su objetivo de calidad."),
    alerts: ["Diferenciar síntomas en hojas nuevas y viejas.", "Relacionar carga productiva, agua y estado radicular.", "No atribuir un cambio de color a un solo nutriente."],
    followUp: ["Registrar floración y evolución de la carga.", "Comparar respuesta por lote o sector.", "Revisar análisis y manejo antes del siguiente ajuste."],
    cautions: ["Evitar recomendaciones basadas únicamente en edad o número de plantas."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "aguacate",
    name: "Aguacate Hass",
    scientificName: "Persea americana",
    headline: "Condición radicular, flujos vegetativos, floración y desarrollo del fruto.",
    intro: "Ruta para preparar decisiones en aguacate a partir de raíz, drenaje, agua, etapa, carga y objetivo comercial.",
    context: "La sensibilidad radicular y la variabilidad entre floración, cuajado y carga exigen separar nutrición, agua, sanidad y ambiente antes de intervenir.",
    density: 0,
    coverImage: "/guides/guia-aguacate-cover.webp",
    pdfFile: "/downloads/guia-wondergreen-aguacate.pdf",
    stages: standardStages("Acompañar el desarrollo del fruto y observar carga, agua, materia seca y criterios comerciales definidos por el productor."),
    alerts: ["Revisar raíces antes de interpretar síntomas aéreos.", "Distinguir estrés hídrico, salino y sanitario.", "Registrar distribución de floración y caída de frutos."],
    followUp: ["Observar raíces activas en sectores comparables.", "Registrar carga y desarrollo del fruto.", "Cruzar respuesta con riego y clima."],
    cautions: ["No recomendar por árbol sin conocer edad, tamaño, suelo y sistema de riego."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "cacao",
    name: "Cacao",
    scientificName: "Theobroma cacao",
    headline: "Formación, cojines florales, desarrollo de mazorca y mantenimiento.",
    intro: "Ruta de lectura para conectar sombra, humedad, sanidad, etapa productiva y condición del suelo en cacao.",
    context: "El manejo nutricional debe convivir con poda, sombra, drenaje, remoción sanitaria y variación de carga entre árboles.",
    density: 0,
    coverImage: "/guides/guia-cacao-cover.webp",
    pdfFile: "/downloads/guia-wondergreen-cacao.pdf",
    stages: standardStages("Acompañar el desarrollo de mazorca y grano con seguimiento de carga, sanidad y variables de calidad."),
    alerts: ["Separar caída fisiológica de problemas nutricionales.", "Registrar humedad y presión sanitaria.", "Comparar árboles con carga y sombra semejantes."],
    followUp: ["Registrar floración y supervivencia de mazorquillas.", "Monitorear sanidad de mazorcas.", "Evaluar respuesta junto con poda y sombra."],
    cautions: ["La nutrición no reemplaza el manejo cultural y sanitario."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "limon-tahiti",
    name: "Limón Tahití y cítricos",
    scientificName: "Citrus x latifolia",
    headline: "Brotación, floración, cosechas escalonadas y recuperación.",
    intro: "Ruta para ordenar la nutrición de cítricos con ciclos simultáneos, lectura foliar, agua y condición radicular.",
    context: "En un mismo árbol pueden coexistir brotes, flores y frutos; por eso el programa debe priorizar objetivos y conservar registros por lote.",
    density: 0,
    coverImage: "/guides/guia-citricos-cover.webp",
    pdfFile: "/downloads/guia-wondergreen-citricos.pdf",
    stages: standardStages("Acompañar crecimiento y llenado del fruto según carga, riego, calidad objetivo y estado general del árbol."),
    alerts: ["Distinguir síntomas foliares por edad del tejido.", "Revisar calidad de agua y drenaje.", "Relacionar brotación con cosechas anteriores."],
    followUp: ["Registrar floración, cuajado y cosecha.", "Comparar sectores de riego.", "Revisar análisis foliar cuando sea pertinente."],
    cautions: ["Evitar un calendario único cuando coexisten etapas distintas."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "pastos-gramineas",
    name: "Pastos y praderas",
    scientificName: "Gramíneas forrajeras",
    headline: "Establecimiento, recuperación después del uso y mantenimiento del suelo.",
    intro: "Ruta para relacionar suelo, especie forrajera, corte o pastoreo, compactación, humedad y objetivo productivo.",
    context: "La necesidad cambia con especie, carga animal, intervalo de uso, disponibilidad de agua, fertilidad y nivel de extracción.",
    density: 0,
    coverImage: "/guides/guia-pastos-cover.webp",
    pdfFile: "/downloads/guia-wondergreen-pastos-y-praderas.pdf",
    stages: establishmentStages,
    alerts: ["Revisar compactación y cobertura antes de atribuir bajo rebrote a nutrición.", "Relacionar respuesta con lluvia o riego.", "Registrar altura y momento de uso."],
    followUp: ["Comparar recuperación entre potreros.", "Registrar cobertura y relación hoja-tallo.", "Ajustar con análisis y objetivo de carga."],
    cautions: ["No extrapolar una dosis entre especies, suelos o sistemas de pastoreo."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "platano-banano",
    name: "Plátano y banano",
    scientificName: "Musa spp.",
    headline: "Establecimiento, desarrollo del hijo, diferenciación y llenado del racimo.",
    intro: "Ruta de lectura para conectar suelo, agua, raíces, población, sanidad y etapa del cultivo de musáceas.",
    context: "La continuidad del sistema depende tanto de la planta madre como del relevo, el drenaje, el retorno de biomasa y la sanidad del lote.",
    density: 0,
    coverImage: "/guides/guia-platano-banano-cover.webp",
    pdfFile: "/downloads/MANUAL_TECNICO_WONDERGREEN_BANANO_PLATANO_PROFUNDO_20P.pdf",
    stages: standardStages("Acompañar el desarrollo del racimo y la continuidad del sistema madre-hijo con indicadores del lote."),
    alerts: ["Revisar drenaje y raíces.", "Relacionar vigor del hijo con manejo de población.", "No confundir daño sanitario con deficiencia."],
    followUp: ["Registrar emisión foliar y desarrollo del racimo.", "Observar continuidad del relevo.", "Comparar respuesta por sector."],
    cautions: ["La nutrición debe coordinarse con deshije, sanidad y manejo de residuos."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "tomate-chonto",
    name: "Tomate Chonto",
    scientificName: "Solanum lycopersicum",
    headline: "Trasplante, crecimiento, floración y cosecha continua.",
    intro: "Ruta para preparar el manejo de tomate considerando sustrato o suelo, agua, conductividad, sanidad, etapa y destino comercial.",
    context: "Los síntomas pueden cambiar rápidamente y deben leerse junto con riego, ambiente, carga, análisis y aplicaciones previas.",
    density: 0,
    coverImage: "/guides/guia-tomate-chonto-cover.webp",
    pdfFile: "/downloads/01_GUIA_WONDERGREEN_TOMATE_CHONTO_V1.pdf",
    stages: standardStages("Acompañar cosecha continua y desarrollo del fruto con seguimiento de agua, carga, firmeza y condición sanitaria."),
    alerts: ["Revisar uniformidad del riego.", "Distinguir síntomas radiculares, fisiológicos y sanitarios.", "Relacionar respuesta con ambiente protegido o campo abierto."],
    followUp: ["Registrar racimos, carga y descarte.", "Monitorear humedad y conductividad cuando aplique.", "Ajustar con observación y análisis."],
    cautions: ["No diagnosticar una alteración del fruto únicamente como deficiencia."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "lechuga",
    name: "Lechuga y hortalizas de hoja",
    scientificName: "Lactuca sativa",
    headline: "Preparación, establecimiento y construcción de biomasa foliar.",
    intro: "Ruta para sistemas de ciclo corto donde agua, sustrato, densidad, ambiente y uniformidad condicionan la respuesta.",
    context: "En hortalizas de hoja el programa debe evitar extrapolar recomendaciones entre especies, variedades y sistemas de producción.",
    density: 0,
    coverImage: "/guides/guia-lechuga-cover.webp",
    pdfFile: "/downloads/01_GUIA_WONDERGREEN_LECHUGA_V1.pdf",
    stages: establishmentStages,
    alerts: ["Revisar uniformidad de emergencia o trasplante.", "Distinguir exceso de humedad y problemas nutricionales.", "Registrar temperatura y condición del sustrato."],
    followUp: ["Comparar uniformidad y desarrollo.", "Registrar descarte y calidad comercial.", "Ajustar por ciclo y sistema."],
    cautions: ["No aplicar una frecuencia fija sin leer el ciclo y el ambiente."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "gulupa",
    name: "Gulupa y pasifloras",
    scientificName: "Passiflora edulis",
    headline: "Levante, formación, floración y desarrollo del fruto.",
    intro: "Ruta de lectura para pasifloras que conecta raíces, estructura, agua, floración, sanidad y objetivo de calidad.",
    context: "El tutorado, el drenaje, la polinización, la presión sanitaria y la carga deben analizarse junto con la nutrición.",
    density: 0,
    coverImage: "/guides/guia-gulupa-cover.webp",
    pdfFile: "/downloads/01_GUIA_WONDERGREEN_GULUPA_V1.pdf",
    stages: standardStages("Acompañar el desarrollo del fruto con seguimiento de carga, integridad, agua y criterios del mercado."),
    alerts: ["Revisar cuello y raíces.", "Registrar floración y polinización.", "Distinguir problemas de agua y sanidad."],
    followUp: ["Observar distribución de carga.", "Registrar calidad y descarte.", "Comparar respuesta entre sectores."],
    cautions: ["La nutrición no reemplaza manejo de estructura, polinización o sanidad."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "granadilla",
    name: "Granadilla",
    scientificName: "Passiflora ligularis",
    headline: "Levante, formación de estructura, floración y llenado.",
    intro: "Ruta para ordenar decisiones en granadilla con énfasis en raíz, agua, estructura, etapa productiva y seguimiento.",
    context: "La respuesta debe interpretarse junto con drenaje, arquitectura de la planta, polinización, carga y manejo sanitario.",
    density: 0,
    coverImage: "/guides/guia-granadilla-cover.webp",
    pdfFile: "/downloads/01_GUIA_WONDERGREEN_GRANADILLA_V1.pdf",
    stages: standardStages("Acompañar desarrollo y llenado con indicadores de carga, calidad, agua y condición de la planta."),
    alerts: ["Revisar raíces y cuello.", "Observar distribución de floración.", "Relacionar síntomas con humedad y estructura."],
    followUp: ["Registrar floración y carga.", "Evaluar uniformidad de desarrollo.", "Ajustar con evidencia por lote."],
    cautions: ["Evitar recomendaciones cerradas por planta sin diagnóstico."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "uchuva",
    name: "Uchuva",
    scientificName: "Physalis peruviana",
    headline: "Establecimiento, ramificación, floración y cosecha continua.",
    intro: "Ruta para preparar el manejo de uchuva según suelo, agua, estructura, sanidad, carga y objetivo de mercado.",
    context: "La continuidad de floración y cosecha exige registros para diferenciar etapa, respuesta y presión ambiental dentro del lote.",
    density: 0,
    coverImage: "/guides/guia-uchuva-cover.webp",
    pdfFile: "/downloads/01_GUIA_WONDERGREEN_UCHUVA_V1.pdf",
    stages: standardStages("Acompañar cosecha continua y desarrollo del fruto con seguimiento de carga, integridad y calidad objetivo."),
    alerts: ["Revisar drenaje y raíces.", "Registrar continuidad de floración.", "Distinguir rajado, agua y nutrición."],
    followUp: ["Comparar carga por sector.", "Registrar calidad y descarte.", "Relacionar respuesta con clima y riego."],
    cautions: ["No atribuir calidad del fruto a una sola aplicación."],
    deficiencies: commonDeficiencies,
  },
  {
    slug: "lulo",
    name: "Lulo",
    scientificName: "Solanum quitoense",
    headline: "Establecimiento, estructura, floración y cosecha escalonada.",
    intro: "Ruta para leer lulo desde condición radicular, humedad, sombra, sanidad, etapa y objetivo productivo.",
    context: "La respuesta nutricional debe interpretarse junto con raíces, nematodos, humedad, presión sanitaria y carga de frutos.",
    density: 0,
    coverImage: "/guides/guia-lulo-cover.webp",
    pdfFile: "/downloads/01_GUIA_WONDERGREEN_LULO_V1.pdf",
    stages: standardStages("Acompañar cosecha escalonada y desarrollo del fruto con indicadores de carga, agua y calidad."),
    alerts: ["Revisar raíces antes de corregir follaje.", "Distinguir estrés hídrico y sanitario.", "Registrar distribución de síntomas."],
    followUp: ["Observar raíces y vigor.", "Registrar floración y carga.", "Comparar respuesta por sector."],
    cautions: ["El manejo nutricional debe coordinarse con diagnóstico sanitario."],
    deficiencies: commonDeficiencies,
  },
];

export function getCrop(slug: string): Crop | undefined {
  return crops.find((crop) => crop.slug === slug);
}
