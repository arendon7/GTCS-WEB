import type { AudienceLanding } from "./audience-landings";

export type IntentLanding = Omit<AudienceLanding, "slug"> & {
  slug: "residuos-organicos" | "infraestructura-plantas" | "propiedad-horizontal-redes";
};

export const intentLandings: readonly IntentLanding[] = [
  {
    slug: "residuos-organicos",
    audience: "Residuos orgánicos",
    eyebrow: "Soluciones Greenatics · Separación, captura, logística y tratamiento",
    title: "Del potencial orgánico a una corriente útil y trazable.",
    lead: "Greenatics ayuda a medir, separar, capturar, transportar y tratar residuos orgánicos con evidencia suficiente para mejorar la operación o decidir si tiene sentido escalar hacia nueva infraestructura.",
    proofTitle: "Orgánico potencial no es lo mismo que orgánico útil.",
    proofCopy: "Antes de dimensionar rutas, equipos o plantas distinguimos generación potencial, separación real, captura efectiva, calidad, impropios y materia que realmente puede llegar a tratamiento.",
    path: ["Medir", "Separar", "Capturar", "Transportar", "Tratar", "Escalar"],
    decisions: [
      {
        situation: "No sé cuánto orgánico genero ni con qué calidad",
        startWith: "GREENATICS BASE",
        copy: "Construye una línea base de generación, caracterización, puntos de origen, infraestructura y evidencia antes de definir metas, frecuencias o inversión.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "La separación es irregular o tengo demasiados impropios",
        startWith: "Diagnóstico y caracterización",
        copy: "Identifica cantidad, composición, frecuencia, puntos críticos y condiciones de separación para saber qué parte de la corriente puede gestionarse con mayor calidad.",
        href: "/soluciones/diagnostico-caracterizacion",
      },
      {
        situation: "Necesito validar la logística antes de ampliar una ruta",
        startWith: "Diseño de rutas selectivas",
        copy: "Ordena generadores, frecuencias, ventanas, secuencias, destino y captura de datos; cuando aplica, un piloto permite probar tiempos y volúmenes antes de escalar.",
        href: "/soluciones/rutas-selectivas",
      },
      {
        situation: "Necesito una gestión continua con evidencia de tratamiento",
        startWith: "Gestión, recolección y tratamiento",
        copy: "Integra programación, criterios de aceptación, recepción, tratamiento y trazabilidad para que la gestión no termine en una simple recolección sin evidencia de destino.",
        href: "/soluciones/recoleccion-tratamiento",
      },
      {
        situation: "Necesito saber qué pasó con cada entrega o tonelada",
        startWith: "Trazabilidad digital y GREENATICS OPS",
        copy: "Conecta origen, ruta, recepción, proceso, producto, inventario y destino para reducir reprocesos y sostener indicadores sobre registros operativos.",
        href: "/soluciones/trazabilidad-datos",
      },
      {
        situation: "Estoy pensando en tratamiento propio, compartido o nueva infraestructura",
        startWith: "Prefactibilidad",
        copy: "Compara suministro, logística, localización, alternativas de proceso, salidas, CAPEX/OPEX preliminar y modelo operativo antes de comprar tecnología o construir.",
        href: "/soluciones/prefactibilidad",
      },
    ],
    programSlugs: ["greenatics-base"],
    moduleIds: ["organicos-piloto", "rutas-flota", "prefactibilidad-decision", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Antes de prometer captura",
        title: "Medir cuánto existe y cuánto puede separarse bien.",
        copy: "Caracterizar generación, calidad, impropios, puntos de origen y condiciones de entrega para separar potencial teórico de captura efectiva.",
        serviceSlugs: ["diagnostico-caracterizacion", "rutas-selectivas", "motocarguero"],
      },
      {
        number: "02",
        kicker: "Durante la operación",
        title: "Conectar logística, recepción, tratamiento y evidencia.",
        copy: "Estabilizar frecuencias, criterios de aceptación, registros y seguimiento para que la corriente conserve trazabilidad desde el generador hasta su tratamiento.",
        serviceSlugs: ["recoleccion-tratamiento", "trazabilidad-datos", "direccion-operacion"],
      },
      {
        number: "03",
        kicker: "Cuando aparece escala",
        title: "Evaluar infraestructura sin asumir que construir es la respuesta.",
        copy: "Comparar alternativas propias, compartidas o tercerizadas y avanzar a ingeniería solo cuando cantidad, calidad, continuidad, logística y modelo operativo lo justifiquen.",
        serviceSlugs: ["prefactibilidad", "factibilidad-ingenieria", "plantas-nuevas", "rehabilitacion"],
      },
    ],
    ctaTitle: "Cuéntanos cómo nace y dónde termina hoy la corriente orgánica.",
    ctaCopy: "Con tipo y origen del residuo, volumen aproximado, frecuencia, ubicación, separación actual y destino podemos ubicar el primer bloque de trabajo sin presuponer una ruta, tecnología o planta.",
  },
  {
    slug: "infraestructura-plantas",
    audience: "Infraestructura, plantas y proyectos",
    eyebrow: "Soluciones Greenatics · Prefactibilidad, ingeniería, rehabilitación y operación",
    title: "La primera decisión no es construir. Es saber si vale la pena avanzar.",
    lead: "Greenatics madura proyectos de tratamiento y valorización por etapas: línea base, prefactibilidad, revisión de localización, ingeniería, implementación, rehabilitación y operación según la evidencia disponible.",
    proofTitle: "Seguir, esperar, rediseñar o descartar también son resultados útiles.",
    proofCopy: "La infraestructura se evalúa alrededor del residuo, la logística, el predio, el proceso, las salidas y la capacidad real de operar; no alrededor de una tecnología elegida de antemano.",
    path: ["Línea base", "Prefactibilidad", "Predio", "Ingeniería", "Implementación", "Operación"],
    decisions: [
      {
        situation: "Tengo una idea de planta pero todavía no sé si se justifica",
        startWith: "Prefactibilidad",
        copy: "Compara demanda y oferta de residuos, alternativas de proceso, dimensionamiento preliminar, implantación, CAPEX/OPEX y riesgos antes de comprometer ingeniería.",
        href: "/soluciones/prefactibilidad",
      },
      {
        situation: "Tengo un predio y necesito saber si merece estudios más profundos",
        startWith: "Prefactibilidad + screening técnico",
        copy: "Revisa de manera preliminar accesos, distancias, entorno, servicios, riesgos, restricciones, expansión y compatibilidad operativa antes de asumir que el predio es apto.",
        href: "/soluciones/prefactibilidad",
      },
      {
        situation: "La alternativa ya maduró y necesito bases técnicas para contratar o construir",
        startWith: "Factibilidad e ingeniería",
        copy: "Desarrolla balances, proceso, equipos, implantación, cantidades, APU, servicios auxiliares y criterios de operación según el alcance contratado.",
        href: "/soluciones/factibilidad-ingenieria",
      },
      {
        situation: "Necesito diseñar e implementar una planta nueva",
        startWith: "Diseño, construcción e implementación",
        copy: "Integra recepción, tratamiento biológico, servicios auxiliares, manejo de productos, instrumentación y puesta en marcha alrededor del residuo y la operación real.",
        href: "/soluciones/plantas-nuevas",
      },
      {
        situation: "Ya existe infraestructura pero está subutilizada o presenta fallas",
        startWith: "Diagnóstico y rehabilitación",
        copy: "Separa fallas de infraestructura, proceso, suministro, personal y gestión antes de decidir qué adecuar, recuperar o reemplazar.",
        href: "/soluciones/rehabilitacion",
      },
      {
        situation: "La planta existe y el reto es sostener una operación disciplinada",
        startWith: "Dirección técnica y coordinación",
        copy: "Conecta proceso, personas, mantenimiento, calidad, inventarios, productos, reportes y mejora continua bajo responsabilidades contractuales explícitas.",
        href: "/soluciones/direccion-operacion",
      },
    ],
    programSlugs: ["greenatics-base"],
    moduleIds: ["prefactibilidad-decision", "screening-predios", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Antes de comprometer inversión",
        title: "Construir evidencia para decidir si el proyecto debe avanzar.",
        copy: "Validar residuos, escala, logística, localización, alternativas, salidas y modelo operativo antes de convertir una idea en ingeniería.",
        serviceSlugs: ["diagnostico-caracterizacion", "prefactibilidad"],
      },
      {
        number: "02",
        kicker: "Cuando la alternativa está madura",
        title: "Pasar de concepto a proyecto implementable.",
        copy: "Definir proceso, capacidades, equipos, implantación, cantidades, costos y criterios de arranque con el nivel de detalle acordado para contratación o construcción.",
        serviceSlugs: ["factibilidad-ingenieria", "plantas-nuevas"],
      },
      {
        number: "03",
        kicker: "Con infraestructura existente",
        title: "Recuperar o estabilizar antes de volver a invertir.",
        copy: "Diagnosticar activos y proceso, priorizar adecuaciones y fortalecer la operación antes de recomendar reemplazos o nuevas ampliaciones.",
        serviceSlugs: ["rehabilitacion", "direccion-operacion", "operacion-integral", "trazabilidad-datos"],
      },
    ],
    ctaTitle: "Cuéntanos qué infraestructura existe y qué decisión está abierta.",
    ctaCopy: "Con ubicación, corriente prevista, capacidad objetivo, infraestructura disponible, etapa del proyecto y restricciones conocidas podemos ubicar el nivel de estudio correcto sin saltar prematuramente a obra o tecnología.",
  },
  {
    slug: "propiedad-horizontal-redes",
    audience: "Propiedad horizontal, constructoras y redes multiunidad",
    eyebrow: "Soluciones Greenatics · Línea base, planes internos y arquitectura común de información",
    title: "Cada unidad conserva su realidad. La red puede compartir método y datos.",
    lead: "Greenatics estructura diagnósticos, planes internos, separación, rutas, orgánicos e indicadores para conjuntos residenciales, constructoras y redes de múltiples unidades sin convertir cada sede en un proyecto aislado.",
    proofTitle: "La escala aparece cuando la información puede compararse.",
    proofCopy: "Una metodología común permite que cada unidad tenga su propio diagnóstico o plan y que la red consolide generación, composición, accesos, horarios, orgánicos, rutas, indicadores y oportunidades.",
    path: ["Levantar", "Estandarizar", "Implementar", "Consolidar", "Optimizar", "Escalar"],
    decisions: [
      {
        situation: "No tengo una línea base comparable entre unidades",
        startWith: "GREENATICS BASE",
        copy: "Estandariza generación, caracterización, infraestructura, evidencias y lectura operativa para que las sedes puedan analizarse bajo una misma estructura.",
        href: "/soluciones/programas/greenatics-base",
      },
      {
        situation: "Necesito ordenar la gestión interna de una unidad",
        startWith: "PMIRS y planes internos",
        copy: "Organiza corrientes, separación, almacenamiento, rutas, responsables, gestores, indicadores y evidencias según la aplicabilidad y alcance de cada organización.",
        href: "/soluciones/pmirs",
      },
      {
        situation: "Tengo varias propiedades y quiero un estándar común",
        startWith: "PMIRS RED",
        copy: "Permite conservar el plan o diagnóstico de cada unidad y, al mismo tiempo, consolidar información comparable para seguimiento y decisiones de red.",
        href: "/soluciones/programas/pmirs-red",
      },
      {
        situation: "Las rutas, accesos u horarios cambian mucho entre unidades",
        startWith: "Diseño de rutas selectivas",
        copy: "Conecta generadores, accesos, frecuencias, ventanas, secuencias y destino para diseñar logística sobre condiciones reales y no sobre promedios de la red.",
        href: "/soluciones/rutas-selectivas",
      },
      {
        situation: "Quiero separar y gestionar orgánicos de forma trazable",
        startWith: "Gestión, recolección y tratamiento",
        copy: "Integra criterios de separación, programación, recepción, tratamiento y evidencia según el esquema definido para cada corriente y unidad.",
        href: "/soluciones/recoleccion-tratamiento",
      },
      {
        situation: "Necesito indicadores consolidados sin rehacer la información cada mes",
        startWith: "Trazabilidad digital y GREENATICS OPS",
        copy: "Estructura registros y evidencia para que cada unidad produzca datos comparables y la red pueda consolidarlos sin perder el origen de cada actividad.",
        href: "/soluciones/trazabilidad-datos",
      },
    ],
    programSlugs: ["greenatics-base", "pmirs-red"],
    moduleIds: ["rutas-flota", "organicos-piloto", "acompanamiento-etapas"],
    stages: [
      {
        number: "01",
        kicker: "Unidad por unidad",
        title: "Levantar una base consistente antes de estandarizar.",
        copy: "Entender generación, corrientes, infraestructura, responsables y prácticas reales para que el estándar común no borre las diferencias entre propiedades.",
        serviceSlugs: ["diagnostico-caracterizacion", "pmirs", "trazabilidad-datos"],
      },
      {
        number: "02",
        kicker: "Durante la implementación",
        title: "Traducir planes en separación, logística y destino.",
        copy: "Conectar procedimientos, accesos, rutas, frecuencias, criterios de entrega y tratamiento para que la gestión pueda ejecutarse y verificarse en cada unidad.",
        serviceSlugs: ["rutas-selectivas", "recoleccion-tratamiento", "motocarguero"],
      },
      {
        number: "03",
        kicker: "A escala de red",
        title: "Consolidar información y detectar decisiones que sí merecen escala.",
        copy: "Comparar generación, desempeño y oportunidades antes de decidir logística compartida, pilotos de orgánicos o infraestructura común.",
        serviceSlugs: ["trazabilidad-datos", "prefactibilidad", "factibilidad-ingenieria"],
      },
    ],
    ctaTitle: "Cuéntanos cuántas unidades componen la red y qué información ya existe.",
    ctaCopy: "Con número de sedes o propiedades, ubicación, tipo de generación, información disponible, prácticas actuales y principal decisión pendiente podemos definir si conviene empezar por línea base, plan interno, PMIRS RED o una fase operacional.",
  },
] as const;

export const intentSolutionPaths = intentLandings.map((landing) => `/soluciones/${landing.slug}` as const);
export const getIntentLanding = (slug: string) => intentLandings.find((landing) => landing.slug === slug);
