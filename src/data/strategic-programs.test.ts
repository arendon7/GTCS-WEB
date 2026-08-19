import { describe, expect, it } from "vitest";
import { services } from "./services";
import { getStrategicProgram, strategicPrograms } from "./strategic-programs";

describe("strategic public programs", () => {
  it("publishes only ESP READY and PMIRS RED in this wave", () => {
    expect(strategicPrograms.map((program) => program.slug)).toEqual(["esp-ready", "pmirs-red"]);
  });

  it("keeps every related service grounded in the governed registry", () => {
    const serviceSlugs = new Set(services.map((service) => service.slug));
    for (const program of strategicPrograms) {
      expect(program.relatedServiceSlugs.length).toBeGreaterThan(0);
      for (const slug of program.relatedServiceSlugs) expect(serviceSlugs.has(slug)).toBe(true);
    }
  });

  it("keeps ESP READY dimensions and outputs aligned with the source methodology", () => {
    const program = getStrategicProgram("esp-ready");
    expect(program?.primaryItems).toEqual([
      "Regulación",
      "Clientes",
      "Operación",
      "Tarifa",
      "Facturación",
      "Rutas",
      "Flota",
      "Datos",
      "Contingencias",
      "Infraestructura futura",
    ]);
    expect(program?.outputs).toEqual(["Estado actual", "Brechas", "Prioridades", "Hoja de ruta"]);
  });

  it("keeps PMIRS RED unit and network layers separate", () => {
    const program = getStrategicProgram("pmirs-red");
    expect(program?.primaryItems).toHaveLength(6);
    expect(program?.secondaryItems).toHaveLength(8);
    expect(program?.sourceNote).toMatch(/24 no es un mínimo/i);
  });
});
