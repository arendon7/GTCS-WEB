import { describe, expect, it } from "vitest";
import { audienceLandings, audienceSolutionPaths } from "./audience-landings";
import { commercialModules } from "./commercial-modules";
import { services } from "./services";
import { strategicPrograms } from "./strategic-programs";

const serviceSlugs = new Set(services.map((service) => service.slug));
const programSlugs = new Set(strategicPrograms.map((program) => program.slug));
const moduleIds = new Set(commercialModules.map((commercialModule) => commercialModule.id));

describe("audience solution landings", () => {
  it("defines exactly the five canonical organization routes", () => {
    expect(audienceLandings).toHaveLength(5);
    expect(audienceSolutionPaths).toEqual([
      "/soluciones/esp",
      "/soluciones/municipios",
      "/soluciones/empresas",
      "/soluciones/propiedad-horizontal",
      "/soluciones/plantas",
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

  it("keeps strategic programs attached only to the audiences they actually govern", () => {
    const esp = audienceLandings.find((landing) => landing.slug === "esp");
    const municipalities = audienceLandings.find((landing) => landing.slug === "municipios");
    const companies = audienceLandings.find((landing) => landing.slug === "empresas");
    const properties = audienceLandings.find((landing) => landing.slug === "propiedad-horizontal");
    const plants = audienceLandings.find((landing) => landing.slug === "plantas");

    expect(esp?.programSlugs).toContain("esp-ready");
    expect(esp?.programSlugs).not.toContain("pmirs-red");
    expect(municipalities?.programSlugs).not.toContain("esp-ready");
    expect(companies?.programSlugs).not.toContain("esp-ready");
    expect(companies?.programSlugs).not.toContain("pmirs-red");
    expect(properties?.programSlugs).toContain("pmirs-red");
    expect(properties?.programSlugs).not.toContain("esp-ready");
    expect(plants?.programSlugs).toEqual([]);
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
