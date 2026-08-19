import { describe, expect, it } from "vitest";
import { services } from "./services";
import { getStrategicProgram, strategicPrograms } from "./strategic-programs";

describe("strategic public programs", () => {
  it("publishes ESP READY, GREENATICS BASE and PMIRS RED as distinct entry products", () => {
    expect(strategicPrograms.map((program) => program.slug)).toEqual(["esp-ready", "greenatics-base", "pmirs-red"]);
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

  it("keeps GREENATICS BASE as technical baseline rather than regulatory aforo or PMIRS", () => {
    const program = getStrategicProgram("greenatics-base");
    expect(program?.primaryItems).toEqual([
      "Línea base de generación",
      "Caracterización de residuos",
      "Diagnóstico de infraestructura",
      "Lectura operativa del proyecto",
      "Captura digital y evidencia",
      "Consolidación y análisis",
    ]);
    expect(program?.secondaryItems).toContain("Aforo regulatorio");
    expect(program?.secondaryItems).toContain("PMIRS completo");
    expect(program?.sourceNote).toMatch(/alcance independiente conforme al procedimiento aplicable/i);
  });

  it("keeps PMIRS RED unit and network layers separate", () => {
    const program = getStrategicProgram("pmirs-red");
    expect(program?.primaryItems).toHaveLength(6);
    expect(program?.secondaryItems).toHaveLength(8);
    expect(program?.sourceNote).toMatch(/24 no es un mínimo/i);
  });
});
