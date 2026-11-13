export interface Product {
  slug: string;
  name: string;
  family: string;
  category: "solidos" | "liquidos" | "acondicionadores" | "bioinsumos";
  headline: string;
  intro: string;
  focus: string;
  objective: string;
  format: string;
  presentations: string[];
  commercialStatus: string;
  technicalRole: string;
  stage?: string;
  idealFor: string[];
  notes: string[];
  benefits: string[];
  specs: { label: string; value: string }[];
  application: string[];
  crops: string[];
  cautions: string[];
  priceCop?: number;
  presentation?: string;
  formula?: string;
  concentrations?: string[];
  organicCarbon?: string;
}

export interface ProductSpec {
  id: string;
  name: string;
  line: "Solid" | "Liquid" | "Bioinsumo";
  formula: string;
  organicCarbon: string;
  presentation: string;
  priceCop: number;
  badge: string;
  pdfManual: string;
  targetRole: string;
  molecularBenefit: string;
  usageInstructions: string;
}

export const products: Product[] = [
  {
    slug: "2grow",
    name: "Wondergreen 2GROW",
    family: "2GROW",
    category: "solidos",
    headline: "15-3-3 organomineral ocluido · Establecimiento y crecimiento",
    intro: "Fertilizante sólido organomineral ocluido para acompañar establecimiento, brotación y crecimiento vegetativo. Su matriz reúne materia orgánica y nutrientes en una estructura orientada a una liberación gradual; el comportamiento depende del suelo, el agua y el manejo del lote.",
    focus: "Establecimiento, levante y crecimiento vegetativo.",
    objective: "Acompañar etapas de establecimiento, levante y desarrollo vegetativo.",
    format: "Sólido granulado",
    presentations: ["40 kg", "5 kg"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Aporte organomineral ocluido para nutrición edáfica y desarrollo vegetativo.",
    stage: "Arranque & Crecimiento",
    idealFor: ["Café en levante", "Aguacate Hass en brotación", "Hortalizas en trasplante", "Pastos en renovación"],
    notes: ["Validar compatibilidades y programa de uso antes de aplicar."],
    benefits: [
      "Integra una fórmula N-P-K dentro de una matriz organomineral ocluida que aporta materia orgánica al sistema suelo-planta.",
      "La oclusión está orientada a favorecer una liberación gradual; su comportamiento depende del suelo, el agua y el manejo del lote.",
      "Se posiciona para objetivos de establecimiento y crecimiento vegetativo.",
      "Permite construir un programa por etapa en conjunto con las demás líneas Wondergreen."
    ],
    specs: [
      { label: "Graduación", value: "15-3-3 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" }
    ],
    application: [
      "Ubicarlo en la etapa de establecimiento, brotación o crecimiento vegetativo que se quiere acompañar.",
      "Aplicarlo al suelo, cerca de la zona radicular activa y con humedad suficiente para favorecer su incorporación.",
      "Definir dosis, frecuencia y distancia al tallo con la etiqueta vigente, el diagnóstico y la recomendación técnica del lote.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Limón Tahití", "Pastos", "Plátano", "Tomate", "Lechuga", "Gulupa", "Granadilla", "Uchuva", "Lulo"],
    cautions: ["No aplicar en suelo seco sin adecuada humedad.", "Conservar en lugar techado y seco."],
    priceCop: 147400,
    presentation: "Bulto 40 kg",
    formula: "15-3-3"
  },
  {
    slug: "2balance",
    name: "Wondergreen 2BALANCE",
    family: "2BALANCE",
    category: "solidos",
    headline: "7-7-7 organomineral ocluido · Balance y mantenimiento",
    intro: "Fertilizante sólido organomineral ocluido para programas de nutrición balanceada y mantenimiento. Aporta nutrientes y materia orgánica en una matriz diseñada para acompañar su disponibilidad de forma gradual.",
    focus: "Nutrición balanceada y mantenimiento.",
    objective: "Acompañar programas que requieren un aporte equilibrado de macronutrientes.",
    format: "Sólido granulado",
    presentations: ["40 kg", "5 kg"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Aporte organomineral ocluido y balanceado para nutrición edáfica y mantenimiento.",
    stage: "Mantenimiento & Suelo",
    idealFor: ["Cafetales en producción", "Cítricos continuos", "Plátano en emisión", "Jardines y viveros"],
    notes: ["La periodicidad depende del diagnóstico y del programa de manejo."],
    benefits: [
      "Integra una relación balanceada de macronutrientes con materia orgánica funcional.",
      "La matriz ocluida busca moderar la disponibilidad del nutriente; la respuesta debe revisarse con análisis y seguimiento del lote.",
      "Se posiciona para etapas de mantenimiento dentro del sistema Wondergreen.",
      "Su uso debe ajustarse a análisis de suelo, extracción del cultivo y manejo previo."
    ],
    specs: [
      { label: "Graduación", value: "7-7-7 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" }
    ],
    application: [
      "Usarlo cuando la planta ya está estable y el objetivo sea sostener una nutrición balanceada, no forzar un crecimiento puntual.",
      "Distribuirlo de manera homogénea en la zona de goteo, evitando concentrarlo sobre el tallo o aplicarlo con el suelo saturado.",
      "Definir cantidad y periodicidad con análisis, etiqueta vigente, manejo previo y recomendación técnica.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Limón Tahití", "Pastos", "Plátano", "Tomate", "Lechuga", "Gulupa", "Granadilla", "Uchuva", "Lulo"],
    cautions: ["Distribuir de forma homogénea en la zona de goteo."],
    priceCop: 147400,
    presentation: "Bulto 40 kg",
    formula: "7-7-7"
  },
  {
    slug: "2bloom",
    name: "Wondergreen 2BLOOM",
    family: "2BLOOM",
    category: "solidos",
    headline: "3-8-3 organomineral ocluido · Transición reproductiva",
    intro: "Fertilizante sólido organomineral ocluido para acompañar transición reproductiva y floración. La matriz orgánica integra nutrientes y favorece una entrega gradual conectada con el suelo y la actividad radicular.",
    focus: "Transición reproductiva y floración.",
    objective: "Acompañar programas nutricionales durante la etapa reproductiva.",
    format: "Sólido granulado",
    presentations: ["40 kg", "5 kg"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Aporte organomineral ocluido orientado a la transición reproductiva y la floración.",
    stage: "Floración & Cuajado",
    idealFor: ["Cafetales en prefloración", "Aguacate en floración", "Tomate en flor", "Pasifloras en espaldera"],
    notes: ["El momento de aplicación debe definirse según etapa, clima y manejo del cultivo."],
    benefits: [
      "Integra una relación N-P-K orientada a la etapa reproductiva dentro de una matriz con materia orgánica.",
      "La matriz ocluida acompaña una entrega gradual del aporte; el momento y la respuesta dependen de la etapa, el ambiente y el manejo.",
      "Permite diferenciar la nutrición de floración frente a las etapas vegetativa y productiva.",
      "La respuesta debe observarse y ajustarse dentro del programa del cultivo."
    ],
    specs: [
      { label: "Graduación", value: "3-8-3 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" }
    ],
    application: [
      "Confirmar que la planta se encuentre en transición reproductiva y que luz, agua y sanidad no estén limitando la floración.",
      "Aplicarlo al suelo como parte del programa de la etapa, sin sustituir polinización, manejo de carga ni seguimiento del cultivo.",
      "Definir dosis, momento y frecuencia con la etiqueta vigente y la recomendación técnica para el lote.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Limón Tahití", "Tomate", "Gulupa", "Granadilla", "Uchuva", "Lulo"],
    cautions: ["No aplicar sobre follaje mojado."],
    priceCop: 115500,
    presentation: "Bulto 40 kg",
    formula: "3-8-3"
  },
  {
    slug: "2fruit",
    name: "Wondergreen 2FRUIT",
    family: "2FRUIT",
    category: "solidos",
    headline: "3-3-8 organomineral ocluido · Desarrollo y llenado",
    intro: "Fertilizante sólido organomineral ocluido para acompañar la fase productiva y el desarrollo del fruto. Su matriz aporta materia orgánica y favorece una entrega gradual de nutrientes en la zona radicular.",
    focus: "Fase productiva, desarrollo y llenado.",
    objective: "Acompañar programas nutricionales durante el desarrollo del fruto o del órgano cosechado.",
    format: "Sólido granulado",
    presentations: ["40 kg", "5 kg"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Aporte organomineral ocluido orientado a la fase productiva, el desarrollo y el llenado.",
    stage: "Llenado & Maduración",
    idealFor: ["Aguacate Hass en engorde", "Café en llenado de grano", "Cacao en desarrollo de mazorca", "Frutales"],
    notes: ["Revisar disponibilidad de agua y condición del cultivo antes de ajustar el programa."],
    benefits: [
      "Integra una relación N-P-K orientada a la fase productiva dentro de una matriz con materia orgánica.",
      "La matriz ocluida acompaña la liberación gradual de nutrientes en la zona radicular; su aprovechamiento debe evaluarse según suelo, humedad y cultivo.",
      "Permite diferenciar la nutrición de llenado frente a las etapas vegetativa y reproductiva.",
      "El resultado debe evaluarse con indicadores propios del cultivo y del lote."
    ],
    specs: [
      { label: "Graduación", value: "3-3-8 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" }
    ],
    application: [
      "Usarlo cuando el cultivo esté en cuajado, desarrollo o llenado y exista una condición productiva que acompañar.",
      "Revisar agua, raíces, carga y sanidad antes de ajustar la nutrición del fruto u órgano cosechado.",
      "Definir dosis, momento y frecuencia con la etiqueta vigente, la carga productiva y la recomendación técnica.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Limón Tahití", "Plátano", "Tomate", "Gulupa", "Granadilla", "Uchuva", "Lulo"],
    cautions: ["Mantener humedad de suelo constante para absorción eficiente."],
    priceCop: 121900,
    presentation: "Bulto 40 kg",
    formula: "3-3-8"
  },
  {
    slug: "compost",
    name: "Wondergreen Compost",
    family: "Compost",
    category: "acondicionadores",
    headline: "Materia orgánica estabilizada · Base para suelo y sustrato",
    intro: "Acondicionador orgánico para incorporar materia orgánica estabilizada a la preparación del suelo, el sustrato y las rutas de cultivo. Funciona como base del sistema: primero se revisa la condición física y biológica; después se define cómo complementar la nutrición.",
    focus: "Base orgánica, suelo y preparación de sustratos.",
    objective: "Acompañar la preparación y el acondicionamiento del suelo o sustrato antes de construir el programa nutricional.",
    format: "Acondicionador orgánico",
    presentations: ["40 kg"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Aporte de materia orgánica estabilizada para preparar la base del sistema suelo-planta.",
    stage: "Base orgánica & suelo",
    idealFor: ["Preparación de suelo", "Sustratos", "Huertas y jardín", "Biofábricas y programas territoriales"],
    notes: ["La madurez, humedad y calidad se confirman según la ficha y la presentación vigentes.", "La incorporación debe responder a la condición del suelo, el sustrato y el cultivo."],
    benefits: [
      "Aporta materia orgánica estabilizada al sistema suelo-planta.",
      "Su aporte se integra a la preparación del suelo o sustrato; la respuesta depende de la madurez y calidad del material, las condiciones del sitio y el manejo.",
      "Ordena la preparación de la base antes de complementar con nutrición o bioinsumos.",
      "Se trabaja como parte de un programa, no como sustituto de diagnóstico o fertilización."
    ],
    specs: [
      { label: "Tipo", value: "Acondicionador orgánico" },
      { label: "Presentación", value: "Bulto 40 kg" },
      { label: "Uso de referencia", value: "Preparación de suelo y sustratos" }
    ],
    application: [
      "Definir el objetivo del suelo o sustrato y revisar humedad, drenaje, estructura y manejo previo.",
      "Incorporar de manera homogénea según la ficha vigente, el cultivo y el sistema de manejo.",
      "Observar estructura, humedad, raíces y respuesta del sistema antes de complementar con nutrición o biología."
    ],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Pastos", "Huertas y jardín"],
    cautions: ["Confirmar madurez, calidad y condición de uso de la presentación seleccionada.", "No asumir una dosis universal para todos los suelos, cultivos o sustratos."],
    presentation: "Bulto 40 kg"
  },
  {
    slug: "bioinsumos",
    name: "Wondergreen Bioinsumos & Bioles",
    family: "Bioinsumos",
    category: "bioinsumos",
    headline: "Herramientas botánicas y microbiológicas",
    intro: "Portafolio técnico de extractos botánicos y referencias microbiológicas para considerar dentro de estrategias de manejo integrado.",
    focus: "Herramientas complementarias de manejo integrado.",
    objective: "Acompañar estrategias agronómicas definidas según diagnóstico y documentación vigente.",
    format: "Líquido soluble",
    presentations: ["1 L, 5 L y 20 L en portafolio técnico"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Complemento botánico o microbiológico dentro del manejo integrado.",
    stage: "Alcance por validar",
    idealFor: ["Revisar la necesidad del cultivo y la documentación de la referencia seleccionada."],
    notes: ["Cada solicitud recibe la ficha, condición de uso y protocolo correspondiente a la referencia seleccionada."],
    benefits: [
      "Incluye referencias botánicas y microbiológicas diferenciadas.",
      "Debe integrarse a un manejo definido por diagnóstico, monitoreo y condición regulatoria.",
      "La selección depende del objetivo, el cultivo y la ficha vigente de cada referencia."
    ],
    specs: [
      { label: "Tipo", value: "Referencias botánicas y microbiológicas" },
      { label: "Presentación técnica", value: "1 L / 5 L / 20 L" },
      { label: "Estado", value: "Portafolio técnico; presentación y suministro por consultar" }
    ],
    application: [
      "Identifica la necesidad del cultivo y la referencia que quieres consultar.",
      "Confirma que la ficha, etiqueta y registro vigentes correspondan exactamente a esa referencia.",
      "Define pertinencia y condiciones de uso solo con la documentación vigente y la orientación técnica aplicable.",
    ],
    crops: [],
    cautions: ["No inferir cultivo, blanco biológico, eficacia, dosis o compatibilidad por la categoría del portafolio."],
    presentation: "1 L / 5 L / 20 L",
    formula: "Portafolio técnico",
  },
  {
    slug: "bioinsumo-trichoderma",
    name: "Wondergreen Trichoderma",
    family: "Trichoderma",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Alcance por confirmar",
    intro: "Referencia de Trichoderma incluida en el portafolio técnico Wondergreen. La ficha, etiqueta y registro vigentes determinan su uso autorizado y condiciones.",
    focus: "Ficha, etiqueta, registro y uso autorizado por confirmar.",
    objective: "Confirma con el equipo técnico si esta referencia corresponde a la necesidad y a las condiciones del lote.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L", "5 L", "20 L"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Referencia de Trichoderma en el portafolio técnico; su uso depende de la ficha, etiqueta y registro vigentes.",
    stage: "Uso por validar",
    idealFor: ["Confirma en la ficha vigente el uso autorizado antes de relacionarla con una necesidad del cultivo."],
    notes: ["La ficha técnica, etiqueta y registro vigentes deben confirmar especie o cepa, concentración, uso autorizado, dosis y compatibilidades."],
    benefits: [
      "La ficha, etiqueta y registro deben corresponder a esta referencia.",
      "Confirma especie o cepa, concentración y uso autorizado con el equipo técnico.",
      "Consulta las condiciones vigentes antes de definir un programa para el lote."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Trichoderma" },
      { label: "Presentaciones de referencia", value: "1 L / 5 L / 20 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: [
      "Revisa que la ficha, etiqueta y registro vigentes correspondan exactamente a esta referencia.",
      "Confirma especie o cepa, concentración, uso autorizado y condiciones para el cultivo y el lote.",
      "Define vía, dosis, frecuencia y compatibilidades solo con documentación y recomendación técnica vigentes.",
    ],
    crops: [],
    cautions: ["No inferir cultivos, objetivos, vías, dosis ni efectos por el nombre Trichoderma.", "No definir aplicaciones, mezclas ni compatibilidades sin ficha, etiqueta y registro vigentes."],
    formula: "Trichoderma",
  },
  {
    slug: "bioinsumo-bacillus-subtilis",
    name: "Wondergreen Bacillus subtilis",
    family: "Bacillus subtilis",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Referencia técnica",
    intro: "Bacillus subtilis forma parte del portafolio técnico Wondergreen. Su pertinencia para un cultivo o lote y sus condiciones de uso se confirman en la ficha, etiqueta y registro vigentes de esta referencia.",
    focus: "Identidad, uso y condiciones por confirmar.",
    objective: "Confirmar con el equipo técnico si la documentación vigente de Bacillus subtilis corresponde a la necesidad del lote.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L", "5 L", "20 L"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Referencia microbiológica de Bacillus subtilis en el portafolio técnico Wondergreen; la ficha, etiqueta y registro vigentes determinan su uso autorizado.",
    stage: "Uso por confirmar",
    idealFor: ["Revisar la necesidad del lote y la documentación vigente de esta referencia."],
    notes: ["El portafolio técnico identifica Bacillus subtilis como ingrediente de referencia.", "Verifica la cepa, concentración, alcance y condiciones en la documentación vigente."],
    benefits: [
      "La referencia está identificada por Bacillus subtilis dentro del portafolio técnico.",
      "La documentación del SKU permite confirmar si corresponde a la necesidad consultada.",
      "No se infieren eficacia, blanco biológico ni cultivo autorizado a partir del nombre del microorganismo."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Bacillus subtilis" },
      { label: "Presentaciones de referencia", value: "1 L / 5 L / 20 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: [
      "Identifica la necesidad y el cultivo o lote que deseas revisar.",
      "Confirma que la ficha, etiqueta y registro vigentes correspondan exactamente a Bacillus subtilis.",
      "Define pertinencia, vía, dosis y condiciones solo con esa documentación y orientación técnica.",
    ],
    crops: [],
    cautions: ["No inferir cultivos, blancos o eficacia por el nombre Bacillus subtilis.", "No definir vía, dosis, mezcla o compatibilidad sin ficha, etiqueta y registro vigentes."],
    formula: "Bacillus subtilis",
  },
  {
    slug: "bioinsumo-beauveria",
    name: "Wondergreen Beauveria",
    family: "Beauveria",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Referencia técnica",
    intro: "Beauveria forma parte del portafolio técnico microbiológico Wondergreen. Su pertinencia y condiciones de uso se confirman en la ficha, etiqueta y registro vigentes de esta referencia.",
    focus: "Identidad, uso y condiciones por confirmar.",
    objective: "Confirmar con el equipo técnico si la documentación vigente de Beauveria corresponde a la necesidad del lote.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L", "5 L", "20 L"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Referencia microbiológica de Beauveria en el portafolio técnico Wondergreen; la ficha, etiqueta y registro vigentes determinan su uso autorizado.",
    stage: "Uso por confirmar",
    idealFor: ["Revisar la necesidad del lote y la documentación vigente de esta referencia."],
    notes: ["El portafolio técnico identifica Beauveria como ingrediente de referencia.", "Verifica la especie, concentración, alcance y condiciones en la documentación vigente."],
    benefits: [
      "La referencia está identificada por Beauveria dentro del portafolio técnico.",
      "La documentación del SKU permite confirmar si corresponde a la necesidad consultada.",
      "No se infieren eficacia, blanco biológico ni cultivo autorizado a partir del nombre del microorganismo."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Beauveria" },
      { label: "Presentaciones de referencia", value: "1 L / 5 L / 20 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: [
      "Identifica la necesidad y el cultivo o lote que deseas revisar.",
      "Confirma que la ficha, etiqueta y registro vigentes correspondan exactamente a Beauveria.",
      "Define pertinencia, vía, dosis y condiciones solo con esa documentación y orientación técnica.",
    ],
    crops: [],
    cautions: ["No inferir cultivos, blancos o eficacia por el nombre Beauveria.", "No definir vía, dosis, mezcla o compatibilidad sin ficha, etiqueta y registro vigentes."],
    formula: "Beauveria",
  },
  {
    slug: "bioinsumo-metarhizium",
    name: "Wondergreen Metarhizium",
    family: "Metarhizium",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Referencia técnica",
    intro: "Metarhizium forma parte del portafolio técnico microbiológico Wondergreen. Su pertinencia y condiciones de uso se confirman en la ficha, etiqueta y registro vigentes de esta referencia.",
    focus: "Identidad, uso y condiciones por confirmar.",
    objective: "Confirmar con el equipo técnico si la documentación vigente de Metarhizium corresponde a la necesidad del lote.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L", "5 L", "20 L"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Referencia microbiológica de Metarhizium en el portafolio técnico Wondergreen; la ficha, etiqueta y registro vigentes determinan su uso autorizado.",
    stage: "Uso por confirmar",
    idealFor: ["Revisar la necesidad del lote y la documentación vigente de esta referencia."],
    notes: ["El portafolio técnico identifica Metarhizium como ingrediente de referencia.", "Verifica la especie, concentración, alcance y condiciones en la documentación vigente."],
    benefits: [
      "La referencia está identificada por Metarhizium dentro del portafolio técnico.",
      "La documentación del SKU permite confirmar si corresponde a la necesidad consultada.",
      "No se infieren eficacia, blanco biológico ni cultivo autorizado a partir del nombre del microorganismo."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Metarhizium" },
      { label: "Presentaciones de referencia", value: "1 L / 5 L / 20 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: [
      "Identifica la necesidad y el cultivo o lote que deseas revisar.",
      "Confirma que la ficha, etiqueta y registro vigentes correspondan exactamente a Metarhizium.",
      "Define pertinencia, vía, dosis y condiciones solo con esa documentación y orientación técnica.",
    ],
    crops: [],
    cautions: ["No inferir cultivos, blancos o eficacia por el nombre Metarhizium.", "No definir vía, dosis, mezcla o compatibilidad sin ficha, etiqueta y registro vigentes."],
    formula: "Metarhizium",
  },
  {
    slug: "bioinsumo-ajo-aji",
    name: "Wondergreen Extracto Ajo-Ají",
    family: "Ajo-Ají",
    category: "bioinsumos",
    headline: "Bioinsumo botánico · Referencia técnica",
    intro: "El extracto de ajo y ají forma parte del portafolio técnico botánico Wondergreen. Su pertinencia y condiciones de uso se confirman en la ficha, etiqueta y registro vigentes de esta referencia.",
    focus: "Identidad, uso y condiciones por confirmar.",
    objective: "Confirmar con el equipo técnico si la documentación vigente del extracto de ajo y ají corresponde a la necesidad del lote.",
    format: "Extracto líquido",
    presentations: ["1 L", "5 L", "20 L"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Referencia botánica de ajo y ají en el portafolio técnico Wondergreen; la ficha, etiqueta y registro vigentes determinan su uso autorizado.",
    stage: "Uso por confirmar",
    idealFor: ["Revisar la necesidad del lote y la documentación vigente de esta referencia."],
    notes: ["El portafolio técnico identifica extractos de ajo (Allium sativum) y ají (Capsicum spp.).", "Verifica composición, alcance y condiciones en la documentación vigente."],
    benefits: [
      "La referencia está identificada por ajo y ají dentro del portafolio técnico.",
      "La documentación del SKU permite confirmar si corresponde a la necesidad consultada.",
      "No se infieren eficacia, blanco biológico ni cultivo autorizado a partir del nombre de los ingredientes."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo botánico" },
      { label: "Ingredientes identificados", value: "Ajo (Allium sativum) y ají (Capsicum spp.)" },
      { label: "Presentaciones de referencia", value: "1 L / 5 L / 20 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: [
      "Identifica la necesidad y el cultivo o lote que deseas revisar.",
      "Confirma que la ficha, etiqueta y registro vigentes correspondan exactamente a esta referencia botánica.",
      "Define pertinencia, vía, dosis y condiciones solo con esa documentación y orientación técnica.",
    ],
    crops: [],
    cautions: ["No inferir cultivos, blancos o eficacia por el nombre de los ingredientes.", "No definir vía, dosis, mezcla o compatibilidad sin ficha, etiqueta y registro vigentes."],
    formula: "Ajo + Ají",
  },
  {
    slug: "bioinsumo-neem",
    name: "Wondergreen Extracto de Neem",
    family: "Neem",
    category: "bioinsumos",
    headline: "Bioinsumo botánico · Referencia técnica",
    intro: "El extracto de Neem forma parte del portafolio técnico botánico Wondergreen. Su pertinencia y condiciones de uso se confirman en la ficha, etiqueta y registro vigentes de esta referencia.",
    focus: "Identidad, uso y condiciones por confirmar.",
    objective: "Confirmar con el equipo técnico si la documentación vigente del extracto de Neem corresponde a la necesidad del lote.",
    format: "Extracto botánico líquido",
    presentations: ["1 L", "5 L", "20 L"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Referencia botánica de Neem en el portafolio técnico Wondergreen; la ficha, etiqueta y registro vigentes determinan su uso autorizado.",
    stage: "Uso por confirmar",
    idealFor: ["Revisar la necesidad del lote y la documentación vigente de esta referencia."],
    notes: ["La presentación y las condiciones de uso se confirman con la documentación vigente.", "Revisa con el equipo técnico si el alcance documentado corresponde a la necesidad del lote."],
    benefits: [
      "La referencia está identificada por Neem dentro del portafolio técnico.",
      "La documentación del SKU permite confirmar si corresponde a la necesidad consultada.",
      "No se infieren eficacia, blanco biológico ni cultivo autorizado a partir del nombre del ingrediente."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo botánico" },
      { label: "Ingrediente identificado", value: "Extracto de Neem" },
      { label: "Presentaciones de referencia", value: "1 L / 5 L / 20 L" },
      { label: "Aplicación", value: "Definida para el cultivo y objetivo según ficha vigente" }
    ],
    application: [
      "Identifica la necesidad y el cultivo o lote que deseas revisar.",
      "Confirma que la ficha, etiqueta y registro vigentes correspondan exactamente al extracto de Neem.",
      "Define pertinencia, vía, dosis y condiciones solo con esa documentación y orientación técnica."
    ],
    crops: [],
    cautions: ["No inferir cultivos, blancos o eficacia por el nombre Neem.", "No definir vía, dosis, mezcla o compatibilidad sin ficha, etiqueta y registro vigentes."],
    formula: "Extracto de Neem",
  },
  {
    slug: "2grow-liquido",
    name: "Wondergreen 2GROW Líquido",
    family: "2GROW",
    category: "liquidos",
    headline: "Nutrición de base biológica para arranque y crecimiento",
    intro: "2GROW lleva al sistema suelo-planta una base de bioles de digestión anaerobia multietapa, formulada y estabilizada en dos concentraciones. El 100-20-20 acompaña la nutrición NPK vegetativa; el 200-0-0 concentra más nitrógeno dentro de la línea para momentos de mayor demanda. La elección se afina con el cultivo, la etapa y el programa nutricional del lote.",
    focus: "100-20-20 para crecimiento vegetativo; 200-0-0, la formulación de mayor concentración de nitrógeno de la línea, para momentos de alta demanda vegetativa.",
    objective: "Complementar el programa de nutrición soluble durante el crecimiento vegetativo, seleccionando concentración y pauta según cultivo, etapa y condiciones del lote.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Dos perfiles líquidos para ajustar la nutrición al crecimiento y a la demanda de nitrógeno del cultivo.",
    stage: "Arranque & Crecimiento",
    idealFor: ["Viveros y establecimiento", "Café en levante", "Hortalizas en crecimiento", "Recuperación vegetativa"],
    notes: ["La ficha técnica de la presentación seleccionada define concentración, calidad de agua y compatibilidad de mezcla.", "El programa integra etapa del cultivo, calidad de aplicación y seguimiento de la respuesta."],
    benefits: [
      "Permite elegir entre 100-20-20 y 200-0-0, la concentración de mayor nitrógeno de la línea, para estrategias vegetativas distintas.",
      "Su base de bioles, con formulación y estabilización, integra nutrientes, materia orgánica y microorganismos benéficos al sistema suelo-planta.",
      "La dosis se relaciona con análisis, demanda y vía de aplicación; la respuesta se sigue mediante absorción de N, crecimiento y calidad del cultivo."
    ],
    specs: [
      { label: "Graduación", value: "100-20-20" },
      { label: "Segunda concentración de 2GROW", value: "200-0-0 · mayor concentración de nitrógeno de la línea" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Presentaciones", value: "1 L / 3,75 L / 20 L / 200 L / 1000 L" }
    ],
    application: [
      "Ubicar la referencia en la etapa de arranque, crecimiento vegetativo o recuperación que se quiere acompañar.",
      "Revisar calidad de agua, vía de aplicación y compatibilidad antes de preparar; el formato líquido complementa, pero no reemplaza, la ruta del suelo.",
      "Definir dosis, frecuencia y volumen con etiqueta vigente, etapa y recomendación técnica; registrar la respuesta del cultivo.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Pasifloras", "Viveros"],
    cautions: ["Realizar prueba de compatibilidad cuando se combine con bioinsumos u otros productos.", "No mezclar por intuición ni asumir que la vía foliar y la radicular tienen el mismo manejo."],
    priceCop: 17000,
    presentation: "1 L",
    formula: "100-20-20",
    concentrations: ["100-20-20", "200-0-0 · mayor concentración de nitrógeno de la línea"],
  },
  {
    slug: "2balance-liquido",
    name: "Wondergreen 2BALANCE Líquido",
    family: "2BALANCE",
    category: "liquidos",
    headline: "70-70-70 · Fertilizante líquido de base biológica para equilibrio nutricional",
    intro: "2BALANCE líquido reúne nitrógeno, fósforo y potasio en el perfil declarado 70-70-70. Su relación numérica 1:1:1 ofrece una referencia soluble para programas de transición y mantenimiento cuando el análisis y la demanda del cultivo respaldan un aporte combinado. La base proviene de bioles de digestión anaerobia multietapa, formulados y estabilizados; la etiqueta vigente define su concentración analítica y las condiciones de aplicación.",
    focus: "Equilibrio, transición y mantenimiento.",
    objective: "Integrar un perfil N-P-K soluble a programas de transición y mantenimiento, definiendo aporte efectivo, vía y fraccionamiento según etiqueta, análisis y demanda del lote.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Fertilizante líquido N-P-K de base biológica para integrar aporte combinado durante transición y mantenimiento, cuando el diagnóstico del lote lo justifica.",
    stage: "Equilibrio & Transición",
    idealFor: ["Cultivos en producción", "Transición vegetativa-reproductiva", "Programas de mantenimiento", "Aplicaciones fraccionadas"],
    notes: ["La ficha técnica de la presentación seleccionada define concentración, calidad de agua y compatibilidad de mezcla.", "El formato líquido se integra según el sistema de aplicación y el programa del cultivo."],
    benefits: [
      "Reúne los valores declarados de N, P y K en una sola referencia líquida para programas que requieren evaluar un aporte combinado.",
      "La relación 70:70:70 permite comparar el perfil numérico de los tres nutrientes; no informa por sí sola su concentración analítica ni la dosis por hectárea.",
      "Ayuda a contrastar la recomendación con análisis de suelo o tejido, extracción esperada, aportes previos y etapa del cultivo antes de definir la pauta.",
      "El registro de aplicación y la observación nutricional del cultivo permiten revisar el programa con el equipo técnico a lo largo del ciclo."
    ],
    specs: [
      { label: "Graduación", value: "70-70-70" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Presentaciones", value: "1 L / 3,75 L / 20 L / 200 L / 1000 L" }
    ],
    application: [
      "Usarlo cuando el cultivo requiera equilibrio o transición y el diagnóstico no indique una limitación previa de agua, raíz o sanidad.",
      "Revisar calidad de agua, sistema de aplicación y compatibilidad indicada en la ficha antes de incorporarlo al tanque.",
      "Definir dosis, vía y frecuencia con etiqueta vigente, análisis y recomendación técnica para el lote; evaluar la respuesta antes de fraccionar.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Cítricos", "Plátano", "Hortalizas"],
    cautions: ["Confirmar compatibilidad de mezcla con la ficha técnica vigente antes de combinar.", "Separar aplicaciones cuando la etiqueta o la orientación técnica lo indiquen."],
    priceCop: 19100,
    presentation: "1 L",
    formula: "70-70-70",
  },
  {
    slug: "2bloom-liquido",
    name: "Wondergreen 2BLOOM Líquido",
    family: "2BLOOM",
    category: "liquidos",
    headline: "30-80-30 · Fertilizante líquido de base biológica para floración",
    intro: "Fertilizante líquido de base biológica de la línea 2BLOOM, elaborado a partir de bioles de digestión anaerobia multietapa. Se considera para floración y transición reproductiva según la ficha vigente y el programa definido para el cultivo.",
    focus: "Floración, cuajado y transición reproductiva.",
    objective: "Acompañar programas de floración con una referencia soluble cuya vía, dosis y momento deben definirse técnicamente.",
    format: "Líquido soluble",
    presentations: ["Formato por consultar"],
    commercialStatus: "Portafolio técnico; presentación y suministro por consultar",
    technicalRole: "Fertilizante líquido de base biológica, derivado de bioles de digestión anaerobia multietapa, para acompañar la floración y la transición reproductiva.",
    stage: "Floración & Cuajado",
    idealFor: ["Prefloración", "Floración plena", "Cafetales y frutales", "Pasifloras en producción"],
    notes: ["La referencia se suministra dentro de un programa definido para el cultivo y una condición de entrega confirmada.", "La ficha técnica de la presentación seleccionada define compatibilidad con bioinsumos y calidad de agua."],
    benefits: [
      "Extiende la lógica de 2BLOOM a un formato líquido de base biológica.",
      "La etapa reproductiva, la ficha vigente y las condiciones del lote orientan la decisión de uso.",
      "Permite conversar sobre etapa, vía y operación sin separar la fórmula del contexto.",
      "La respuesta debe observarse dentro del programa productivo."
    ],
    specs: [
      { label: "Graduación", value: "30-80-30" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Estado", value: "Portafolio técnico; presentación y suministro por consultar" }
    ],
    application: [
      "Confirmar transición reproductiva, condición del cultivo y objetivo de floración antes de elegir la referencia soluble.",
      "Revisar calidad de agua, compatibilidad con bioinsumos e intervalo entre aplicaciones antes de preparar la mezcla.",
      "Definir dosis, vía, momento y frecuencia únicamente con ficha, etiqueta y recomendación técnica vigentes; no interpretar la fórmula como garantía de cuajado.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Cítricos", "Gulupa", "Granadilla", "Uchuva"],
    cautions: ["No presentar la fórmula como garantía de floración o cuajado.", "Confirmar mezcla, intervalo y calidad de agua antes de aplicar."],
    formula: "30-80-30",
  },
  {
    slug: "2fruit-liquido",
    name: "Wondergreen 2FRUIT Líquido",
    family: "2FRUIT",
    category: "liquidos",
    headline: "30-30-80 · Fertilizante líquido de base biológica para desarrollo de fruto",
    intro: "Fertilizante líquido de base biológica de la línea 2FRUIT, elaborado a partir de bioles de digestión anaerobia multietapa. Su formulación se considera para desarrollo y llenado del fruto según la ficha vigente y las condiciones del cultivo.",
    focus: "Fructificación, llenado y maduración.",
    objective: "Acompañar la nutrición soluble de la fase productiva sin reemplazar el análisis de carga, agua y condición del cultivo.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento agronómico",
    technicalRole: "Referencia de nutrición soluble para la fase productiva; su uso se define con la ficha vigente y las condiciones del lote.",
    stage: "Llenado & Maduración",
    idealFor: ["Frutificación", "Llenado de fruto", "Café en llenado de grano", "Frutales y pasifloras"],
    notes: ["La ficha técnica de la presentación seleccionada define concentración, calidad de agua y compatibilidad de mezcla.", "El programa registra indicadores de calidad relevantes para cada cultivo y lote."],
    benefits: [
      "Completa la ruta 2FRUIT con un formato líquido de base biológica y escalable.",
      "La integración al programa considera la carga productiva, la etapa y los indicadores que se observarán en el lote.",
      "Ayuda a ordenar la conversación alrededor de carga, etapa y objetivo productivo.",
      "Permite vincular aplicación y seguimiento de resultados propios del cultivo."
    ],
    specs: [
      { label: "Graduación", value: "30-30-80" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Presentaciones", value: "1 L / 3,75 L / 20 L / 200 L / 1000 L" }
    ],
    application: [
      "Ubicar la aplicación en desarrollo, llenado o maduración y definir qué indicador de calidad o rendimiento se quiere seguir.",
      "Revisar carga productiva, agua, calidad de mezcla y compatibilidad antes de aplicar; el formato líquido no es equivalente al sólido.",
      "Definir dosis, vía y frecuencia con etiqueta vigente, carga productiva y recomendación técnica, y comparar la respuesta con el registro del lote.",
    ],
    crops: ["Café", "Aguacate", "Cacao", "Cítricos", "Plátano", "Gulupa", "Granadilla", "Uchuva"],
    cautions: ["No asumir que el formato líquido es equivalente a la referencia sólida.", "Verificar compatibilidad y hacer prueba de mezcla cuando corresponda."],
    priceCop: 18000,
    presentation: "1 L",
    formula: "30-30-80",
  }
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const productCategoryLabels: Record<Product["category"], string> = {
  solidos: "Fertilizantes sólidos",
  liquidos: "Fertilizantes líquidos",
  acondicionadores: "Acondicionadores de suelo",
  bioinsumos: "Bioinsumos y bioles",
};

export function getProductCategoryLabel(category: Product["category"]): string {
  return productCategoryLabels[category];
}

export const bioinputs = products.filter(p => p.category === "bioinsumos");
export const pricedProducts = products.filter((product) => typeof product.priceCop === "number");
export const technicalPortfolio = products.filter((product) => typeof product.priceCop !== "number");

export const productsList: ProductSpec[] = products.map(p => ({
  id: p.slug,
  name: p.name,
  line: p.category === "bioinsumos" ? "Bioinsumo" : p.category === "liquidos" ? "Liquid" : "Solid",
  formula: p.formula || p.headline,
  organicCarbon: "Consultar ficha vigente",
  presentation: p.presentation || p.presentations[0] || "Consultar",
  priceCop: p.priceCop || 0,
  badge: p.headline.split("·")[1]?.trim() || "Nutrición",
  pdfManual: "/downloads/catalogo-wondergreen.pdf",
  targetRole: p.focus,
  molecularBenefit: p.benefits[0] || "",
  usageInstructions: p.application[0] || ""
}));
