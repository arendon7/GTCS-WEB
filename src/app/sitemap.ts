export const dynamic = "force-static";

import { MetadataRoute } from "next";
import { crops } from "@/data/crops";
import { portfolioGroups } from "@/data/portfolio";
import { products } from "@/data/products";
import { casaJardinKits, casaJardinProducts } from "@/data/casa-jardin-detail";
import { services } from "@/data/services";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = site.url;
  const pageUrl = (route: string) => {
    const normalizedPath = route.replace(/^\/+|\/+$/g, "");
    return normalizedPath ? `${baseUrl}/${normalizedPath}/` : `${baseUrl}/`;
  };

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: pageUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: pageUrl("soluciones"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: pageUrl("acceso"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: pageUrl("portafolio"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: pageUrl("wondergreen"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: pageUrl("casa-jardin"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: pageUrl("biblioteca"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: pageUrl("biblioteca/catalogo-wondergreen"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: pageUrl("biblioteca/glosario"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: pageUrl("biblioteca/guia-deficiencias"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("biblioteca/huertas"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("biblioteca/manual-uso-wondergreen"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("biblioteca/pastos-gramineas"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("recursos"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("faq"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.55 },
    { url: pageUrl("proyectos"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("proyectos/yarumal"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: pageUrl("proyectos/tamesis"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: pageUrl("red"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: pageUrl("app"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: pageUrl("plataforma"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("plataforma/usuarios"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: pageUrl("agroway"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("agroway/app"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("sana"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("sana/app"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("impacto"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: pageUrl("nosotros"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("contacto"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("municipios"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("empresas"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("agroindustria"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("diagnostico"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("herramientas"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("herramientas/estimador-organicos"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("huella"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: pageUrl("servicios"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: pageUrl("servicios/recoleccion-tratamiento"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("servicios/rehabilitacion-infraestructura"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("servicios/optimizacion-composteras"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("casa-jardin/productos"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: pageUrl("casa-jardin/kits"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: pageUrl("casa-jardin/guias"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: pageUrl("legal/privacidad"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: pageUrl("legal/terminos"), lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: pageUrl("parque-ambiental"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: pageUrl("tecnologia"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map(({ slug }) => ({
    url: pageUrl(`servicios/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const wondergreenResourceRoutes: MetadataRoute.Sitemap = [
    "analisis-agua",
    "analisis-suelo",
    "balance-bases",
    "balance-cn",
    "beneficio-cafe",
    "calculadora",
    "calendario-agricola",
    "calibracion-aspersores",
    "ciencia",
    "compatibilidad",
    "costo-unidad-nutriente",
    "cultivos",
    "encalamiento",
    "fitosanidad",
    "hogar",
    "logistica-flete",
    "quiz-deficiencias",
    "valorizacion-pecuaria",
  ].map((slug) => ({
    url: pageUrl(`wondergreen/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const casaJardinRoutes: MetadataRoute.Sitemap = [
    ...casaJardinProducts.map(({ slug }) => ({
      url: pageUrl(`casa-jardin/productos/${slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...casaJardinKits.map(({ slug }) => ({
      url: pageUrl(`casa-jardin/kits/${slug}`),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const solutionRoutes: MetadataRoute.Sitemap = [
    "auditoria-sui",
    "beneficio-tributario",
    "biogas-energia",
    "circularidad-empresarial",
    "flota-recoleccion",
    "podas-municipales",
    "riesgo-lixiviados",
    "viabilidad-municipal",
  ].map((slug) => ({
    url: pageUrl(`soluciones/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const cropRoutes: MetadataRoute.Sitemap = crops.map((crop) => ({
    url: pageUrl(`wondergreen/cultivos/${crop.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioGroups.map((group) => ({
    url: pageUrl(`portafolio/${group.slug}`),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = [
    ...products.map((product) => ({
      url: pageUrl(`wondergreen/productos/${product.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    {
      url: pageUrl("wondergreen/productos/biol"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  return [...staticRoutes, ...serviceRoutes, ...solutionRoutes, ...portfolioRoutes, ...productRoutes, ...cropRoutes, ...casaJardinRoutes, ...wondergreenResourceRoutes];
}
