export interface ProfileItem {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface NeedItem {
  id: string;
  label: string;
  sub: string;
}

export interface DiagnosticRoute {
  badge: string;
  title: string;
  copy: string;
  steps: string[];
  href: string;
  cta: string;
  contactInterest: string;
  contactProfile?: string;
  secondary?: { href: string; cta: string };
}

export const diagnosticProfiles: ProfileItem[] = [
  {
    id: "municipio",
    label: "Municipio / Entidad Pública",
    icon: "🏛️",
    description: "Alcaldías, gobernaciones y equipos de ambiente, planeación y servicios públicos.",
  },
  {
    id: "esp",
    label: "ESP / Operador de Aseo",
    icon: "🚛",
    description: "Prestadores y operadores que organizan recolección, tratamiento y aprovechamiento.",
  },
  {
    id: "empresa",
    label: "Organización / Gran Generador",
    icon: "🏭",
    description: "Empresas, unidades residenciales, centros comerciales e instituciones con una operación que ordenar.",
  },
  {
    id: "agro",
    label: "Productor Agrícola / Finca",
    icon: "🌾",
    description: "Productores, asociaciones y equipos que buscan orientar la nutrición y el manejo del cultivo.",
  },
  {
    id: "hogar",
    label: "Casa, Jardín o Huerta",
    icon: "🏡",
    description: "Personas que cuidan plantas en materas, jardines, huertas familiares o espacios educativos.",
  },
];

export const diagnosticNeeds: Record<string, NeedItem[]> = {
  municipio: [
    { id: "diagnostico", label: "Conocer la generación y las rutas posibles", sub: "Caracterización, línea base y decisión sobre el siguiente estudio" },
    { id: "planta", label: "Diseñar o recuperar infraestructura de tratamiento", sub: "Alternativas, predio, capacidad y fases de ingeniería" },
    { id: "operacion", label: "Dar continuidad técnica a una planta", sub: "Modalidad, responsabilidades, procedimientos y seguimiento" },
    { id: "pgirs", label: "Traducir el PGIRS en proyectos y seguimiento", sub: "Metas, responsables, recursos y articulación territorial" },
  ],
  esp: [
    { id: "ruta", label: "Diseñar una ruta selectiva", sub: "Generadores, vehículo, frecuencia, recepción y calidad del material" },
    { id: "planta", label: "Estudiar una solución de tratamiento", sub: "Corriente, sitio, proceso e infraestructura por fases" },
    { id: "datos", label: "Organizar registros y trazabilidad operativa", sub: "GREENATICS OPS, con acceso y configuración por confirmar" },
    { id: "valorizacion", label: "Definir salidas para la biomasa", sub: "Compostaje, productos, biogás o bioenergía según la corriente" },
  ],
  empresa: [
    { id: "residuos", label: "Organizar la recolección y el tratamiento", sub: "Frecuencia, volumen, separación y destino acordado" },
    { id: "diagnostico", label: "Caracterizar los residuos orgánicos", sub: "Fuentes, composición, continuidad y balance de masa" },
    { id: "planta", label: "Evaluar una solución de tratamiento en sitio", sub: "Alternativas y condiciones del predio, sin paquete estándar" },
    { id: "trazabilidad", label: "Preparar un inventario o reporte climático", sub: "Línea base, fuentes, factores y revisión profesional" },
  ],
  agro: [
    { id: "producto", label: "Conocer los productos Wondergreen", sub: "Fertilizantes sólidos y líquidos, bioinsumos y orientación agronómica" },
    { id: "cultivo", label: "Encontrar una ruta para mi cultivo", sub: "Guías por cultivo, etapa, suelo y objetivo productivo" },
    { id: "volumen", label: "Consultar referencias y presentaciones", sub: "Producto, cantidad, destino y condiciones de suministro" },
    { id: "distribucion", label: "Conversar sobre distribución Wondergreen", sub: "Zona, canal, referencias y condiciones de abastecimiento" },
  ],
  hogar: [
    { id: "kit", label: "Elegir un kit para mi espacio", sub: "Plantas de follaje, flores, huertas y colecciones" },
    { id: "producto", label: "Comparar productos por etapa", sub: "Compost y referencias para necesidades distintas" },
    { id: "guia", label: "Resolver una duda de cuidado", sub: "Etapa, sustrato, raíces, trasplante y huerta" },
    { id: "planta", label: "Orientar una planta antes de elegir", sub: "Observaciones de riego, luz, drenaje y condición general" },
  ],
};

export const diagnosticRoutes: Record<string, DiagnosticRoute> = {
  "municipio:diagnostico": {
    badge: "Planeación territorial",
    title: "Caracterizar antes de dimensionar",
    copy: "Levantamos una línea base de fuentes, volúmenes, composición y continuidad de los residuos. Con sus supuestos visibles, esa información ayuda a decidir qué alternativas estudiar; no reemplaza la ingeniería ni garantiza por sí sola la viabilidad del proyecto.",
    steps: ["Identificar generadores, corrientes y condiciones de entrega.", "Definir aforos y muestreos acordes con la decisión pendiente.", "Comparar rutas potenciales y precisar la información que falta."],
    href: "/servicios/diagnostico-residuos/",
    cta: "Ver diagnóstico y caracterización",
    contactInterest: "diagnostico-residuos",
    contactProfile: "municipio",
    secondary: { href: "/contacto/", cta: "Conversar sobre el alcance" },
  },
  "municipio:planta": {
    badge: "Infraestructura y plantas",
    title: "Definir la fase adecuada para una planta",
    copy: "La alternativa se estudia a partir de la biomasa, el predio, los servicios disponibles y la capacidad local de operación. Prefactibilidad, ingeniería, construcción y puesta en marcha son fases distintas; cada una se delimita para el proyecto.",
    steps: ["Caracterizar el suministro y las condiciones del sitio.", "Comparar alternativas y estimaciones preliminares.", "Acordar el nivel de ingeniería y, por separado, cualquier implementación."],
    href: "/servicios/plantas-modulares/",
    cta: "Ver ingeniería de plantas",
    contactInterest: "plantas-modulares",
    contactProfile: "municipio",
    secondary: { href: "/contacto/", cta: "Conversar sobre una planta" },
  },
  "municipio:operacion": {
    badge: "Operación y continuidad técnica",
    title: "Acordar quién ejecuta y quién dirige la operación",
    copy: "El acompañamiento puede ser integral, compartido o de dirección técnica. Se especifican las tareas, los responsables, los turnos, el mantenimiento y los reportes; GREENATICS OPS puede apoyar el registro si su alcance y acceso se habilitan para el proyecto.",
    steps: ["Revisar proceso, equipo local, activos y responsabilidades vigentes.", "Elegir la modalidad y definir procedimientos, mantenimiento y seguimiento.", "Acordar si se requieren registros digitales y bajo qué condiciones."],
    href: "/servicios/operacion-delegada/",
    cta: "Comparar modalidades de operación",
    contactInterest: "operacion-delegada",
    contactProfile: "municipio",
    secondary: { href: "/contacto/", cta: "Conversar sobre continuidad" },
  },
  "municipio:pgirs": {
    badge: "PGIRS municipal",
    title: "Conectar las metas del PGIRS con proyectos ejecutables",
    copy: "Acompañamos la revisión técnica del instrumento, sus metas y proyectos, y su relación con responsables, recursos y seguimiento. La adopción formal del PGIRS corresponde a la autoridad territorial competente.",
    steps: ["Revisar el instrumento, avances y decisiones pendientes.", "Priorizar programas y proyectos con responsables e indicadores.", "Preparar insumos para implementación, articulación y seguimiento."],
    href: "/servicios/pgirs-pmirs/#pgirs-municipal",
    cta: "Ver la ruta de PGIRS municipal",
    contactInterest: "pgirs-municipal",
    contactProfile: "municipio",
    secondary: { href: "/contacto/", cta: "Conversar sobre el PGIRS" },
  },
  "esp:ruta": {
    badge: "Recolección selectiva",
    title: "Diseñar la ruta con el vehículo y la operación en mente",
    copy: "Describe los generadores, las frecuencias, el recorrido y los puntos de recepción. Si los conoces, añade la carga estimada, las restricciones de acceso y las condiciones actuales de separación; indica si buscas diseñar la ruta, evaluar la configuración del motocarguero o medir un piloto.",
    steps: ["Mapear generadores, accesos, distancias y ventanas de recolección.", "Integrar el motocarguero diseñado conjuntamente al recorrido y a la carga prevista.", "Probar y medir recepción, calidad del material, tiempos y costos para ajustar la ruta."],
    href: "/servicios/microrrutas-motocarguero/",
    cta: "Ver microrrutas y motocarguero",
    contactInterest: "microrrutas-motocarguero",
    contactProfile: "esp",
    secondary: { href: "/contacto/", cta: "Conversar sobre una ruta" },
  },
  "esp:planta": {
    badge: "Tratamiento de orgánicos",
    title: "Estudiar el proceso que corresponde a la corriente",
    copy: "La infraestructura se dimensiona con datos de composición y continuidad, condiciones del predio, servicios, manejo de salidas y capacidad operativa. La solución puede avanzar por fases; la tecnología y la capacidad no se presuponen antes del estudio.",
    steps: ["Caracterizar la corriente y las condiciones de recepción.", "Comparar proceso, predio, capacidad, costos y requerimientos operativos.", "Definir por contrato el nivel de ingeniería y las fases de implementación."],
    href: "/servicios/plantas-modulares/",
    cta: "Explorar ingeniería de plantas",
    contactInterest: "plantas-modulares",
    contactProfile: "esp",
    secondary: { href: "/contacto/", cta: "Conversar sobre tratamiento" },
  },
  "esp:datos": {
    badge: "Datos y operación digital",
    title: "Explorar el flujo público y definir el alcance digital",
    copy: "GREENATICS OPS organiza registros de recepción, pesajes, lotes, activos e indicadores según la operación. La estación pública permite recorrer una muestra; el acceso organizacional, los módulos y la configuración se confirman por separado.",
    steps: ["Identificar sedes, roles y procesos que necesitan registro.", "Explorar la estación pública con información ilustrativa.", "Definir alcance, acceso y acompañamiento antes de configurar el entorno."],
    href: "/servicios/greenatics-ops/",
    cta: "Ver alcance de GREENATICS OPS",
    contactInterest: "greenatics-ops",
    contactProfile: "digital",
    secondary: { href: "/contacto/", cta: "Conversar sobre acceso y configuración" },
  },
  "esp:valorizacion": {
    badge: "Valorización y bioeconomía",
    title: "Elegir una salida viable para cada corriente",
    copy: "Comparamos rutas de compostaje, digestión anaerobia, biogás, bioenergía y productos de uso agronómico según la biomasa, el proceso, la operación y el destino. La combinación y los resultados dependen de las condiciones del proyecto.",
    steps: ["Revisar cantidad, composición y continuidad de la biomasa.", "Comparar proceso, infraestructura y necesidades de operación.", "Definir el destino y las pruebas o controles requeridos para las salidas."],
    href: "/servicios/aprovechamiento-productivo/",
    cta: "Ver rutas de aprovechamiento",
    contactInterest: "aprovechamiento-productivo",
    contactProfile: "esp",
    secondary: { href: "/contacto/", cta: "Conversar sobre valorización" },
  },
  "empresa:residuos": {
    badge: "Organizaciones y grandes generadores",
    title: "Organizar la recolección y el tratamiento recurrentes",
    copy: "Acordamos zona, generadores, separación, volumen, frecuencia, logística, trazabilidad de cargas y destino de tratamiento. El alcance se define por operación; el diseño de microrrutas y la configuración de una herramienta digital son componentes distintos.",
    steps: ["Reconocer sedes, corrientes, almacenamiento y prácticas de separación.", "Definir frecuencia, responsables, logística y control de calidad.", "Acordar trazabilidad, tratamiento y destino de las cargas."],
    href: "/contacto/",
    cta: "Conversar sobre recolección y tratamiento",
    contactInterest: "recoleccion-tratamiento",
    contactProfile: "empresa",
  },
  "empresa:diagnostico": {
    badge: "Diagnóstico y caracterización",
    title: "Conocer la corriente antes de elegir una solución",
    copy: "Caracterizamos fuentes, volúmenes, composición, humedad y continuidad de la biomasa. La línea base y el balance de masa ayudan a comparar rutas, sin convertir el diagnóstico en una promesa de viabilidad o retorno de inversión.",
    steps: ["Precisar fuentes, periodo y decisión que debe orientar el estudio.", "Definir aforos, muestreo y variables relevantes para la ruta evaluada.", "Entregar línea base, balance y alternativas con supuestos trazables."],
    href: "/servicios/diagnostico-residuos/",
    cta: "Ver diagnóstico de residuos",
    contactInterest: "diagnostico-residuos",
    contactProfile: "empresa",
    secondary: { href: "/contacto/", cta: "Conversar sobre el diagnóstico" },
  },
  "empresa:planta": {
    badge: "Infraestructura por fases",
    title: "Evaluar si una planta propia tiene sentido",
    copy: "Comparamos alternativas de proceso y sus condiciones de predio, escala, inversión y operación. No se presupone una tecnología, una capacidad universal ni ausencia de impactos; las estimaciones iniciales no son presupuesto definitivo.",
    steps: ["Caracterizar corrientes, continuidad y restricciones del sitio.", "Comparar alternativas y necesidades de inversión y operación.", "Definir la fase de ingeniería y las condiciones de implementación."],
    href: "/servicios/plantas-modulares/",
    cta: "Ver ingeniería de plantas",
    contactInterest: "plantas-modulares",
    contactProfile: "empresa",
    secondary: { href: "/contacto/", cta: "Conversar sobre alternativas" },
  },
  "empresa:trazabilidad": {
    badge: "Clima, carbono y reportabilidad",
    title: "Preparar un inventario o reporte climático",
    copy: "El acompañamiento profesional define alcance y línea base, revisa fuentes y factores de emisión, y documenta supuestos y límites. Back 2 Green permite organizar el inventario y avanzar con sus soportes a medida que el equipo reúne los datos.",
    steps: ["Precisar organización, periodo y decisión que debe respaldar el reporte.", "Revisar fuentes, factores y calidad de los datos disponibles.", "Acordar metodología, supuestos y entregables del acompañamiento."],
    href: "/huella/",
    cta: "Conocer Back 2 Green",
    contactInterest: "clima-carbono",
    contactProfile: "clima",
    secondary: { href: "/contacto/", cta: "Solicitar acompañamiento climático" },
  },
  "agro:producto": {
    badge: "Productos agrícolas Wondergreen",
    title: "Elegir una referencia según cultivo y objetivo",
    copy: "Wondergreen reúne fertilizantes sólidos organominerales ocluidos, que aportan materia orgánica y favorecen una liberación más gradual de nutrientes y menor volatilización; fertilizantes líquidos de base microbiana vinculados a bioles obtenidos mediante digestión anaerobia multietapa y metanogénesis; y bioinsumos. La selección y la dosis se orientan por cultivo, etapa, suelo y ficha técnica vigente. En la línea líquida 2GROW, 200-0-0 es la formulación de mayor concentración de nitrógeno.",
    steps: ["Identificar cultivo, área, etapa y objetivo de manejo.", "Revisar análisis y prácticas actuales cuando estén disponibles.", "Consultar referencias, presentaciones y condiciones de aplicación."],
    href: "/wondergreen/",
    cta: "Explorar productos Wondergreen",
    contactInterest: "wondergreen",
    contactProfile: "agro",
    secondary: { href: "/contacto/", cta: "Pedir orientación agronómica" },
  },
  "agro:cultivo": {
    badge: "Orientación por cultivo",
    title: "Consultar una ruta según cultivo y etapa",
    copy: "Las guías ayudan a ordenar observaciones, prácticas y nutrición a lo largo del ciclo. La recomendación se ajusta a la información del lote, el suelo y la ficha técnica de cada producto.",
    steps: ["Elegir el cultivo y ubicar su etapa productiva.", "Revisar señales, prácticas y datos disponibles del lote.", "Construir una secuencia de manejo y seguimiento pertinente."],
    href: "/wondergreen/cultivos/",
    cta: "Buscar guías por cultivo",
    contactInterest: "programas-wondergreen",
    contactProfile: "agro",
    secondary: { href: "/contacto/", cta: "Conversar sobre un programa" },
  },
  "agro:volumen": {
    badge: "Referencias y suministro",
    title: "Consultar producto, cantidad y destino",
    copy: "Ordenamos la referencia, presentación, cantidad y ubicación para revisar el suministro aplicable. Una estimación de catálogo no confirma inventario, flete, precio final ni fecha de entrega.",
    steps: ["Seleccionar producto y presentación de interés.", "Indicar cantidad, destino y momento requerido.", "Confirmar disponibilidad y condiciones directamente con el equipo."],
    href: "/wondergreen/#productos",
    cta: "Ver productos y presentaciones",
    contactInterest: "wondergreen",
    contactProfile: "agro",
    secondary: { href: "/contacto/", cta: "Consultar condiciones de suministro" },
  },
  "agro:distribucion": {
    badge: "Distribución Wondergreen",
    title: "Conversar sobre distribución y abastecimiento",
    copy: "Para almacenes, asociaciones y aliados que exploran comercializar Wondergreen, revisamos zona, canal, referencias y condiciones de abastecimiento. La disponibilidad y los acuerdos se confirman para cada conversación.",
    steps: ["Compartir la zona y el tipo de canal o asociación.", "Identificar referencias y demanda que se quiere atender.", "Conversar sobre abastecimiento, acompañamiento y condiciones aplicables."],
    href: "/wondergreen/",
    cta: "Conocer Wondergreen",
    contactInterest: "distribucion-wondergreen",
    contactProfile: "empresa",
    secondary: { href: "/contacto/", cta: "Conversar sobre distribución" },
  },
  "hogar:kit": {
    badge: "Kits Wondergreen por uso",
    title: "Elegir una composición para el espacio que cuidas",
    copy: "Los kits reúnen referencias complementarias y una ruta de cuidado para plantas de follaje, flores, huertas y colecciones. Revisa qué incluye cada composición y sigue las indicaciones de uso de sus productos.",
    steps: ["Identificar qué plantas tienes y dónde crecen.", "Comparar las composiciones según el uso y las referencias incluidas.", "Seguir la guía y revisar la etapa de cada planta antes de aplicar."],
    href: "/casa-jardin/kits/",
    cta: "Ver kits por uso",
    contactInterest: "casa-jardin",
    contactProfile: "hogar",
    secondary: { href: "/contacto/", cta: "Consultar qué kit puede encajar" },
  },
  "hogar:producto": {
    badge: "Productos Casa & Jardín",
    title: "Consultar productos según la etapa de la planta",
    copy: "La etapa orienta la referencia, pero la condición de la planta también importa. Revisa la función descrita en cada ficha y considera sustrato, luz, agua, drenaje y raíces antes de elegir.",
    steps: ["Reconocer la etapa y el tipo de planta.", "Comparar las fichas y presentaciones publicadas.", "Consultar la etiqueta vigente para las instrucciones de uso."],
    href: "/casa-jardin/productos/",
    cta: "Explorar productos",
    contactInterest: "casa-jardin",
    contactProfile: "hogar",
    secondary: { href: "/contacto/", cta: "Consultar sobre un producto" },
  },
  "hogar:guia": {
    badge: "Guías de cuidado",
    title: "Ir a una guía desde la pregunta que tienes",
    copy: "Las guías ayudan a observar la etapa, revisar sustrato y raíces, preparar el trasplante o acompañar una huerta. Consulta los pasos y materiales de apoyo antes de decidir qué producto usar.",
    steps: ["Elegir la guía que responde a tu duda.", "Seguir sus pasos y revisar las condiciones del espacio.", "Volver a las fichas de producto si necesitas comparar referencias."],
    href: "/casa-jardin/guias/",
    cta: "Elegir una guía",
    contactInterest: "casa-jardin",
    contactProfile: "hogar",
    secondary: { href: "/contacto/", cta: "Conversar sobre el cuidado de mi planta" },
  },
  "hogar:planta": {
    badge: "Orientador de plantas",
    title: "Ordenar lo que observas antes de elegir un producto",
    copy: "Riego, luz, drenaje, raíces y sanidad pueden explicar una condición antes de pensar en nutrición. El orientador de Casa & Jardín ayuda a organizar observaciones; no reemplaza la etiqueta ni un diagnóstico especializado.",
    steps: ["Describir la planta, su etapa y el espacio donde crece.", "Revisar agua, luz, drenaje, sustrato y estado de las raíces.", "Consultar una guía o pedir orientación antes de cambiar el manejo."],
    href: "/casa-jardin/#diagnostico",
    cta: "Usar el orientador de plantas",
    contactInterest: "casa-jardin",
    contactProfile: "hogar",
    secondary: { href: "/contacto/", cta: "Pedir orientación Casa & Jardín" },
  },
};

export function buildDiagnosticContactHref(profile: string, route: DiagnosticRoute, selectedNeed: string) {
  const params = new URLSearchParams({
    interes: route.contactInterest,
    perfil: route.contactProfile ?? profile,
    diagnostico: route.title,
    prioridad: selectedNeed,
  });
  return `/contacto/?${params.toString()}`;
}

export function buildDiagnosticDestinationHref(profile: string, route: DiagnosticRoute, selectedNeed: string) {
  const destination = new URL(route.href, "https://greenatics.test");
  if (destination.pathname === "/contacto/") return buildDiagnosticContactHref(profile, route, selectedNeed);

  destination.searchParams.set("perfil", route.contactProfile ?? profile);
  destination.searchParams.set("diagnostico", route.title);
  destination.searchParams.set("prioridad", selectedNeed);
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export function buildDiagnosticSecondaryHref(profile: string, route: DiagnosticRoute, selectedNeed: string) {
  if (!route.secondary) return undefined;

  const destination = new URL(route.secondary.href, "https://greenatics.test");
  if (destination.pathname !== "/contacto/") return route.secondary.href;

  const contact = new URL(buildDiagnosticContactHref(profile, route, selectedNeed), "https://greenatics.test");
  destination.searchParams.forEach((value, key) => {
    if (!contact.searchParams.has(key)) contact.searchParams.append(key, value);
  });
  contact.hash = destination.hash || contact.hash;
  return `${contact.pathname}${contact.search}${contact.hash}`;
}

export function buildDiagnosticRequestDetails(title: string | null, selectedNeed: string | null, mode: "route" | "home" | "organic-flow") {
  const titleLabel = mode === "home" ? "Consulta" : mode === "organic-flow" ? "Escenario consultado" : "Ruta sugerida";
  const needLabel = mode === "home" ? "Contexto de consulta" : mode === "organic-flow" ? "Dato de consulta" : "Necesidad seleccionada";
  return [
    title ? `${titleLabel}: ${title}` : null,
    selectedNeed ? `${needLabel}: ${selectedNeed}` : null,
  ].filter(Boolean).join("\n");
}
