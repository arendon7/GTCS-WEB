import { describe, expect, it } from "vitest";
import { companyServices, municipalServices, publicServices, serviceCategories } from "@/data/public-services";

describe("Greenatics public services", () => {
  it("keeps unique slugs and all service categories represented", () => {
    expect(new Set(publicServices.map((service) => service.slug)).size).toBe(publicServices.length);
    const represented = new Set(publicServices.map((service) => service.category));
    for (const category of serviceCategories) expect(represented.has(category)).toBe(true);
  });

  it("keeps audience routing honest", () => {
    expect(municipalServices.some((service) => service.slug === "pgirs")).toBe(true);
    expect(companyServices.some((service) => service.slug === "pgirs")).toBe(false);
    expect(companyServices.some((service) => service.slug === "pmirs")).toBe(true);
    expect(municipalServices.some((service) => service.slug === "pmirs")).toBe(false);
    expect(companyServices.some((service) => service.slug === "recoleccion-tratamiento")).toBe(true);
  });

  it("requires enough substance for every published capability", () => {
    for (const service of publicServices) {
      expect(service.summary.length).toBeGreaterThan(35);
      expect(service.solves.length).toBeGreaterThan(45);
      expect(service.includes.length).toBeGreaterThanOrEqual(4);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(4);
      expect(service.cta.length).toBeGreaterThan(5);
    }
  });

  it("keeps GREENATICS OPS as a data capability rather than a public data source", () => {
    const dataService = publicServices.find((service) => service.slug === "trazabilidad-datos");
    expect(dataService?.category).toBe("Datos");
    expect(dataService?.includes).toContain("indicadores publicables bajo aprobación");
  });
});
