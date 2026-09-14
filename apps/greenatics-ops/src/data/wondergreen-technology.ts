export type WondergreenTechnologyConcept = {
  id: "organomineral" | "oclusion" | "lenta-liberacion";
  number: string;
  name: string;
  headline: string;
  definition: string;
  appliesWhen: string;
  guardrail: string;
};

export type WondergreenEvidenceLevel = {
  number: string;
  name: string;
  meaning: string;
  publicationRule: string;
};

export const wondergreenTechnologyConcepts: readonly WondergreenTechnologyConcept[] = [
  {
    id: "organomineral",
    number: "01",
    name: "Organomineral",
    headline: "La nutrición mineral se integra dentro de una matriz que también contiene una fracción orgánica.",
    definition:
      "En las referencias sólidas aplicables, Wondergreen parte de una base orgánica estabilizada e incorpora componentes minerales de acuerdo con la formulación documentada de cada producto.",
    appliesWhen:
      "Describe la naturaleza y formulación del material únicamente cuando esa condición está documentada para la referencia consultada.",
    guardrail:
      "La palabra organomineral no demuestra por sí sola eficiencia, duración, rendimiento ni respuesta agronómica universal.",
  },
  {
    id: "oclusion",
    number: "02",
    name: "Oclusión",
    headline: "Se explica como integración dentro de la matriz, no como una capa decorativa alrededor del material.",
    definition:
      "Cuando corresponde a la versión técnica, la oclusión describe la incorporación de componentes minerales dentro de la matriz organomineral durante la formulación del sólido.",
    appliesWhen:
      "Debe vincularse a la referencia y versión técnica que realmente documenten esa característica.",
    guardrail:
      "No demuestra una duración específica, una eficiencia porcentual ni una respuesta de rendimiento universal.",
  },
  {
    id: "lenta-liberacion",
    number: "03",
    name: "Lenta liberación",
    headline: "Una característica que debe permanecer vinculada a la referencia y versión que realmente la soporta.",
    definition:
      "Wondergreen puede comunicar lenta liberación en las referencias y versiones donde esa característica esté documentada.",
    appliesWhen:
      "La expresión se usa únicamente donde Product Truth y la documentación técnica vigente la soportan; no se extiende automáticamente a todo el portafolio sólido.",
    guardrail:
      "Lenta liberación no implica por sí sola un tiempo específico, una curva experimental, una dosis, una frecuencia ni una respuesta agronómica universal.",
  },
] as const;

export const wondergreenTechnologyImplications = [
  {
    number: "01",
    title: "El suelo es parte del sistema",
    copy: "La lectura técnica no termina en la fórmula: materia orgánica, humedad, raíz y biología forman parte del contexto de uso.",
  },
  {
    number: "02",
    title: "La etapa cambia la decisión",
    copy: "La misma referencia no se interpreta igual en establecimiento, crecimiento, floración, llenado o recuperación.",
  },
  {
    number: "03",
    title: "La disponibilidad necesita contexto",
    copy: "La forma física y la matriz del producto se leen junto con condiciones de suelo, agua y manejo; no como una promesa aislada.",
  },
  {
    number: "04",
    title: "La evidencia manda",
    copy: "Una característica documentada del producto no se convierte automáticamente en un resultado agronómico universal.",
  },
] as const;

export const wondergreenEvidenceLevels: readonly WondergreenEvidenceLevel[] = [
  {
    number: "A",
    name: "Característica",
    meaning: "Qué es el producto o qué propiedad documentada tiene una referencia concreta.",
    publicationRule: "Puede publicarse desde Product Truth o documentación técnica vigente.",
  },
  {
    number: "B",
    name: "Mecanismo",
    meaning: "Cómo se explica técnicamente el comportamiento de una característica o de la matriz.",
    publicationRule: "Requiere soporte técnico suficiente y lenguaje que no convierta el mecanismo en resultado garantizado.",
  },
  {
    number: "C",
    name: "Beneficio",
    meaning: "Qué ventaja agronómica podría asociarse a una característica bajo un contexto de uso definido.",
    publicationRule: "Requiere evidencia y contexto; no se generaliza automáticamente a todos los cultivos, suelos o manejos.",
  },
  {
    number: "D",
    name: "Resultado",
    meaning: "Respuesta observada o cuantificada en un ensayo, lote, cultivo o condición específica.",
    publicationRule: "Solo se comunica con evidencia específica, alcance, condiciones y fuente identificables.",
  },
] as const;
