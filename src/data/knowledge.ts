export type DeficiencyRow = {
  nutrient: string;
  starts: string;
  symptom: string;
  key: string;
};

export type DeficiencyCrop = {
  slug: string;
  name: string;
  intro: string;
  rows: DeficiencyRow[];
  fieldNotes: string[];
};

export const deficiencyCrops: DeficiencyCrop[] = [
  {
    slug: "aguacate",
    name: "Aguacate",
    intro: "La lectura visual debe contrastarse con análisis foliar y condiciones de suelo: pH alto, asfixia radicular, salinidad y desbalances pueden producir síntomas parecidos.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Pérdida de vigor, hojas pequeñas y verde pálido.", key: "Revisar vigor general, brotación y manejo previo." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Clorosis y necrosis desde punta y bordes; posible fruta pequeña.", key: "Puede confundirse con salinidad o cloruros." },
      { nutrient: "Zn", starts: "Hojas nuevas", symptom: "Moteado amarillo, entrenudos cortos y hojas pequeñas.", key: "Frecuente con pH alto o fósforo elevado." },
      { nutrient: "Fe", starts: "Hojas nuevas", symptom: "Clorosis intervenal con nervaduras verdes.", key: "Sospechar especialmente en condiciones alcalinas." },
      { nutrient: "B", starts: "Brotes", symptom: "Corrugación, necrosis marginal y deformación de brotes/fruto.", key: "Diferenciar de calcio y daños del crecimiento." },
    ],
    fieldNotes: ["Si el problema se concentra en sectores de pH alto, revisar Fe y Zn.", "Hojas pequeñas + entrenudos cortos + moteado orientan primero a Zn.", "Deformación fuerte de brotes y fruto exige revisar B y condición radicular."],
  },
  {
    slug: "cacao",
    name: "Cacao",
    intro: "La sintomatología visual es orientativa y debe confirmarse con análisis foliar y de suelo, especialmente en lotes viejos o de alta extracción.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas / planta", symptom: "Follaje verde pálido, crecimiento lento y menor vigor.", key: "Puede confundirse con baja materia orgánica o lavado." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Amarillamiento marginal que progresa a necrosis.", key: "Revisar junto con estrés hídrico y carga productiva." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Clorosis intervenal conservando nervaduras más verdes.", key: "Puede agravarse con exceso relativo de K." },
      { nutrient: "Fe / Zn", starts: "Hojas nuevas", symptom: "Clorosis intervenal; con Zn pueden aparecer hojas pequeñas.", key: "Confirmar porque los patrones pueden superponerse." },
      { nutrient: "B", starts: "Brotes", symptom: "Deformación y mala expansión foliar; problemas de cuajado.", key: "Revisar junto con Ca y estrés hídrico." },
    ],
    fieldNotes: ["Hoja adulta con clorosis intervenal: revisar Mg primero.", "Hoja nueva con clorosis intervenal: revisar Fe o Zn.", "En lotes de alta extracción, K y Mg merecen revisión prioritaria."],
  },
  {
    slug: "cafe",
    name: "Café",
    intro: "El diagnóstico visual tiene buena base técnica en Colombia, pero debe cruzarse con suelo, estado foliar, época de muestreo y carga productiva.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Clorosis; en casos severos paloteo y pérdida de vigor.", key: "Revisar alta carga y fertilización previa." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Necrosis en punta y bordes; defoliación en casos severos.", key: "Muy relevante durante producción." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Clorosis intervenal y defoliación en ramas productivas.", key: "Puede coexistir con niveles altos de K." },
      { nutrient: "B", starts: "Brotes", symptom: "Muerte de yemas, rebrote lateral y tejido corchoso.", key: "La V invertida y los signos corchosos son pistas útiles." },
      { nutrient: "Zn", starts: "Hojas nuevas", symptom: "Hojas pequeñas, lanceoladas y entrenudos cortos.", key: "No confundir con sequía o sombra intensa." },
    ],
    fieldNotes: ["N y K son macronutrientes de alta demanda en producción.", "Una V invertida o signos corchosos orientan a revisar B.", "La época de muestreo y la carga cambian la lectura del síntoma."],
  },
  {
    slug: "pastos",
    name: "Pastos y gramíneas",
    intro: "Primero se lee el patrón del potrero y después la hoja. Corte, pastoreo, humedad, compactación y fertilización reciente cambian completamente la interpretación.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Clorosis general y pérdida progresiva de color.", key: "Es frecuente, pero no debe diagnosticarse sin revisar manejo." },
      { nutrient: "P", starts: "Plantas jóvenes / hojas bajas", symptom: "Rebrote lento, enanismo y tonos rojizos o púrpura.", key: "Puede confundirse con compactación, frío o encharcamiento." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Estrías amarillas y quemado de puntas.", key: "Revisar especialmente después de cortes repetidos." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Clorosis intervenal y bordes café rojizo.", key: "Frecuente en suelos ácidos, arenosos o con K alto." },
      { nutrient: "S", starts: "Hojas nuevas", symptom: "Verde pálido a amarillo en tejido joven.", key: "Se parece a N, pero comienza en tejido más nuevo." },
    ],
    fieldNotes: ["Después del segundo o tercer corte, revisar K si aparecen síntomas.", "Una pradera rala no equivale automáticamente a deficiencia.", "Estrés hídrico puede simular deficiencia; revisar humedad primero."],
  },
  {
    slug: "limon-tahiti",
    name: "Limón Tahití",
    intro: "En cítricos es crítico diferenciar nutrición de HLB, daño radicular, pH alto y anegamiento. El fruto también aporta pistas de diagnóstico.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Canopia menos verde, amarillamiento general y menor crecimiento.", key: "Diferenciar de senescencia o sombra." },
      { nutrient: "P", starts: "Fruto y hojas", symptom: "Cáscara más gruesa, menor jugo y posible follaje bronceado.", key: "El fruto orienta parte de la lectura." },
      { nutrient: "K", starts: "Fruto / hojas viejas", symptom: "Frutos pequeños y cambios en cáscara; posible caída.", key: "Revisar carga y condición química del suelo." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Patrón amarillo-verdoso y V invertida verde característica.", key: "Uno de los patrones útiles en cítricos." },
      { nutrient: "Fe", starts: "Hojas nuevas", symptom: "Clorosis intervenal intensa con nervaduras verdes.", key: "Frecuente con pH alto o limitación radicular." },
    ],
    fieldNotes: ["No asumir Zn o Mn sin descartar HLB cuando el patrón es irregular.", "El estado del fruto complementa la lectura foliar.", "Antes de corregir, revisar drenaje, raíces, pH y agua."],
  },
];

