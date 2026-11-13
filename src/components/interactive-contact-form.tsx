"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildDiagnosticRequestDetails } from "@/data/diagnostic-routes";
import { buildContactEmailHref } from "@/data/contact-email-handoff";
import { consumeToolContactDraft } from "@/data/tool-contact-handoff";

const profileOptions = [
  {
    id: "esp",
    label: "Municipio / ESP",
    entityLabel: "Municipio o empresa de servicios públicos *",
    entityPlaceholder: "Ej.: Alcaldía de Yarumal o ESP municipal",
    locationLabel: "Ciudad o municipio y departamento *",
    locationPlaceholder: "Ej.: Yarumal, Antioquia",
    scaleLabel: "Volumen mensual estimado",
    placeholderVol: "Ej.: 150 t/mes de residuos orgánicos",
  },
  {
    id: "agroindustria",
    label: "Organización / Gran generador",
    entityLabel: "Organización o gran generador *",
    entityPlaceholder: "Ej.: conjunto residencial, centro comercial o institución",
    locationLabel: "Ciudad o municipio y departamento *",
    locationPlaceholder: "Ej.: Medellín, Antioquia",
    scaleLabel: "Sedes, generadores o corrientes",
    placeholderVol: "Ej.: 3 sedes, 1 centro comercial y sus corrientes",
  },
  {
    id: "agroindustrial",
    label: "Agroindustria / proyecto productivo",
    entityLabel: "Agroindustria o proyecto productivo *",
    entityPlaceholder: "Ej.: planta de beneficio o proyecto agroindustrial",
    locationLabel: "Ciudad o municipio y departamento *",
    locationPlaceholder: "Ej.: Támesis, Antioquia",
    scaleLabel: "Corrientes o capacidad de proceso",
    placeholderVol: "Ej.: 12 t/semana de pulpa; operación estacional",
  },
  {
    id: "agro",
    label: "Productor / Finca",
    entityLabel: "Finca o unidad productiva *",
    entityPlaceholder: "Ej.: Finca El Porvenir",
    locationLabel: "Ciudad o municipio y departamento *",
    locationPlaceholder: "Ej.: Támesis, Antioquia",
    scaleLabel: "Área y cultivo",
    placeholderVol: "Ej.: 15 ha de café o aguacate",
  },
  {
    id: "hogar",
    label: "Casa y Jardín",
    entityLabel: "Hogar, jardín o huerta *",
    entityPlaceholder: "Ej.: balcón, jardín familiar o huerta escolar",
    locationLabel: "Ciudad o municipio y departamento *",
    locationPlaceholder: "Ej.: Medellín, Antioquia",
    scaleLabel: "Espacio, plantas o kits de interés",
    placeholderVol: "Ej.: 8 plantas de interior o 2 kits de huerta",
  },
  {
    id: "territorio",
    label: "Territorio / Organización",
    entityLabel: "Municipio, organización o gran generador *",
    entityPlaceholder: "Ej.: alcaldía, centro comercial, unidad residencial o institución",
    locationLabel: "Municipio, región o área de operación *",
    locationPlaceholder: "Ej.: Valle de Aburrá, Antioquia",
    scaleLabel: "Generadores, sedes o rutas",
    placeholderVol: "Ej.: 4 sedes, 18 generadores y 3 rutas",
  },
  {
    id: "clima",
    label: "Clima / datos",
    entityLabel: "Organización, entidad o proyecto *",
    entityPlaceholder: "Ej.: empresa, municipio, institución o iniciativa",
    locationLabel: "Ciudad, región o ámbito de medición *",
    locationPlaceholder: "Ej.: Antioquia o sedes incluidas en el inventario",
    scaleLabel: "Fuentes, sedes o periodo",
    placeholderVol: "Ej.: energía, transporte y residuos; periodo del inventario",
  },
  {
    id: "digital",
    label: "Equipo / plataforma",
    entityLabel: "Organización o proyecto *",
    entityPlaceholder: "Ej.: equipo de gestión territorial o proyecto agrícola",
    locationLabel: "Ciudad o territorio de trabajo *",
    locationPlaceholder: "Ej.: Antioquia o región de operación",
    scaleLabel: "Sedes, usuarios o procesos",
    placeholderVol: "Ej.: 2 sedes, 12 usuarios y trazabilidad de lotes",
  },
  {
    id: "proyecto",
    label: "Proyecto / aliado",
    entityLabel: "Proyecto, organización o aliado *",
    entityPlaceholder: "Ej.: proyecto agrícola, asociación o aliado inversionista",
    locationLabel: "Ciudad o territorio del proyecto *",
    locationPlaceholder: "Ej.: Medellín, Antioquia o región de operación",
    scaleLabel: "Actividad, escala o etapa",
    placeholderVol: "Ej.: cultivo, corriente orgánica, sedes o etapa actual",
  },
] as const;

type ContactProfile = typeof profileOptions[number]["id"];
type ContactContext = {
  label: string;
  title: string;
  copy: string;
  profile: ContactProfile;
};
type ToolHandoffStatus = "none" | "received" | "missing";
type ContactDraft = {
  profile: ContactProfile;
  name: string;
  entity: string;
  email: string;
  phone: string;
  location: string;
  volume: string;
  details: string;
};

const contactDraftPrefix = "greenatics:contact-draft:v1:";

function readContactDraft(key: string): ContactDraft | null {
  try {
    const saved = window.sessionStorage.getItem(key);
    if (!saved) return null;
    const draft: unknown = JSON.parse(saved);
    if (!draft || typeof draft !== "object" || Array.isArray(draft)) return null;
    const fields = draft as Record<string, unknown>;
    if (!profileOptions.some((option) => option.id === fields.profile)) return null;
    if (!["name", "entity", "email", "phone", "location", "volume", "details"].every((field) => typeof fields[field] === "string")) return null;
    return draft as ContactDraft;
  } catch {
    return null;
  }
}

