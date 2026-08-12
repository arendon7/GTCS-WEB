import { describe, expect, it } from "vitest";
import { getPublicProject, publicProjects } from "./projects-public";

describe("Greenatics public project master", () => {
  it("publishes only the two governed initial cases with unique slugs", () => {
    expect(publicProjects).toHaveLength(2);
    expect(new Set(publicProjects.map((project) => project.slug)).size).toBe(2);
    expect(publicProjects.map((project) => project.slug)).toEqual(["yarumal", "tamesis"]);
  });

  it("distinguishes documented operation from historical assessment", () => {
    expect(getPublicProject("yarumal")?.status).toBe("documented-case");
    expect(getPublicProject("tamesis")?.status).toBe("historical-assessment");
  });

  it("requires a publication context that prevents historical facts becoming current claims", () => {
    for (const project of publicProjects) {
      expect(project.publicationContext.length).toBeGreaterThan(100);
      expect(project.publicationContext.toLowerCase()).toMatch(/actual|presente|históric|vigente/);
    }
  });

  it("keeps projects qualitative until governed current metrics exist", () => {
    for (const project of publicProjects) {
      expect(project).not.toHaveProperty("capacity");
      expect(project).not.toHaveProperty("production");
      expect(project).not.toHaveProperty("investment");
      expect(project.capabilities.length).toBeGreaterThanOrEqual(6);
      expect(project.learnings.length).toBeGreaterThanOrEqual(3);
    }
  });
});
