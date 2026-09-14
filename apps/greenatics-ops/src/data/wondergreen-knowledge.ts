export type DeficiencyRow = {
  nutrient: string;
  starts: string;
  symptom: string;
  interpretation: string;
};

export type DeficiencyCrop = {
  slug: string;
  cropSlug: string;
  name: string;
  intro: string;
  rows: DeficiencyRow[];
  fieldNotes: string[];
};

export const deficiencyQuickRules = [
  { title: "Hojas viejas", copy: "Revisar primero nutrientes móviles como N, P, K y Mg, sin asumir que el síntoma es exclusivamente nutricional." },
  { title: "Hojas nuevas", copy: "Revisar primero Ca, S, B, Fe, Zn y Mn, junto con raíz, pH y condición hídrica." },
  { title: "Patrón del lote", copy: "Distinguir planta aislada, manchón, zona baja, ladera, cabecera de riego o afectación general." },
  { title: "Antes de corregir", copy: "Cruzar fertilización previa, pH, textura, drenaje, humedad, raíces, carga productiva y síntomas sanitarios." },
] as const;

export const deficiencyCrops: DeficiencyCrop[] = [
  {
    slug: "aguacate",
    cropSlug: "aguacate",
    name: "Aguacate",
    intro: "La lectura visual debe contrastarse con análisis foliar y condiciones de suelo: pH alto, asfixia radicular, salinidad y desbalances pueden producir síntomas parecidos.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Pérdida de vigor, hojas pequeñas y verde pálido.", interpretation: "Revisar vigor general, brotación y manejo previo." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Clorosis y necrosis desde punta y bordes; posible fruta pequeña.", interpretation: "Puede confundirse con salinidad o cloruros." },
      { nutrient: "Zn", starts: "Hojas nuevas", symptom: "Moteado amarillo, entrenudos cortos y hojas pequeñas.", interpretation: "Frecuente con pH alto o fósforo elevado." },
      { nutrient: "Fe", starts: "Hojas nuevas", symptom: "Clorosis intervenal con nervaduras verdes.", interpretation: "Sospechar especialmente en condiciones alcalinas." },
      { nutrient: "B", starts: "Brotes", symptom: "Corrugación, necrosis marginal y deformación de brotes o fruto.", interpretation: "Diferenciar de calcio y daños del crecimiento." },
    ],
    fieldNotes: ["Si el problema se concentra en sectores de pH alto, revisar Fe y Zn.", "Hojas pequeñas + entrenudos cortos + moteado orientan primero a Zn.", "Deformación fuerte de brotes y fruto exige revisar B y condición radicular."],
  },
  {
    slug: "cacao",
    cropSlug: "cacao",
    name: "Cacao",
    intro: "La sintomatología visual es orientativa y debe confirmarse con análisis foliar y de suelo, especialmente en lotes viejos o de alta extracción.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas / planta", symptom: "Follaje verde pálido, crecimiento lento y menor vigor.", interpretation: "Puede confundirse con baja materia orgánica o lavado." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Amarillamiento marginal que progresa a necrosis.", interpretation: "Revisar junto con estrés hídrico y carga productiva." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Clorosis intervenal conservando nervaduras más verdes.", interpretation: "Puede agravarse con exceso relativo de K." },
      { nutrient: "Fe / Zn", starts: "Hojas nuevas", symptom: "Clorosis intervenal; con Zn pueden aparecer hojas pequeñas.", interpretation: "Confirmar porque los patrones pueden superponerse." },
      { nutrient: "B", starts: "Brotes", symptom: "Deformación y mala expansión foliar; problemas de cuajado.", interpretation: "Revisar junto con Ca y estrés hídrico." },
    ],
    fieldNotes: ["Hoja adulta con clorosis intervenal: revisar Mg primero.", "Hoja nueva con clorosis intervenal: revisar Fe o Zn.", "En lotes de alta extracción, K y Mg merecen revisión prioritaria."],
  },
  {
    slug: "cafe",
    cropSlug: "cafe",
    name: "Café",
    intro: "El diagnóstico visual tiene buena base técnica en Colombia, pero debe cruzarse con suelo, estado foliar, época de muestreo y carga productiva.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Clorosis; en casos severos paloteo y pérdida de vigor.", interpretation: "Revisar alta carga y fertilización previa." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Necrosis en punta y bordes; defoliación en casos severos.", interpretation: "Muy relevante durante producción." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Clorosis intervenal y defoliación en ramas productivas.", interpretation: "Puede coexistir con niveles altos de K." },
      { nutrient: "B", starts: "Brotes", symptom: "Muerte de yemas, rebrote lateral y tejido corchoso.", interpretation: "La V invertida y los signos corchosos son pistas útiles." },
      { nutrient: "Zn", starts: "Hojas nuevas", symptom: "Hojas pequeñas, lanceoladas y entrenudos cortos.", interpretation: "No confundir con sequía o sombra intensa." },
    ],
    fieldNotes: ["N y K son macronutrientes de alta demanda en producción.", "Una V invertida o signos corchosos orientan a revisar B.", "La época de muestreo y la carga cambian la lectura del síntoma."],
  },
  {
    slug: "pastos",
    cropSlug: "pastos-gramineas",
    name: "Pastos y gramíneas",
    intro: "Primero se lee el patrón del potrero y después la hoja. Corte, pastoreo, humedad, compactación y fertilización reciente cambian completamente la interpretación.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Clorosis general y pérdida progresiva de color.", interpretation: "Es frecuente, pero no debe diagnosticarse sin revisar manejo." },
      { nutrient: "P", starts: "Plantas jóvenes / hojas bajas", symptom: "Rebrote lento, enanismo y tonos rojizos o púrpura.", interpretation: "Puede confundirse con compactación, frío o encharcamiento." },
      { nutrient: "K", starts: "Hojas viejas", symptom: "Estrías amarillas y quemado de puntas.", interpretation: "Revisar especialmente después de cortes repetidos." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Clorosis intervenal y bordes café rojizo.", interpretation: "Frecuente en suelos ácidos, arenosos o con K alto." },
      { nutrient: "S", starts: "Hojas nuevas", symptom: "Verde pálido a amarillo en tejido joven.", interpretation: "Se parece a N, pero comienza en tejido más nuevo." },
    ],
    fieldNotes: ["Después del segundo o tercer corte, revisar K si aparecen síntomas.", "Una pradera rala no equivale automáticamente a deficiencia.", "Estrés hídrico puede simular deficiencia; revisar humedad primero."],
  },
  {
    slug: "limon-tahiti",
    cropSlug: "limon-tahiti",
    name: "Limón Tahití",
    intro: "En cítricos es crítico diferenciar nutrición de problemas sanitarios, daño radicular, pH alto y anegamiento. El fruto también aporta pistas de diagnóstico.",
    rows: [
      { nutrient: "N", starts: "Hojas viejas", symptom: "Canopia menos verde, amarillamiento general y menor crecimiento.", interpretation: "Diferenciar de senescencia o sombra." },
      { nutrient: "P", starts: "Fruto y hojas", symptom: "Cáscara más gruesa, menor jugo y posible follaje bronceado.", interpretation: "El fruto orienta parte de la lectura." },
      { nutrient: "K", starts: "Fruto / hojas viejas", symptom: "Frutos pequeños y cambios en cáscara; posible caída.", interpretation: "Revisar carga y condición química del suelo." },
      { nutrient: "Mg", starts: "Hojas viejas", symptom: "Patrón amarillo-verdoso y V invertida verde característica.", interpretation: "Uno de los patrones útiles en cítricos." },
      { nutrient: "Fe", starts: "Hojas nuevas", symptom: "Clorosis intervenal intensa con nervaduras verdes.", interpretation: "Frecuente con pH alto o limitación radicular." },
    ],
    fieldNotes: ["No asumir Zn o Mn sin descartar causas sanitarias cuando el patrón es irregular.", "El estado del fruto complementa la lectura foliar.", "Antes de corregir, revisar drenaje, raíces, pH y agua."],
  },
];

export function getDeficiencyCrop(slug: string) {
  return deficiencyCrops.find((crop) => crop.slug === slug);
}