const greenaticsRedContactContext = {
  label: "GREENATICS Red · alcance territorial y organizacional",
  title: "Definir los componentes de trabajo para un territorio u organización",
  copy: "Cuéntanos qué territorio, organizaciones o grandes generadores participan y qué necesitan resolver: diagnóstico, trabajo de campo, medición, revisión de datos, línea base, PGIRS o PMIRS, acciones y seguimiento. Podemos ordenar los componentes del servicio y conversar sobre los recursos digitales pertinentes; la estación pública es una muestra y no equivale a una plataforma organizacional habilitada.",
  profile: "territorio",
} satisfies ContactContext;

const toolsContactContext = {
  label: "Herramientas y plataformas Greenatics",
  title: "Elegir el siguiente paso para tu organización",
  copy: "Cuéntanos qué herramienta te interesa y qué trabajo quieres resolver. Podemos orientarte entre una muestra pública, una consulta de alcance y el servicio profesional relacionado. El acceso con datos propios, los derechos de uso y cualquier implementación se confirman para cada herramienta; visitar una demo no habilita por sí solo un entorno operativo.",
  profile: "digital",
} satisfies ContactContext;

const servicesContactContext = {
  label: "Servicios Greenatics",
  title: "Definir qué alcance responde a tu necesidad",
  copy: "Cuéntanos desde qué contexto nos contactas, qué corriente o proceso quieres abordar, qué ocurre hoy y qué decisión debes tomar. Con esos datos orientamos la conversación hacia planeación, recolección, infraestructura, operación, datos o valorización, y distinguimos qué componentes conviene contratar juntos.",
  profile: "proyecto",
} satisfies ContactContext;

const microrrutasContactContext = {
  label: "Microrrutas y motocarguero para el sector aseo",
  title: "Diseñar una ruta alrededor de una solución desarrollada para el sector",
  copy: "Cuéntanos si buscas estructurar una microrruta, implementar recolección selectiva o evaluar la integración de un motocarguero a la operación. Comparte generadores, material, volumen, recorrido, accesos, frecuencia y punto de recepción. La adaptación y el alcance se definen para cada proyecto.",
  profile: "territorio",
} satisfies ContactContext;

const plantImplementationContactContext = {
  label: "Construcción y puesta en marcha de plantas",
  title: "Revisar el alcance de construcción y puesta en marcha",
  copy: "Cuéntanos qué está definido sobre el predio, la ingeniería, los equipos y los servicios disponibles, y qué parte de la ejecución quieres evaluar. La coordinación o ejecución de obras, suministro, montaje, pruebas y arranque solo se incluyen cuando forman parte del alcance contratado.",
  profile: "territorio",
} satisfies ContactContext;

const directionTechnicalContactContext = {
  label: "Dirección técnica de operación",
  title: "Acompañar decisiones de proceso con el equipo local",
  copy: "Comparte qué variables y rutinas necesitan seguimiento y qué decisiones debe respaldar el acompañamiento. En dirección técnica, la organización conserva la operación cotidiana. Personal, turnos, SST, permisos y mantenimiento no se incluyen automáticamente; se definen por separado y solo cuando el contrato los acuerda.",
  profile: "territorio",
} satisfies ContactContext;

const integratedOperationContactContext = {
  label: "Operación integral recurrente",
  title: "Definir el alcance de una operación integral",
  copy: "Comparte el proceso, la capacidad y la continuidad que buscas cubrir, junto con las tareas, los recursos, turnos, mantenimiento y reportes que deben coordinarse. La ejecución y las responsabilidades de cada equipo se delimitan para el sitio y el contrato; no se presumen como un paquete universal.",
  profile: "territorio",
} satisfies ContactContext;

const sharedOperationContactContext = {
  label: "Operación compartida",
  title: "Acordar cómo se distribuye el trabajo entre los equipos",
  copy: "Cuéntanos qué tareas mantiene el equipo local y dónde necesita apoyo Greenatics. Podemos ordenar ejecución, supervisión, mantenimiento, reportes y escalamiento mediante una matriz de responsabilidades. Los recursos, turnos, seguridad y obligaciones se acuerdan para cada planta y contrato.",
  profile: "territorio",
} satisfies ContactContext;

const opsConfigurationContactContext = {
  label: "Configuración organizacional de GREENATICS OPS",
  title: "Definir cómo OPS podría ajustarse a tu operación",
  copy: "Cuéntanos cuántas plantas o sedes participarían, qué roles usarían el sistema y qué procesos, registros o indicadores necesitan priorizar. La estación pública es una muestra; antes de acordar accesos, conexiones o funciones, confirmaremos disponibilidad, derechos de uso y alcance para el proyecto.",
  profile: "digital",
} satisfies ContactContext;

