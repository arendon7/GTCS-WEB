export const dynamic = "force-static";

import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Greenatics · Transformamos residuos en vida",
    short_name: "Greenatics",
    description: "Diseñamos sistemas que conectan residuos, tecnología, operación y datos para devolver valor al territorio.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a2920",
    theme_color: "#006b45",
    icons: [
      {
        src: "/brand/greenatics-horizontal.webp",
        sizes: "360x66",
        type: "image/webp",
      },
    ],
  };
}
