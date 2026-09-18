export const dynamic = "force-static";

import { MetadataRoute } from "next";
import { crops } from "@/data/crops";
import { portfolioGroups } from "@/data/portfolio";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://greenatics.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/soluciones`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/portafolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wondergreen`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wondergreen/cotizador`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/casa-jardin`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/biblioteca`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/recursos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/proyectos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/red`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/plataforma`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/agroway`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/sana`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/impacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/nosotros`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/legal/privacidad`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/legal/terminos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const cropRoutes: MetadataRoute.Sitemap = crops.map((crop) => ({
    url: `${baseUrl}/wondergreen/cultivos/${crop.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioGroups.map((group) => ({
    url: `${baseUrl}/portafolio/${group.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = [
    ...products.map((product) => ({
      url: `${baseUrl}/wondergreen/productos/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    {
      url: `${baseUrl}/wondergreen/productos/biol`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...portfolioRoutes, ...productRoutes, ...cropRoutes];
}
