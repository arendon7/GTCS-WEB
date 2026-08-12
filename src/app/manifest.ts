import type { MetadataRoute } from "next";
import { publicSite } from "@/data/public-site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: publicSite.name,
    short_name: publicSite.name,
    description: publicSite.description,
    start_url: "/",
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
