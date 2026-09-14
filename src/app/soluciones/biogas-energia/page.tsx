import { SolutionAssessment } from "@/components/solution-assessment";

export default function BiogasEnergiaPage() {
  return <SolutionAssessment
    eyebrow="Digestión anaerobia, biogás y bioenergía"
    title="El potencial energético se mide en el sustrato y se demuestra en operación."
    lead="Un reactor UASB, un digestor de biomasa y un sistema de captura de gas responden a alimentaciones y objetivos diferentes. La prefactibilidad debe conectar caudal, carga orgánica, biodegradabilidad, estabilidad, calidad del gas y uso energético."
    principle="Los rendimientos bibliográficos sirven para formular hipótesis, no para prometer producción. La decisión necesita datos del residuo, pruebas y balance energético."
    fields={[
      { id: "facility", label: "Instalación y proceso actual", help: "Reactor existente, planta nueva, tratamiento de aguas o digestión de sólidos.", placeholder: "Ubicación, tecnología y estado" },
      { id: "substrate", label: "Sustrato o corriente", help: "Origen, variabilidad, contaminantes y forma de alimentación.", placeholder: "Tipo de biomasa o agua residual" },
      { id: "flow", label: "Caudal o masa disponible", help: "Serie temporal, frecuencia y método de medición.", placeholder: "Dato diario, mensual o pendiente" },
      { id: "analysis", label: "Caracterización", help: "ST, SV, DQO, alcalinidad, pH, nutrientes u otros parámetros pertinentes.", placeholder: "Resultados y fecha" },
      { id: "use", label: "Uso esperado del biogás", help: "La demanda define limpieza, almacenamiento y equipos.", options: ["Calor directo", "Sustitución de combustible", "Generación eléctrica", "Uso combinado", "Primero estabilizar captura y quema"] },
    ]}
    questions={[
      "¿Cuál es la carga biodegradable real y cómo varía en el tiempo?",
      "¿Qué rendimiento y estabilidad muestran las pruebas o la operación existente?",
      "¿Qué composición, humedad, presión y contaminantes tiene el biogás?",
      "¿Qué demanda energética coincide con la producción horaria y estacional?",
      "¿Qué seguridad, antorcha, almacenamiento, limpieza y contingencias se requieren?",
    ]}
    evidence={["Series de caudal, carga, temperatura, pH y operación.", "Caracterización del sustrato y pruebas de potencial cuando correspondan.", "Mediciones de caudal y composición de gas en sistemas existentes.", "Perfil de demanda térmica o eléctrica, costos y disponibilidad de equipos."]}
    deliverables={["Balance de masa, DQO o sólidos y energía.", "Escenarios conservador, base y superior con supuestos visibles.", "Diagrama de proceso y necesidades de captura, limpieza, seguridad y uso.", "Plan de medición, piloto o rehabilitación con criterios de decisión."]}
    nextStep="Definir si la prioridad es diagnosticar un reactor existente, medir y capturar gas o estudiar una nueva línea de valorización energética."
    whatsappIntro="Hola Greenatics. Quiero evaluar producción, captura y uso de biogás o bioenergía en una instalación."
  />;
}
