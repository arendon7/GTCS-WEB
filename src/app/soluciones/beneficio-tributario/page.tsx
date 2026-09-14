import { SolutionAssessment } from "@/components/solution-assessment";

export default function BeneficioTributarioPage() {
  return <SolutionAssessment
    eyebrow="Elegibilidad ambiental y expediente técnico"
    title="Primero elegibilidad. Después, cualquier beneficio."
    lead="Una inversión ambiental puede requerir certificaciones, conceptos y soportes específicos antes de recibir tratamiento tributario. Greenatics puede estructurar la evidencia técnica, pero la aplicación fiscal exige revisión jurídica, contable y normativa vigente."
    principle="No todo activo, servicio o proyecto es elegible, y una tasa legal no equivale al beneficio efectivo de una empresa."
    fields={[
      { id: "company", label: "Empresa y actividad económica", help: "Identifica contribuyente, operación y ubicación.", placeholder: "Razón social, sector y territorio" },
      { id: "investment", label: "Inversión proyectada", help: "Describe activos, obras, servicios, fechas y proveedores.", placeholder: "Componentes y presupuesto preliminar" },
      { id: "objective", label: "Objetivo ambiental", help: "Impacto que la inversión busca prevenir, controlar o reducir.", placeholder: "Problema, línea base y resultado esperado" },
      { id: "status", label: "Estado de la decisión", help: "El momento de compra o contratación puede ser relevante.", options: ["Idea o prefactibilidad", "Diseño y cotizaciones", "Proceso de compra", "Inversión ejecutada", "Requiere revisión urgente"] },
      { id: "support", label: "Soportes disponibles", help: "Diseños, cotizaciones, balances, permisos, mediciones y certificaciones.", placeholder: "Documentos disponibles y pendientes" },
    ]}
    questions={[
      "¿Qué norma y procedimiento están vigentes para el tipo de inversión?",
      "¿Qué componentes pueden ser elegibles y cuáles deben excluirse?",
      "¿Qué línea base y beneficio ambiental pueden demostrarse técnicamente?",
      "¿Qué actos, tiempos y aprobaciones deben ocurrir antes de aplicar el tratamiento?",
      "¿Cómo se concilia el expediente ambiental con la posición tributaria de la empresa?",
    ]}
    evidence={["Matriz de activos, obras, servicios, valores y fechas.", "Memorias de diseño, balances y línea base ambiental.", "Cotizaciones, fichas, contratos y soportes de propiedad o uso.", "Concepto jurídico-tributario independiente y normativa vigente."]}
    deliverables={["Matriz preliminar de elegibilidad y exclusiones.", "Documento técnico con metodología, línea base y resultados esperados.", "Índice de soportes, brechas y responsabilidades.", "Ruta de revisión, radicación y respuesta a requerimientos, cuando aplique."]}
    nextStep="Realizar una revisión temprana de elegibilidad antes de comprar, contratar o incluir cifras en un modelo financiero."
    whatsappIntro="Hola Greenatics. Quiero revisar la elegibilidad ambiental y preparar el soporte técnico de una inversión."
  />;
}
