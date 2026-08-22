export type PublicPrimaryNavItem = {
  href: string;
  label: string;
  menu?: "solutions" | "resources";
};

export type PublicMenuItem = {
  label: string;
  description: string;
  href: string;
  canonicalHref?: string;
};

export const publicPrimaryNav: readonly PublicPrimaryNavItem[] = [
  { href: "/soluciones", label: "Soluciones", menu: "solutions" },
  { href: "/wondergreen", label: "Wondergreen" },
  { href: "/casa-jardin", label: "Casa & Jardín" },
  { href: "/biblioteca", label: "Recursos", menu: "resources" },
  { href: "/nosotros", label: "Nosotros" },
] as const;

export const publicSolutionAudiences: readonly PublicMenuItem[] = [
  {
    label: "ESP / Prestador",
    description: "Preparación, regulación, rutas, operación, infraestructura y datos.",
    href: "/soluciones/esp",
  },
  {
    label: "Municipio",
    description: "Planeación, PGIRS, activos, proyectos y fortalecimiento territorial.",
    href: "/soluciones/municipios",
  },
  {
    label: "Empresa / Gran generador",
    description: "Caracterización, PMIRS, logística, tratamiento y trazabilidad.",
    href: "/soluciones/empresas",
  },
  {
    label: "Propiedad horizontal / Institución",
    description: "Diagnóstico por unidad, PMIRS, redes e información comparable.",
    href: "/soluciones/propiedad-horizontal",
  },
  {
    label: "Planta / Operador",
    description: "Prefactibilidad, rehabilitación, optimización, dirección y datos.",
    href: "/soluciones/plantas",
  },
] as const;

export const publicSolutionNeeds: readonly PublicMenuItem[] = [
  {
    label: "Entender mis residuos",
    description: "Línea base, generación, caracterización y brechas.",
    href: "/soluciones/diagnostico-caracterizacion",
  },
  {
    label: "Organizar la gestión",
    description: "Planes, responsables, actividades, indicadores y seguimiento.",
    href: "/soluciones/pmirs",
  },
  {
    label: "Gestión jurídica y regulatoria",
    description: "Obligaciones, decisiones regulatorias y acciones concretas.",
    href: "/soluciones",
    canonicalHref: "/soluciones/juridica-regulacion",
  },
  {
    label: "Mejorar rutas y logística",
    description: "Usuarios, frecuencias, tiempos, capacidad, recorridos y destino.",
    href: "/soluciones/rutas-selectivas",
  },
  {
    label: "Evaluar o recuperar una planta",
    description: "Decidir, diseñar, rehabilitar u optimizar infraestructura.",
    href: "/soluciones/infraestructura-plantas",
  },
  {
    label: "Mejorar la operación",
    description: "Dirección técnica, protocolos, mantenimiento y control.",
    href: "/soluciones/direccion-operacion",
  },
  {
    label: "Organizar datos y trazabilidad",
    description: "Registros, evidencia, indicadores y GREENATICS OPS.",
    href: "/soluciones/trazabilidad-datos",
  },
  {
    label: "Valorizar y desarrollar productos",
    description: "Calidad, destinos y nuevas rutas de aprovechamiento.",
    href: "/soluciones/residuos-organicos",
    canonicalHref: "/soluciones/valorizacion-productos",
  },
] as const;

export const publicResourceNav: readonly PublicMenuItem[] = [
  {
    label: "Biblioteca",
    description: "Guías, manuales, programas por cultivo y recursos técnicos.",
    href: "/biblioteca",
  },
  {
    label: "Proyectos / Casos",
    description: "Experiencia documentada, contexto y aprendizajes transferibles.",
    href: "/proyectos",
  },
  {
    label: "Impacto",
    description: "Indicadores publicados únicamente cuando cuentan con gobierno y fuente.",
    href: "/impacto",
  },
] as const;
