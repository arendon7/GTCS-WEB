export type ServiceCategory = "Planeación" | "Recolección" | "Infraestructura" | "Operación" | "Datos" | "Valorización";

export interface Service {
  slug: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  audience: "Municipios y ESP" | "Empresas" | "Ambos";
  headline: string;
  intro: string;
  summary: string;
  solves: string;
  includes: string[];
  challenge: string;
  solution: string;
  activities: string[];
  deliverables: string[];
  scope: string;
  cases: string[];
  cta: string;
  image?: string;
  imageAlt?: string;
  imageCaption?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  family: string;
  audience: "ESP / Municipio" | "Empresa / Gran Generador" | "Agroindustria" | "General";
  scope: string;
  activities: string[];
  deliverables: string[];
  regulations: string[];
}

export const serviceFamilies = [
  { id: "planeacion", title: "1. Planeación & Diagnóstico Territorial", desc: "Líneas base, caracterización de biomasa, formulación PGIRS y PMIRS." },
  { id: "logistica", title: "2. Logística & Microrrutas Selectivas", desc: "Diseño de cobertura, frecuencia, flota, protocolos y captura de datos en campo." },
  { id: "ingenieria", title: "3. Ingeniería & Plantas Modulares", desc: "Prefactibilidad, diseño e implementación de procesos ajustados a la biomasa y a la operación." },
  { id: "operacion", title: "4. Operación Integral & Continuidad Técnica", desc: "Operación directa, operación compartida o dirección técnica, con POE, control de proceso y mejora continua." },
  { id: "digital", title: "5. Capa Digital GREENATICS OPS", desc: "Bitácoras, trazabilidad por lote, control de volúmenes y preparación de datos para reporte." },
  { id: "valorizacion", title: "6. Valorización & Bioinsumos", desc: "Formulación de fertilizantes organominerales y bioles para retorno al campo." },
  { id: "capacitacion", title: "7. Educación & Cultura Ciudadana", desc: "Campañas de separación en la fuente, sensibilización y capacitación de operarios." },
  { id: "auditoria", title: "8. Auditoría & Aseguramiento Técnico", desc: "Interventoría, peritajes técnicos y optimización de plantas existentes." }
];