const contactContexts = {
  "diagnostico": { label: "Orientador de soluciones", title: "Un punto de partida para tu necesidad", copy: "Cuéntanos qué quieres resolver y desde qué contexto. Usaremos la información seleccionada para orientar la conversación hacia un producto, servicio o herramienta pertinente.", profile: "proyecto" },
  "diagnostico-residuos": { label: "Diagnóstico y caracterización", title: "Línea base de residuos orgánicos", copy: "Comparte las fuentes, volúmenes, composición disponible y la decisión que necesitas tomar para definir el muestreo y el balance de masa.", profile: "territorio" },
  "pgirs-pmirs": { label: "Formulación de PGIRS / PMIRS", title: "Elegir una ruta territorial u organizacional", copy: "Indica si buscas formular o actualizar un PGIRS municipal/regional o un PMIRS para una organización o gran generador. Puede ser una unidad o conjunto residencial, centro comercial, institución, establecimiento de servicios o planta productiva. Comparte sedes, corrientes, metas, avances y datos disponibles. La adopción formal del PGIRS no la realiza Greenatics.", profile: "territorio" },
  "pgirs-municipal": { label: "PGIRS municipal o regional", title: "Traducir las metas territoriales en proyectos ejecutables", copy: "Comparte municipio o región, instrumento y acto vigentes, metas y avances, actores responsables, articulación con planeación y presupuesto, y la decisión que debe apoyar la actualización. Greenatics acompaña técnicamente; la adopción corresponde a la autoridad competente.", profile: "esp" },
  "pmirs-organizacional": { label: "PMIRS para organizaciones y grandes generadores", title: "Organizar la gestión de residuos en cada operación", copy: "Cuéntanos qué tipo de generador eres —unidad o conjunto residencial, centro comercial, institución, establecimiento de servicios o planta productiva— y qué sedes y procesos comprende. Incluye tipos y volúmenes de residuos, separación, almacenamiento, gestores, responsables y necesidades de formación o seguimiento. El alcance se ajusta a la actividad, jurisdicción y obligaciones aplicables.", profile: "agroindustria" },
  "microrrutas-motocarguero": microrrutasContactContext,
  "microrrutas": microrrutasContactContext,
  "plantas-modulares": { label: "Ingeniería de plantas modulares", title: "Definir la fase adecuada para una planta", copy: "Indica si necesitas prefactibilidad, factibilidad o ingeniería de detalle, o si ya estás preparando construcción y puesta en marcha. Comparte corriente y suministro, predio, servicios, activos existentes, objetivo y datos disponibles. Cada fase tiene entregables propios; la implementación física solo se incluye cuando se acuerda.", profile: "territorio" },
  "operacion-delegada": { label: "Operación y continuidad técnica", title: "Estabilizar una planta en funcionamiento", copy: "Describe el proceso, el equipo local, las variables críticas y el tipo de apoyo requerido: operación integral, compartida o dirección técnica.", profile: "territorio" },
  "calcula-tu-huella": { label: "Back 2 Green", title: "Preparar la conversación sobre el inventario GEI", copy: "Indica si recibiste una solicitud de reporte o si quieres medir para gestión interna. Comparte quién lo solicita, periodo, formato, fecha límite, sedes y datos disponibles cuando existan. Si tienes una duda normativa, la revisaremos con fuentes vigentes y criterio profesional.", profile: "clima" },
  "estimador-organicos": { label: "Estimador de flujo orgánico", title: "Revisar el flujo y la meta de desvío", copy: "Comparte el volumen mensual, el periodo, el destino actual y la meta que quieres explorar. La proyección describe masa, no emisiones evitadas; si necesitas una evaluación de GEI, primero deben definirse línea base, datos y método.", profile: "territorio" },
  "greenatics-ops": { label: "GREENATICS OPS", title: "Conversar sobre el alcance y la configuración de OPS", copy: "Cuéntanos cuántas plantas o sedes comprende la operación y qué procesos quieres ordenar: bitácora, pesajes, recepciones, lotes, mantenimiento, inventarios o reportes. Podemos definir los datos, responsabilidades y prioridades de trabajo. La disponibilidad de un entorno digital, sus permisos y cualquier configuración se confirman según el proyecto; la estación pública es una muestra.", profile: "digital" },
  "greenatics-ops-recorrido": { label: "Recorrido guiado de GREENATICS OPS", title: "Conocer el flujo de trabajo de la plataforma", copy: "Cuéntanos qué tipo de operación quieres recorrer, qué roles participarían y qué procesos te interesa ver: recepción, pesajes, lotes, mantenimiento, inventario o reportes. Así preparamos una demostración pertinente. La estación pública sigue disponible para explorar el flujo por cuenta propia.", profile: "digital" },
  "greenatics-red": greenaticsRedContactContext,
  "red": greenaticsRedContactContext,
  "plataformas": toolsContactContext,
  "servicios": servicesContactContext,
  "agroway": { label: "AGROWAY · trazabilidad agrícola", title: "Explorar necesidades de trazabilidad agrícola", copy: "Cuéntanos qué productores, fincas, lotes y etapas necesitan seguimiento, qué información debe quedar relacionada y qué decisiones quieres apoyar. Puedes recorrer la demo navegable de AGROWAY; la operación con datos de fincas y la conexión con SANA se definen por proyecto.", profile: "agro" },
  "sana": { label: "SANA · proyectos agrícolas", title: "Conversar sobre un proyecto agrícola", copy: "Indica si impulsas el proyecto como productor, organización, inversionista o aliado. Comparte cultivo, territorio, actores, etapa y necesidad de inversión o acompañamiento. Con ese contexto podemos acordar alcance, responsabilidades, criterio agronómico, seguimiento y las herramientas pertinentes para el proyecto.", profile: "proyecto" },
  "agroindustria": { label: "Agroindustria", title: "Tratamiento, biogás o bioenergía", copy: "Describe la corriente, su volumen, continuidad y salida esperada para orientar la alternativa técnica más coherente.", profile: "agroindustrial" },
  "empresas": { label: "Organizaciones y grandes generadores", title: "Definir el frente adecuado para tu operación", copy: "Cuéntanos qué organización eres —empresa, unidad residencial, centro comercial, institución u otro gran generador—, cuántas sedes comprende y qué corrientes manejas. Indica si necesitas ordenar el PMIRS, el retiro, una microrruta, el tratamiento o su seguimiento; así enfocamos la conversación en el alcance pertinente.", profile: "agroindustria" },
  "municipios": { label: "Municipios y ESP", title: "Solución territorial de aprovechamiento", copy: "Comparte el municipio, la meta del PGIRS, los generadores y la infraestructura disponible para ordenar una ruta viable.", profile: "esp" },
  "territorio": { label: "Greenatics Territorio", title: "Estructurar una solución para el territorio", copy: "Cuéntanos el municipio, las metas del PGIRS, los generadores, las rutas y la infraestructura disponible. Indica si el reto principal es diagnóstico, logística, planta, operación o valorización.", profile: "esp" },
  "valorizacion": { label: "Greenatics Valorización", title: "Evaluar productos y energía a partir de biomasa", copy: "Describe la corriente orgánica, su volumen y continuidad, el proceso disponible y la salida que quieres evaluar: compost, biofábrica, productos agrícolas, biogás o bioenergía.", profile: "proyecto" },
  "clima-datos": { label: "Greenatics Clima y datos", title: "Medir, registrar o dar trazabilidad", copy: "Cuéntanos qué información necesitas organizar: inventario climático, operación de planta, gestión territorial, trazabilidad agrícola o reportes. Incluye el periodo y las fuentes disponibles.", profile: "clima" },
  "operacion-digital": { label: "Operación digital Greenatics", title: "Encontrar la herramienta adecuada para el equipo", copy: "Indica qué aplicación o recurso buscas, quiénes la usarán y si necesitas acceso, configuración, administración de usuarios o consulta de documentos técnicos.", profile: "digital" },
  "instituciones-alianzas": { label: "Instituciones y alianzas", title: "Estructuración de un proyecto ambiental", copy: "Cuéntanos la oportunidad, los actores, el territorio y las capacidades que se deben articular para definir el siguiente paso.", profile: "proyecto" },
  "herramientas": toolsContactContext,
  "soluciones": { label: "Soluciones Greenatics", title: "Conectar una necesidad con la ruta adecuada", copy: "Cuéntanos qué corriente, operación o resultado quieres abordar y desde qué contexto: municipio, empresa, agroindustria o casa y jardín. Te orientaremos hacia el producto, servicio o herramienta pertinente.", profile: "proyecto" },
  "casa-jardin": { label: "Casa y Jardín", title: "Orientación para tus plantas", copy: "Cuéntanos qué plantas tienes, en qué espacio están y qué quieres mejorar para orientar producto, kit o guía.", profile: "hogar" },
  "wondergreen-hogar": { label: "Wondergreen Hogar", title: "Orientar el cuidado de plantas y huertas", copy: "Cuéntanos qué especies tienes, en qué espacio crecen, cómo son la luz y el riego y qué quieres mejorar. Si es una huerta comunitaria o educativa, añade el área, quiénes la cuidan y el propósito del proyecto. El equipo puede orientarte entre guía, producto, kit y presentación con base en la información técnica disponible.", profile: "hogar" },
  "programas-wondergreen": { label: "Programas Wondergreen", title: "Evaluar un programa o ensayo agronómico", copy: "Comparte cultivo, variedad, lote o área, etapa y objetivo productivo. Si tienes análisis de suelo o agua, prácticas actuales, costos o una meta de circularidad o carbono, cuéntanoslo también. Revisaremos si conviene formular un programa o diseñar un ensayo y qué seguimiento requeriría; el alcance y las mediciones se acuerdan según la evidencia y el trabajo necesario.", profile: "agro" },
  "distribucion-wondergreen": { label: "Distribución Wondergreen", title: "Conversar sobre distribución y abastecimiento", copy: "Cuéntanos la zona y el tipo de canal, las referencias que te interesan y la demanda que buscas atender. Revisaremos las condiciones de abastecimiento y acompañamiento aplicables; la disponibilidad y cualquier acuerdo se confirman para cada caso.", profile: "agroindustria" },
  "aprovechamiento-productivo": { label: "Aprovechamiento productivo", title: "Biomasa, productos y energía", copy: "Cuéntanos si nos escribes desde un municipio o ESP, una empresa u organización, un gran generador o una agroindustria. Describe qué biomasa se produce, su volumen y continuidad, el proceso actual y la salida productiva o energética que quieres evaluar.", profile: "territorio" },
  "prefactibilidad": { label: "Prefactibilidad técnica y económica", title: "Comparar alternativas antes de comprometer la inversión", copy: "Comparte datos de generación, infraestructura, restricciones y objetivo. Comparamos opciones y estimamos inversión y costos de operación al nivel preliminar necesario para decidir si avanzar; no es presupuesto definitivo, ingeniería de detalle ni compromiso de construcción.", profile: "proyecto" },
  "gerencia-tecnica": { label: "Gerencia técnica e ingeniería del propietario", title: "Coordinar un proyecto desde el lado del propietario", copy: "Cuéntanos la etapa, los responsables y los frentes que requieren coordinación. Desde la ingeniería del propietario alineamos entregables e interfaces, damos seguimiento a hitos y cambios y acompañamos pruebas y puesta en marcha según el alcance acordado; no sustituimos los diseños de cada disciplina ni la ejecución de obra.", profile: "proyecto" },
  "clima-carbono": { label: "Clima, carbono y reportabilidad", title: "Preparar un inventario y un reporte climático", copy: "El acompañamiento define alcance y línea base, revisa datos y factores de emisión, controla su calidad y analiza incertidumbre para preparar el reporte acordado. Back 2 Green organiza el inventario y sus soportes. Cuéntanos la organización, el periodo, las fuentes disponibles y la decisión que debe respaldar el reporte.", profile: "clima" },
  "preparacion-sui": { label: "Preparación SUI", title: "Preparar información y soportes para el SUI", copy: "Indica qué prestador, servicio y periodo debes reportar. Organizamos variables, responsables y soportes, y revisamos consistencia entre fuente y dato antes de la carga o revisión. La presentación oficial queda a cargo del prestador y del responsable designado.", profile: "esp" },
  "idi-agroindustrial": { label: "I+D+i agroindustrial y bioeconomía", title: "Diseñar un piloto que permita decidir el siguiente paso", copy: "Describe la biomasa, el proceso y el producto que quieres probar, la evidencia disponible y el criterio para decidir si avanzar, ajustar o detener el desarrollo.", profile: "agroindustrial" },
  "esg": { label: "Escenario ESG", title: "Convertir una estimación en una línea base", copy: "Comparte el volumen, periodo, costos y fuentes disponibles para revisar qué puede medirse y con qué metodología.", profile: "clima" },
  "impacto": { label: "Impacto y metodología", title: "Revisar un caso o construir un escenario de impacto", copy: "Indica si quieres revisar un resultado publicado, entender su metodología y periodo, o dimensionar una estimación preliminar. Comparte proceso, volúmenes, datos y supuestos disponibles para distinguir resultados medidos, valores anualizados y escenarios potenciales.", profile: "proyecto" },
  "solucion": { label: "Solución Greenatics", title: "Definir el alcance de una solución", copy: "Comparte el escenario que quieres resolver para ordenar evidencia, alcance técnico y siguiente decisión.", profile: "proyecto" },
  "wondergreen": { label: "Wondergreen", title: "Recomendación agronómica y suministro", copy: "Comparte cultivo, área, etapa y análisis disponibles para revisar referencia, dosis, logística y suministro.", profile: "agro" },
  "educacion-adopcion": { label: "Educación y transferencia", title: "Formación y adopción de la operación", copy: "Cuéntanos qué público, proceso o herramienta debe incorporarse y qué capacidad quieres dejar en el equipo local.", profile: "proyecto" },
  "aseguramiento-tecnico": { label: "Auditoría y aseguramiento técnico", title: "Revisar técnicamente una operación", copy: "Indica qué planta, proceso, balance o documento necesitas revisar, qué fuentes y periodo están disponibles y qué decisión debe apoyar el análisis. El alcance define la profundidad y los productos de la revisión.", profile: "territorio" },
  "recoleccion-tratamiento": { label: "Recolección y tratamiento recurrentes", title: "Coordinar la recolección y el tratamiento recurrentes", copy: "Cuéntanos la zona, quiénes generan los orgánicos, qué volumen y frecuencia manejan y cómo separan el material. La propuesta integra logística, trazabilidad de cargas y tratamiento en el destino acordado; capacidad y responsabilidades se definen para cada operación. El diseño de nuevas microrrutas y la configuración de GREENATICS OPS son componentes específicos que se incorporan cuando el proyecto los requiere.", profile: "territorio" },
  "rehabilitacion-infraestructura": { label: "Rehabilitación de infraestructura", title: "Evaluar la recuperación de una planta existente", copy: "Comparte el proceso, la capacidad de diseño, el estado de equipos e infraestructura, registros recientes y restricciones del sitio. La evaluación define el potencial de recuperación, las intervenciones recomendadas y las condiciones para preparar el arranque; la capacidad y ejecución se precisan tras la revisión técnica.", profile: "territorio" },
  "optimizacion-composteras": { label: "Optimización técnica de composteras", title: "Mejorar un proceso de compostaje en funcionamiento", copy: "Cuéntanos los materiales recibidos, mezcla, rutina de volteo, tiempos, controles, espacio y equipo responsable. Este alcance optimiza el proceso en marcha; se diferencia de rehabilitar equipos o infraestructura y de asumir la operación diaria de la planta.", profile: "territorio" },
  "desarrollo-productos-derivados": { label: "Desarrollo técnico de productos derivados", title: "Desarrollar una ruta técnica para un producto de biomasa", copy: "Describe la materia prima, formulación o proceso de interés, los análisis disponibles y la aplicación prevista. El desarrollo puede requerir pruebas, control de calidad y revisión regulatoria; no presupone registro ni disponibilidad comercial.", profile: "agroindustrial" },
  "regulatorio-residuos-esp": { label: "Acompañamiento jurídico y regulatorio", title: "Definir la ruta jurídica y regulatoria aplicable", copy: "Indica organización, jurisdicción, proceso, acto o trámite y la decisión que preparas. Revisamos obligaciones y soportes para proponer una ruta jurídica y regulatoria; la decisión final corresponde a la autoridad competente.", profile: "esp" },
  "remuneracion-tratamiento": { label: "Estructuración para remuneración del tratamiento", title: "Estructurar la base del servicio de tratamiento", copy: "Cuéntanos quién presta y recibe el servicio, el modelo contractual, costos, operación y soportes disponibles. Estructuramos la base técnica y documental para analizar la remuneración aplicable. El reconocimiento y el recaudo dependen del marco vigente y de la decisión correspondiente.", profile: "esp" },
  "estructuracion-financiera": { label: "Estructuración técnico-económica y financiera", title: "Estructurar alternativas para decidir una inversión", copy: "Comparte alcance, actores, alternativas técnicas, inversión, costos operativos, ingresos o ahorros esperados, riesgos y fuentes disponibles. Integramos esa información en escenarios y necesidades de capital que apoyen la decisión. Complementa la prefactibilidad; no garantiza financiación ni cierre financiero.", profile: "proyecto" },
} as const satisfies Record<string, ContactContext>;

