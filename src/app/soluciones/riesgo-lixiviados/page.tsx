import { SolutionAssessment } from "@/components/solution-assessment";

export default function RiesgoLixiviadosPage() {
  return <SolutionAssessment
    eyebrow="Prevención y manejo de aguas contaminadas"
    title="Reducir el riesgo empieza por un balance hídrico."
    lead="La generación y composición de lixiviados dependen del material, clima, cubiertas, drenajes, edad del sistema, operación y recirculaciones. Separar orgánicos puede ayudar, pero su efecto debe medirse dentro del sistema completo."
    principle="Un porcentaje fijo de reducción no describe un relleno, una planta ni un patio de proceso. Primero se identifican fuentes, caudales, cargas, rutas hidráulicas y puntos de control."
    fields={[
      { id: "facility", label: "Instalación evaluada", help: "Relleno, estación, planta, patio o centro de acopio.", placeholder: "Nombre, ubicación y operador" },
      { id: "water", label: "Fuentes de agua y lixiviado", help: "Lluvia, escorrentía, humedad del residuo, lavado y proceso.", placeholder: "Fuentes identificadas o pendientes" },
      { id: "flow", label: "Mediciones disponibles", help: "Caudales, volúmenes, lluvias, niveles o balances.", placeholder: "Periodo y método de medición" },
      { id: "quality", label: "Caracterización disponible", help: "Parámetros, laboratorio, puntos y frecuencia.", placeholder: "Resultados o fecha del último análisis" },
      { id: "priority", label: "Problema principal", help: "Selecciona el evento que requiere control.", options: ["Desbordamientos o contingencias", "Alta carga para tratamiento", "Mezcla de aguas limpias y contaminadas", "Costos operativos", "Falta de datos y trazabilidad"] },
    ]}
    questions={[
      "¿Qué fuentes explican el caudal y cómo cambian con la lluvia?",
      "¿Dónde se mezclan aguas limpias, aguas de proceso y lixiviados?",
      "¿Qué carga recibe el tratamiento y cuál es su capacidad real?",
      "¿Qué medidas de prevención reducen caudal antes de ampliar tratamiento?",
      "¿Cómo se comprobará el efecto de cada intervención?",
    ]}
    evidence={["Planos, drenajes, cotas, áreas expuestas y cubiertas.", "Series de lluvia, caudal, niveles y eventos operativos.", "Caracterizaciones con cadena de custodia y puntos identificados.", "Costos, consumos, capacidad y desempeño del tratamiento actual."]}
    deliverables={["Mapa de fuentes, rutas hidráulicas y puntos críticos.", "Balance hídrico y de cargas con incertidumbres.", "Medidas priorizadas de prevención, segregación y tratamiento.", "Plan de monitoreo, contingencia e indicadores de desempeño."]}
    nextStep="Levantar el balance de agua y carga antes de dimensionar obras, tratamiento o ahorros potenciales."
    whatsappIntro="Hola Greenatics. Quiero evaluar y reducir el riesgo asociado a lixiviados o aguas de proceso."
  />;
}