export const portfolioFamilies = [
  { family: "Compost", moment: "Suelo", purpose: "Construir base orgánica y acondicionar el suelo.", next: "Puede complementar programas 2GROW o 2BALANCE." },
  { family: "2GROW", moment: "Crecimiento", purpose: "Acompañar brotación, arranque y recuperación vegetativa.", next: "Leer formato y momento según objetivo del cultivo." },
  { family: "2BALANCE", moment: "Mantenimiento", purpose: "Sostener continuidad y equilibrio nutricional entre etapas.", next: "Útil cuando el programa requiere estabilidad." },
  { family: "2BLOOM", moment: "Floración", purpose: "Acompañar prefloración, floración y transición reproductiva.", next: "La oportunidad de aplicación depende del cultivo." },
  { family: "2FRUIT", moment: "Producción", purpose: "Acompañar llenado, engrose y fase productiva.", next: "Conectar con carga, agua y objetivo productivo." },
  { family: "Bioinsumos", moment: "Complemento", purpose: "Aportar soporte botánico o microbiológico dentro de programas integrales.", next: "No se tratan como sustituto automático de la nutrición." },
] as const;

export const homeKitFamilies = [
  { name: "Follaje y crecimiento", use: "Materas, jardín y plantas cuyo objetivo dominante es desarrollo vegetativo.", state: "Concepto comercial validado; formulación/presentación final pendiente de Product Truth." },
  { name: "Floración y producción en matera", use: "Plantas ornamentales o productivas manejadas en espacios pequeños y contenedores.", state: "Concepto comercial validado; dosis y composición no publicadas hasta ficha vigente." },
  { name: "Huerta urbana y aromáticas", use: "Huertas caseras, escolares o comunitarias y sistemas de aromáticas de pequeña escala.", state: "Concepto comercial validado; se priorizan Compost y nutrición por etapa sin receta rígida." },
  { name: "Rescate y mantenimiento", use: "Plantas que requieren recuperar condición general o sostener un manejo doméstico ordenado.", state: "Concepto comercial validado; diagnóstico antes de recomendar." },
] as const;
