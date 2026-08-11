import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Greenatics",
    short_name: "Greenatics",
    description: "Transformamos residuos orgánicos en recursos, soluciones agrícolas e impacto medible.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfcf8",
    theme_color: "#008b4c",
    lang: "es-CO",
    icons: [
      {
        src: "/brand/greenatics-symbol.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
