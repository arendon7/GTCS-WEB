import type { Service, ServiceSlug } from "@/data/services";

export type ServiceVisual = { src: string; alt: string; caption: string; fit?: "contain" | "cover" };

export const serviceVisuals: Record<ServiceSlug, ServiceVisual> = {
  "diagnostico-residuos": {
    src: "/service-visuals/diagnostic-characterization-editorial.jpg",
    alt: "Dos profesionales separan una muestra de residuos vegetales en una bandeja y registran la actividad.",
    caption: "Caracterizar la corriente permite reconocer oportunidades y definir el siguiente paso.",
    fit: "cover",
  },
  "pgirs-pmirs": {
    src: "/services/pgirs-pmirs-planning-editorial-v1.jpg",
    alt: "Equipo técnico conversa sobre la gestión de residuos mientras revisa un mapa de territorio.",
    caption: "La planeación conecta las necesidades del territorio y de cada organización con acciones y responsables.",
    fit: "cover",
  },
  "plantas-modulares": {
    src: "/projects/concepts/plant-engineering-concept-v1.webp",
    alt: "Representación de una configuración propuesta de planta regional, con áreas techadas, zonas de recepción y tanques de proceso.",
    caption: "Cada configuración se diseña según la corriente, el predio y la operación prevista.",
    fit: "cover",
  },
  "microrrutas-motocarguero": {
    src: "/projects/routes/motocarguero-verde-operacion-real.webp",
    alt: "Representación visual del motocarguero con el contenedor verde diseñado por Greenatics y Auteco Mobility.",
    caption: "La representación del diseño Greenatics–Auteco acompaña el análisis de ruta, capacidad y recepción para cada operación.",
    fit: "contain",
  },
  "operacion-delegada": {
    src: "/tools/greenatics-ops-documentary-v01.jpg",
    alt: "Una persona revisa residuos orgánicos en un contenedor mientras otra registra la recepción junto a una báscula.",
    caption: "Recepción, pesaje y revisión técnica conectan el flujo operativo de la planta.",
  },
  "greenatics-ops": {
    src: "/tools/ops-plant-editorial.jpg",
    alt: "Una operadora revisa información del proceso junto a material orgánico en una planta.",
    caption: "El acompañamiento define qué registrar, quién lo actualiza y cómo consultar la información que necesita cada operación.",
    fit: "cover",
  },
  "aprovechamiento-productivo": {
    src: "/services/valorization-characterization-editorial.jpg",
    alt: "Una profesional compara muestras de subproductos orgánicos antes de evaluar alternativas.",
    caption: "Las características de la biomasa orientan qué alternativas de aprovechamiento conviene estudiar.",
  },
  "programas-wondergreen": {
    src: "/products/wondergreen-program-multicrop-context-v1.jpg",
    alt: "Cultivos de café, cacao y aguacate en un paisaje andino.",
    caption: "La estrategia nutricional se plantea según el cultivo, el lote y la etapa.",
  },
};

export function getServiceVisual(service: Pick<Service, "slug">): ServiceVisual {
  return serviceVisuals[service.slug];
}
