import type { MetadataRoute } from "next";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://greenatics.com.co";
  const staticRoutes = ["", "/wondergreen", "/municipios", "/contacto", "/acceso"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}/`, changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 })),
    ...products.map((product) => ({ url: `${base}/wondergreen/productos/${product.slug}/`, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
