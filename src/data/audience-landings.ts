export type AudienceDecision = {
  situation: string;
  startWith: string;
  copy: string;
  href: `/${string}`;
};

export type AudienceStage = {
  number: string;
  kicker: string;
  title: string;
  copy: string;
  serviceSlugs: readonly string[];
};

export type AudienceLanding = {
  slug: "esp-municipios" | "empresas-grandes-generadores";
  audience: string;
  eyebrow: string;
  title: string;
  lead: string;
  proofTitle: string;
  proofCopy: string;
  path: readonly string[];
  decisions: readonly AudienceDecision[];
  programSlugs: readonly ("esp-ready" | "greenatics-base" | "pmirs-red")[];
  moduleIds: readonly string[];
  stages: readonly AudienceStage[];
  ctaTitle: string;
  ctaCopy: string;
};

export const audienceLandings: readonly AudienceLanding[] = [
  {
    slug: "esp-municipios",
    audience: "Municipios y empresas de servicios públicos",
    eyebrow: "Soluciones Greenatics · Territorio y operación de aseo",
    title: "De la planeación a una operación preparada para crecer.",
    lead: "Greenatics ayuda a ordenar decisiones de servicio, rutas, orgánicos, datos e infraestructura sin empezar por una compra o una obra. La ruta cambia según la madurez de la operación y las responsabilidades de cada actor.",
    proofTitle: "Primero saber qué está listo y qué falta.",
    proofCopy: "Una ESP que inicia, una operación que amplía cobertura y un municipio que evalúa infraestructura no necesitan el mismo punto de entrada. Organizamos el trabajo por decisión y por etapa.",
    path: ["Preparar", "Medir", "Operar", "Estabilizar", "Decidir", "Escalar"],
    decisions: [
      {
        situation: "Voy a iniciar, ampliar o reorganizar una operación de aseo",
        startWith: "ESP READY",
        copy: "Ordena regulación, clientes, operación, tarifa, facturación, rutas, flota, datos, contingencias e infraestructura futura antes del Día 0 o de una expansión.",
        href: "/soluciones/programas/esp-ready",
      },
      {
        situation: "Necesito datos reales antes de definir rutas, proyectos o inversiones",
        startWith: "GREENATICS BASE",
        copy: "Construye línea base de generación, caracterización, infraestructura, evidencia y lectura operativa sin confundir medición técnica con conclusiones regulatorias.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "Debo formular, actualizar o aterrizar el PGIRS",
        startWith: "PGIRS",
        copy: "Conecta el instrumento territorial con programas, metas, actores, logística, tratamiento, valorización, proyectos e indicadores implementables.",
        href: "/soluciones/pgirs",
      },
      {
        situation: "Rutas, flota o continuidad operativa son hoy el cuello de botella",
        startWith: "Diseño de rutas selectivas y microrrutas",
        copy: "Parte de usuarios, toneladas, frecuencias, accesos, tiempos, destino y capacidad efectiva antes de dimensionar vehículos o ampliar recorridos.",
        href: "/soluciones/rutas-selectivas",
      },
      {
        situation: "Quiero saber cuánto orgánico útil puedo capturar realmente",
        startWith: "Diagnóstico + piloto de orgánicos",
        copy: "Separa potencial teórico de captura efectiva, calidad, impropios, logística y materia útil antes de escoger tecnología o planta.",
        href: "/soluciones/diagnostico-caracterizacion",
      },
      {
        situation: "Estoy evaluando una planta, ampliación o infraestructura existente",
        startWith: "Prefactibilidad",
        copy: "Compara alternativas y madura la decisión antes de comprometer ingeniería, obra o tecnología; incluye la opción de esperar, rediseñar o no construir.",
        href: "/soluciones/prefactibilidad",
      },
    ],
    programSlugs: ["esp-ready", "greenatics-base"],
    moduleIds: ["dia-cero", "rutas-flota", "organicos-piloto", "prefactibilidad-decision", "screening-predios", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Antes de iniciar o ampliar",
        title: "Preparar el modelo y cerrar brechas críticas.",
        copy: "Aclarar responsabilidades, línea base, actividades, usuarios, rutas, datos, contingencias y decisiones que no pueden llegar abiertas al inicio.",
        serviceSlugs: ["diagnostico-caracterizacion", "pgirs", "rutas-selectivas", "trazabilidad-datos"],
      },
      {
        number: "02",
        kicker: "Durante la estabilización",
        title: "Convertir el servicio en una operación repetible.",
        copy: "Coordinar procesos, equipos, mantenimiento, evidencias, inventarios, indicadores y mejora sin confundir acompañamiento técnico con las obligaciones propias de la persona prestadora.",
        serviceSlugs: ["direccion-operacion", "operacion-integral", "motocarguero", "trazabilidad-datos"],
      },
      {
        number: "03",
        kicker: "Antes de invertir",
        title: "Madurar infraestructura con evidencia suficiente.",
        copy: "Validar residuos, localización, alternativas, capacidad, costos, operación y permisos aplicables antes de avanzar hacia ingeniería o construcción.",
        serviceSlugs: ["prefactibilidad", "factibilidad-ingenieria", "rehabilitacion", "plantas-nuevas"],
      },
    ],
    ctaTitle: "Cuéntanos en qué etapa está la operación.",
    ctaCopy: "Con municipio, área de servicio, actividades actuales, usuarios, rutas, infraestructura y objetivo podemos ubicar el punto de entrada sin forzar una solución predeterminada.",
  },
  {
    slug: "empresas-grandes-generadores",
    audience: "Empresas, grandes generadores y redes multiunidad",
    eyebrow: "Soluciones Greenatics · Gestión empresarial de residuos",
    title: "De cumplimiento aislado a gestión medible y circular.",
    lead: "Greenatics organiza la información, los planes, la separación, la logística, el tratamiento y la evidencia para que una empresa pueda gestionar sus residuos como un sistema y no como tareas desconectadas.",
    proofTitle: "Una misma base para decidir, operar y demostrar.",
    proofCopy: "La gestión mejora cuando generación, corrientes, sedes, responsables, rutas, gestores, tratamiento e indicadores comparten una estructura común de información.",
    path: ["Conocer", "Ordenar", "Separar", "Gestionar", "Medir", "Mejorar"],
    decisions: [
      {
        situation: "No tengo una línea base confiable de cuánto y qué genero",
        startWith: "GREENATICS BASE",
        copy: "Levanta generación, caracterización, infraestructura, evidencias y lectura operativa como base reutilizable para planes y decisiones posteriores.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "Necesito ordenar mi plan interno de gestión de residuos",
        startWith: "PMIRS y planes internos",
        copy: "Estructura corrientes, separación, almacenamiento, rutas, responsables, gestores, indicadores y evidencias según el marco aplicable a la organización.",
        href: "/soluciones/pmirs",
      },
      {
        situation: "Tengo varias sedes, unidades o propiedades y quiero una metodología común",
        startWith: "PMIRS RED",
        copy: "Conserva el plan de cada unidad y, al mismo tiempo, consolida información comparable para operar, hacer seguimiento y detectar oportunidades de red.",
        href: "/soluciones/programas/pmirs-red",
      },
      {
        situation: "Necesito una solución trazable para mis residuos orgánicos",
        startWith: "Gestión, recolección y tratamiento",
        copy: "Integra programación, criterios de aceptación, recepción, tratamiento, trazabilidad y evidencia de destino según el alcance definido para la corriente.",
        href: "/soluciones/recoleccion-tratamiento",
      },
      {
        situation: "Quiero saber si tiene sentido invertir en tratamiento propio o compartido",
        startWith: "Prefactibilidad",
        copy: "Compara alternativas antes de comprar equipos o construir: generación, logística, localización, tecnología, salidas, CAPEX/OPEX y modelo operativo.",
        href: "/soluciones/prefactibilidad",
      },
      {
        situation: "Necesito indicadores y evidencia sin rehacer hojas cada mes",
        startWith: "Trazabilidad digital y GREENATICS OPS",
        copy: "Conecta registros operativos, lotes, evidencias, inventarios e indicadores para que el dato nazca donde ocurre la actividad y pueda consolidarse después.",
        href: "/soluciones/trazabilidad-datos",
      },
    ],
    programSlugs: ["greenatics-base", "pmirs-red"],
    moduleIds: ["organicos-piloto", "prefactibilidad-decision", "screening-predios", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Antes de diseñar el plan",
        title: "Construir una línea base que pueda reutilizarse.",
        copy: "Medir y caracterizar corrientes, entender infraestructura y prácticas actuales, identificar responsables y organizar evidencia antes de llenar formatos o definir metas.",
        serviceSlugs: ["diagnostico-caracterizacion", "pmirs", "trazabilidad-datos"],
      },
      {
        number: "02",
        kicker: "Durante la implementación",
        title: "Conectar separación, logística y destino.",
        copy: "Traducir el plan en procedimientos, rutas, frecuencias, criterios de entrega, tratamiento y seguimiento para que la gestión pueda ejecutarse y verificarse.",
        serviceSlugs: ["rutas-selectivas", "recoleccion-tratamiento", "motocarguero", "trazabilidad-datos"],
      },
      {
        number: "03",
        kicker: "Cuando aparece escala suficiente",
        title: "Evaluar infraestructura sin asumir que construir es la respuesta.",
        copy: "Comparar alternativas propias, compartidas o tercerizadas y avanzar a ingeniería solo cuando la generación, logística, localización y modelo operativo lo justifiquen.",
        serviceSlugs: ["prefactibilidad", "factibilidad-ingenieria", "plantas-nuevas", "rehabilitacion"],
      },
    ],
    ctaTitle: "Cuéntanos dónde se generan los residuos y qué quieres resolver.",
    ctaCopy: "Con tipo de corriente, volumen aproximado, frecuencia, ubicación, separación actual y principal dificultad podemos proponer el primer bloque de trabajo sin sobredimensionar el proyecto.",
  },
] as const;

export const audienceSolutionPaths = audienceLandings.map((landing) => `/soluciones/${landing.slug}` as const);
export const getAudienceLanding = (slug: string) => audienceLandings.find((landing) => landing.slug === slug);
