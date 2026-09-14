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
  slug: "esp" | "municipios" | "empresas" | "propiedad-horizontal" | "plantas";
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
    slug: "esp",
    audience: "ESP y prestadores",
    eyebrow: "Soluciones Greenatics · Prestación y operación de aseo",
    title: "Preparar, estabilizar y fortalecer una operación que debe funcionar todos los días.",
    lead: "Greenatics acompaña a prestadores que necesitan ordenar el arranque, fortalecer rutas y procesos, mejorar la información, evaluar orgánicos o madurar infraestructura sin confundir asesoría técnica con las responsabilidades regulatorias propias de la persona prestadora.",
    proofTitle: "La operación necesita método antes que capas nuevas de complejidad.",
    proofCopy: "Clientes, actividades, rutas, flota, contingencias, datos, infraestructura y responsabilidades deben leerse como un sistema. La secuencia cambia si la operación está por iniciar, estabilizarse o crecer.",
    path: ["Preparar", "Medir", "Operar", "Estabilizar", "Optimizar", "Escalar"],
    decisions: [
      {
        situation: "Voy a iniciar, ampliar o reorganizar la prestación",
        startWith: "ESP READY",
        copy: "Ordena regulación, clientes, operación, tarifa, facturación, rutas, flota, datos, contingencias e infraestructura futura antes del Día 0 o de una expansión.",
        href: "/soluciones/programas/esp-ready",
      },
      {
        situation: "Necesito datos reales antes de rediseñar rutas o comprometer inversión",
        startWith: "GREENATICS BASE",
        copy: "Construye línea base de generación, caracterización, infraestructura y evidencia sin convertir una medición técnica en una conclusión regulatoria automática.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "Rutas, flota o continuidad operativa son el cuello de botella",
        startWith: "Diseño de rutas selectivas y microrrutas",
        copy: "Parte de usuarios, toneladas, frecuencias, accesos, tiempos, destino y capacidad efectiva antes de dimensionar vehículos o ampliar recorridos.",
        href: "/soluciones/rutas-selectivas",
      },
      {
        situation: "Quiero estructurar un programa de orgánicos con captura real",
        startWith: "Diagnóstico + piloto de orgánicos",
        copy: "Separa potencial teórico de captura efectiva, calidad, impropios, logística y materia útil antes de escoger tecnología o infraestructura.",
        href: "/soluciones/diagnostico-caracterizacion",
      },
      {
        situation: "Tengo una planta o infraestructura que no está rindiendo como debería",
        startWith: "Diagnóstico y rehabilitación",
        copy: "Diferencia brechas de activos, proceso, suministro, personal, mantenimiento y gestión antes de reemplazar equipos o ampliar capacidad.",
        href: "/soluciones/rehabilitacion",
      },
      {
        situation: "Necesito sostener una operación más disciplinada y trazable",
        startWith: "Dirección técnica + datos",
        copy: "Conecta programación, protocolos, mantenimiento, calidad, inventarios, reportes e indicadores con una cadencia de seguimiento definida.",
        href: "/soluciones/direccion-operacion",
      },
    ],
    programSlugs: ["esp-ready", "greenatics-base"],
    moduleIds: ["dia-cero", "rutas-flota", "organicos-piloto", "prefactibilidad-decision", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Antes de iniciar o ampliar",
        title: "Cerrar las decisiones que no pueden llegar abiertas al Día 0.",
        copy: "Aclarar responsabilidades, línea base, actividades, usuarios, rutas, datos, contingencias y criterios de operación antes de aumentar complejidad.",
        serviceSlugs: ["diagnostico-caracterizacion", "rutas-selectivas", "trazabilidad-datos", "direccion-operacion"],
      },
      {
        number: "02",
        kicker: "Durante la estabilización",
        title: "Convertir la prestación en una rutina medible y repetible.",
        copy: "Coordinar procesos, personal, mantenimiento, evidencias, inventarios, indicadores y mejora sin trasladar por defecto a Greenatics obligaciones propias del prestador.",
        serviceSlugs: ["direccion-operacion", "operacion-integral", "motocarguero", "trazabilidad-datos"],
      },
      {
        number: "03",
        kicker: "Antes de crecer o invertir",
        title: "Usar evidencia operativa para decidir infraestructura y escala.",
        copy: "Validar demanda, captura, localización, alternativas, capacidad, costos, operación y permisos aplicables antes de avanzar hacia ingeniería o construcción.",
        serviceSlugs: ["prefactibilidad", "rehabilitacion", "factibilidad-ingenieria", "plantas-nuevas"],
      },
    ],
    ctaTitle: "Cuéntanos qué parte de la operación necesitas preparar o fortalecer.",
    ctaCopy: "Con área de servicio, actividades actuales, usuarios, rutas, infraestructura, datos disponibles y objetivo podemos ubicar el primer bloque de trabajo sin forzar una solución predeterminada.",
  },
  {
    slug: "municipios",
    audience: "Municipios y entidades territoriales",
    eyebrow: "Soluciones Greenatics · Planeación territorial y proyectos",
    title: "De la planeación territorial a decisiones y proyectos que puedan implementarse.",
    lead: "Greenatics apoya al municipio en diagnóstico, PGIRS, programas de orgánicos, estructuración de proyectos, evaluación de activos e infraestructura y seguimiento técnico. El municipio conserva sus competencias; nuestro trabajo es convertir necesidades dispersas en una ruta técnicamente accionable.",
    proofTitle: "Planear no es acumular proyectos. Es ordenar decisiones y responsabilidades.",
    proofCopy: "El PGIRS, la información de generación, las capacidades existentes, los actores, los predios, la logística y los proyectos deben conversar antes de comprometer recursos o declarar una solución como prioritaria.",
    path: ["Diagnosticar", "Planear", "Priorizar", "Madurar", "Articular", "Seguir"],
    decisions: [
      {
        situation: "Debo formular, actualizar o aterrizar el PGIRS",
        startWith: "PGIRS",
        copy: "Conecta línea base, programas, metas, actores, logística, tratamiento, valorización, proyectos e indicadores dentro del instrumento territorial.",
        href: "/soluciones/pgirs",
      },
      {
        situation: "No tengo una línea base suficientemente confiable para priorizar",
        startWith: "GREENATICS BASE",
        copy: "Produce información técnica de generación, caracterización, infraestructura y evidencia para sustentar decisiones posteriores sin sustituir los procedimientos regulatorios aplicables.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "Quiero estructurar o fortalecer un programa territorial de orgánicos",
        startWith: "Diagnóstico + captura real",
        copy: "Mide generación, separación, calidad, impropios, logística y destinos antes de definir metas, rutas, tratamiento o infraestructura.",
        href: "/soluciones/diagnostico-caracterizacion",
      },
      {
        situation: "Existe una planta o activo público subutilizado y debo decidir qué hacer",
        startWith: "Diagnóstico y rehabilitación",
        copy: "Inventaría activos, identifica brechas de proceso y operación y permite comparar recuperación, adecuación, cambio de uso o sustitución con mejor información.",
        href: "/soluciones/rehabilitacion",
      },
      {
        situation: "Estoy evaluando una nueva planta, estación o infraestructura",
        startWith: "Prefactibilidad",
        copy: "Compara necesidad, localización, alternativas, CAPEX/OPEX preliminar, modelo operativo y riesgos antes de comprometer ingeniería o construcción.",
        href: "/soluciones/prefactibilidad",
      },
      {
        situation: "Necesito seguimiento técnico e información comparable entre programas o proyectos",
        startWith: "Trazabilidad e indicadores",
        copy: "Organiza evidencias, hitos, registros e indicadores para que el seguimiento no dependa de archivos aislados ni de reconstrucciones tardías.",
        href: "/soluciones/trazabilidad-datos",
      },
    ],
    programSlugs: ["greenatics-base"],
    moduleIds: ["organicos-piloto", "prefactibilidad-decision", "screening-predios", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Planeación",
        title: "Construir una base territorial útil para decidir.",
        copy: "Revisar generación, corrientes, actores, infraestructura, programas y brechas para que PGIRS y proyectos partan de información utilizable.",
        serviceSlugs: ["diagnostico-caracterizacion", "pgirs", "trazabilidad-datos"],
      },
      {
        number: "02",
        kicker: "Priorización y maduración",
        title: "Separar las ideas de los proyectos que merecen avanzar.",
        copy: "Comparar alternativas, predios, activos existentes, riesgos, costos y modelos operativos antes de llevar una iniciativa a ingeniería, contratación o financiación.",
        serviceSlugs: ["prefactibilidad", "rehabilitacion", "factibilidad-ingenieria"],
      },
      {
        number: "03",
        kicker: "Implementación y seguimiento",
        title: "Conectar el proyecto con responsables, operación y evidencia.",
        copy: "Acompañar puesta en marcha, fortalecimiento técnico, seguimiento e indicadores según el rol de cada actor y el alcance efectivamente contratado.",
        serviceSlugs: ["direccion-operacion", "trazabilidad-datos", "plantas-nuevas"],
      },
    ],
    ctaTitle: "Cuéntanos qué decisión territorial está abierta.",
    ctaCopy: "Con municipio, instrumento o programa involucrado, información disponible, activos existentes y decisión que debe tomarse podemos proponer una primera fase concreta sin convertir toda necesidad en una obra.",
  },
  {
    slug: "empresas",
    audience: "Empresas y grandes generadores",
    eyebrow: "Soluciones Greenatics · Gestión empresarial de residuos",
    title: "De obligaciones y prácticas dispersas a una gestión medible y circular.",
    lead: "Greenatics organiza línea base, planes internos, separación, logística, tratamiento, evidencia e indicadores para que una empresa pueda gestionar sus residuos como un sistema y no como tareas desconectadas.",
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
        situation: "Necesito una solución trazable para mis residuos orgánicos",
        startWith: "Gestión, recolección y tratamiento",
        copy: "Integra programación, criterios de aceptación, recepción, tratamiento, trazabilidad y evidencia de destino según el alcance definido para la corriente.",
        href: "/soluciones/recoleccion-tratamiento",
      },
      {
        situation: "Quiero mejorar rutas internas o externas y sus frecuencias",
        startWith: "Rutas y microrrutas",
        copy: "Ordena puntos, secuencias, horarios, frecuencias, accesos, capacidad y captura de datos antes de estabilizar o escalar la logística.",
        href: "/soluciones/rutas-selectivas",
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
    programSlugs: ["greenatics-base"],
    moduleIds: ["organicos-piloto", "rutas-flota", "prefactibilidad-decision", "acompanamiento-etapas"],
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
        copy: "Comparar alternativas propias, compartidas o tercerizadas y avanzar a ingeniería solo cuando generación, logística, localización y modelo operativo lo justifiquen.",
        serviceSlugs: ["prefactibilidad", "factibilidad-ingenieria", "plantas-nuevas", "rehabilitacion"],
      },
    ],
    ctaTitle: "Cuéntanos dónde se generan los residuos y qué quieres resolver.",
    ctaCopy: "Con tipo de corriente, volumen aproximado, frecuencia, ubicación, separación actual y principal dificultad podemos proponer el primer bloque de trabajo sin sobredimensionar el proyecto.",
  },
  {
    slug: "propiedad-horizontal",
    audience: "Propiedad horizontal, instituciones y redes multiunidad",
    eyebrow: "Soluciones Greenatics · Unidades, sedes y redes",
    title: "Cada unidad conserva su realidad. La red puede compartir método, datos y oportunidades.",
    lead: "Greenatics estructura diagnósticos, planes internos, separación, almacenamiento, rutas, indicadores y seguimiento para una unidad o para redes de edificios, sedes e instituciones que necesitan comparar información sin borrar sus diferencias operativas.",
    proofTitle: "Estandarizar el método no significa volver idénticas las unidades.",
    proofCopy: "La escala aparece cuando cada sede captura la misma clase de información, conserva su contexto y puede agregarse después para detectar patrones, oportunidades logísticas y prioridades de implementación.",
    path: ["Diagnosticar", "Ordenar", "Implementar", "Comparar", "Coordinar", "Mejorar"],
    decisions: [
      {
        situation: "No conozco bien la generación y las condiciones de cada unidad",
        startWith: "GREENATICS BASE",
        copy: "Levanta generación, caracterización, infraestructura y prácticas actuales con una metodología común que luego puede compararse entre sedes.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "Necesito ordenar el plan de una unidad o institución",
        startWith: "PMIRS y planes internos",
        copy: "Estructura corrientes, separación, almacenamiento, rutas, responsables, gestores, indicadores y evidencias según el marco que resulte aplicable.",
        href: "/soluciones/pmirs",
      },
      {
        situation: "Tengo varias unidades y quiero una arquitectura común de información",
        startWith: "PMIRS RED",
        copy: "Conserva el plan y la realidad de cada unidad mientras consolida información comparable para seguimiento, coordinación y oportunidades de red.",
        href: "/soluciones/programas/pmirs-red",
      },
      {
        situation: "Los orgánicos son una corriente relevante y quiero saber qué escala existe",
        startWith: "Diagnóstico + programa de orgánicos",
        copy: "Mide generación, separación, calidad, horarios, accesos y captura potencial antes de diseñar recolección, tratamiento o una solución compartida.",
        href: "/soluciones/diagnostico-caracterizacion",
      },
      {
        situation: "Quiero ordenar rutas y frecuencias entre varias sedes",
        startWith: "Rutas y microrrutas",
        copy: "Cruza ubicación, volumen, ventanas horarias, accesos, destino y capacidad para estructurar una logística basada en demanda real.",
        href: "/soluciones/rutas-selectivas",
      },
      {
        situation: "Necesito ver avances e indicadores de varias unidades en un mismo lugar",
        startWith: "Trazabilidad digital y datos",
        copy: "Organiza registros, evidencias, tareas e indicadores para comparar sin depender de consolidaciones manuales distintas en cada sede.",
        href: "/soluciones/trazabilidad-datos",
      },
    ],
    programSlugs: ["greenatics-base", "pmirs-red"],
    moduleIds: ["organicos-piloto", "rutas-flota", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Unidad",
        title: "Diagnosticar y ordenar cada realidad operativa.",
        copy: "Construir línea base, identificar corrientes, responsabilidades, infraestructura, rutas y brechas antes de comparar unidades entre sí.",
        serviceSlugs: ["diagnostico-caracterizacion", "pmirs", "trazabilidad-datos"],
      },
      {
        number: "02",
        kicker: "Red",
        title: "Consolidar información comparable sin borrar las diferencias.",
        copy: "Usar una metodología común para agregar generación, composición, accesos, horarios, orgánicos, aprovechables y oportunidades de coordinación.",
        serviceSlugs: ["pmirs", "rutas-selectivas", "trazabilidad-datos"],
      },
      {
        number: "03",
        kicker: "Mejora",
        title: "Activar oportunidades solo cuando la escala y la evidencia lo soportan.",
        copy: "Evaluar rutas compartidas, tratamiento, compras, infraestructura o pilotos a partir de datos consolidados y no de una solución uniforme impuesta a todas las unidades.",
        serviceSlugs: ["recoleccion-tratamiento", "prefactibilidad", "trazabilidad-datos"],
      },
    ],
    ctaTitle: "Cuéntanos cuántas unidades o sedes quieres ordenar y qué información ya existe.",
    ctaCopy: "Con ubicación, tipo de unidad, generación aproximada, prácticas actuales y objetivo de la red podemos proponer una fase inicial que funcione desde la primera unidad y pueda escalar después.",
  },
  {
    slug: "plantas",
    audience: "Plantas, operadores y propietarios de infraestructura",
    eyebrow: "Soluciones Greenatics · Infraestructura y operación",
    title: "La infraestructura crea valor cuando puede operar, medirse y mejorar de forma estable.",
    lead: "Greenatics ayuda a diagnosticar plantas existentes, recuperar activos, estabilizar procesos, fortalecer dirección técnica, organizar mantenimiento y datos o madurar expansiones y nueva infraestructura. La primera pregunta no es qué equipo comprar, sino qué brecha limita hoy el sistema.",
    proofTitle: "Antes de reemplazar activos, hay que separar fallas de proceso, operación e infraestructura.",
    proofCopy: "Suministro, recepción, equipos, bioproceso, personal, mantenimiento, calidad, inventarios, salidas y datos deben revisarse juntos. Una planta puede requerir rehabilitación, optimización, dirección o una nueva etapa de ingeniería; no siempre una sustitución completa.",
    path: ["Auditar", "Recuperar", "Estabilizar", "Medir", "Optimizar", "Escalar"],
    decisions: [
      {
        situation: "Tengo infraestructura existente y no sé exactamente dónde está la falla",
        startWith: "Diagnóstico y rehabilitación",
        copy: "Audita activos, proceso, suministro, personal, mantenimiento y gestión para separar causas y priorizar intervenciones antes de invertir.",
        href: "/soluciones/rehabilitacion",
      },
      {
        situation: "La planta funciona, pero necesito más disciplina y estabilidad operacional",
        startWith: "Dirección técnica",
        copy: "Organiza parámetros, protocolos, roles, programación, mantenimiento, calidad, productos, inventarios e informes alrededor de una cadencia de gestión.",
        href: "/soluciones/direccion-operacion",
      },
      {
        situation: "Necesito trazabilidad de recepción, proceso, producción e inventarios",
        startWith: "GREENATICS OPS",
        copy: "Conecta registros operativos y evidencia para que recepción, proceso, lotes, inventarios, tareas y novedades puedan seguirse sobre una misma base.",
        href: "/soluciones/trazabilidad-datos",
      },
      {
        situation: "Estoy considerando ampliar capacidad o construir una nueva planta",
        startWith: "Prefactibilidad",
        copy: "Valida suministro, localización, alternativas, dimensionamiento preliminar, salidas, CAPEX/OPEX y modelo operativo antes de avanzar a ingeniería.",
        href: "/soluciones/prefactibilidad",
      },
      {
        situation: "Ya existe una alternativa viable y necesito madurarla técnicamente",
        startWith: "Factibilidad e ingeniería",
        copy: "Desarrolla balances, proceso, equipos, implantación, cantidades, APU, servicios auxiliares y criterios operativos según el nivel de madurez contratado.",
        href: "/soluciones/factibilidad-ingenieria",
      },
      {
        situation: "Necesito un alcance de operación más amplio dentro de la planta",
        startWith: "Operación integral",
        copy: "Evalúa personal, coordinación, mantenimiento, seguridad, control de ingreso, proceso, producto, inventarios y reportes bajo un modelo contractual explícito.",
        href: "/soluciones/operacion-integral",
      },
    ],
    programSlugs: [],
    moduleIds: ["prefactibilidad-decision", "screening-predios", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Infraestructura existente",
        title: "Diagnosticar antes de intervenir.",
        copy: "Inventariar activos, revisar proceso, suministro, personal, mantenimiento, seguridad, datos y calidad para distinguir reparación, rehabilitación, optimización o sustitución.",
        serviceSlugs: ["rehabilitacion", "direccion-operacion", "trazabilidad-datos"],
      },
      {
        number: "02",
        kicker: "Estabilización",
        title: "Convertir la planta en un sistema operativo repetible.",
        copy: "Alinear parámetros, rutinas, mantenimiento, roles, producción, inventarios, calidad e informes para reducir dependencia de conocimiento informal y reacción a novedades.",
        serviceSlugs: ["direccion-operacion", "operacion-integral", "trazabilidad-datos"],
      },
      {
        number: "03",
        kicker: "Expansión o nueva infraestructura",
        title: "Madurar inversión solo cuando la base operativa y de suministro lo justifican.",
        copy: "Avanzar desde prefactibilidad a ingeniería y construcción únicamente cuando generación, localización, tecnología, salidas y modelo de operación estén suficientemente sustentados.",
        serviceSlugs: ["prefactibilidad", "factibilidad-ingenieria", "plantas-nuevas"],
      },
    ],
    ctaTitle: "Cuéntanos qué infraestructura tienes y qué comportamiento quieres corregir o alcanzar.",
    ctaCopy: "Con tipo de planta, proceso, capacidad de diseño si existe, alimentación real, estado de activos, principales fallas y datos disponibles podemos definir si el primer paso es auditoría, rehabilitación, dirección técnica o maduración de una inversión.",
  },
] as const;

export const audienceSolutionPaths = audienceLandings.map((landing) => `/soluciones/${landing.slug}` as const);
export const getAudienceLanding = (slug: string) => audienceLandings.find((landing) => landing.slug === slug);
