import { describe, expect, it } from "vitest";
import { audienceLandings, audienceSolutionPaths } from "./audience-landings";
import { commercialModules } from "./commercial-modules";
import { services } from "./services";
import { strategicPrograms } from "./strategic-programs";

const serviceSlugs = new Set(services.map((service) => service.slug));
const programSlugs = new Set(strategicPrograms.map((program) => program.slug));
const moduleIds = new Set(commercialModules.map((commercialModule) => commercialModule.id));

describe("audience solution landings", () => {
  it("defines exactly the two master B2B audience routes", () => {
    expect(audienceLandings).toHaveLength(2);
    expect(audienceSolutionPaths).toEqual([
      "/soluciones/esp-municipios",
      "/soluciones/empresas-grandes-generadores",
    ]);
  });

  it("reuses governed programs, modules and services without creating parallel product truth", () => {
    for (const landing of audienceLandings) {
      for (const slug of landing.programSlugs) expect(programSlugs.has(slug)).toBe(true);
      for (const id of landing.moduleIds) expect(moduleIds.has(id)).toBe(true);
      for (const stage of landing.stages) {
        expect(stage.serviceSlugs.length).toBeGreaterThan(0);
        for (const slug of stage.serviceSlugs) expect(serviceSlugs.has(slug)).toBe(true);
      }
    }
  });

  it("keeps the ESP route centered on ESP READY and the enterprise route centered on PMIRS RED", () => {
    const esp = audienceLandings.find((landing) => landing.slug === "esp-municipios");
    const companies = audienceLandings.find((landing) => landing.slug === "empresas-grandes-generadores");

    expect(esp?.programSlugs).toContain("esp-ready");
    expect(esp?.programSlugs).not.toContain("pmirs-red");
    expect(companies?.programSlugs).toContain("pmirs-red");
    expect(companies?.programSlugs).not.toContain("esp-ready");
  });

  it("routes every decision to an existing governed public destination", () => {
    const knownPaths = new Set([
      ...services.map((service) => `/soluciones/${service.slug}`),
      ...strategicPrograms.map((program) => `/soluciones/programas/${program.slug}`),
    ]);

    for (const landing of audienceLandings) {
      expect(landing.decisions).toHaveLength(6);
      for (const decision of landing.decisions) expect(knownPaths.has(decision.href)).toBe(true);
    }
  });
});
