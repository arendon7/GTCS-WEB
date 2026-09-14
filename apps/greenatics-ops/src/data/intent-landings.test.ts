import { describe, expect, it } from "vitest";
import { commercialModules } from "./commercial-modules";
import { intentLandings, intentSolutionPaths } from "./intent-landings";
import { services } from "./services";
import { strategicPrograms } from "./strategic-programs";

describe("intent solution landings", () => {
  const servicePaths = new Set(services.map((service) => `/soluciones/${service.slug}`));
  const programPaths = new Set(strategicPrograms.map((program) => `/soluciones/programas/${program.slug}`));
  const moduleIds = new Set(commercialModules.map((commercialModule) => commercialModule.id));

  it("keeps exactly three distinct intent routes", () => {
    expect(intentLandings).toHaveLength(3);
    expect(intentSolutionPaths).toEqual([
      "/soluciones/residuos-organicos",
      "/soluciones/infraestructura-plantas",
      "/soluciones/propiedad-horizontal-redes",
    ]);
    expect(new Set(intentSolutionPaths).size).toBe(intentSolutionPaths.length);
  });

  it("routes every decision, stage, program and module to governed truth", () => {
    for (const landing of intentLandings) {
      expect(landing.decisions).toHaveLength(6);
      expect(landing.path).toHaveLength(6);
      expect(landing.stages).toHaveLength(3);

      for (const decision of landing.decisions) {
        expect(servicePaths.has(decision.href) || programPaths.has(decision.href)).toBe(true);
      }
      for (const programSlug of landing.programSlugs) {
        expect(strategicPrograms.some((program) => program.slug === programSlug)).toBe(true);
      }
      for (const moduleId of landing.moduleIds) expect(moduleIds.has(moduleId)).toBe(true);
      for (const stage of landing.stages) {
        expect(stage.serviceSlugs.length).toBeGreaterThan(0);
        for (const slug of stage.serviceSlugs) expect(services.some((service) => service.slug === slug)).toBe(true);
      }
    }
  });

  it("keeps organic capture distinct from theoretical potential and infrastructure from automatic construction", () => {
    const organics = intentLandings.find((landing) => landing.slug === "residuos-organicos");
    const infrastructure = intentLandings.find((landing) => landing.slug === "infraestructura-plantas");

    expect(`${organics?.proofTitle} ${organics?.proofCopy}`.toLowerCase()).toContain("potencial");
    expect(`${organics?.proofTitle} ${organics?.proofCopy}`.toLowerCase()).toContain("útil");
    expect(infrastructure?.title.toLowerCase()).toContain("no es construir");
    expect(infrastructure?.decisions.some((decision) => decision.href === "/soluciones/prefactibilidad")).toBe(true);
  });

  it("keeps multiunit property on GREENATICS BASE and PMIRS RED without importing ESP READY", () => {
    const network = intentLandings.find((landing) => landing.slug === "propiedad-horizontal-redes");
    expect(network?.programSlugs).toContain("greenatics-base");
    expect(network?.programSlugs).toContain("pmirs-red");
    expect(network?.programSlugs).not.toContain("esp-ready");
  });
});
