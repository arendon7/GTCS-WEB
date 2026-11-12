export type ServiceCategory = "Planeación" | "Recolección" | "Infraestructura" | "Operación" | "Datos" | "Valorización";
export type ServiceSlug =
  | "diagnostico-residuos"
  | "pgirs-pmirs"
  | "microrrutas-motocarguero"
  | "plantas-modulares"
  | "operacion-delegada"
  | "greenatics-ops"
  | "aprovechamiento-productivo"
  | "programas-wondergreen";

export interface Service {
  slug: ServiceSlug;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  audience: "Municipios y ESP" | "Empresas" | "Ambos";
  audienceLabel: string;
  headline: string;
  intro: string;
  summary: string;
  solves: string;
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

export const operationDeliverables = [
  {
    title: "Línea base operativa",
    detail: "Balance de materiales, capacidad efectiva, disponibilidad, paradas, calidad y producto, con fuente, unidad, periodo y método para cada indicador.",
  },
  {
    title: "Modelo de trabajo",
    detail: "Criterios de recepción, rutinas por tecnología, responsabilidades entre cliente y operador, controles, atención de novedades y prioridades de mantenimiento para el alcance acordado.",
  },
  {
    title: "Seguimiento de desempeño",
    detail: "Revisión de recepción, proceso, producto terminado, calidad, inventario y despacho; hallazgos convertidos en acciones con responsables y fecha de revisión.",
  },
] as const;

export const serviceAudienceLabels: Record<Service["audience"], string> = {
  "Municipios y ESP": "Municipios y empresas de servicios públicos",
  Empresas: "Organizaciones y grandes generadores",
  Ambos: "Municipios, ESP y organizaciones",
};

export const services: Service[] = [
  {
    slug: "diagnostico-residuos",
    name: "Diagnóstico y Caracterización de Residuos",
    category: "Planeación",
    categoryLabel: "Planeación",
    audience: "Ambos",
    audienceLabel: "Territorios, organizaciones y agroindustria",
    headline: "Conocer la corriente antes de dimensionar la solución",
    intro: "Identificamos dónde y cuándo se generan las corrientes orgánicas, cuánto material se presenta, qué contiene y cómo llega a la recepción. La muestra y el periodo se acuerdan según la decisión: priorizar fuentes, planear recolección o definir qué alternativa de aprovechamiento vale la pena estudiar.",
    summary: "Aforos, muestreo y balances por fuente para conocer disponibilidad, composición y variación de los residuos orgánicos.",
    solves: "Estimaciones globales que no distinguen fuentes, temporadas, composición o condiciones de entrega y dificultan decidir cómo recoger, recibir o aprovechar el material.",
    solution: "Acordamos la pregunta, las fuentes, los periodos y las variables del estudio. Combinamos registros disponibles, aforos, muestreo y balance de masa; separamos datos medidos, estimados y supuestos. La línea base permite priorizar corrientes y comparar rutas logísticas o de aprovechamiento, e identifica qué falta antes de dimensionar. No reemplaza por sí sola una prefactibilidad ni la ingeniería.",
    activities: ["Delimitación de fuentes, generadores, corrientes, temporadas y condiciones de entrega incluidas en el estudio.", "Protocolo de aforos, pesaje y muestreo; caracterización de composición, humedad e impropios según la decisión.", "Balance por fuente y periodo, con datos medidos, estimaciones, supuestos y variación claramente diferenciados.", "Comparación de rutas potenciales de recolección y aprovechamiento, con requisitos por evaluar y brechas de información."],
    deliverables: ["Protocolo y línea base con fuentes, periodo, cobertura, método, unidades y límites de la muestra documentados.", "Balance de masa que distingue información medida, estimada y supuestos del cálculo.", "Matriz de rutas potenciales y datos faltantes para definir el siguiente estudio o decisión de diseño."],
    scope: "Municipal, regional, organizacional y agroindustrial. El alcance define las fuentes y corrientes, los periodos y el nivel de representatividad necesarios para cada decisión.",
    cases: ["Yarumal"],
    cta: "Solicitar diagnóstico de residuos"
  },
  {
    slug: "pgirs-pmirs",
    name: "Formulación y actualización de PGIRS y PMIRS",
    category: "Planeación",
    categoryLabel: "Planeación",
    audience: "Ambos",
    audienceLabel: "Territorios, organizaciones y grandes generadores",
    headline: "Dos escalas de planeación, dos responsabilidades distintas.",
    intro: "El PGIRS ordena la gestión de residuos del territorio; el PMIRS, la de una organización o gran generador. Cambian el alcance, los responsables y el proceso de adopción.",
    summary: "Conectamos los instrumentos territoriales y organizacionales con proyectos, responsables y seguimiento.",
    solves: "Metas de gestión sin proyectos, responsables, recursos, prácticas operativas o seguimiento útil.",
    solution: "Revisamos el instrumento vigente y la decisión pendiente. Conectamos diagnóstico, medidas, responsables y seguimiento; la adopción del PGIRS corresponde a la autoridad territorial.",
    activities: ["PGIRS: revisar instrumento vigente, diagnóstico territorial, avances, actores, metas, programas y relación con los instrumentos de planeación y presupuesto.", "PMIRS: reconocer sedes y procesos, corrientes, puntos de generación, separación, almacenamiento, gestores, responsables y prácticas internas.", "Priorizar proyectos o medidas con responsables, recursos, cronograma e indicadores; definir mecanismos de implementación, divulgación y seguimiento."],
    deliverables: ["PGIRS: insumos de diagnóstico y actualización, programas, proyectos, metas, responsables e indicadores para apoyar la revisión y adopción por la entidad competente.", "PMIRS: diagnóstico organizacional, medidas de manejo por corriente y proceso, responsables, rutas internas, necesidades de formación e indicadores.", "Para ambas rutas: fichas de implementación y seguimiento ajustadas al alcance y a la información disponible."],
    scope: "PGIRS municipal, distrital o regional; PMIRS para organizaciones y grandes generadores residenciales, comerciales, institucionales, de servicios o productivos, según sus características, jurisdicción y obligaciones aplicables. La decisión y adopción formal del PGIRS corresponde a la autoridad territorial competente.",
    cases: [],
    cta: "Elegir mi ruta de planeación"
  },
  {
    slug: "microrrutas-motocarguero",
    name: "Diseño de Microrrutas con Motocarguero",
    category: "Recolección",
    categoryLabel: "Logística",
    audience: "Ambos",
    audienceLabel: "Municipios, ESP y organizaciones",
    headline: "Conectar generación, recolección selectiva y capacidad de tratamiento.",
    intro: "Diseñamos trazado, horarios y frecuencias a partir de los generadores y de lo que realmente puede recibir el sistema. La configuración Greenatics–Auteco se evalúa dentro de esa operación y se valida para cada ruta.",
    summary: "Con Auteco Mobility desarrollamos una configuración sobre base Ceronte. Greenatics diseñó el contenedor para la recolección selectiva de orgánicos. Su integración depende del diagnóstico de generadores y accesos, los tiempos de recorrido y la capacidad de recepción.",
    solves: "Rutas definidas sin evidencia suficiente sobre suministro, tiempos, calidad del material y costo operativo.",
    solution: "Comparamos alternativas de trazado con la demanda por generador, la red vial, las restricciones de acceso, el tiempo de recorrido, la carga útil y las ventanas de recepción. El nivel de precisión y verificación en campo se acuerda según la decisión que deba tomar el cliente.",
    activities: ["Construir el inventario georreferenciado de generadores y puntos de entrega, con tipo de orgánico, cantidades y horarios disponibles según la información existente.", "Trazar y contrastar alternativas sobre la red vial: sentidos, pendientes, accesos, distancias y tiempos; revisar paradas, carga útil, ciclos de recolección y capacidad del punto de recepción.", "Definir con los actores la separación, presentación y entrega del material. Si se contrata un piloto, registrar pesajes, tiempos, novedades, calidad, rechazos y costos observados."],
    deliverables: ["Cartografía y fichas operativas de las microrrutas, con generadores, frecuencias, supuestos y restricciones identificadas.", "Protocolo de coordinación entre generación, recolección y recepción; plan de piloto con variables, responsables y método de registro.", "Informe de piloto que compara el diseño con los datos observados y sustenta ajustes de cobertura, frecuencia, vehículo o recepción."],
    scope: "Para municipios, ESP y organizaciones que requieren recolección selectiva de orgánicos. El motocarguero se integra a la microrruta; suministro, adaptación, operación y soporte se definen según las condiciones de cada proyecto. No se ofrece como venta minorista de vehículo.",
    cases: ["Yarumal"],
    cta: "Evaluar una ruta selectiva",
  },
  {
    slug: "plantas-modulares",
    name: "Ingeniería de Plantas Modulares",
    category: "Infraestructura",
    categoryLabel: "Ingeniería",
    audience: "Ambos",
    audienceLabel: "Municipios, ESP, empresas y agroindustria",
    headline: "Diseñar una planta que responda a la corriente y pueda operarse.",
    intro: "La solución de planta debe responder a la composición y continuidad de los residuos, las condiciones del predio, los servicios disponibles y la capacidad local para operarla.",
    summary: "Prefactibilidad, factibilidad e ingeniería de plantas; construcción y puesta en marcha se acuerdan como fases de implementación.",
    solves: "Infraestructuras sobredimensionadas o abandonadas por inviabilidad operativa.",
    solution: "La información de la corriente y el predio orienta proceso, capacidad, costos y destino de las salidas. La fase contratada define el nivel de detalle y qué datos hace falta levantar.",
    activities: ["Caracterización de suministro, evaluación de predio, servicios, restricciones y activos existentes para definir la base del estudio.", "Comparación de alternativas y estimación preliminar técnico-económica; si se avanza, desarrollo de disciplinas, cantidades, APU, memorias y planos al nivel contratado.", "Preparación de una secuencia de implementación y, cuando esté dentro del alcance, coordinación o ejecución de construcción, montaje, pruebas y puesta en marcha."],
    deliverables: ["Prefactibilidad: alternativas, supuestos, riesgos, necesidades de información y estimaciones preliminares de inversión y operación.", "Factibilidad e ingeniería: memorias, planos, cantidades y APU correspondientes a las disciplinas y nivel de detalle acordados.", "Implementación contratada: plan de trabajo, interfaces, pruebas, puesta en marcha y criterios de entrega definidos para ese contrato."],
    scope: "Municipal, empresarial y agroindustrial. La capacidad se define para cada proyecto con datos de generación, composición y operación. La prefactibilidad no es un presupuesto definitivo; los estudios no incluyen automáticamente construcción, compra de equipos o puesta en marcha.",
    cases: ["Yarumal", "Támesis"],
    cta: "Definir la fase de mi proyecto"
  },
  {
    slug: "operacion-delegada",
    name: "Dirección técnica y operación de plantas",
    category: "Operación",
    categoryLabel: "Operación",
    audience: "Ambos",
    audienceLabel: "Municipios, ESP, empresas y agroindustria",
    headline: "Del material que llega al producto despachado: una operación bajo control.",
    intro: "Cuando suministro, recepción, proceso, mantenimiento y turnos se gestionan por separado, la planta puede perder capacidad sin que el equipo vea con claridad dónde se interrumpe el flujo. Greenatics articula dirección técnica y ejecución para conectar cada etapa, acordar controles adecuados a la tecnología y convertir los registros del día a día en decisiones y acciones de mejora.",
    summary: "Integramos suministro, recepción, proceso, equipos, turnos y salida del producto con criterios e indicadores acordados. Tu equipo puede reconocer qué está frenando la operación, priorizar una corrección y revisar su efecto en el siguiente ciclo.",
    solves: "Cuando cambia el material que llega, se detiene un equipo o la información queda repartida entre turnos, la capacidad instalada no siempre se convierte en material procesado ni en producto disponible. Al mezclar recepción, rechazo, proceso, producción e inventario, se ocultan pérdidas y cuellos de botella. El cliente termina reaccionando a incidentes sin saber qué factor conviene corregir primero.",
    solution: "Partimos de la corriente, la capacidad efectiva, los equipos y la forma de trabajo de la planta. Con esa lectura fijamos criterios de recepción, controles de proceso, rutinas de mantenimiento y responsabilidades; luego dirigimos, compartimos o asumimos la operación según la modalidad contratada. Buscamos sostener la continuidad, aprovechar mejor la infraestructura, reducir paradas, pérdidas y reprocesos, y producir con calidad consistente. Una línea base permite priorizar el cambio y comprobar, con el indicador y el periodo acordados, si la corrección funcionó o requiere otro ajuste.",
    activities: ["Levantamos junto al equipo el flujo de materiales, la variación del suministro, la capacidad por etapa, las horas disponibles, las paradas, los turnos y el estado de los equipos. Así identificamos dónde se interrumpe el paso entre material recibido, material procesado y producto terminado.", "Definimos controles adecuados a cada proceso. En compostaje pueden incluir mezcla, humedad, temperatura, aireación y maduración; en digestión anaerobia, alimentación, pH, caudal y tiempo de retención. Los responsables y las rutinas de contingencia, mantenimiento y control de calidad responden a la tecnología y los riesgos de la planta.", "Acompañamos la ejecución según la modalidad acordada. Registramos desviaciones con su contexto, priorizamos causas, asignamos acciones y comparamos el siguiente ciclo para sostener lo que funciona y corregir lo que sigue limitando la producción."],
    deliverables: operationDeliverables.map(({ title, detail }) => `${title}: ${detail}`),
    scope: "Municipios y ESP pueden coordinar mejor generadores, recolección, recepción y tratamiento. Las empresas pueden localizar pérdidas, paradas y costos que afectan su operación. Las agroindustrias pueden ordenar el uso de biomasa propia y planear el suministro necesario para producir. La modalidad se define según tecnología, infraestructura, continuidad del material y equipo disponible. Personal, turnos, mantenimiento, seguridad y responsabilidades quedan delimitados en el contrato; los cambios de continuidad, rendimiento, calidad y costo se revisan contra una línea base y un método acordado.",
    cases: [],
    cta: "Solicitar propuesta de operación"
  },
  {
    slug: "greenatics-ops",
    name: "GREENATICS OPS · Operación digital",
    category: "Datos",
    categoryLabel: "Herramientas digitales",
    audience: "Ambos",
    audienceLabel: "Operadores de planta y organizaciones",
    headline: "Cada turno deja el contexto que el siguiente necesita.",
    intro: "Cuando programación, recepción, actividades, mantenimiento y producción se registran en lugares distintos, coordinación invierte tiempo reconstruyendo lo ocurrido y puede perder la relación entre una novedad y el trabajo que la originó. GREENATICS OPS conecta el flujo de la planta en registros que se pueden revisar por actividad, responsable y periodo.",
    summary: "GREENATICS OPS organiza programación, actividades, recepciones, lotes, mantenimiento, producción e inventarios para seguir la ejecución de la planta y consultar su historial. La configuración, los módulos y el acceso se acuerdan según cada proyecto.",
    solves: "Registros dispersos, dificultad para contrastar lo programado con lo ejecutado, novedades de mantenimiento enterradas en comentarios y retrabajo al reconstruir periodos para reportar o decidir.",
    solution: "OPS conecta la programación con el calendario, la actividad ejecutada, su registro técnico, las evidencias o incidencias y su revisión. Operación captura la información del trabajo; coordinación identifica faltantes y desviaciones; dirección consulta indicadores e historial. El tablero operativo se alimenta del flujo de captura y reduce la reconstrucción manual de reportes. Disponibilidad, acceso, persistencia, perfiles y módulos se confirman antes de acordar una implementación.",
    activities: ["Acordar sedes, roles, catálogos y procesos que cada equipo necesita gestionar.", "Configurar los registros pertinentes para programación, actividades, recepción, lotes, equipos, mantenimiento, producción e inventario.", "Definir indicadores, vistas, capacitación y revisión periódica para que la información de operación sirva a coordinación y dirección."],
    deliverables: ["Alcance del proyecto con perfiles, sedes, módulos, accesos y responsabilidades confirmados.", "Flujos, catálogos y registros definidos para las actividades y controles incluidos.", "Vistas e indicadores operativos acordados, acompañamiento de adopción y criterios para revisar calidad y continuidad de la información."],
    scope: "Municipal, empresarial y agroindustrial; desde una planta hasta una operación multi-sede.",
    cases: [],
    cta: "Explorar el entorno público"
  },
  {
    slug: "aprovechamiento-productivo",
    name: "Aprovechamiento Productivo y Bioeconomía",
    category: "Valorización",
    categoryLabel: "Bioeconomía",
    audience: "Ambos",
    audienceLabel: "Territorios, empresas y agroindustria",
    headline: "Elegir una ruta exige entender la corriente completa.",
    intro: "No todas las rutas funcionan para cualquier biomasa. Contrastamos composición, volumen, estacionalidad, logística y condiciones de operación para identificar qué alternativas vale la pena estudiar.",
    summary: "Comparamos alternativas para transformar biomasa en compost, bioenergía o insumos agrícolas. La decisión parte de la corriente y su contexto, no de una tecnología predeterminada.",
    solves: "Falta información para elegir entre alternativas de aprovechamiento o se está avanzando sin contrastar sus requisitos.",
    solution: "Conectamos la biomasa con los requisitos de proceso y los usos posibles. El análisis orienta el siguiente paso: ampliar el estudio, probar una alternativa o preparar su diseño.",
    activities: ["Caracterizar continuidad, composición, estacionalidad, logística y restricciones de manejo de la biomasa.", "Comparar alternativas de proceso y sus requisitos técnicos, operativos, económicos y de infraestructura.", "Definir qué análisis, prueba o fase de diseño permitiría reducir incertidumbre antes de implementar."],
    deliverables: ["Matriz de rutas con criterios técnicos, operativos y económicos explícitos.", "Diagrama de proceso y balance preliminar de entradas y salidas.", "Hoja de ruta para pruebas, implementación y aprovechamiento de productos o energía."],
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
    audienceLabel: "Productores, asociaciones y agroindustria",
    headline: "Del potencial de tu cultivo a un programa de nutrición que puedas evaluar en campo.",
    intro: "Un mismo producto no responde igual en todos los cultivos ni en todos los lotes. Por eso, el programa parte de la meta del productor y de la evidencia disponible: qué cultivar, dónde está, en qué etapa se encuentra y qué condiciones de suelo, agua y manejo pueden orientar la nutrición.",
    summary: "Diseñamos programas Wondergreen por cultivo, lote y etapa. Si el proyecto lo requiere, acompañamos un ensayo para revisar resultados y decidir qué ajustar, repetir o ampliar.",
    solves: "Pasar de aplicaciones definidas por costumbre a una estrategia de nutrición relacionada con el cultivo, la etapa, el lote y una meta productiva concreta.",
    solution: "Partimos de la decisión del productor y revisamos cultivo, variedad, etapa, análisis disponibles, suelo, agua, prácticas y costos. Con esa lectura seleccionamos las referencias pertinentes de compost, fertilizantes y bioinsumos, según sus fichas y etiquetas vigentes; no usamos recetas ni dosis generales. Si hace falta comprobar la estrategia, acordamos un ensayo con área, comparación, variables y calendario. Los resultados ayudan a decidir qué ajustar, repetir o ampliar con la evidencia y los costos del caso.",
    activities: ["Precisar cultivo, variedad, lote, etapa, objetivo productivo y prácticas actuales; revisar los análisis disponibles y reconocer la información que falta.", "Construir una estrategia agronómica por cultivo y etapa, integrando solo las familias Wondergreen pertinentes y respetando la ficha y etiqueta vigentes de cada referencia.", "Cuando se acuerde un ensayo, definir comparación, área, variables y fechas de seguimiento para revisar respuesta, costos y uso de nutrientes antes de decidir si ajustar, repetir o ampliar."],
    deliverables: ["Lectura del cultivo y del lote, con objetivo, evidencia consultada y criterios que orientan el programa.", "Programa de nutrición y ruta de seguimiento con referencias pertinentes y condiciones de uso verificadas en la ficha y etiqueta vigentes de cada SKU.", "Si forma parte del alcance, diseño de ensayo y registro para valorar respuesta del cultivo, costos, uso de nutrientes y oportunidades de circularidad."],
    scope: "Para productores, asociaciones y proyectos agroindustriales que quieren ordenar decisiones de nutrición por cultivo, lote y etapa. El alcance se acuerda según el área, la meta productiva, la información disponible y la capacidad de seguimiento del equipo.",
    cases: [],
    cta: "Diseñar un programa para mi cultivo"
  }
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export const relatedServiceSlugs: Partial<Record<Service["slug"], Service["slug"][]>> = {
  "diagnostico-residuos": ["pgirs-pmirs", "plantas-modulares"],
  "pgirs-pmirs": ["diagnostico-residuos", "microrrutas-motocarguero"],
  "microrrutas-motocarguero": ["greenatics-ops", "operacion-delegada"],
  "plantas-modulares": ["operacion-delegada", "aprovechamiento-productivo"],
  "operacion-delegada": ["greenatics-ops", "plantas-modulares"],
  "greenatics-ops": ["operacion-delegada", "microrrutas-motocarguero"],
  "aprovechamiento-productivo": ["programas-wondergreen", "plantas-modulares"],
  "programas-wondergreen": ["aprovechamiento-productivo"],
};

export const relatedServiceDetails: Partial<Record<ServiceSlug, Partial<Record<ServiceSlug, { reason: string; action: string }>>>> = {
  "diagnostico-residuos": {
    "pgirs-pmirs": { reason: "La línea base ayuda a priorizar programas, medidas y seguimiento.", action: "Ver rutas de planeación" },
    "plantas-modulares": { reason: "La caracterización permite dimensionar alternativas y capacidad de proceso.", action: "Revisar fases de ingeniería" },
  },
  "pgirs-pmirs": {
    "diagnostico-residuos": { reason: "Cuando faltan datos de generación, una caracterización fortalece las decisiones del instrumento.", action: "Conocer el diagnóstico" },
    "microrrutas-motocarguero": { reason: "Las medidas de separación se concretan en recorridos, frecuencias y puntos de recepción.", action: "Diseñar una microrruta" },
  },
  "microrrutas-motocarguero": {
    "greenatics-ops": { reason: "El registro de pesajes y novedades facilita revisar lo ocurrido en cada jornada.", action: "Explorar GREENATICS OPS" },
    "operacion-delegada": { reason: "La ruta debe coordinarse con la recepción y las rutinas de la planta.", action: "Conocer modalidades de operación" },
  },
  "plantas-modulares": {
    "operacion-delegada": { reason: "El diseño debe considerar quién opera, mantiene y hace seguimiento a la planta.", action: "Definir responsabilidades operativas" },
    "aprovechamiento-productivo": { reason: "Las corrientes y salidas posibles orientan la comparación de procesos.", action: "Evaluar rutas de valorización" },
  },
  "operacion-delegada": {
    "greenatics-ops": { reason: "Los registros pueden apoyar el seguimiento de recepciones, procesos y novedades.", action: "Explorar GREENATICS OPS" },
    "plantas-modulares": { reason: "Si la infraestructura condiciona la continuidad, conviene revisar alternativas de adecuación o diseño.", action: "Revisar fases de ingeniería" },
  },
  "greenatics-ops": {
    "operacion-delegada": { reason: "La herramienta acompaña rutinas; los roles y responsabilidades se acuerdan para cada operación.", action: "Conocer modalidades de operación" },
    "microrrutas-motocarguero": { reason: "La información de rutas y recepción puede conectarse con el seguimiento del proceso.", action: "Diseñar una microrruta" },
  },
  "aprovechamiento-productivo": {
    "programas-wondergreen": { reason: "El uso agronómico requiere relacionar producto, cultivo, etapa y condiciones de aplicación.", action: "Conocer el acompañamiento agronómico" },
    "plantas-modulares": { reason: "La infraestructura se compara según la biomasa disponible y las salidas que se quieran evaluar.", action: "Revisar fases de ingeniería" },
  },
  "programas-wondergreen": {
    "aprovechamiento-productivo": { reason: "La disponibilidad de biomasa puede abrir una evaluación de opciones de aprovechamiento.", action: "Evaluar rutas de valorización" },
  },
};

export const serviceCaseRoutes: Record<string, string> = {
  Yarumal: "/proyectos/yarumal/",
  Támesis: "/proyectos/tamesis/",
};

export const serviceCaseLabels: Record<string, string> = {
  Yarumal: "Yarumal · caso municipal",
  Támesis: "Támesis · caso territorial",
};

export const environmentalParkModules = [
  ["Recepción, inspección y pesaje", "Registro de origen, cantidad, calidad y novedades antes de admitir el material al proceso."],
  ["Digestión anaerobia", "Módulos configurables para transformar corrientes compatibles, capturar biogás y manejar las salidas del proceso."],
  ["Compostaje", "Proceso aeróbico con conformación de mezclas, seguimiento de variables, maduración y control de calidad."],
  ["Acondicionamiento de producto", "Tamizado, almacenamiento y preparación según las características y el destino definido."],
  ["Biofábrica y salidas de valor", "Espacio para conectar productos resultantes, control de calidad, uso agronómico y mercado."]
];