const huellaContactRoutes = {
  "solicitud-externa": {
    label: "Reporte solicitado",
    title: "Preparar el reporte que te pidieron",
    copy: "Cuéntanos quién lo solicita, qué periodo y formato pide, cuál es la fecha límite, qué organización o sedes incluye y qué datos ya tienes. Conservaremos el requerimiento como punto de partida para acordar el alcance.",
    profile: "clima",
  },
  "duda-normativa": {
    label: "Duda sobre una obligación",
    title: "Revisar qué instrumento podría aplicar",
    copy: "Comparte la actividad, el establecimiento o las sedes implicadas y cualquier comunicación recibida. Revisaremos fuentes oficiales vigentes; la aplicación no emite dictámenes automáticos ni trata un proyecto normativo como obligación expedida.",
    profile: "clima",
  },
  "gestion-interna": {
    label: "Gestión interna de emisiones",
    title: "Construir un inventario para gestionar emisiones",
    copy: "Indica qué decisión quieres respaldar, el periodo, las sedes y las fuentes de actividad disponibles. El método y los límites del inventario se acuerdan antes de interpretar resultados o plantear reducciones.",
    profile: "clima",
  },
} as const satisfies Record<string, ContactContext>;

const huellaPlanContactContext = {
  label: "Planes de Back 2 Green",
  title: "Elegir un plan y preparar el inventario GEI",
  copy: "Cuéntanos qué organización y fuentes comprende el inventario para confirmar el alcance comercial y el acompañamiento incluidos en el plan consultado.",
  profile: "clima",
} satisfies ContactContext;

