import { describe, expect, it } from "vitest";
import { commercialModules } from "./commercial-modules";
import { services } from "./services";

describe("public commercial decision modules", () => {
  it("publishes six distinct modules without creating a second technical catalog", () => {
    expect(commercialModules).toHaveLength(6);
    expect(new Set(commercialModules.map((commercialModule) => commercialModule.id)).size).toBe(6);
    expect(new Set(commercialModules.map((commercialModule) => commercialModule.title)).size).toBe(6);
  });

  it("routes every module only to governed technical services", () => {
    const serviceSlugs = new Set(services.map((service) => service.slug));
    for (const commercialModule of commercialModules) {
      expect(commercialModule.relatedServiceSlugs.length).toBeGreaterThan(0);
      for (const slug of commercialModule.relatedServiceSlugs) expect(serviceSlugs.has(slug)).toBe(true);
    }
  });

  it("keeps organics and site screening decision-first and technology-neutral", () => {
    const organics = commercialModules.find((commercialModule) => commercialModule.id === "organicos-piloto");
    expect(organics?.signals).toEqual(["Potencial teórico", "Separación real", "Captura efectiva", "Calidad e impropios", "Materia útil"]);
    expect(organics?.guardrail).toMatch(/no presupone una planta ni una tecnología/i);

    const sites = commercialModules.find((commercialModule) => commercialModule.id === "screening-predios");
    expect(sites?.guardrail).toMatch(/no sustituye concepto de uso del suelo/i);
  });

  it("keeps staged accompaniment explicitly non-contractual by default", () => {
    const stagedModule = commercialModules.find((item) => item.id === "acompanamiento-etapas");
    expect(stagedModule?.guardrail).toMatch(/no un cronograma contractual universal/i);
  });
});
