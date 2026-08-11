export type Crop = {
  slug: string;
  name: string;
  headline: string;
  intro: string;
  context: string;
  stages: { moment: string; lines: string[]; goal: string }[];
  cautions: string[];
  alerts: string[];
  followUp: string[];
};

export const fieldChecklist = [
  "Confirmar etapa real del cultivo y objetivo del productor.",
  "Revisar humedad, drenaje, compactación y condición general del suelo.",
  "Consultar análisis de suelo o foliar cuando existan y revisar fertilización reciente.",
  "Observar dónde aparece el problema: planta aislada, manchón, ladera, cabecera de riego o todo el lote.",
  "Identificar si el tejido afectado es viejo, nuevo, brote, yema o fruto.",
  "Definir el equipo y la vía que la finca realmente puede manejar de forma consistente.",
] as const;

export const fieldApplicationRules = [
  "Los productos sólidos se manejan al suelo; en árboles se distribuyen en plato o anillo, sin pegarlos al tallo.",
  "Los líquidos pueden entrar por drench o fertirriego cuando la operación y la ficha vigente lo permitan.",
  "Usar agua limpia, homogenizar correctamente y preparar únicamente la mezcla que se vaya a aplicar.",
  "Evitar aplicaciones sobre plantas marchitas, suelo totalmente seco, sol fuerte o lluvia inminente.",
  "Si el productor mezcla con otros insumos, verificar compatibilidad y realizar prueba previa antes de escalar.",
  "Registrar fecha, lote, producto, condición climática y próximo punto de seguimiento.",
] as const;

