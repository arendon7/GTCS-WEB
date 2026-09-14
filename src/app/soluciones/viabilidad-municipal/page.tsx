import { SolutionAssessment } from "@/components/solution-assessment";

export default function ViabilidadMunicipalPage() {
  return <SolutionAssessment
    eyebrow="Prefactibilidad territorial"
    title="Antes del CAPEX, hay que entender el sistema."
    lead="Una solución municipal se vuelve viable cuando generación, separación, logística, tratamiento, institucionalidad, destinos y financiación caben en una misma ruta de implementación."
    principle="La pregunta no es cuánto podría ahorrar un municipio con un porcentaje fijo. Es qué configuración puede operar, financiar, medir y sostener."
    fields={[
      { id: "territory", label: "Municipio y departamento", help: "Territorio donde se evaluaría la solución.", placeholder: "Ej. Támesis, Antioquia" },
      { id: "population", label: "Población y cobertura atendida", help: "Distingue cabecera, centros poblados y ruralidad.", placeholder: "Población, usuarios o suscriptores" },
      { id: "generation", label: "Generación y caracterización disponibles", help: "Indica fuente, periodo, toneladas y composición.", placeholder: "Dato medido, estimado o pendiente" },
      { id: "current", label: "Sistema actual", help: "Recolección, transferencia, disposición y aprovechamiento existentes.", placeholder: "Infraestructura, operador y destinos" },
      { id: "priority", label: "Prioridad institucional", help: "Selecciona el problema que activa la evaluación.", options: ["Reducir disposición final", "Mejorar operación existente", "Implementar recolección diferenciada", "Aprovechar orgánicos", "Actualizar hoja de ruta"] },
    ]}
    questions={[
      "¿Qué cantidad y calidad de material puede capturarse de forma gradual?",
      "¿Qué parte del sistema ya existe y qué capacidad debe fortalecerse?",
      "¿Cuál es la alternativa logística y tecnológica compatible con el territorio?",
      "¿Qué costos, ingresos, riesgos y responsabilidades deben modelarse?",
      "¿Cómo se implementa por etapas sin comprometer continuidad del servicio?",
    ]}
    evidence={["PGIRS y estudios de caracterización vigentes.", "Bases de usuarios, rutas, frecuencias, pesajes y costos reales.", "Contratos, activos, predios, permisos y capacidades institucionales.", "Destinos actuales y potenciales para materiales y productos."]}
    deliverables={["Línea base técnica, operativa e institucional.", "Alternativas comparadas con supuestos visibles.", "Modelo económico por etapas y análisis de sensibilidad.", "Hoja de ruta con decisiones, responsables, hitos y riesgos."]}
    nextStep="Definir si corresponde un diagnóstico rápido, un estudio de prefactibilidad o la estructuración integral de un proyecto."
    whatsappIntro="Hola Greenatics. Quiero preparar una evaluación de prefactibilidad para un sistema municipal de residuos orgánicos."
  />;
}
