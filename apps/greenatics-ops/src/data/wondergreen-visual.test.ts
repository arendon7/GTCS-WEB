import { describe, expect, it } from "vitest";
import { getWondergreenVisualTone } from "./wondergreen-visual";
import { wondergreenReferences } from "./wondergreen-public";

describe("Wondergreen V9 visual routing", () => {
  it("keeps the four nutritional families on their governed line identities", () => {
    const byFamily = new Map(wondergreenReferences.map((reference) => [reference.family, reference]));

    expect(getWondergreenVisualTone(byFamily.get("2Grow")!)).toBe("grow");
    expect(getWondergreenVisualTone(byFamily.get("2Balance")!)).toBe("balance");
    expect(getWondergreenVisualTone(byFamily.get("2Bloom")!)).toBe("bloom");
    expect(getWondergreenVisualTone(byFamily.get("2Fruit")!)).toBe("fruit");
  });

  it("routes compost and bioinputs without changing Product Truth", () => {
    const compost = wondergreenReferences.find((reference) => reference.slug === "compost")!;
    const neem = wondergreenReferences.find((reference) => reference.slug === "extracto-neem")!;
    const trichoderma = wondergreenReferences.find((reference) => reference.slug === "trichoderma")!;

    expect(getWondergreenVisualTone(compost)).toBe("compost");
    expect(getWondergreenVisualTone(neem)).toBe("botanical");
    expect(getWondergreenVisualTone(trichoderma)).toBe("bioinput");
  });
});
