import type { Service } from "@/data/services";

export type ServiceVisual = { src: string; alt: string };

const categoryVisuals: Record<Service["category"], ServiceVisual> = {
  Planeación: {
    src: "/projects/yarumal/aerial-02.webp",
    alt: "Vista aérea del territorio y las áreas de trabajo de un proyecto Greenatics",
  },
  Recolección: {
    src: "/projects/routes/motocarguero-verde-operacion-real.webp",
    alt: "Motocarguero verde de referencia para una ruta de recolección diferenciada",
  },
  Infraestructura: {
    src: "/projects/plant/plant-evidence-10.webp",
    alt: "Recepción de material orgánico en una planta de aprovechamiento",
  },
  Operación: {
    src: "/projects/plant/plant-evidence-08.webp",
    alt: "Pilas y áreas de proceso en una planta de tratamiento de material orgánico",
  },
  Datos: {
    src: "/tools/greenatics-dashboard-concept.jpg",
    alt: "Vista conceptual de un tablero de indicadores operativos Greenatics",
  },
  Valorización: {
    src: "/projects/tamesis/reactor-uasb.jpeg",
    alt: "Reactor anaerobio UASB para valorización de corrientes orgánicas en Támesis",
  },
};

const serviceVisualOverrides: Record<string, ServiceVisual> = {
  "diagnostico-residuos": {
    src: "/projects/yarumal/aerial-02.webp",
    alt: "Vista aérea de la planta, los accesos y el territorio que se analizan en un diagnóstico Greenatics",
  },
  "pgirs-pmirs": {
    src: "/projects/routes/route-evidence-02.webp",
    alt: "Entrega de un recipiente con residuos orgánicos durante una operación documentada en Yarumal",
  },
};

export function getServiceVisual(service: Pick<Service, "slug" | "name" | "category" | "image" | "imageAlt">): ServiceVisual {
  if (service.slug === "programas-wondergreen") {
    return {
      src: "/products/wondergreen-system-stages.webp",
      alt: "Sistema Wondergreen organizado por etapas del cultivo",
    };
  }

  if (serviceVisualOverrides[service.slug]) return serviceVisualOverrides[service.slug];

  return service.image
    ? { src: service.image, alt: service.imageAlt ?? service.name }
    : categoryVisuals[service.category];
}
