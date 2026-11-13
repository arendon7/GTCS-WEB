import { isPrivateOrLocalHost, runtimeLinks } from "@/lib/runtime-links";

export type DigitalToolCode = "OPS" | "RED" | "CO₂" | "AG" | "SANA";

export type DigitalTool = {
  code: DigitalToolCode;
  name: string;
  status: string;
  title: string;
  audience: string;
  copy: string;
  includes: readonly string[];
  result: string;
  image?: string;
  imageAlt?: string;
  homeKind: string;
  homeTitle: string;
  homeSummary: string;
  homeAction: string;
  landingHref: string;
  publicHref: string;
  landingLabel: string;
  publicLabel: string;
  scope: string;
  requestLabel: string;
  requestHref?: string;
  implementationInterest: string;
  runtimeHref: string;
};

const routeIdentity = (href: string) => {
  const url = new URL(href, "https://greenatics.invalid");
  return `${url.origin}${url.pathname.replace(/\/+$/, "") || "/"}`;
};

// A fragment changes the destination within a page, not the page itself.
export const hasSeparateLanding = (publicHref: string, landingHref: string) =>
  routeIdentity(publicHref) !== routeIdentity(landingHref);

export const digitalTools: readonly DigitalTool[] = [
  {
    code: "OPS",
    name: "GREENATICS OPS",
    status: "Muestra pública · datos ficticios",
    title: "La memoria operativa de cada planta.",
    audience: "Para plantas, supervisión y dirección",
    copy: "Registra lo que ocurre durante la jornada y conecta cada decisión con su fuente: actividad, recepción, lote, equipo, mantenimiento, inventario o salida.",
    includes: ["Bitácora y control de actividades", "Ingresos, pesajes, volúmenes y lotes", "Dashboard, alertas y calidad del dato"],
    result: "Un historial operativo que permite entender qué ocurrió, quién lo atendió y qué requiere decisión.",
    image: "/tools/ops-plant-editorial.jpg",
    imageAlt: "Operaria revisa una jornada de trabajo junto a material orgánico en una instalación de tratamiento.",
    homeKind: "Muestra pública · operación de planta",
    homeTitle: "De la recepción al cierre de jornada, cada dato en contexto.",
    homeSummary: "Reúne ingresos, lotes, tareas, equipos e inventario para reconstruir qué ocurrió en la planta y decidir qué revisar. La muestra pública usa datos ficticios; no representa una operación real.",
    homeAction: "Entrar a la muestra OPS",
    landingHref: "/app/",
    publicHref: "/app/",
    landingLabel: "Conocer alcance de OPS",
    publicLabel: "Abrir muestra de GREENATICS OPS",
    scope: "Operación · Supervisión · Dirección",
    requestLabel: "Conversar sobre una configuración",
    implementationInterest: "greenatics-ops",
    runtimeHref: runtimeLinks.opsApp,
  },
  {
    code: "RED",
    name: "GREENATICS Red",
    status: "Muestra pública · datos ficticios",
    title: "Del diagnóstico a la gestión con seguimiento.",
    audience: "Para municipios, ESP, organizaciones y grandes generadores",
    copy: "Red conecta el contexto del territorio u organización con el trabajo de campo, los datos, los PGIRS o PMIRS, las acciones y sus evidencias. Las microrrutas son solo una parte del alcance. El recorrido usa datos ficticios y no representa una operación real.",
    includes: ["Actores, generadores y cobertura", "Trabajo de campo, novedades y soportes", "Hallazgos, programas, responsables e indicadores"],
    result: "Una lectura común del problema para ordenar prioridades, planes y seguimiento.",
    image: "/tools/red-territory-editorial.jpg",
    imageAlt: "Equipo técnico conversa con un operador de aseo en una calle de un municipio andino.",
    homeKind: "Muestra pública · municipios y organizaciones",
    homeTitle: "Del plan acordado a las acciones que se pueden seguir.",
    homeSummary: "Explora cómo se conectan PGIRS/PMIRS, generadores, trabajo de campo, evidencias y seguimiento. La muestra usa datos ficticios; no representa una operación real.",
    homeAction: "Recorrer la muestra Red",
    landingHref: "/red/",
    publicHref: "/red/app/",
    landingLabel: "Conocer alcance de Red",
    publicLabel: "Abrir muestra de GREENATICS Red",
    scope: "PGIRS · PMIRS · Campo",
    requestLabel: "Conversar sobre territorio u organización",
    implementationInterest: "greenatics-red",
    runtimeHref: runtimeLinks.red,
  },
  {
    code: "CO₂",
    name: "Back 2 Green",
    status: "Inventario autogestionado · acompañamiento experto",
    title: "Organiza el inventario de emisiones a tu ritmo.",
    audience: "Para organizaciones y equipos de sostenibilidad",
    copy: "Tu equipo registra actividades y soportes a su ritmo. La plataforma organiza fuentes, periodos y avances con una guía por tareas; Greenatics acompaña las decisiones metodológicas y revisa los puntos críticos del inventario.",
    includes: ["Registro progresivo de fuentes y evidencias", "Guía de uso y recorrido para organizar cada etapa", "Acompañamiento profesional y revisión metodológica"],
    result: "Un inventario trazable que ayuda a explicar los datos, preparar información para los requerimientos aplicables y priorizar decisiones climáticas.",
    image: "/tools/huella/dashboard.png",
    imageAlt: "Pantalla de trabajo de Back 2 Green con el avance y las fuentes de un inventario de referencia.",
    homeKind: "Inventario corporativo de GEI",
    homeTitle: "Organiza el inventario a tu ritmo, con criterio profesional.",
    homeSummary: "Registra fuentes y evidencias por etapas; recibe acompañamiento para revisar datos y decisiones metodológicas.",
    homeAction: "Ver método, planes y precios",
    landingHref: "/huella/",
    publicHref: "/huella/",
    landingLabel: "Conocer Back 2 Green",
    publicLabel: "Ver plataforma y planes",
    scope: "Inventario · Método · Evidencia",
    requestLabel: "Solicitar demo guiada o acceso",
    requestHref: "/contacto/?interes=calcula-tu-huella",
    implementationInterest: "calcula-tu-huella",
    runtimeHref: runtimeLinks.huella,
  },
  {
    code: "AG",
    name: "AGROWAY",
    status: "Demo navegable · desarrollo en curso",
    title: "Conecta lo que ocurre en cada lote con las decisiones del ciclo.",
    audience: "Para productores, proyectos agrícolas y equipos técnicos",
    copy: "AGROWAY relaciona productor, finca, lote, diagnóstico, plan, labores, evidencia y cosecha. Su visión integra trabajo de campo, Greenatics Control y datos de ciclo para SANA; explora la demo navegable y el alcance que estamos desarrollando.",
    includes: ["Proyectos, fincas, ciclos y lotes", "MIPFRE por zona y seguimiento de campo", "Evidencias, cosecha y visión de datos para SANA"],
    result: "Una historia de ciclo que conecta operación agrícola, criterio técnico, evidencia y decisiones de proyecto.",
    image: "/tools/agroway-field-editorial.jpg",
    imageAlt: "Productora técnica observa un cultivo de café y registra una nota en una finca andina.",
    homeKind: "Demo navegable · agricultura",
    homeTitle: "Del lote y el plan a una historia de ciclo que el equipo puede revisar.",
    homeSummary: "Recorre productor, finca, cultivo, MIPFRE, labores, evidencias y cosecha. La visión de producto también conecta trazabilidad, Control y SANA Data; la integración real se valida por separado.",
    homeAction: "Recorrer la demo",
    landingHref: "/agroway/",
    publicHref: "/agroway/app/",
    landingLabel: "Conocer AGROWAY",
    publicLabel: "Abrir demo navegable AGROWAY",
    scope: "Trazabilidad · Campo · Proyecto",
    requestLabel: "Conversar sobre trazabilidad agrícola",
    implementationInterest: "agroway",
    runtimeHref: "",
  },
  {
    code: "SANA",
    name: "SANA",
    status: "En desarrollo · muestra conceptual",
    title: "Un marco para conectar proyectos productivos con inversión y acompañamiento.",
    audience: "Para inversionistas, aliados y proyectos productivos",
    copy: "SANA articula oportunidades agrícolas con inversión, capacidades técnicas de Greenatics y Wondergreen, acompañamiento y evidencia. Cada proyecto define su alcance, sus responsabilidades y las herramientas pertinentes.",
    includes: ["Lectura de oportunidad y contexto", "Criterios para seguimiento del proyecto", "Articulación entre capital, ciencia y campo"],
    result: "Un marco común para conversar sobre información, inversión y acompañamiento productivo.",
    image: "/tools/sana-project-editorial.jpg",
    imageAlt: "Productor y equipo técnico conversan sobre el alcance de un proyecto agrícola en una finca.",
    homeKind: "En desarrollo · muestra conceptual",
    homeTitle: "Antes de estructurar un proyecto, aclara qué necesita.",
    homeSummary: "Pon en común la oportunidad, el alcance técnico, las capacidades y las responsabilidades para definir etapas y seguimiento.",
    homeAction: "Explorar el marco SANA",
    landingHref: "/sana/",
    publicHref: "/sana/app/",
    landingLabel: "Conocer SANA",
    publicLabel: "Explorar muestra SANA",
    scope: "Inversión · Campo · Acompañamiento",
    requestLabel: "Conversar sobre un proyecto",
    implementationInterest: "sana",
    runtimeHref: "",
  },
] as const;

export const isExternalRuntime = (url: string) => /^https?:\/\//.test(url);
export const isLocalRuntime = (url: string) => {
  try {
    return isPrivateOrLocalHost(new URL(url).hostname);
  } catch {
    return false;
  }
};

export const getRuntimeEntryHref = (tool: Pick<DigitalTool, "code" | "runtimeHref">) => {
  if (!tool.runtimeHref) return "";
  if (tool.code === "CO₂") return `${tool.runtimeHref.replace(/\/+$/, "")}/login`;
  return tool.runtimeHref;
};

export const toolByCode = (code: DigitalToolCode) => digitalTools.find((tool) => tool.code === code)!;
