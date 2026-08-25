import type { MetadataRoute } from "next";
import { audienceSolutionPaths } from "@/data/audience-landings";
import { intentSolutionPaths } from "@/data/intent-landings";
import { publicProjects } from "@/data/projects-public";
import { publicSite, publicStaticRoutes } from "@/data/public-site";
import { services } from "@/data/services";
import { strategicPrograms } from "@/data/strategic-programs";
import { wondergreenCrops } from "@/data/wondergreen-crops";
import { wondergreenProductLines } from "@/data/wondergreen-product-lines";
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

  const audienceEntries = audienceSolutionPaths.map((path) =>
    entry(path, 0.82, "monthly"),
  );

  const intentEntries = intentSolutionPaths.map((path) =>
    entry(path, 0.8, "monthly"),
  );

  const strategicProgramEntries = strategicPrograms.map((program) =>
    entry(`/soluciones/programas/${program.slug}`, 0.78, "monthly"),
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

  const lineEntries = wondergreenProductLines.map((line) =>
    entry(`/wondergreen/lineas/${line.slug}`, 0.75, "monthly"),
  );

  const productEntries = wondergreenReferences.map((reference) =>
    entry(`/wondergreen/productos/${reference.slug}`, reference.truthStatus === "commercial-reconciled" ? 0.76 : 0.64, "monthly"),
  );

  return [...staticEntries, ...audienceEntries, ...intentEntries, ...strategicProgramEntries, ...serviceEntries, ...projectEntries, ...cropEntries, ...lineEntries, ...productEntries];
}
