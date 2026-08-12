import { describe, expect, it } from "vitest";
import { companyServices, municipalServices, serviceCategories, services } from "./services";

describe("Greenatics services master", () => {
  it("keeps the 13 governed services with unique slugs", () => {
    expect(services).toHaveLength(13);
    expect(new Set(services.map((service) => service.slug)).size).toBe(13);
  });

  it("covers the five service categories", () => {
    expect(serviceCategories).toEqual(["Planeación", "Recolección", "Infraestructura", "Operación", "Datos"]);
    for (const category of serviceCategories) {
      expect(services.some((service) => service.category === category)).toBe(true);
    }
  });

  it("preserves audience routing without hiding shared services", () => {
    expect(municipalServices.every((service) => service.audience !== "Empresas")).toBe(true);
    expect(companyServices.every((service) => service.audience !== "Municipios y ESP")).toBe(true);
    expect(municipalServices.some((service) => service.slug === "pgirs")).toBe(true);
    expect(companyServices.some((service) => service.slug === "pmirs")).toBe(true);
  });

  it("keeps every public service self-contained", () => {
    for (const service of services) {
      expect(service.summary.length).toBeGreaterThan(30);
      expect(service.solves.length).toBeGreaterThan(30);
      expect(service.includes.length).toBeGreaterThanOrEqual(6);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(4);
    }
  });
});
