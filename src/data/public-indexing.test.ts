import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { publicNav, publicSite, publicStaticRoutes } from "./public-site";
import { services } from "./services";
import { publicProjects } from "./projects-public";
import { wondergreenCrops } from "./wondergreen-crops";

describe("public navigation and indexing contract", () => {
  it("keeps primary navigation on real public routes", () => {
    const staticSet = new Set<string>(publicStaticRoutes);
    expect(publicNav.map((item) => item.href)).toHaveLength(new Set(publicNav.map((item) => item.href)).size);
    for (const item of publicNav) expect(staticSet.has(item.href)).toBe(true);
  });

  it("builds a sitemap from governed public data only", () => {
    const entries = sitemap();
    const urls = entries.map((item) => item.url);
    const expectedCount = publicStaticRoutes.length + services.length + publicProjects.length + wondergreenCrops.length;

    expect(entries).toHaveLength(expectedCount);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/soluciones/diagnostico-caracterizacion`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/proyectos/yarumal`);
    expect(urls).toContain(`${publicSite.publicDomainTarget}/wondergreen/cultivos/cafe`);
    expect(urls.some((url) => url.includes("/app"))).toBe(false);
    expect(urls.some((url) => url.includes("/dashboard"))).toBe(false);
  });

  it("keeps internal operation prefixes out of crawlable paths", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallow = rules.flatMap((rule) => Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : []);

    expect(disallow).toContain("/app");
    expect(disallow).toContain("/dashboard");
    expect(disallow).toContain("/api/");
    expect(config.sitemap).toBe(`${publicSite.publicDomainTarget}/sitemap.xml`);
  });
});
