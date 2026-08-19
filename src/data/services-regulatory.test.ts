import { describe, expect, it } from "vitest";
import { getService, services } from "./services";

describe("public services regulatory and commercial boundaries", () => {
  it("keeps the governed catalog at thirteen unique technical services", () => {
    expect(services).toHaveLength(13);
    expect(new Set(services.map((service) => service.slug)).size).toBe(13);
    for (const service of services) expect(service.scopeNote?.trim().length).toBeGreaterThan(40);
  });

  it("separates technical generation measurements from regulatory aforo", () => {
    const service = getService("diagnostico-caracterizacion");
    expect(service?.includes).toContain("mediciones de generación y caracterización");
    expect(service?.includes.join(" ")).not.toMatch(/aforos y caracterización/i);
    expect(service?.scopeNote).toMatch(/no constituyen por sí solas un aforo regulatorio/i);
    expect(service?.scopeNote).toMatch(/alcance independiente/i);
  });

  it("keeps PGIRS territorial ownership and PMIRS applicability explicit", () => {
    const pgirs = getService("pgirs");
    expect(pgirs?.scopeNote).toMatch(/corresponde al municipio o distrito/i);
    expect(pgirs?.scopeNote).toMatch(/Greenatics presta apoyo técnico/i);

    const pmirs = getService("pmirs");
    expect(pmirs?.name).toBe("PMIRS y planes internos de gestión de residuos");
    expect(pmirs?.scopeNote).toMatch(/actividad, ubicación, tipo de residuo y normativa aplicable/i);
    expect(pmirs?.scopeNote).toMatch(/no presume que exista un mismo PMIRS obligatorio/i);
  });

  it("uses treatment and valorization language for organics infrastructure", () => {
    expect(getService("prefactibilidad")?.name).toMatch(/tratamiento y valorización/i);
    expect(getService("plantas-nuevas")?.name).toMatch(/tratamiento y valorización/i);
    expect(getService("operacion-integral")?.name).toMatch(/tratamiento y valorización/i);
    expect(getService("recoleccion-tratamiento")?.name).toMatch(/tratamiento de residuos orgánicos/i);
  });

  it("does not transfer public-service provider status through technical operation language", () => {
    expect(getService("rutas-selectivas")?.scopeNote).toMatch(/no transfiere por sí solo la calidad de prestador/i);
    expect(getService("direccion-operacion")?.scopeNote).toMatch(/no transfiere por sí sola a Greenatics la condición de prestador/i);
    expect(getService("operacion-integral")?.scopeNote).toMatch(/No significa, por sí mismo, que Greenatics asuma integralmente el servicio público de aseo/i);
    expect(getService("recoleccion-tratamiento")?.scopeNote).toMatch(/no convierte automáticamente a Greenatics en prestador frente al usuario/i);
  });

  it("keeps digital traceability supportive rather than regulatory by default", () => {
    const service = getService("trazabilidad-datos");
    expect(service?.scopeNote).toMatch(/No sustituye automáticamente reportes regulatorios/i);
    expect(service?.scopeNote).toMatch(/debe definirse y validarse de forma expresa/i);
  });
});
