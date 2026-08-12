import type { MetadataRoute } from "next";
import { crops } from "@/data/crops";
import { products } from "@/data/products";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://greenatics.com.co";
  const staticRoutes = [
    "",
    "/nosotros",
    "/diagnostico",
    "/servicios",
    "/biblioteca",
    "/biblioteca/guia-deficiencias",
    "/biblioteca/manual-uso-wondergreen",
    "/biblioteca/catalogo-wondergreen",
    "/biblioteca/pastos-gramineas",
    "/biblioteca/huertas",
    "/wondergreen",
    "/wondergreen/cultivos",
    "/wondergreen/cotizador",
    "/municipios",
    "/empresas",
    "/tecnologia",
    "/proyectos",
    "/proyectos/yarumal",
    "/proyectos/tamesis",
    "/impacto",
    "/contacto",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}/`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : route === "/wondergreen" || route === "/servicios" ? 0.9 : route.startsWith("/biblioteca") ? 0.85 : 0.8,
    })),
    ...products.map((product) => ({
      url: `${base}/wondergreen/productos/${product.slug}/`,
      changeFrequency: "monthly" as const,
      priority: product.commercialStatus === "PRECIO_VALIDADO" ? 0.78 : 0.68,
    })),
    ...crops.map((crop) => ({
      url: `${base}/wondergreen/cultivos/${crop.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
