import { visibleHomeGardenKits, type HomeGardenStage } from "./home-garden";

export type HomeGardenPublicDocument = {
  id: "casa-jardin" | "mi-huerta" | "etapas" | "trasplante";
  title: string;
  summary: string;
  resourceId: string;
  sourceMaster: string;
  stages: readonly HomeGardenStage[];
  status: "public-verified-reconstruction";
};

export const homeGardenPublicDocuments: readonly HomeGardenPublicDocument[] = [
  {
    id: "casa-jardin",
    title: "Guía Wondergreen Casa & Jardín",
    summary: "Método de observación, etapas, semáforo de seguridad, aplicación y errores frecuentes.",
    resourceId: "home-garden-guide-casa-jardin",
    sourceMaster: "GUIA_WONDERGREEN_CASA_Y_JARDIN_IMAGEGEN_V1.pdf",
    stages: ["prepara", "crece", "equilibra", "florece", "fructifica"],
    status: "public-verified-reconstruction",
  },
  {
    id: "mi-huerta",
    title: "Guía Mi Huerta",
    summary: "Ruta PREPARA → CRECE → FLORECE → FRUCTIFICA para una huerta doméstica por etapas.",
    resourceId: "home-garden-guide-mi-huerta",
    sourceMaster: "Guia_Mi_Huerta_Wondergreen_V1_optimizada.pdf",
    stages: ["prepara", "crece", "florece", "fructifica"],
    status: "public-verified-reconstruction",
  },
  {
    id: "etapas",
    title: "Guía rápida de etapas",
    summary: "Referencia visual corta para reconocer suelo, crecimiento, equilibrio, floración y fructificación antes de elegir.",
    resourceId: "home-garden-guide-etapas",
    sourceMaster: "GUIA_RAPIDA_ETAPAS_WONDERGREEN_IMAGEGEN_V1.pdf",
    stages: ["prepara", "crece", "equilibra", "florece", "fructifica"],
    status: "public-verified-reconstruction",
  },
  {
    id: "trasplante",
    title: "Guía de trasplante",
    summary: "Drenaje, raíces, sustrato, estabilidad y observación antes de decidir nutrición.",
    resourceId: "home-garden-guide-trasplante",
    sourceMaster: "GUIA_TRASPLANTE_WONDERGREEN_IMAGEGEN_V1.pdf",
    stages: ["prepara", "crece"],
    status: "public-verified-reconstruction",
  },
] as const;

export function publicDocumentHref(document: HomeGardenPublicDocument) {
  return `/api/public-resources/${document.resourceId}`;
}

export function publicDocumentDownloadHref(document: HomeGardenPublicDocument) {
  return `${publicDocumentHref(document)}?download=1`;
}

export function getHomeGardenDocumentsForStage(stage: HomeGardenStage) {
  return homeGardenPublicDocuments.filter((document) => document.stages.includes(stage));
}

export function getRelatedHomeGardenKitsForStage(stage: HomeGardenStage) {
  return visibleHomeGardenKits.filter((kit) => kit.pathway.includes(stage));
}

export function getHomeGardenDocumentsForKit(kitId: string) {
  if (kitId === "mi-huerta") {
    return homeGardenPublicDocuments.filter((document) => ["mi-huerta", "etapas", "casa-jardin"].includes(document.id));
  }
  return homeGardenPublicDocuments.filter((document) => ["casa-jardin", "etapas"].includes(document.id));
}
