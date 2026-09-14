export type CommercialModule = {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  decision: string;
  signals: readonly string[];
  relatedServiceSlugs: readonly string[];
  guardrail: string;
};

// Commercial decision layer only. Contractual scope remains governed by services.ts.
export const commercialModules: readonly CommercialModule[] = [
  {
    id: "dia-cero",
    kicker: "Arranque operacional",
    title: "Puesta en marcha de operación de aseo",
    summary: "Ordena clientes, actividades, roles, jornada, rutas, vehículos, pesaje, entrega, atención y contingencias para que una operación nueva o ampliada llegue al inicio con responsabilidades y evidencias claras.",
    decision: "¿Qué debe estar resuelto para que el servicio funcione desde el Día 0?",
    signals: ["Clientes y actividades", "Roles y jornada", "Pesaje, entrega y evidencia", "Contingencias y cierre"],
    relatedServiceSlugs: ["direccion-operacion", "rutas-selectivas", "trazabilidad-datos", "operacion-integral"],
    guardrail: "Diseñar o acompañar la puesta en marcha no implica por sí mismo que Greenatics asuma la condición de prestador ni todas las actividades del servicio.",
  },
  {
    id: "rutas-flota",
    kicker: "Logística",
    title: "Rutas, flota y continuidad operativa",
    summary: "Dimensiona la logística a partir de demanda y condiciones reales: usuarios, toneladas, frecuencias, accesos, ventanas horarias, distancias, tiempos, destino, capacidad efectiva y respaldo.",
    decision: "¿Qué configuración logística soporta la demanda sin sobredimensionar la operación?",
    signals: ["Usuarios y toneladas", "Frecuencias y ventanas", "Distancias y tiempos", "Capacidad efectiva y respaldo"],
    relatedServiceSlugs: ["rutas-selectivas", "motocarguero", "direccion-operacion", "trazabilidad-datos"],
    guardrail: "La flota no se prescribe ni se compra desde supuestos: primero se valida demanda, recorrido, destino y continuidad requerida.",
  },
  {
    id: "organicos-piloto",
    kicker: "Orgánicos",
    title: "Programa de orgánicos: captura real y piloto",
    summary: "Separa el potencial teórico de la corriente que realmente puede separarse, capturarse con calidad y llegar como materia útil a un esquema de gestión o tratamiento.",
    decision: "¿Cuánto orgánico útil existe realmente y qué piloto conviene validar antes de escalar?",
    signals: ["Potencial teórico", "Separación real", "Captura efectiva", "Calidad e impropios", "Materia útil"],
    relatedServiceSlugs: ["diagnostico-caracterizacion", "rutas-selectivas", "motocarguero", "recoleccion-tratamiento", "prefactibilidad"],
    guardrail: "El módulo no presupone una planta ni una tecnología. El tratamiento se define después de validar cantidad, calidad, continuidad, logística y destino.",
  },
  {
    id: "prefactibilidad-decision",
    kicker: "Inversión",
    title: "Prefactibilidad de decisiones de infraestructura",
    summary: "Compara alternativas antes de comprometer inversión en transferencia, tratamiento, ampliaciones, nueva infraestructura o tecnología, incluyendo cuando aplique la alternativa de no construir.",
    decision: "¿Existe evidencia suficiente para seguir, esperar, rediseñar o descartar?",
    signals: ["SEGUIR", "ESPERAR", "REDISEÑAR", "DESCARTAR"],
    relatedServiceSlugs: ["prefactibilidad", "factibilidad-ingenieria", "rehabilitacion"],
    guardrail: "La prefactibilidad orienta la decisión y sus siguientes estudios; no equivale automáticamente a factibilidad, ingeniería de detalle, permiso o decisión de inversión.",
  },
  {
    id: "screening-predios",
    kicker: "Localización",
    title: "Screening técnico de predios",
    summary: "Revisión preliminar de compatibilidad física y operativa antes de comprometer un predio para infraestructura de residuos: accesos, distancias, entorno sensible, servicios, riesgos, restricciones, movilidad, expansión y proceso previsto.",
    decision: "¿Qué predios merecen avanzar a verificaciones y estudios de mayor profundidad?",
    signals: ["Accesos y distancias", "Entorno y restricciones", "Servicios y riesgos", "Expansión y proceso"],
    relatedServiceSlugs: ["prefactibilidad", "factibilidad-ingenieria"],
    guardrail: "Es un screening técnico preliminar. No sustituye concepto de uso del suelo, estudio jurídico, licencia, permiso ni pronunciamiento de autoridad competente.",
  },
  {
    id: "acompanamiento-etapas",
    kicker: "Continuidad",
    title: "Acompañamiento por etapas",
    summary: "Permite activar primero las brechas críticas y, a medida que aparece evidencia, avanzar hacia procesos, capacitación, trazabilidad, pilotos, optimización, prefactibilidades e infraestructura.",
    decision: "¿Qué conviene activar ahora y qué debe esperar a que exista mejor información?",
    signals: ["Cerrar brechas críticas", "Implementar y medir", "Pilotear y ajustar", "Madurar proyectos"],
    relatedServiceSlugs: ["direccion-operacion", "trazabilidad-datos", "pgirs", "pmirs", "prefactibilidad"],
    guardrail: "Las etapas son una lógica de maduración, no un cronograma contractual universal. Plazos, responsables y entregables se definen para cada proyecto.",
  },
] as const;