const diagnosticProfiles: Record<string, ContactProfile> = {
  municipio: "esp",
  esp: "esp",
  empresa: "agroindustria",
  agroindustria: "agroindustrial",
  agro: "agro",
  hogar: "hogar",
  clima: "clima",
  territorio: "territorio",
  digital: "digital",
  proyecto: "proyecto",
};

export function InteractiveContactForm() {
  const [profile, setProfile] = useState<ContactProfile>("proyecto");
  const [name, setName] = useState<string>("");
  const [entity, setEntity] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [dataConsent, setDataConsent] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const [emailDraftHref, setEmailDraftHref] = useState<string>("");
  const [context, setContext] = useState<ContactContext | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [toolHandoffStatus, setToolHandoffStatus] = useState<ToolHandoffStatus>("none");
  const [draftKey, setDraftKey] = useState("");
  const [draftRecovered, setDraftRecovered] = useState(false);
  const didInitializeContact = useRef(false);

  useEffect(() => {
    if (didInitializeContact.current) return;
    didInitializeContact.current = true;

    const params = new URLSearchParams(window.location.search);
    const key = params.get("servicio") || params.get("interes") || "";
    const planParam = params.get("plan") || "";
    const validPlans = ["Huella Esencial", "Huella Empresarial", "Gestión Corporativa"];
    const planSelection = key === "calcula-tu-huella" && validPlans.includes(planParam) ? planParam : "";
    const companySizeParam = params.get("tamano_empresa") || "";
    const companySizeLabels: Record<string, string> = { pyme: "Empresa Pyme", mediana: "Empresa mediana", grande: "Empresa grande" };
    const companySizeSelection = key === "calcula-tu-huella" ? companySizeLabels[companySizeParam] || "" : "";
    const baseContext = contactContexts[key as keyof typeof contactContexts];
    const huellaRoute = key === "calcula-tu-huella"
      ? huellaContactRoutes[params.get("motivo") as keyof typeof huellaContactRoutes]
      : undefined;
    const diagnosticTitle = params.get("diagnostico");
    const diagnosticNeed = params.get("prioridad");
    const diagnosticProfile = params.get("perfil");
    const selectedProfile = diagnosticProfiles[diagnosticProfile || ""];
    const plantImplementationPhase = key === "plantas-modulares" && params.get("fase") === "implementacion"
      ? { ...plantImplementationContactContext, profile: selectedProfile || plantImplementationContactContext.profile }
      : null;
    const directionTechnicalMode = key === "operacion-delegada" && params.get("modalidad") === "direccion-tecnica"
      ? { ...directionTechnicalContactContext, profile: selectedProfile || directionTechnicalContactContext.profile }
      : null;
    const integratedOperationMode = key === "operacion-delegada" && params.get("modalidad") === "operacion-integral"
      ? { ...integratedOperationContactContext, profile: selectedProfile || integratedOperationContactContext.profile }
      : null;
    const sharedOperationMode = key === "operacion-delegada" && params.get("modalidad") === "operacion-compartida"
      ? { ...sharedOperationContactContext, profile: selectedProfile || sharedOperationContactContext.profile }
      : null;
    const opsConfigurationMode = key === "greenatics-ops" && params.get("modalidad") === "configuracion"
      ? { ...opsConfigurationContactContext, profile: selectedProfile || opsConfigurationContactContext.profile }
      : null;
    const diagnosticMode = key === "casa-jardin" ? "home" : key === "estimador-organicos" ? "organic-flow" : "route";
    const diagnosticDetails = buildDiagnosticRequestDetails(diagnosticTitle, diagnosticNeed, diagnosticMode);
    const diagnosticProfileLabel = profileOptions.find((option) => option.id === selectedProfile)?.label
      || profileOptions.find((option) => option.id === diagnosticProfile)?.label
      || diagnosticProfile;
    const diagnosticContext = diagnosticTitle
      ? {
        label: baseContext?.label || "Orientación Greenatics",
        title: key === "casa-jardin" ? diagnosticTitle : key === "estimador-organicos" ? baseContext.title : `Ruta sugerida: ${diagnosticTitle}`,
        copy: `${baseContext ? `${baseContext.copy} ` : ""}${diagnosticProfileLabel ? `Perfil seleccionado: ${diagnosticProfileLabel}. ` : ""}${diagnosticNeed ? `${diagnosticMode === "home" ? "Contexto de consulta" : diagnosticMode === "organic-flow" ? "Dato de consulta" : "Necesidad seleccionada"}: ${diagnosticNeed}` : "Partimos de la información que compartiste para definir el alcance adecuado."}`,
        profile: selectedProfile || baseContext?.profile || "esp",
      }
      : null;
    const contextualProfile = baseContext && selectedProfile ? { ...baseContext, profile: selectedProfile } : baseContext;
    const huellaSizeContext = companySizeSelection && contextualProfile
      ? { ...contextualProfile, title: `${contextualProfile.title} · ${companySizeSelection}`, copy: `${contextualProfile.copy} Tamaño indicado para la propuesta: ${companySizeSelection}; el alcance se confirmará según las sedes, fuentes, datos y trabajo requerido.` }
      : null;
    const nextContext = opsConfigurationMode || integratedOperationMode || sharedOperationMode || directionTechnicalMode || plantImplementationPhase || diagnosticContext || huellaRoute || (planSelection ? huellaPlanContactContext : null) || huellaSizeContext || contextualProfile || null;
    const hasToolHandoffMarker = params.get("transferencia") === "sesion";
    const handoffDraft = hasToolHandoffMarker ? consumeToolContactDraft() : null;
    setContext(nextContext);
    setSelectedPlan(planSelection);
    if (nextContext) setProfile(nextContext.profile);
    setToolHandoffStatus(!hasToolHandoffMarker ? "none" : handoffDraft ? "received" : "missing");
    const planDetails = planSelection ? `Plan de interés: ${planSelection} (precio de referencia; condiciones a confirmar).` : "";
    const companySizeDetails = companySizeSelection ? `Tamaño indicado para la propuesta anual: ${companySizeSelection}. Se confirmará con el equipo según la operación y el trabajo requerido.` : "";
    const phaseDetails = plantImplementationPhase ? "Fase de interés: Construcción y puesta en marcha." : "";
    const modalityDetails = directionTechnicalMode ? "Modalidad de interés: Dirección técnica." : "";
    const integratedOperationDetails = integratedOperationMode ? "Modalidad de interés: Operación integral." : "";
    const sharedOperationDetails = sharedOperationMode ? "Modalidad de interés: Operación compartida." : "";
    const opsConfigurationDetails = opsConfigurationMode ? "Modalidad de interés: Configuración por proyecto." : "";
    const initialDetails = [planDetails, companySizeDetails, diagnosticDetails, phaseDetails, modalityDetails, integratedOperationDetails, sharedOperationDetails, opsConfigurationDetails, handoffDraft].filter(Boolean).join("\n\n");
    if (initialDetails) setDetails(initialDetails);
    const keyForRequest = `${contactDraftPrefix}${window.location.pathname}${window.location.search}`;
    const saved = readContactDraft(keyForRequest);
    if (saved) {
      setProfile(saved.profile);
      setName(saved.name);
      setEntity(saved.entity);
      setEmail(saved.email);
      setPhone(saved.phone);
      setLocation(saved.location);
      setVolume(saved.volume);
      if (!handoffDraft) setDetails(saved.details);
      setDraftRecovered(true);
    }
    setDraftKey(keyForRequest);
  }, []);

  useEffect(() => {
    if (!draftKey) return;
    try {
      if (![name, entity, email, phone, location, volume, details].some((field) => field.trim())) {
        window.sessionStorage.removeItem(draftKey);
      } else {
        window.sessionStorage.setItem(draftKey, JSON.stringify({ profile, name, entity, email, phone, location, volume, details } satisfies ContactDraft));
      }
    } catch {
      // Storage is optional; the WhatsApp handoff still works without it.
    }
  }, [draftKey, profile, name, entity, email, phone, location, volume, details]);

  function clearContactDraft() {
    setName("");
    setEntity("");
    setEmail("");
    setPhone("");
    setLocation("");
    setVolume("");
    setDetails("");
    setDataConsent(false);
    setSubmitted(false);
    setWhatsappUrl("");
    setEmailDraftHref("");
    setDraftRecovered(false);
    try {
      if (draftKey) window.sessionStorage.removeItem(draftKey);
    } catch {
      // The fields above are cleared even when storage is unavailable.
    }
  }

  const currentProfile = profileOptions.find(p => p.id === profile) || profileOptions[0];
  const activeContext = context?.profile === profile ? context : null;

  function invalidatePreparedMessages() {
    setEmailDraftHref("");
    setSubmitted(false);
    setWhatsappUrl("");
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataConsent) return;
    setSubmitted(true);

    const message = encodeURIComponent(
      `Hola equipo Greenatics, quiero revisar esta solicitud:\n\n` +
      `*Nombre:* ${name || "No especificado"}\n` +
      `*${currentProfile.entityLabel.replace(" *", "")}* ${entity || "No especificado"}\n` +
      `*Perfil:* ${currentProfile.label}\n` +
      `*Interés:* ${context?.title || "Orientación general"}\n` +
      `*Correo:* ${email || "No especificado"}\n` +
      `*Teléfono:* ${phone || "No especificado"}\n` +
      `*Ubicación:* ${location || "No especificada"}\n` +
      `*${currentProfile.scaleLabel}:* ${volume || "No especificado"}\n` +
      `*Requerimiento:* ${details || "No especificado"}\n\n` +
      `*Autorización:* He leído la política de tratamiento de datos personales y autorizo a GREENATICS S.A.S. a tratar los datos incluidos para atender esta solicitud.\n\n` +
      `¿Podemos coordinar una conversación para revisar el alcance y el siguiente paso?`
    );
    const nextWhatsappUrl = `https://wa.me/573003078822?text=${message}`;
    setWhatsappUrl(nextWhatsappUrl);
    window.open(nextWhatsappUrl, "_blank", "noopener,noreferrer");
  };

  function handlePrepareEmail(e: React.MouseEvent<HTMLButtonElement>) {
    if (!e.currentTarget.form?.reportValidity()) return;
    const subject = context?.title ? `Solicitud Greenatics: ${context.title}` : "Solicitud de orientación Greenatics";
    const body = [
      "Hola equipo Greenatics,",
      "",
      "Quiero revisar esta solicitud:",
      "",
      `Nombre: ${name || "No especificado"}`,
      `${currentProfile.entityLabel.replace(" *", "")}: ${entity || "No especificado"}`,
      `Perfil: ${currentProfile.label}`,
      `Interés: ${context?.title || "Orientación general"}`,
      selectedPlan ? `Plan consultado: ${selectedPlan}` : "",
      `Correo: ${email || "No especificado"}`,
      `Teléfono: ${phone || "No especificado"}`,
      `Ubicación: ${location || "No especificada"}`,
      `${currentProfile.scaleLabel}: ${volume || "No especificado"}`,
      `Requerimiento: ${details || "No especificado"}`,
      "",
      "Autorización: He leído la política de tratamiento de datos personales y autorizo a GREENATICS S.A.S. a tratar los datos incluidos para atender esta solicitud.",
      "",
      "¿Podemos coordinar una conversación para revisar el alcance y el siguiente paso?",
    ].filter(Boolean).join("\n");
    setEmailDraftHref(buildContactEmailHref(subject, body));
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-describedby="contact-form-note"
      className="contact-form"
    >
      <div className="contact-form__intro">
        <span className="contact-eyebrow">
          {activeContext ? `Ruta: ${activeContext.label}` : context ? `Interés: ${context.label}` : `Perfil: ${currentProfile.label}`}
        </span>
        <h2 className="contact-form__title">
          {activeContext ? "Preparemos la conversación correcta" : context ? "Ajusta el perfil de tu solicitud" : "Prepara tu solicitud"}
        </h2>

        {activeContext && (
          <div role="status" className="contact-context">
            <strong>{activeContext.title}</strong>
            <p>{activeContext.copy}</p>
            {selectedPlan ? <p><strong>Plan consultado:</strong> {selectedPlan}. El precio publicado es de referencia; alcance y condiciones se confirman en la propuesta.</p> : null}
          </div>
        )}
        {context && !activeContext && (
          <div role="status" className="contact-context">
            <strong>{context.title}</strong>
            <p>El perfil seleccionado es {currentProfile.label}. El interés de origen se conserva y puedes editar la necesidad antes de abrir WhatsApp.</p>
          </div>
        )}

        <fieldset className="contact-profile">
          <legend>¿Desde qué perfil nos escribes?</legend>
          <div className="contact-profile-grid">
          {profileOptions.map((opt) => (
            <button
              key={opt.id}
              aria-pressed={profile === opt.id}
              type="button"
              onClick={() => { setProfile(opt.id); invalidatePreparedMessages(); }}
              className="contact-profile__button"
            >
              {opt.label}
            </button>
          ))}
          </div>
        </fieldset>
      </div>

      <div className="contact-form-row">
        <div>
          <label htmlFor="contact-name">
          {profile === "esp" || profile === "agroindustria" || profile === "agroindustrial" || profile === "territorio" || profile === "digital" || profile === "proyecto" || profile === "clima" ? "Nombre y cargo *" : "Nombre *"}
          </label>
          <input
            id="contact-name"
            name="name"
            autoComplete="name"
            required
            type="text"
            className="contact-field"
            placeholder="Ej.: Carlos Restrepo"
            value={name}
            onChange={(e) => { setName(e.target.value); invalidatePreparedMessages(); }}
          />
        </div>

        <div>
          <label htmlFor="contact-entity">
            {currentProfile.entityLabel}
          </label>
          <input
            id="contact-entity"
            name="organization"
            autoComplete="organization"
            required
            type="text"
            className="contact-field"
            placeholder={currentProfile.entityPlaceholder}
            value={entity}
            onChange={(e) => { setEntity(e.target.value); invalidatePreparedMessages(); }}
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div>
          <label htmlFor="contact-email">
            Correo Electrónico {phone.trim() ? "(opcional)" : "*"}
          </label>
          <input
            id="contact-email"
            aria-describedby="contact-method-note"
            name="email"
            autoComplete="email"
            spellCheck={false}
            required={!phone.trim()}
            type="email"
            className="contact-field"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); invalidatePreparedMessages(); }}
          />
        </div>

        <div>
          <label htmlFor="contact-phone">
            Celular / WhatsApp {email.trim() ? "(opcional)" : "*"}
          </label>
          <input
            id="contact-phone"
            aria-describedby="contact-method-note"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            required={!email.trim()}
            type="tel"
            className="contact-field"
            placeholder="+57 300 000 0000…"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); invalidatePreparedMessages(); }}
          />
        </div>
      </div>
      <p className="contact-form__method-note" id="contact-method-note">Déjanos al menos un medio para responderte: correo electrónico o teléfono/WhatsApp.</p>

      <div className="contact-form-row">
        <div>
          <label htmlFor="contact-location">
            {currentProfile.locationLabel}
          </label>
          <input
            id="contact-location"
            name="location"
            autoComplete="address-level2"
            required
            type="text"
            className="contact-field"
            placeholder={currentProfile.locationPlaceholder}
            value={location}
            onChange={(e) => { setLocation(e.target.value); invalidatePreparedMessages(); }}
          />
        </div>

        <div>
          <label htmlFor="contact-volume">
            {currentProfile.scaleLabel}
          </label>
          <input
            id="contact-volume"
            name="volume"
            type="text"
            className="contact-field"
            placeholder={currentProfile.placeholderVol}
            value={volume}
            onChange={(e) => { setVolume(e.target.value); invalidatePreparedMessages(); }}
          />
        </div>
      </div>

      <div className="contact-form__details">
        <label htmlFor="contact-details">
          Qué quieres resolver o decidir
        </label>
        <textarea
          id="contact-details"
          name="details"
          className="contact-field"
          rows={3}
          placeholder="Describe la situación actual, el plazo y la decisión que necesitas tomar…"
          value={details}
          onChange={(e) => { setDetails(e.target.value); invalidatePreparedMessages(); }}
        />
      </div>

      <div className="contact-form__consent">
        <input
          id="contact-data-consent"
          name="dataConsent"
          type="checkbox"
          required
          checked={dataConsent}
          onChange={(event) => {
            const checked = event.target.checked;
            setDataConsent(checked);
            setEmailDraftHref("");
            if (!checked) {
              setSubmitted(false);
              setWhatsappUrl("");
            }
          }}
        />
        <div>
          <label htmlFor="contact-data-consent">
            He leído la política y autorizo a GREENATICS S.A.S. a tratar los datos que incluí para responder y dar seguimiento a esta solicitud.
          </label>
          <p id="contact-consent-note">
            Al abrir WhatsApp, el texto se pasa a ese servicio; para correo, se prepara en la aplicación que tengas configurada. Greenatics recibe la solicitud si tú decides enviarla. Consulta la <Link href="/legal/privacidad/">política de tratamiento de datos personales</Link>.
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="button button--primary contact-form__submit"
      >
        <span>Revisar resumen y abrir WhatsApp →</span>
      </button>
      <button type="button" className="button button--ghost contact-form__email-button" onClick={handlePrepareEmail}>
        Preparar borrador de correo
      </button>
      {emailDraftHref ? (
        <div className="contact-form__email-ready" role="status" aria-live="polite">
          <p>El mensaje está preparado. Revisa el destinatario y el contenido en tu aplicación de correo antes de enviarlo.</p>
          <a className="button button--ghost" href={emailDraftHref}>Abrir borrador de correo →</a>
        </div>
      ) : null}
      {submitted ? (
        <p role="status" aria-live="polite" className="contact-form__response">
          El resumen está listo en WhatsApp. Revísalo y envíalo cuando estés de acuerdo. Si no se abrió una nueva pestaña, <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">continúa aquí</a>.
        </p>
      ) : null}
      <p id="contact-form-note" className="contact-form__note">
        Este formulario no registra automáticamente un caso en una plataforma interna. Puedes revisar y enviar el resumen por WhatsApp o preparar un correo para editarlo antes de enviarlo. El borrador en este sitio se conserva solo en esta pestaña mientras preparas la solicitud. Greenatics recibe tus datos si eliges enviar el mensaje. Consulta nuestra <Link href="/legal/privacidad/">política de privacidad</Link>.
      </p>
      {(draftRecovered || name || entity || email || phone || location || volume || details) ? (
        <div className="contact-form__draft-actions">
          {draftRecovered ? <span role="status">Recuperamos tu borrador de esta pestaña.</span> : <span>Tu borrador permanece en esta pestaña.</span>}
          <button type="button" onClick={clearContactDraft}>Borrar borrador local</button>
        </div>
      ) : null}
      {toolHandoffStatus !== "none" ? (
        <p role="status" aria-live="polite" className="contact-form__note contact-form__note--recovery">
        {toolHandoffStatus === "missing"
            ? "Esta herramienta o evaluación intentó transferir un resumen temporal, pero la sesión del navegador no lo conservó. Revisa y completa el requerimiento antes de preparar un envío."
            : "Los datos de la herramienta o evaluación se conservan temporalmente en esta sesión del navegador para preparar el resumen; no se incluyen en la dirección web. El sitio no los envía al abrir esta página. Si eliges WhatsApp o correo, podrás revisar el mensaje antes de enviarlo."}
        </p>
      ) : null}
    </form>
  );
}
