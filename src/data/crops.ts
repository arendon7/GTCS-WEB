export type Crop = {
  slug: string;
  name: string;
  headline: string;
  intro: string;
  context: string;
  stages: { moment: string; lines: string[]; goal: string }[];
  cautions: string[];
};

export const crops: Crop[] = [
  {
    slug: "cacao",
    name: "Cacao",
    headline: "Nutrición por etapa para construir, florecer y producir.",
    intro: "En cacao, el programa debe leer establecimiento, formación, floración, llenado y recuperación como momentos distintos.",
    context: "La selección es orientativa y debe cruzarse con edad, humedad, sombra, poda, carga productiva y, cuando sea posible, análisis de suelo y foliar.",
    stages: [
      { moment: "Establecimiento", lines: ["Compost", "2GROW"], goal: "Construir base orgánica y acompañar el arranque." },
      { moment: "Formación", lines: ["2GROW", "2BALANCE"], goal: "Mover crecimiento y luego sostener continuidad." },
      { moment: "Prefloración y floración", lines: ["2BLOOM"], goal: "Acompañar la transición reproductiva." },
      { moment: "Formación y llenado", lines: ["2FRUIT"], goal: "Soportar la fase productiva de la mazorca." },
      { moment: "Pospoda / recuperación", lines: ["2GROW"], goal: "Reactivar brotación y área foliar." },
    ],
    cautions: ["No cerrar una recomendación solo por fórmula.", "Evitar fertilización intensa con el suelo seco.", "Ajustar con sombra, poda, humedad y producción esperada."],
  },
  {
    slug: "cafe",
    name: "Café",
    headline: "Un programa que sigue el ritmo fisiológico del cafetal.",
    intro: "Levante, sostenimiento, prefloración, llenado y recuperación no tienen la misma demanda. Wondergreen organiza la conversación por ese momento del cultivo.",
    context: "La dosis final depende de densidad, sombra, lluvia, carga productiva y condición del lote. Las aplicaciones líquidas son complemento y no sustituyen automáticamente la base al suelo.",
    stages: [
      { moment: "Levante", lines: ["Compost", "2GROW"], goal: "Base de suelo, brotación y establecimiento." },
      { moment: "Mantenimiento vegetativo", lines: ["2BALANCE"], goal: "Continuidad y equilibrio nutricional." },
      { moment: "Antesala de floración", lines: ["2BLOOM"], goal: "Preparar el periodo de mayor demanda reproductiva." },
      { moment: "Llenado y desarrollo", lines: ["2FRUIT"], goal: "Acompañar el desarrollo del fruto." },
      { moment: "Poscosecha / zoca", lines: ["2GROW"], goal: "Recuperar tejido vegetativo y reservas." },
    ],
    cautions: ["No corregir únicamente por lectura visual.", "Revisar carga, acidez, aluminio, humedad y fertilización reciente.", "Restablecer humedad antes de intensificar un programa en plantas severamente estresadas."],
  },
  {
    slug: "aguacate",
    name: "Aguacate",
    headline: "Formación, floración y llenado requieren decisiones diferentes.",
    intro: "En aguacate joven conviene una nutrición cautelosa y fraccionada; en producción el programa debe leer floración, cuajado, llenado y recuperación.",
    context: "Síntomas nutricionales pueden confundirse con salinidad, pH alto o problemas radiculares. La recomendación debe ligarse a lote, edad, floración, carga y disponibilidad de riego.",
    stages: [
      { moment: "Levante y formación", lines: ["Compost", "2GROW"], goal: "Establecimiento y desarrollo vegetativo." },
      { moment: "Mantenimiento", lines: ["2BALANCE"], goal: "Continuidad y equilibrio del programa." },
      { moment: "Prefloración", lines: ["2BLOOM"], goal: "Acompañar la transición reproductiva." },
      { moment: "Cuajado y llenado", lines: ["2FRUIT"], goal: "Soportar la fase productiva." },
      { moment: "Poscosecha", lines: ["2GROW"], goal: "Recuperación del árbol." },
    ],
    cautions: ["No sobrerrecomendar solo por síntomas visuales.", "Revisar agua y potasio si el fruto pierde calibre o llenado.", "No aplicar producto pegado al cuello del árbol."],
  },
  {
    slug: "limon-tahiti",
    name: "Limón Tahití",
    headline: "Una nutrición que se mueve con los flujos del cultivo.",
    intro: "El limón Tahití puede combinar brotación, floración y cosecha en distintos momentos del año, por lo que un programa rígido pierde sentido.",
    context: "La recomendación debe moverse con edad, carga, rendimiento esperado, suelo, análisis foliar y patrón de producción del lote.",
    stages: [
      { moment: "Formación", lines: ["Compost", "2GROW"], goal: "Construir base y acompañar brotación." },
      { moment: "Mantenimiento", lines: ["2BALANCE"], goal: "Dar continuidad al programa." },
      { moment: "Prefloración y floración", lines: ["2BLOOM"], goal: "Acompañar el momento reproductivo." },
      { moment: "Cuajado y llenado", lines: ["2FRUIT"], goal: "Soportar producción, llenado y engrose." },
      { moment: "Recuperación", lines: ["2GROW"], goal: "Responder después de picos productivos o estrés." },
    ],
    cautions: ["Diferenciar nutrición de problemas sanitarios o radiculares.", "En suelos o aguas difíciles, revisar micronutrientes y condición química antes de escalar el programa.", "La observación del fruto no reemplaza el análisis."],
  },
  {
    slug: "pastos-gramineas",
    name: "Pastos y gramíneas",
    headline: "Más foco en rebrote, biomasa y recuperación del potrero.",
    intro: "En sistemas forrajeros la conversación cambia: importa la respuesta por hectárea, el rebrote, la oferta de forraje, la humedad y la intensidad de corte o pastoreo.",
    context: "2GROW es la línea protagonista para recuperación y respuesta vegetativa; 2BALANCE puede apoyar mantenimiento. Las líneas reproductivas no son el eje de esta guía.",
    stages: [
      { moment: "Inicio de lluvias", lines: ["2GROW"], goal: "Impulsar recuperación y crecimiento vegetativo." },
      { moment: "Crecimiento activo", lines: ["2GROW"], goal: "Acompañar biomasa, brotación y desarrollo foliar." },
      { moment: "Rebrote / recuperación", lines: ["2GROW"], goal: "Responder después de corte o pastoreo." },
      { moment: "Sostenimiento", lines: ["2GROW", "2BALANCE"], goal: "Buscar continuidad y balance del sistema." },
      { moment: "Suelo a recuperar", lines: ["Compost"], goal: "Aportar soporte orgánico y acondicionamiento." },
    ],
    cautions: ["No diagnosticar una pradera rala solo como falta de fertilización.", "Revisar compactación, sequía, encharcamiento y manejo de pastoreo.", "Los líquidos deben tratarse como apoyo puntual, no como única base del programa."],
  },
];

export function getCrop(slug: string) {
  return crops.find((crop) => crop.slug === slug);
}
