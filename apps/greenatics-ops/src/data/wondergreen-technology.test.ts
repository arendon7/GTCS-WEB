import { describe, expect, it } from "vitest";
import {
  wondergreenEvidenceLevels,
  wondergreenTechnologyConcepts,
  wondergreenTechnologyImplications,
} from "./wondergreen-technology";

describe("Wondergreen technology truth contract", () => {
  it("keeps exactly the three governed concepts with slow release wording", () => {
    expect(wondergreenTechnologyConcepts.map((concept) => concept.id)).toEqual([
      "organomineral",
      "oclusion",
      "lenta-liberacion",
    ]);

    const serialized = JSON.stringify(wondergreenTechnologyConcepts).toLowerCase();
    expect(serialized).toContain("lenta liberación");
    expect(serialized).not.toContain("liberación controlada");
  });

  it("keeps evidence claims progressive instead of collapsing characteristic into result", () => {
    expect(wondergreenEvidenceLevels.map((level) => level.name)).toEqual([
      "Característica",
      "Mecanismo",
      "Beneficio",
      "Resultado",
    ]);
    expect(wondergreenEvidenceLevels.at(-1)?.publicationRule).toMatch(/evidencia específica/i);
  });

  it("keeps agronomic interpretation contextual", () => {
    expect(wondergreenTechnologyImplications).toHaveLength(4);
    expect(wondergreenTechnologyImplications.map((item) => item.title)).toContain("La evidencia manda");
  });
});
