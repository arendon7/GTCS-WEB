import { describe, expect, it } from "vitest";
import {
  bioinputReferences,
  compostReferences,
  getWondergreenReference,
  liquidFertilizers,
  solidFertilizers,
} from "@/data/wondergreen-public";

describe("Wondergreen public product master", () => {
  it("keeps the canonical fertilizer family counts", () => {
    expect(liquidFertilizers).toHaveLength(5);
    expect(solidFertilizers).toHaveLength(4);
    expect(compostReferences).toHaveLength(1);
  });

  it("includes the complete current bioinput family vocabulary", () => {
    const names = bioinputReferences.map((reference) => reference.name);
    expect(names).toContain("Trichoderma");
    expect(names).toContain("Metarhizium");
    expect(names).toContain("Beauveria");
    expect(names).toContain("Bacillus subtilis");
    expect(names).toContain("Micorrizas");
    expect(names).toContain("Extracto de Neem");
    expect(names).toContain("Extracto Ajo–Ají");
  });

  it("does not promote technical liquid references to reconciled commercial SKUs", () => {
    expect(getWondergreenReference("2grow-liquido-200-0-0")?.truthStatus).toBe("technical-portfolio");
    expect(getWondergreenReference("2bloom-liquido-30-80-30")?.truthStatus).toBe("technical-portfolio");
  });

  it("keeps the reconciled liquid references commercial", () => {
    expect(getWondergreenReference("2grow-liquido-100-20-20")?.truthStatus).toBe("commercial-reconciled");
    expect(getWondergreenReference("2balance-liquido-70-70-70")?.truthStatus).toBe("commercial-reconciled");
    expect(getWondergreenReference("2fruit-liquido-30-30-80")?.truthStatus).toBe("commercial-reconciled");
  });
});
