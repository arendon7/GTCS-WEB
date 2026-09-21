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
  organicCarbon?: string;
  image?: string;
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
  image: string;
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
    headline: "15-3-3 organomineral · Establecimiento y crecimiento",
    intro: "Referencia sólida orientada a acompañar establecimiento, brotación y crecimiento vegetativo dentro de un programa ajustado al suelo y al cultivo.",
    focus: "Establecimiento, levante y crecimiento vegetativo.",
    objective: "Acompañar etapas de establecimiento, levante y desarrollo vegetativo.",
    format: "Sólido granulado",
    presentations: ["40 kg con precio reconciliado", "5 kg en portafolio técnico"],
    commercialStatus: "Precio público de referencia; suministro coordinado por cotización",
    technicalRole: "Aporte organomineral orientado a la etapa vegetativa.",
    stage: "Arranque & Crecimiento",
    idealFor: ["Café en levante", "Aguacate Hass en brotación", "Hortalizas en trasplante", "Pastos en renovación"],
    notes: ["Conservar bajo techo en un lugar seco.", "Validar compatibilidades y programa de uso antes de aplicar."],
    benefits: [
      "Integra una fórmula N-P-K con matriz organomineral.",
      "Se posiciona para objetivos de establecimiento y crecimiento vegetativo.",
      "Permite construir un programa por etapa en conjunto con las demás líneas Wondergreen."
    ],
    specs: [
      { label: "Graduación", value: "15-3-3 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" },
      { label: "Precio Referencia", value: "COP $147.400" }
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
    formula: "15-3-3",
    image: "/products/wondergreen-2grow.webp"
  },
  {
    slug: "2balance",
    name: "Wondergreen 2BALANCE",
    family: "2BALANCE",
    category: "solidos",
    headline: "7-7-7 organomineral · Balance y mantenimiento",
    intro: "Referencia sólida orientada a programas de nutrición balanceada y mantenimiento, sujeta a diagnóstico de suelo, cultivo y manejo.",
    focus: "Nutrición balanceada y mantenimiento.",
    objective: "Acompañar programas que requieren un aporte equilibrado de macronutrientes.",
    format: "Sólido granulado",
    presentations: ["40 kg con precio reconciliado", "5 kg en portafolio técnico"],
    commercialStatus: "Precio público de referencia; suministro coordinado por cotización",
    technicalRole: "Aporte organomineral balanceado para mantenimiento nutricional.",
    stage: "Mantenimiento & Suelo",
    idealFor: ["Cafetales en producción", "Cítricos continuos", "Plátano en emisión", "Jardines y viveros"],
    notes: ["La periodicidad depende del diagnóstico y del programa de manejo."],
    benefits: [
      "Integra una relación balanceada de macronutrientes.",
      "Se posiciona para etapas de mantenimiento dentro del sistema Wondergreen.",
      "Su uso debe ajustarse a análisis de suelo, extracción del cultivo y manejo previo."
    ],
    specs: [
      { label: "Graduación", value: "7-7-7 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" },
      { label: "Precio Referencia", value: "COP $147.400" }
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
    formula: "7-7-7",
    image: "/products/wondergreen-2balance.webp"
  },
  {
    slug: "2bloom",
    name: "Wondergreen 2BLOOM",
    family: "2BLOOM",
    category: "solidos",
    headline: "3-8-3 organomineral · Transición reproductiva",
    intro: "Referencia sólida orientada a acompañar la etapa de floración dentro de un programa que considere condición del cultivo, ambiente y manejo.",
    focus: "Transición reproductiva y floración.",
    objective: "Acompañar programas nutricionales durante la etapa reproductiva.",
    format: "Sólido granulado",
    presentations: ["40 kg con precio reconciliado", "5 kg en portafolio técnico"],
    commercialStatus: "Precio público de referencia; suministro coordinado por cotización",
    technicalRole: "Aporte organomineral orientado a la transición reproductiva.",
    stage: "Floración & Cuajado",
    idealFor: ["Cafetales en prefloración", "Aguacate en floración", "Tomate en flor", "Pasifloras en espaldera"],
    notes: ["El momento de aplicación debe definirse según etapa, clima y manejo del cultivo."],
    benefits: [
      "Integra una relación N-P-K orientada a la etapa reproductiva.",
      "Permite diferenciar la nutrición de floración frente a las etapas vegetativa y productiva.",
      "La respuesta debe observarse y ajustarse dentro del programa del cultivo."
    ],
    specs: [
      { label: "Graduación", value: "3-8-3 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" },
      { label: "Precio Referencia", value: "COP $115.500" }
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
    formula: "3-8-3",
    image: "/products/wondergreen-2bloom.webp"
  },
  {
    slug: "2fruit",
    name: "Wondergreen 2FRUIT",
    family: "2FRUIT",
    category: "solidos",
    headline: "3-3-8 organomineral · Desarrollo y llenado",
    intro: "Referencia sólida orientada a acompañar la fase productiva y el desarrollo del fruto dentro de un programa ajustado al cultivo.",
    focus: "Fase productiva, desarrollo y llenado.",
    objective: "Acompañar programas nutricionales durante el desarrollo del fruto o del órgano cosechado.",
    format: "Sólido granulado",
    presentations: ["40 kg con precio reconciliado", "5 kg en portafolio técnico"],
    commercialStatus: "Precio público de referencia; suministro coordinado por cotización",
    technicalRole: "Aporte organomineral orientado a la fase productiva.",
    stage: "Llenado & Maduración",
    idealFor: ["Aguacate Hass en engorde", "Café en llenado de grano", "Cacao en desarrollo de mazorca", "Frutales"],
    notes: ["Revisar disponibilidad de agua y condición del cultivo antes de ajustar el programa."],
    benefits: [
      "Integra una relación N-P-K orientada a la fase productiva.",
      "Permite diferenciar la nutrición de llenado frente a las etapas vegetativa y reproductiva.",
      "El resultado debe evaluarse con indicadores propios del cultivo y del lote."
    ],
    specs: [
      { label: "Graduación", value: "3-3-8 Organomineral" },
      { label: "Presentación", value: "Bulto 40 kg" },
      { label: "Precio Referencia", value: "COP $121.900" }
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
    formula: "3-3-8",
    image: "/products/wondergreen-2fruit.webp"
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
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Complemento botánico o microbiológico dentro del manejo integrado.",
    stage: "Defensa & Suelo Vivo",
    idealFor: ["Inoculación en drench", "Aspersión foliar", "Enraizamiento de esquejes", "Manejo integrado"],
    notes: ["Cada solicitud recibe la ficha, condición de uso y protocolo correspondiente a la referencia seleccionada."],
    benefits: [
      "Incluye referencias botánicas y microbiológicas diferenciadas.",
      "Debe integrarse a un manejo definido por diagnóstico, monitoreo y condición regulatoria.",
      "La selección depende del objetivo, el cultivo y la ficha vigente de cada referencia."
    ],
    specs: [
      { label: "Tipo", value: "Referencias botánicas y microbiológicas" },
      { label: "Presentación técnica", value: "1 L / 5 L / 20 L" },
      { label: "Estado", value: "Disponible bajo solicitud y acompañamiento técnico" }
    ],
    application: ["Usar únicamente según etiqueta, condición regulatoria y recomendación vigentes."],
    crops: ["Todos los cultivos"],
    cautions: ["No asumir compatibilidad, blanco biológico o dosis entre referencias distintas."],
    presentation: "1 L / 5 L / 20 L",
    formula: "Portafolio técnico",
    image: "/products/wondergreen-bioinsumos.webp"
  },
  {
    slug: "bioinsumo-trichoderma",
    name: "Wondergreen Trichoderma",
    family: "Trichoderma",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Acompañamiento radicular",
    intro: "Referencia microbiológica líquida para considerar dentro de programas de establecimiento, recuperación radicular y manejo del entorno biológico del suelo.",
    focus: "Suelo, raíz y manejo integrado.",
    objective: "Acompañar un programa biológico del suelo con una referencia cuya concentración, uso autorizado y frecuencia deben confirmarse en la ficha vigente.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Referencia microbiológica para acompañamiento radicular y entorno biológico del suelo.",
    stage: "Suelo & Raíz",
    idealFor: ["Establecimiento", "Recuperación radicular", "Drench", "Fertirriego"],
    notes: ["La presentación de 1 L identifica Trichoderma.", "La ficha técnica entregada con la solicitud define especie o cepa, concentración garantizada, dosis, registro y compatibilidades."],
    benefits: [
      "Hace visible una referencia microbiológica específica dentro del portafolio.",
      "Puede evaluarse junto con humedad, materia orgánica, raíz y manejo del lote.",
      "No reemplaza el diagnóstico ni el programa nutricional del cultivo."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Trichoderma" },
      { label: "Presentación documentada", value: "1 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: ["Agitar antes de usar y definir vía, dosis y frecuencia únicamente con ficha, etiqueta y recomendación técnica vigentes."],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Viveros", "Frutales"],
    cautions: ["No aplicar en horas de alta radiación.", "No mezclar con fungicidas, cobres, azufres, desinfectantes, aceites o productos muy alcalinos sin validación.", "Mantener fuera del alcance de niños y mascotas."],
    formula: "Trichoderma",
    image: "/products/wondergreen-bioinsumos/labels-trichoderma-bacillus-1l.jpeg"
  },
  {
    slug: "bioinsumo-bacillus-subtilis",
    name: "Wondergreen Bacillus subtilis",
    family: "Bacillus subtilis",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Suelo activo y desarrollo radicular",
    intro: "Referencia microbiológica líquida para integrar a programas de suelo activo y desarrollo radicular, siempre con concentración y uso definidos por la documentación vigente.",
    focus: "Suelo activo, raíz y manejo integrado.",
    objective: "Complementar un programa biológico y nutricional con una referencia cuya aplicación debe ajustarse al cultivo, la etapa, el agua y el diagnóstico.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Referencia microbiológica para suelo activo y desarrollo radicular.",
    stage: "Suelo & Raíz",
    idealFor: ["Desarrollo radicular", "Drench", "Fertirriego", "Programas integrales"],
    notes: ["La presentación de 1 L identifica Bacillus subtilis.", "La ficha técnica entregada con la solicitud define cepa, concentración garantizada, dosis, registro y compatibilidades."],
    benefits: [
      "Diferencia una referencia microbiológica concreta frente al portafolio botánico.",
      "Permite conversar sobre raíz, humedad, materia orgánica y manejo del lote.",
      "Se integra como complemento y no como solución aislada."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Bacillus subtilis" },
      { label: "Presentación documentada", value: "1 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: ["Agitar antes de usar y definir preparación, vía y frecuencia con ficha, etiqueta y recomendación técnica vigentes."],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Viveros", "Frutales"],
    cautions: ["No mezclar con bactericidas, cobres, desinfectantes o productos muy alcalinos sin prueba previa.", "Mantener fuera del alcance de niños y mascotas.", "No usar como bloque aislado del diagnóstico."],
    formula: "Bacillus subtilis",
    image: "/products/wondergreen-bioinsumos/labels-trichoderma-bacillus-1l.jpeg"
  },
  {
    slug: "bioinsumo-beauveria",
    name: "Wondergreen Beauveria",
    family: "Beauveria",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Manejo integrado y seguimiento",
    intro: "Referencia microbiológica líquida para evaluar dentro de un programa de manejo integrado, con monitoreo, rotación de estrategias y recomendación técnica.",
    focus: "Manejo integrado, monitoreo y aplicación dirigida.",
    objective: "Acompañar decisiones de manejo integrado cuando la identificación del problema, el monitoreo y la documentación del producto están disponibles.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Referencia microbiológica para programas de manejo integrado y seguimiento del sistema.",
    stage: "Manejo Integrado",
    idealFor: ["Aplicación dirigida", "Aplicación foliar", "Aplicación al suelo", "Monitoreo de lote"],
    notes: ["La presentación de 1 L identifica Beauveria.", "La ficha técnica entregada con la solicitud define especie, concentración, objetivo de manejo, dosis, intervalo y registro."],
    benefits: [
      "Incorpora una referencia microbiológica a una ruta que empieza en el monitoreo.",
      "Ayuda a ordenar la conversación entre diagnóstico, oportunidad y seguimiento.",
      "Evita presentar un microorganismo como sustituto universal de otras estrategias."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Beauveria" },
      { label: "Presentación documentada", value: "1 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: ["Definir objetivo, momento, cobertura, vía y frecuencia a partir del monitoreo, la etiqueta vigente y la recomendación técnica."],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Frutales", "Pasifloras"],
    cautions: ["Evitar radiación fuerte durante la aplicación.", "No mezclar con fungicidas, cobres, azufres, desinfectantes o aceites sin validación.", "La respuesta depende de monitoreo, clima, presión del problema y equipo disponible."],
    formula: "Beauveria",
    image: "/products/wondergreen-bioinsumos/labels-beauveria-metarhizium-1l.jpeg"
  },
  {
    slug: "bioinsumo-metarhizium",
    name: "Wondergreen Metarhizium",
    family: "Metarhizium",
    category: "bioinsumos",
    headline: "Bioinsumo microbiológico · Fortalecimiento biológico",
    intro: "Referencia microbiológica líquida para integrar a programas de manejo integrado y fortalecimiento del sistema suelo-cultivo.",
    focus: "Manejo integrado, suelo y aplicación dirigida.",
    objective: "Evaluar una herramienta microbiológica en relación con monitoreo, clima, humedad, cobertura, calidad del producto y manejo del lote.",
    format: "Suspensión / líquido biológico",
    presentations: ["1 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Referencia microbiológica para fortalecer un programa biológico e integrado.",
    stage: "Manejo Integrado",
    idealFor: ["Aplicación dirigida", "Suelo", "Drench", "Programas integrales"],
    notes: ["La presentación de 1 L identifica Metarhizium.", "La ficha técnica entregada con la solicitud define especie, concentración, objetivo de manejo, dosis, frecuencia y registro."],
    benefits: [
      "Hace explícita la necesidad de trabajar el bioinsumo dentro de un sistema.",
      "Permite conectar aplicación con humedad, temperatura, cobertura y seguimiento.",
      "Mantiene visible la necesidad de rotación y manejo integrado."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo microbiológico" },
      { label: "Ingrediente identificado", value: "Metarhizium" },
      { label: "Presentación documentada", value: "1 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: ["Agitar antes de usar y definir aplicación dirigida, vía y frecuencia con etiqueta vigente, monitoreo y recomendación técnica."],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Frutales", "Pasifloras"],
    cautions: ["No aplicar con radiación fuerte.", "No mezclar con fungicidas, cobres, azufres, aceites o desinfectantes sin validación.", "La respuesta depende de humedad, temperatura, cobertura y calidad del producto."],
    formula: "Metarhizium",
    image: "/products/wondergreen-bioinsumos/labels-beauveria-metarhizium-1l.jpeg"
  },
  {
    slug: "bioinsumo-ajo-aji",
    name: "Wondergreen Extracto Ajo-Ají",
    family: "Ajo-Ají",
    category: "bioinsumos",
    headline: "Bioinsumo botánico · Acompañamiento preventivo",
    intro: "Referencia botánica líquida elaborada a partir de extractos de ajo y ají para considerar dentro de programas preventivos y de manejo integrado.",
    focus: "Manejo preventivo, aplicación foliar y sistema productivo.",
    objective: "Acompañar un programa preventivo con una referencia botánica cuya concentración, objetivo, dosis y frecuencia deben definirse con la documentación vigente.",
    format: "Extracto líquido",
    presentations: ["1 L"],
    commercialStatus: "Disponible bajo solicitud y acompañamiento técnico",
    technicalRole: "Referencia botánica para acompañamiento preventivo y manejo integrado.",
    stage: "Prevención & Manejo Integrado",
    idealFor: ["Aplicación foliar", "Drench", "Fertirriego", "Programas preventivos"],
    notes: ["La presentación de 1 L identifica extracto de ajo (Allium sativum) y ají (Capsicum spp.).", "La ficha técnica entregada con la solicitud define objetivo, dosis, frecuencia, compatibilidades y condición de uso."],
    benefits: [
      "Incorpora una herramienta botánica diferenciada de los microorganismos vivos.",
      "Permite hablar de prevención, oportunidad y monitoreo antes de aplicar.",
      "Puede evaluarse junto con prácticas culturales, físicas y biológicas."
    ],
    specs: [
      { label: "Tipo", value: "Bioinsumo botánico" },
      { label: "Ingredientes identificados", value: "Ajo (Allium sativum) y ají (Capsicum spp.)" },
      { label: "Presentación documentada", value: "1 L" },
      { label: "Concentración / dosis", value: "Definidas en la ficha técnica y el protocolo de la presentación seleccionada" }
    ],
    application: ["Agitar antes de usar y definir vía, dosis y frecuencia con etiqueta vigente, objetivo preventivo y recomendación técnica."],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Frutales", "Jardinería"],
    cautions: ["No mezclar con productos muy alcalinos sin prueba de compatibilidad.", "Evitar horas de alta radiación y mantener fuera del alcance de niños y mascotas.", "Ajustar dosis y frecuencia según diagnóstico, cultivo y objetivo."],
    formula: "Ajo + Ají",
    image: "/products/wondergreen-bioinsumos/label-extracto-ajo-aji-1l.jpeg"
  },
  {
    slug: "2grow-liquido",
    name: "Wondergreen 2GROW Líquido",
    family: "2GROW",
    category: "liquidos",
    headline: "100-20-20 · Nutrición soluble para crecimiento",
    intro: "Referencia líquida de la línea 2GROW para integrar nutrición soluble y acompañamiento biológico dentro de un programa de establecimiento y crecimiento.",
    focus: "Arranque, crecimiento vegetativo y recuperación.",
    objective: "Acompañar la nutrición soluble del cultivo durante la etapa vegetativa, con lectura de suelo, agua y manejo.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Precio público de referencia para 1 L; programa técnico por cultivo",
    technicalRole: "Referencia líquida para integrar al programa de crecimiento junto con la ruta sólida y el diagnóstico del lote.",
    stage: "Arranque & Crecimiento",
    idealFor: ["Viveros y establecimiento", "Café en levante", "Hortalizas en crecimiento", "Recuperación vegetativa"],
    notes: ["La ficha técnica de la presentación seleccionada define concentración, calidad de agua y compatibilidad de mezcla.", "El programa integra etapa del cultivo, calidad de aplicación y seguimiento de la respuesta."],
    benefits: [
      "Amplía la ruta 2GROW con un formato soluble y escalable.",
      "Puede integrarse con seguimiento de etapa, agua y respuesta del cultivo.",
      "Su uso debe coordinarse con el manejo del suelo y no reemplaza el diagnóstico del lote."
    ],
    specs: [
      { label: "Graduación", value: "100-20-20" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Presentaciones", value: "1 L / 3,75 L / 20 L / 200 L / 1000 L" }
    ],
    application: ["Definir dosis, vía y frecuencia con etiqueta vigente, calidad de agua, etapa y recomendación técnica."],
    crops: ["Café", "Aguacate", "Cacao", "Hortalizas", "Pasifloras", "Viveros"],
    cautions: ["Realizar prueba de compatibilidad cuando se combine con bioinsumos u otros productos.", "No mezclar por intuición ni asumir que la vía foliar y la radicular tienen el mismo manejo."],
    priceCop: 17000,
    presentation: "1 L",
    formula: "100-20-20",
    image: "/products/wondergreen-liquids/labels-2grow-1l.jpeg"
  },
  {
    slug: "2balance-liquido",
    name: "Wondergreen 2BALANCE Líquido",
    family: "2BALANCE",
    category: "liquidos",
    headline: "70-70-70 · Nutrición soluble balanceada",
    intro: "Referencia líquida 2BALANCE para acompañar programas de equilibrio nutricional, siempre en relación con el análisis, la etapa y la condición del cultivo.",
    focus: "Equilibrio, transición y mantenimiento.",
    objective: "Apoyar la nutrición soluble en momentos de equilibrio y transición fisiológica, sin convertir la fórmula en una dosis universal.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Precio público de referencia para 1 L; programa técnico por cultivo",
    technicalRole: "Referencia líquida de equilibrio para complementar la lectura nutricional y operativa del cultivo.",
    stage: "Equilibrio & Transición",
    idealFor: ["Cultivos en producción", "Transición vegetativa-reproductiva", "Programas de mantenimiento", "Aplicaciones fraccionadas"],
    notes: ["La ficha técnica de la presentación seleccionada define concentración, calidad de agua y compatibilidad de mezcla.", "El formato líquido se integra según el sistema de aplicación y el programa del cultivo."],
    benefits: [
      "Permite trabajar un formato soluble dentro del sistema por etapas.",
      "Facilita ajustar la conversación a escala, vía y operación del cultivo.",
      "Debe leerse junto con extracciones, análisis, clima y manejo previo."
    ],
    specs: [
      { label: "Graduación", value: "70-70-70" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Presentaciones", value: "1 L / 3,75 L / 20 L / 200 L / 1000 L" }
    ],
    application: ["Definir dosis, vía y frecuencia con etiqueta vigente y recomendación técnica para el lote."],
    crops: ["Café", "Aguacate", "Cacao", "Cítricos", "Plátano", "Hortalizas"],
    cautions: ["Verificar compatibilidad física y biológica antes de combinar.", "Separar aplicaciones cuando la etiqueta o la orientación técnica lo indiquen."],
    priceCop: 19100,
    presentation: "1 L",
    formula: "70-70-70",
    image: "/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg"
  },
  {
    slug: "2bloom-liquido",
    name: "Wondergreen 2BLOOM Líquido",
    family: "2BLOOM",
    category: "liquidos",
    headline: "30-80-30 · Nutrición soluble para floración",
    intro: "Referencia líquida 2BLOOM para integrar nutrición soluble durante floración y transición reproductiva, con manejo condicionado por cultivo, ambiente y etiqueta.",
    focus: "Floración, cuajado y transición reproductiva.",
    objective: "Acompañar programas de floración con una referencia soluble cuya vía, dosis y momento deben definirse técnicamente.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Disponible bajo cotización y acompañamiento técnico",
    technicalRole: "Referencia líquida orientada a la etapa reproductiva dentro del sistema Wondergreen.",
    stage: "Floración & Cuajado",
    idealFor: ["Prefloración", "Floración plena", "Cafetales y frutales", "Pasifloras en producción"],
    notes: ["La referencia se suministra por cotización dentro de un programa definido para el cultivo.", "La ficha técnica de la presentación seleccionada define compatibilidad con bioinsumos y calidad de agua."],
    benefits: [
      "Extiende la lógica de 2BLOOM a un formato soluble.",
      "Permite conversar sobre etapa, vía y operación sin separar la fórmula del contexto.",
      "La respuesta debe observarse dentro del programa productivo."
    ],
    specs: [
      { label: "Graduación", value: "30-80-30" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Estado", value: "Disponible bajo cotización" }
    ],
    application: ["Definir dosis, vía y frecuencia únicamente con ficha y etiqueta vigentes."],
    crops: ["Café", "Aguacate", "Cacao", "Cítricos", "Gulupa", "Granadilla", "Uchuva"],
    cautions: ["No presentar la fórmula como garantía de floración o cuajado.", "Confirmar mezcla, intervalo y calidad de agua antes de aplicar."],
    formula: "30-80-30",
    image: "/products/wondergreen-liquids/labels-2balance-2bloom-1l.jpeg"
  },
  {
    slug: "2fruit-liquido",
    name: "Wondergreen 2FRUIT Líquido",
    family: "2FRUIT",
    category: "liquidos",
    headline: "30-30-80 · Nutrición soluble para fase productiva",
    intro: "Referencia líquida 2FRUIT para acompañar desarrollo, llenado y maduración dentro de un programa que considere carga, agua, suelo y objetivo de calidad.",
    focus: "Fructificación, llenado y maduración.",
    objective: "Acompañar la nutrición soluble de la fase productiva sin reemplazar el análisis de carga, agua y condición del cultivo.",
    format: "Líquido soluble",
    presentations: ["1 L", "3,75 L", "20 L", "200 L", "1000 L"],
    commercialStatus: "Precio público de referencia para 1 L; programa técnico por cultivo",
    technicalRole: "Referencia líquida para la fase productiva y el seguimiento de variables de cosecha.",
    stage: "Llenado & Maduración",
    idealFor: ["Frutificación", "Llenado de fruto", "Café en llenado de grano", "Frutales y pasifloras"],
    notes: ["La ficha técnica de la presentación seleccionada define concentración, calidad de agua y compatibilidad de mezcla.", "El programa registra indicadores de calidad relevantes para cada cultivo y lote."],
    benefits: [
      "Completa la ruta 2FRUIT con un formato soluble y escalable.",
      "Ayuda a ordenar la conversación alrededor de carga, etapa y objetivo productivo.",
      "Permite vincular aplicación y seguimiento de resultados propios del cultivo."
    ],
    specs: [
      { label: "Graduación", value: "30-30-80" },
      { label: "Formato", value: "Líquido soluble" },
      { label: "Presentaciones", value: "1 L / 3,75 L / 20 L / 200 L / 1000 L" }
    ],
    application: ["Definir dosis, vía y frecuencia con etiqueta vigente, carga productiva y recomendación técnica."],
    crops: ["Café", "Aguacate", "Cacao", "Cítricos", "Plátano", "Gulupa", "Granadilla", "Uchuva"],
    cautions: ["No asumir que el formato líquido es equivalente a la referencia sólida.", "Verificar compatibilidad y hacer prueba de mezcla cuando corresponda."],
    priceCop: 18000,
    presentation: "1 L",
    formula: "30-30-80",
    image: "/products/wondergreen-liquids/label-2fruit-1l.jpeg"
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
  image: p.image || "/products/wondergreen-2grow.webp",
  pdfManual: "/downloads/catalogo-wondergreen.pdf",
  targetRole: p.focus,
  molecularBenefit: p.benefits[0] || "",
  usageInstructions: p.application[0] || ""
}));
