import type { MetadataRoute } from "next";
import { publicProjects } from "@/data/projects-public";
import { publicSite, publicStaticRoutes } from "@/data/public-site";
import { services } from "@/data/services";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { wondergreenReferences } from "@/data/wondergreen-public";

const baseUrl = publicSite.publicDomainTarget.replace(/\/$/, "");

function entry(
  path: string,
  priority: number,
  changeFrequency: "weekly" | "monthly",
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = publicStaticRoutes.map((path) =>
    entry(path, path === "/" ? 1 : 0.8, path === "/" ? "weekly" : "monthly"),
  );

  const serviceEntries = services.map((service) =>
    entry(`/soluciones/${service.slug}`, 0.72, "monthly"),
  );

  const projectEntries = publicProjects.map((project) =>
    entry(`/proyectos/${project.slug}`, 0.68, "monthly"),
  );

  const cropEntries = wondergreenCrops.map((crop) =>
    entry(`/wondergreen/cultivos/${crop.slug}`, 0.74, "monthly"),
  );

  const productEntries = wondergreenReferences.map((reference) =>
    entry(`/wondergreen/productos/${reference.slug}`, reference.truthStatus === "commercial-reconciled" ? 0.76 : 0.64, "monthly"),
  );

  return [...staticEntries, ...serviceEntries, ...projectEntries, ...cropEntries, ...productEntries];
}