export const services: Service[] = [
  {
    slug: "diagnostico-residuos",
    name: "Diagnóstico y Caracterización de Residuos",
    category: "Planeación",
    categoryLabel: "Planeación",
    audience: "Municipios y ESP",
    headline: "Línea base técnica, aforos y balance de masa",
    intro: "Levantamiento de información en campo para conocer la generación real, composición y pureza de los residuos orgánicos.",
    summary: "Línea base técnica, aforos en fuente y balance de masa proyectado.",
    solves: "Incertidumbre en volúmenes reales de generación y pureza de biomasa.",
    includes: ["Aforos estadísticos en estratos y comercios", "Análisis de laboratorio C:N y humedad", "Matriz de potencial de aprovechamiento"],
    challenge: "Falta de datos reales de generación y caracterización que llevan a dimensionar plantas erróneas.",
    solution: "Plan de levantamiento y muestreo definido según el tipo de generador, la decisión de diseño y el marco aplicable.",
    activities: ["Aforos en fuentes residenciales y comerciales.", "Análisis de laboratorio de humedad y relación C:N.", "Modelación de curvas de generación."],
    deliverables: ["Documento técnico de caracterización.", "Matriz de potencial de aprovechamiento."],
    scope: "Municipal y regional.",
    cases: ["Yarumal", "Suroeste Antioqueño"],
    cta: "Solicitar diagnóstico territorial"
  },
  {
    slug: "pgirs-pmirs",
    name: "Formulación de PGIRS & PMIRS",
    category: "Planeación",
    categoryLabel: "Planeación",
    audience: "Ambos",
    headline: "Instrumentos de gestión conectados con proyectos ejecutables",
    intro: "Estructuración y actualización de planes de gestión con línea base, metas, responsables, presupuesto y seguimiento.",
    summary: "PGIRS y PMIRS que conectan diagnóstico, proyectos, metas, recursos y responsabilidades.",
    solves: "Planes desactualizados o con metas que no se traducen en proyectos, presupuesto y responsables de ejecución.",
    includes: ["Diagnóstico institucional y normativo", "Formulación de proyectos con presupuesto y metas", "Socialización con actores de la cadena"],
    challenge: "Planes desactualizados o sin proyectos ejecutables de aprovechamiento.",
    solution: "Formulación conforme al marco aplicable y articulada con la capacidad institucional y operativa del cliente.",
    activities: ["Diagnóstico institucional y normativo.", "Formulación de proyectos con presupuesto y metas.", "Socialización con actores de la cadena."],
    deliverables: ["Documento técnico para formulación o actualización.", "Fichas de proyectos, metas e indicadores."],
    scope: "Municipal y corporativo.",
    cases: ["Yarumal", "Empresas Medellín"],
    cta: "Actualizar PGIRS o PMIRS"
  },
  {
    slug: "microrrutas-motocarguero",
    name: "Diseño de Microrrutas con Motocarguero",
    category: "Recolección",
    categoryLabel: "Logística",
    audience: "Municipios y ESP",
    headline: "Microrrutas selectivas diseñadas desde la generación y la topografía",
    intro: "Optimización logística basada en la operación validada en Yarumal, que alcanzó 96,4 % de pureza orgánica en recepción.",
    summary: "Pilotos de recolección que validan generadores, recorridos, frecuencia, capacidad, calidad y costos.",
    solves: "Rutas definidas sin evidencia suficiente sobre suministro, tiempos, calidad del material y costo operativo.",
    includes: ["Trazado georreferenciado de polígonos", "Dimensionamiento de flota y canastillas", "Pesaje digital en punto de entrega"],
    challenge: "Seleccionar un vehículo antes de conocer la carga, el recorrido, la frecuencia, la topografía y el protocolo de entrega.",
    solution: "Una microrruta piloto que integra generadores, recipientes, vehículo compatible, pesaje, novedades y reglas de aceptación.",
    activities: ["Trazado de polígonos de ruteo.", "Dimensionamiento de flota y canastillas.", "Protocolos de entrega con usuarios."],
    deliverables: ["Manual de microrrutas georreferenciado.", "Cronograma operativo."],
    scope: "Cascos urbanos y grandes generadores.",
    cases: ["Yarumal"],
    cta: "Diseñar microrrutas selectivas",
    image: "/projects/routes/motocarguero-verde-operacion-real.webp",
    imageAlt: "Motocarguero verde usado como referencia para recolección diferenciada en barrios urbanos",
    imageCaption: "Vehículo de proximidad para una microrruta que articula separación, frecuencia, recolección y control de calidad."
  },
  {
    slug: "plantas-modulares",
    name: "Ingeniería de Plantas Modulares",
    category: "Infraestructura",
    categoryLabel: "Ingeniería",
    audience: "Ambos",
    headline: "Infraestructura dimensionada desde el balance de masa y la operación",
    intro: "Diseño de plantas y módulos de bioprocesos según suministro, composición, objetivo, implantación, recursos y posibilidades de crecimiento.",
    summary: "Ingeniería de plantas modulares conectada con logística, proceso, operación, productos y expansión por etapas.",
    solves: "Infraestructuras sobredimensionadas o abandonadas por inviabilidad operativa.",
    includes: ["Memorias de cálculo hidráulico y de procesos", "Planos arquitectónicos y constructivos en BIM", "Presupuesto Capex/Opex detallado"],
    challenge: "Inversiones en infraestructura desconectadas del suministro, el personal, los costos recurrentes o el destino de los productos.",
    solution: "Alternativas de compostaje, digestión anaerobia u otros módulos evaluadas dentro de un balance técnico, espacial y operativo.",
    activities: ["Memorias de cálculo hidráulico y de procesos.", "Planos constructivos en AutoCAD/BIM.", "Presupuesto Capex/Opex."],
    deliverables: ["Paquete de ingeniería constructiva.", "Presupuesto y cronograma."],
    scope: "La capacidad se define para cada proyecto con datos de generación, composición y operación.",
    cases: ["Yarumal", "Támesis"],
    cta: "Cotizar ingeniería de planta"
  },
  {
    slug: "operacion-delegada",
    name: "Operación Integral y Continuidad Técnica de Plantas",
    category: "Operación",
    categoryLabel: "Operación",
    audience: "Municipios y ESP",
    headline: "Operación completa, compartida o asistida según la realidad del territorio",
    intro: "Greenatics puede asumir la operación técnica de plantas de tratamiento y aprovechamiento, compartirla con el equipo local o prestar dirección y continuidad técnica.",
    summary: "Operación de plantas con tres modalidades posibles: integral, compartida o mediante dirección y continuidad técnica.",
    solves: "Fallas operativas en plantas públicas y quejas comunitarias por malos olores.",
    includes: ["Operación técnica y personal según alcance", "POE, turnos, mantenimiento y control de variables", "Dirección técnica, GREENATICS OPS e informes de desempeño"],
    challenge: "Plantas públicas con problemas de olores, lixiviados y rechazos de producto.",
    solution: "Un modelo operacional definido para cada planta: Greenatics opera, co-opera con la entidad o dirige técnicamente al equipo local.",
    activities: ["Recepción, triaje, tratamiento, control de proceso y manejo de producto.", "Programación de personal, equipos, mantenimiento, seguridad y contingencias.", "Registro de volúmenes, lotes, novedades, indicadores y acciones de mejora."],
    deliverables: ["Plan de operación y matriz de responsabilidades.", "POE, bitácoras e informes mensuales de desempeño.", "Plan de mantenimiento, control ambiental y mejora continua."],
    scope: "Operación continua, co-operación o acompañamiento técnico mensual.",
    cases: ["Yarumal", "Támesis"],
    cta: "Solicitar propuesta de operación"
  },
  {
    slug: "greenatics-ops",
    name: "Capa Digital GREENATICS OPS",
    category: "Datos",
    categoryLabel: "Digital",
    audience: "Ambos",
    headline: "Bitácoras, volúmenes y trazabilidad para el control operativo",
    intro: "Plataforma para organizar programación, pesajes, recepciones, procesos, lotes, activos, inventario e indicadores.",
    summary: "Estación operativa para capturar actividades, controlar volúmenes y preparar evidencia de gestión.",
    solves: "Información dispersa que dificulta reconstruir qué recibió, procesó y produjo cada operación.",
    includes: ["Registro de pesajes y recepciones", "Bitácoras, procesos y novedades", "Tableros y exportables configurados al alcance"],
    challenge: "Registros dispersos o incompletos que dificultan reconstruir balances, preparar reportes y sustentar decisiones.",
    solution: "Software de operación con vistas de planta, captura estructurada y tableros para seguimiento.",
    activities: ["Configuración de plantas, usuarios y catálogos.", "Capacitación operativa.", "Definición de balances e indicadores."],
    deliverables: ["Acceso a GREENATICS OPS según alcance.", "Plantillas y exportables de información configurados."],
    scope: "Digital global.",
    cases: ["Operación Greenatics"],
    cta: "Solicitar demo de GREENATICS OPS"
  },
  {
    slug: "aprovechamiento-productivo",
    name: "Aprovechamiento Productivo y Bioeconomía",
    category: "Valorización",
    categoryLabel: "Bioeconomía",
    audience: "Ambos",
    headline: "Transformar corrientes orgánicas en productos, energía y valor territorial",
    intro: "Diseño e implementación de rutas de valorización mediante compostaje, digestión anaerobia, biogás, bioenergía, bioles y productos para uso agronómico.",
    summary: "Soluciones para convertir biomasa y subproductos orgánicos en productos útiles, energía renovable y beneficios ambientales medibles.",
    solves: "Corrientes orgánicas tratadas únicamente como costo, residuo o pasivo ambiental.",
    includes: ["Evaluación de alternativas de valorización", "Compostaje, digestión anaerobia, biogás y bioenergía", "Formulación, calidad, usos y mercados de los productos resultantes"],
    challenge: "Elegir una tecnología sin conectar materia prima, proceso, calidad, demanda y sostenibilidad operativa.",
    solution: "Una ruta de bioeconomía que integra balance de masa, tecnología, operación, producto, uso y mercado.",
    activities: ["Caracterización de biomasa y potencial de valorización.", "Diseño de procesos y pruebas de aplicación.", "Estructuración de productos, usos, control de calidad y salidas comerciales."],
    deliverables: ["Matriz de alternativas de aprovechamiento.", "Ruta técnica y económica de valorización.", "Plan de producto, uso o aprovechamiento energético."],
    scope: "Municipal, empresarial y agroindustrial.",
    cases: ["Yarumal", "Támesis"],
    cta: "Evaluar una ruta de valorización"
  },
  {
    slug: "programas-wondergreen",
    name: "Programas Agronómicos Wondergreen",
    category: "Valorización",
    categoryLabel: "Wondergreen",
    audience: "Ambos",
    headline: "Producto, recomendación y seguimiento para suelo y cultivo",
    intro: "Programas que combinan nutrición organomineral Wondergreen, lectura del contexto productivo, plan de uso y acompañamiento técnico.",
    summary: "Nutrición Wondergreen con diagnóstico, recomendación, plan de aplicación y seguimiento según suelo, cultivo, etapa y objetivo.",
    solves: "Compras de insumos desconectadas del suelo, la etapa fisiológica, el manejo y el resultado esperado.",
    includes: ["Diagnóstico y selección de solución", "Plan de aplicación por cultivo y etapa", "Seguimiento técnico, registro de resultados y continuidad de suministro"],
    challenge: "Aplicar una fórmula genérica sin leer la necesidad real del sistema productivo.",
    solution: "Una relación técnica y comercial que conecta producto, protocolo, observación y ajuste.",
    activities: ["Revisión de suelo, cultivo, agua y manejo disponible.", "Selección de productos y construcción del plan de uso.", "Seguimiento de aplicaciones, respuesta y necesidades de ajuste."],
    deliverables: ["Recomendación técnica según alcance.", "Plan de aplicación y seguimiento.", "Registro de observaciones y próximos pasos."],
    scope: "Productores, asociaciones, distribuidores, agroindustria, huertas y jardín.",
    cases: ["Programas Wondergreen"],
    cta: "Construir mi programa Wondergreen"
  }
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const canonicalServices: ServiceItem[] = services.map((s, idx) => ({
  id: `s${idx+1}`,
  name: s.name,
  family: s.category.toLowerCase(),
  audience: s.audience === "Municipios y ESP" ? "ESP / Municipio" : s.audience === "Empresas" ? "Empresa / Gran Generador" : "General",
  scope: s.scope,
  activities: s.activities,
  deliverables: s.deliverables,
  regulations: []
}));

export const municipalServices = services.filter(s => s.audience === "Municipios y ESP" || s.audience === "Ambos");
export const companyServices = services.filter(s => s.audience === "Empresas" || s.audience === "Ambos");
export const environmentalParkModules = [
  ["Recepción, inspección y pesaje", "Registro de origen, cantidad, calidad y novedades antes de admitir el material al proceso."],
  ["Digestión anaerobia", "Módulos configurables para transformar corrientes compatibles, capturar biogás y manejar las salidas del proceso."],
  ["Compostaje", "Proceso aeróbico con conformación de mezclas, seguimiento de variables, maduración y control de calidad."],
  ["Acondicionamiento de producto", "Tamizado, almacenamiento y preparación según las características y el destino definido."],
  ["Biofábrica y salidas de valor", "Espacio para conectar productos resultantes, control de calidad, uso agronómico y mercado."]
];
