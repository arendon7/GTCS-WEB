import { describe, expect, it } from "vitest";
import { serviceJourneys } from "./service-journeys";
import { services } from "./services";

describe("public commercial service journeys", () => {
  it("keeps four distinct commercial entry journeys", () => {
    expect(serviceJourneys).toHaveLength(4);
    expect(new Set(serviceJourneys.map((journey) => journey.number)).size).toBe(4);
    expect(new Set(serviceJourneys.map((journey) => journey.title)).size).toBe(4);
  });

  it("references only governed service slugs", () => {
    const serviceSlugs = new Set(services.map((service) => service.slug));
    for (const journey of serviceJourneys) {
      for (const service of journey.services) expect(serviceSlugs.has(service.slug)).toBe(true);
    }
  });

  it("covers every public service exactly once", () => {
    const journeySlugs = serviceJourneys.flatMap((journey) => journey.services.map((service) => service.slug));
    expect(journeySlugs).toHaveLength(services.length);
    expect(new Set(journeySlugs).size).toBe(services.length);
    expect([...journeySlugs].sort()).toEqual(services.map((service) => service.slug).sort());
  });
});
