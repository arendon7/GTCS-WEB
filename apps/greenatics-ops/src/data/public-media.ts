export type PublicMediaKind = "brand" | "project-photo";
export type PublicMediaStatus = "approved-public";

export type PublicMediaAsset = {
  id: string;
  src: string;
  kind: PublicMediaKind;
  subject: string;
  alt: string;
  caption: string;
  status: PublicMediaStatus;
  source: string;
  projectSlug?: string;
};

export const publicMediaAssets: PublicMediaAsset[] = [
  {
    id: "brand-greenatics-horizontal",
    src: "/brand/greenatics-horizontal.webp",
    kind: "brand",
    subject: "Greenatics",
    alt: "Greenatics",
    caption: "Identidad oficial Greenatics.",
    status: "approved-public",
    source: "Repositorio canónico · public/brand",
  },
  {
    id: "brand-wondergreen-nutrients",
    src: "/brand/wondergreen-nutrients.webp",
    kind: "brand",
    subject: "Wondergreen Nutrients",
    alt: "Wondergreen Nutrients",
    caption: "Identidad oficial Wondergreen Nutrients.",
    status: "approved-public",
    source: "Repositorio canónico · public/brand",
  },
  {
    id: "project-yarumal-aerial-01",
    src: "/projects/yarumal/aerial-01.webp",
    kind: "project-photo",
    subject: "Planta Yarumal",
    alt: "Vista aérea documentada del caso Greenatics en Yarumal",
    caption: "Vista aérea de archivo · Yarumal · evidencia histórica del proyecto.",
    status: "approved-public",
    source: "Archivo de proyecto reconciliado en GTCS-WEB",
    projectSlug: "yarumal",
  },
  {
    id: "project-yarumal-aerial-02",
    src: "/projects/yarumal/aerial-02.webp",
    kind: "project-photo",
    subject: "Planta Yarumal",
    alt: "Segunda vista aérea documentada del caso Greenatics en Yarumal",
    caption: "Segunda vista aérea de archivo · Yarumal · evidencia histórica del proyecto.",
    status: "approved-public",
    source: "Archivo de proyecto reconciliado en GTCS-WEB",
    projectSlug: "yarumal",
  },
  {
    id: "project-tamesis-process-2023",
    src: "/projects/tamesis/process-2023.webp",
    kind: "project-photo",
    subject: "Planta Támesis",
    alt: "Infraestructura de proceso documentada en el proyecto Greenatics de Támesis",
    caption: "Registro fotográfico de archivo · Támesis · julio de 2023. La imagen documenta infraestructura del proyecto en ese periodo y no representa por sí sola el estado operativo actual.",
    status: "approved-public",
    source: "Registro fotográfico del proyecto Támesis · 2023 · reconciliado para publicación",
    projectSlug: "tamesis",
  },
];

export function getProjectMedia(projectSlug: string) {
  return publicMediaAssets.filter((asset) => asset.kind === "project-photo" && asset.projectSlug === projectSlug);
}

export function getPrimaryProjectMedia(projectSlug: string) {
  return getProjectMedia(projectSlug)[0];
}
