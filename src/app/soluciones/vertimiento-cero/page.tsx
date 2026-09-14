import { SolutionAssessment } from "@/components/solution-assessment";

export default function CircularidadEmpresarialPage() {
  return <SolutionAssessment
    eyebrow="Circularidad y trazabilidad empresarial"
    title="Una meta de desvío necesita balance, destinos y evidencia."
    lead="Reducir la disposición final exige conocer qué se genera, qué puede prevenirse, separarse o aprovecharse y qué rechazos permanecen. Las declaraciones ambientales deben construirse con fronteras, periodos, soportes y metodología."
    principle="Una meta porcentual no equivale a certificación ni a huella de carbono. Cada indicador requiere definición, datos trazables y verificación según el uso que se le dará."
    fields={[
      { id: "organization", label: "Organización y sedes", help: "Delimita instalaciones, procesos y periodo.", placeholder: "Empresa, ubicaciones y alcance" },
      { id: "baseline", label: "Línea base de residuos", help: "Cantidades por corriente, origen, destino y periodo.", placeholder: "Pesajes, facturas, manifiestos o estimaciones" },
      { id: "current", label: "Gestión actual", help: "Prevención, separación, almacenamiento, transporte y gestores.", placeholder: "Prácticas y contratos existentes" },
      { id: "objective", label: "Uso esperado de la información", help: "El nivel de evidencia cambia según el propósito.", options: ["Mejora operativa interna", "Reporte de sostenibilidad", "Meta corporativa de circularidad", "Requisito de cliente", "Proceso de verificación o certificación"] },
      { id: "priority", label: "Corriente prioritaria", help: "Indica dónde se concentra masa, costo o riesgo.", placeholder: "Orgánicos, empaques, lodos, rechazo u otra" },
    ]}
    questions={[
      "¿Cuál es la frontera del indicador y qué periodo se comparará?",
      "¿Qué parte puede prevenirse antes de buscar un destino?",
      "¿Qué destinos tienen capacidad, permisos, trazabilidad y continuidad?",
      "¿Cómo se controlan cambios de inventario, humedad, rechazos y doble conteo?",
      "¿Qué metodología y nivel de verificación exige la declaración prevista?",
    ]}
    evidence={["Pesajes, compras, producción, inventarios y facturas de aseo.", "Contratos, licencias o soportes de gestores y destinos.", "Caracterizaciones por sede, proceso y periodo representativo.", "Metodología corporativa o estándar de reporte que se pretenda utilizar."]}
    deliverables={["Balance de materiales y línea base reconciliada.", "Jerarquía de prevención, reúso, aprovechamiento y disposición.", "Plan de segregación, logística, gestores, indicadores y control documental.", "Expediente de evidencia preparado para revisión o verificación independiente."]}
    nextStep="Construir una línea base reconciliada y priorizar corrientes antes de fijar una meta pública o estimar beneficios."
    whatsappIntro="Hola Greenatics. Quiero estructurar una ruta empresarial de circularidad, desvío y trazabilidad de residuos."
  />;
}
