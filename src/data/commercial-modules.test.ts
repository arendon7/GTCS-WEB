import { describe, expect, it } from "vitest";
import { commercialModules } from "./commercial-modules";
import { services } from "./services";

describe("public commercial decision modules", () => {
  it("publishes six distinct modules without creating a second technical catalog", () => {
    expect(commercialModules).toHaveLength(6);
    expect(new Set(commercialModules.map((module) => module.id)).size).toBe(6);
    expect(new Set(commercialModules.map((module) => module.title)).size).toBe(6);
  });

  it("routes every module only to governed technical services", () => {
    const serviceSlugs = new Set(services.map((service) => service.slug));
    for (const module of commercialModules) {
      expect(module.relatedServiceSlugs.length).toBeGreaterThan(0);
      for (const slug of module.relatedServiceSlugs) expect(serviceSlugs.has(slug)).toBe(true);
    }
  });

  it("keeps organics and site screening decision-first and technology-neutral", () => {
    const organics = commercialModules.find((module) => module.id === "organicos-piloto");
    expect(organics?.signals).toEqual(["Potencial teórico", "Separación real", "Captura efectiva", "Calidad e impropios", "Materia útil"]);
    expect(organics?.guardrail).toMatch(/no presupone una planta ni una tecnología/i);

    const sites = commercialModules.find((module) => module.id === "screening-predios");
    expect(sites?.guardrail).toMatch(/no sustituye concepto de uso del suelo/i);
  });

  it("keeps staged accompaniment explicitly non-contractual by default", () => {
    const module = commercialModules.find((item) => item.id === "acompanamiento-etapas");
    expect(module?.guardrail).toMatch(/no un cronograma contractual universal/i);
  });
});
