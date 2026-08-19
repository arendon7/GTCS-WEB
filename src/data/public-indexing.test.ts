import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { protectedOpsRoutePrefixes } from "../lib/ops-access-policy";
import { audienceSolutionPaths } from "./audience-landings";
import { publicNav, publicReservedRoutes, publicSite, publicStaticRoutes } from "./public-site";
import { services } from "./services";
import { strategicPrograms } from "./strategic-programs";
import { publicProjects } from "./projects-public";
import { wondergreenCrops } from "./wondergreen-crops";
import { wondergreenReferences } from "./wondergreen-public";

describe("public navigation and indexing contract", () => {
  it("keeps primary navigation on governed public routes", () => {
    const governedSet = new Set<string>([...publicStaticRoutes, ...publicReservedRoutes]);
    expect(publicNav.map((item) => item.href)).toHaveLength(new Set(publicNav.map((item) => item.href)).size);
    for (const item of publicNav) expect(governedSet.has(item.href)).toBe(true);
  });

  it("builds a sitemap from governed indexed public data only", () => {
    const entries = sitemap();
    const urls = entries.map((item) => item.url);
    const expectedCount = publicStaticRoutes.length + audienceSolutionPaths.length + strategicPrograms.length + services.length + publicProjects.length + wondergreenCrops.length + wondergreenReferences.length;

    expect(entries).toHaveLength(expectedCount);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/esp-municipios`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/empresas-grandes-generadores`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/programas/esp-ready`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/programas/greenatics-base`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/programas/pmirs-red`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/diagnostico-caracterizacion`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/proyectos/yarumal`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/wondergreen/cultivos/cafe`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/wondergreen/productos/2grow-solido-15-3-3`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/wondergreen/productos/extracto-neem`);
    for (const path of publicReservedRoutes) expect(urls).not.toContain(`${publicSite.publicDomainTarget}${path}`);
    expect(urls.some((url) => url.includes("/app"))).toBe(false);
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
  });

  it("derives robots exclusions from live OPS routes and auth utilities", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallow = rules.flatMap((rule) => Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []);

    for (const path of [...protectedOpsRoutePrefixes, "/login", "/auth/", "/api/"]) {
      expect(disallow).toContain(path);
    }
    for (const path of publicStaticRoutes) expect(disallow).not.toContain(path);
    for (const path of publicReservedRoutes) expect(disallow).not.toContain(path);
    for (const stalePath of ["/maintenance", "/purchase-requests", "/settlements", "/suppliers"]) {
      expect(disallow).not.toContain(stalePath);
    }
    expect(disallow).toHaveLength(new Set(disallow).size);
    expect(config.sitemap).toBe(`${publicSite.publicDomainTarget}/sitemap.xml`);
  });
});
