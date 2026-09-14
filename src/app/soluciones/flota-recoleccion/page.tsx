import { SolutionAssessment } from "@/components/solution-assessment";

export default function FlotaRecoleccionPage() {
  return <SolutionAssessment
    eyebrow="Microrrutas y recolección diferenciada"
    title="Diseñar la ruta antes de escoger el vehículo."
    lead="Motocargueros, vehículos livianos, camiones y puntos de transferencia cumplen funciones distintas. La decisión depende de accesibilidad, densidad, frecuencia, carga útil, calidad del material y conexión con la planta."
    principle="El vehículo no crea por sí solo una microrruta eficiente. La eficiencia aparece cuando generadores, horarios, contenedores, personal, descarga y trazabilidad están coordinados."
    fields={[
      { id: "territory", label: "Zona de operación", help: "Describe barrio, vereda, centro urbano o circuito.", placeholder: "Municipio y sectores" },
      { id: "generators", label: "Generadores atendidos", help: "Cantidad, tipo y concentración espacial.", placeholder: "Hogares, comercio, plazas, instituciones" },
      { id: "material", label: "Material y presentación", help: "Tipo de orgánico, recipientes y nivel de separación.", placeholder: "Corriente, volumen y contaminación observada" },
      { id: "access", label: "Condición de acceso", help: "Pendientes, anchos, radios de giro, tráfico y restricciones.", options: ["Centro urbano compacto", "Laderas y vías estrechas", "Corredor rural disperso", "Operación mixta", "Pendiente por levantar"] },
      { id: "fleet", label: "Flota e infraestructura actuales", help: "Vehículos, personal, parqueo, lavado, transferencia y descarga.", placeholder: "Capacidades disponibles" },
    ]}
    questions={[
      "¿Dónde están los generadores y cuánto material entregan por ventana?",
      "¿Qué frecuencia protege calidad, higiene y continuidad del servicio?",
      "¿Qué carga útil y autonomía se obtienen en la topografía real?",
      "¿Cómo se integran descarga, lavado, mantenimiento y contingencias?",
      "¿Qué indicadores permitirán rediseñar la ruta con datos?",
    ]}
    evidence={["Georreferenciación de generadores y vías.", "Aforos por punto, día y franja horaria.", "Tiempos de ciclo, pendientes, distancias y puntos de descarga.", "Costos observados de personal, energía o combustible y mantenimiento."]}
    deliverables={["Diseño de zonas, secuencias, frecuencias y ventanas.", "Comparación de alternativas de vehículo y transferencia.", "Requerimientos de personal, seguridad, lavado y mantenimiento.", "Tablero de pesajes, novedades, tiempos y calidad de separación."]}
    nextStep="Realizar aforos y una prueba de ruta para validar tiempos, carga útil, autonomía y calidad antes de dimensionar la flota."
    whatsappIntro="Hola Greenatics. Quiero evaluar una microrruta de recolección diferenciada y definir la flota adecuada."
  />;
}