export const crops: Crop[] = [
  {
    slug: "cacao",
    name: "Cacao",
    headline: "Nutrición por etapa para construir, florecer y producir.",
    intro: "En cacao, el programa debe leer establecimiento, formación, floración, llenado y recuperación como momentos distintos.",
    context: "La selección es orientativa y debe cruzarse con edad, humedad, sombra, poda, cobertura orgánica, carga productiva y, cuando sea posible, análisis de suelo y foliar.",
    stages: [
      { moment: "Establecimiento", lines: ["Compost", "2GROW"], goal: "Construir base orgánica y acompañar el arranque." },
      { moment: "Formación", lines: ["2GROW", "2BALANCE"], goal: "Mover crecimiento y luego sostener continuidad sin exagerar el empuje vegetativo." },
      { moment: "Prefloración y floración", lines: ["2BLOOM"], goal: "Acompañar la transición reproductiva." },
      { moment: "Formación y llenado", lines: ["2FRUIT"], goal: "Sostener la fase productiva y el llenado de mazorca." },
      { moment: "Pospoda / recuperación", lines: ["2GROW"], goal: "Reactivar brotación y nueva área foliar." },
    ],
    cautions: ["No cerrar una recomendación solo por fórmula.", "Evitar fertilización intensa con el suelo seco.", "Ajustar con sombra, poda, humedad y producción esperada."],
    alerts: ["Síntomas en hojas viejas orientan primero a revisar N, P, K o Mg.", "Síntomas en tejido nuevo exigen revisar Ca, S, Fe, Zn o B y el sistema radicular.", "Problemas por parches requieren revisar drenaje, compactación, sombra y variación de suelo antes de culpar al fertilizante."],
    followUp: ["Color del follaje y fuerza del rebrote.", "Uniformidad del lote y ausencia de estrés después de la aplicación.", "Fecha, producto, clima y próximo paso registrados para repetir correctamente."],
  },
  {
    slug: "cafe",
    name: "Café",
    headline: "Un programa que sigue el ritmo fisiológico del cafetal.",
    intro: "Levante, sostenimiento, prefloración, llenado y recuperación no tienen la misma demanda. Wondergreen organiza la conversación por ese momento del cultivo.",
    context: "La recomendación depende de densidad, sombra, lluvia, carga productiva y condición del lote. La nutrición debe anticiparse al periodo de mayor demanda y los líquidos no sustituyen automáticamente la base al suelo.",
    stages: [
      { moment: "Levante", lines: ["Compost", "2GROW"], goal: "Acondicionar suelo y acompañar brotación y establecimiento." },
      { moment: "Mantenimiento vegetativo", lines: ["2BALANCE"], goal: "Sostener continuidad y equilibrio sin empujar innecesariamente el crecimiento." },
      { moment: "Antesala de floración", lines: ["2BLOOM"], goal: "Acompañar la transición reproductiva antes del periodo de mayor demanda." },
      { moment: "Llenado y desarrollo", lines: ["2FRUIT"], goal: "Acompañar la fase productiva y el desarrollo del fruto." },
      { moment: "Poscosecha / zoca", lines: ["2GROW"], goal: "Recuperar tejido vegetativo y reservas." },
    ],
    cautions: ["No corregir únicamente por lectura visual.", "Revisar carga, acidez, aluminio, humedad y fertilización reciente.", "Restablecer humedad antes de intensificar un programa en plantas severamente estresadas."],
    alerts: ["Amarillamiento de hojas viejas y poco vigor obliga a revisar N y contexto de carga.", "Necrosis en bordes o puntas durante producción orienta a revisar K, agua y presión productiva.", "Patrones tipo V invertida o tejido corchoso justifican revisar B con prioridad."],
    followUp: ["Color del follaje, fuerza del rebrote y uniformidad.", "Respuesta del cafetal frente a la carga productiva y humedad disponible.", "Registro del evento para programar el siguiente momento antes de llegar tarde."],
  },
  {
    slug: "aguacate",
    name: "Aguacate",
    headline: "Formación, floración y llenado requieren decisiones diferentes.",
    intro: "En aguacate joven conviene una nutrición cautelosa y fraccionada; en producción el programa debe leer floración, cuajado, llenado y recuperación.",
    context: "Síntomas nutricionales pueden confundirse con salinidad, pH alto o asfixia radicular. La recomendación debe ligarse a lote, edad, floración, carga, drenaje y disponibilidad de riego.",
    stages: [
      { moment: "Levante y formación", lines: ["Compost", "2GROW"], goal: "Construir base y acompañar establecimiento y desarrollo vegetativo." },
      { moment: "Mantenimiento", lines: ["2BALANCE"], goal: "Sostener continuidad entre fases sin mover el árbol hacia un extremo." },
      { moment: "Prefloración", lines: ["2BLOOM"], goal: "Acompañar la transición reproductiva con el árbol en condición adecuada." },
      { moment: "Cuajado y llenado", lines: ["2FRUIT"], goal: "Sostener la fase productiva, calibre y desarrollo del fruto." },
      { moment: "Poscosecha", lines: ["2GROW"], goal: "Acompañar recuperación del árbol y nueva brotación." },
    ],
    cautions: ["No sobrerrecomendar solo por síntomas visuales.", "Revisar agua y potasio si el fruto pierde calibre o llenado.", "No aplicar producto pegado al cuello del árbol."],
    alerts: ["En sectores de pH alto revisar Fe y Zn antes de generalizar la recomendación.", "Clorosis acompañada de deformación fuerte de brotes o fruto exige revisar B y raíces.", "No intensificar nutrición sobre raíces asfixiadas o lotes encharcados."],
    followUp: ["Brotación, color, uniformidad y respuesta del árbol.", "Comparar árboles bien hidratados con sectores limitados por agua o drenaje.", "Registrar el momento fenológico exacto para la siguiente decisión."],
  },
  {
    slug: "limon-tahiti",
    name: "Limón Tahití",
    headline: "Una nutrición que se mueve con los flujos del cultivo.",
    intro: "El limón Tahití puede combinar brotación, floración y cosecha en distintos momentos del año, por lo que un programa rígido pierde sentido.",
    context: "La recomendación debe seguir el flujo del árbol y considerar edad, carga, rendimiento esperado, suelo, agua, análisis foliar y patrón de producción del lote.",
    stages: [
      { moment: "Formación", lines: ["Compost", "2GROW"], goal: "Construir base y acompañar brotación y desarrollo vegetativo." },
      { moment: "Mantenimiento", lines: ["2BALANCE"], goal: "Dar continuidad sin mover demasiado el árbol hacia crecimiento o producción." },
      { moment: "Prefloración y floración", lines: ["2BLOOM"], goal: "Acompañar el momento reproductivo solo cuando el flujo realmente lo indique." },
      { moment: "Cuajado y llenado", lines: ["2FRUIT"], goal: "Sostener producción, llenado y engrose." },
      { moment: "Recuperación", lines: ["2GROW"], goal: "Recuperar vigor después de picos productivos o estrés." },
    ],
    cautions: ["Diferenciar nutrición de problemas sanitarios o radiculares.", "En suelos o aguas difíciles, revisar micronutrientes y condición química antes de escalar el programa.", "La observación del fruto no reemplaza el análisis."],
    alerts: ["Amarillamiento asimétrico entre mitades de la hoja exige descartar problemas sanitarios antes de asumir deficiencia.", "En suelos calizos o con agua dura revisar Fe, Zn y Mn.", "Daño radicular o anegamiento reduce la respuesta aunque el producto sea adecuado."],
    followUp: ["Color de brotes, floración, cuajado y uniformidad del árbol.", "Respuesta según el flujo fisiológico que tenía el árbol al momento de aplicar.", "Registrar facilidad operativa para poder repetir bien el siguiente evento."],
  },
  {
    slug: "pastos-gramineas",
    name: "Pastos y gramíneas",
    headline: "Más foco en rebrote, biomasa y recuperación del potrero.",
    intro: "En sistemas forrajeros la conversación cambia: importa la respuesta por hectárea, el rebrote, la oferta de forraje, la humedad y la intensidad de corte o pastoreo.",
    context: "La base del programa está en Compost, 2GROW y 2BALANCE. 2GROW protagoniza recuperación y respuesta vegetativa; las líneas reproductivas no son el eje de esta guía.",
    stages: [
      { moment: "Suelo / arranque", lines: ["Compost"], goal: "Aportar base orgánica y acompañar recuperación de condición física del suelo." },
      { moment: "Inicio de lluvias", lines: ["2GROW"], goal: "Impulsar recuperación, color y crecimiento vegetativo." },
      { moment: "Crecimiento activo", lines: ["2GROW"], goal: "Acompañar biomasa, brotación y desarrollo foliar." },
      { moment: "Sostenimiento", lines: ["2BALANCE"], goal: "Mantener continuidad después del empuje vegetativo." },
      { moment: "Tras corte o pastoreo", lines: ["2GROW", "2BALANCE"], goal: "Acompañar rebrote y recuperación según intensidad y humedad." },
    ],
    cautions: ["No diagnosticar una pradera rala solo como falta de fertilización.", "Revisar compactación, sequía, encharcamiento y manejo de pastoreo.", "Los líquidos deben tratarse como apoyo puntual, no como única base del programa."],
    alerts: ["Después del segundo o tercer corte, revisar K si cae la respuesta.", "En sistemas intensivos la extracción puede superar lo que cubre un programa básico.", "Los líquidos no deben convertirse en la base de potreros grandes si la logística no lo soporta."],
    followUp: ["Color y velocidad de rebrote después de corte o salida del ganado.", "Comparación entre potreros o franjas con manejo distinto.", "Fecha, lluvia, carga animal y próxima intervención registrados."],
  },
];

export function getCrop(slug: string) {
  return crops.find((crop) => crop.slug === slug);
}
