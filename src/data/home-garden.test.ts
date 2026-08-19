import { describe, expect, it } from "vitest";
import {
  homeGardenDiagnostic,
  homeGardenKits,
  homeGardenProducts,
  homeGardenRelease,
  visibleHomeGardenKits,
} from "./home-garden";
import { getWondergreenReference } from "./wondergreen-public";

describe("Casa, Jardín y Vivero governed offer", () => {
  it("maps the five household stages to existing Wondergreen technical truth", () => {
    expect(homeGardenProducts).toHaveLength(5);
    expect(homeGardenProducts.map((product) => [product.consumerName, product.formula])).toEqual([
      ["COMPOST", undefined],
      ["CRECE", "15-3-3"],
      ["EQUILIBRA", "7-7-7"],
      ["FLORECE", "3-8-3"],
      ["FRUCTIFICA", "3-3-8"],
    ]);

    for (const product of homeGardenProducts) {
      const technicalReference = getWondergreenReference(product.technicalSlug);
      expect(technicalReference, product.technicalSlug).toBeDefined();
      expect(technicalReference?.truthStatus).toBe("commercial-reconciled");
      if (product.formula) expect(technicalReference?.formula).toBe(product.formula);
    }
  });

  it("publishes five prelaunch kit concepts while keeping transplant kit blocked", () => {
    expect(visibleHomeGardenKits).toHaveLength(5);
    expect(visibleHomeGardenKits.every((kit) => kit.availability === "prelaunch")).toBe(true);

    const transplant = homeGardenKits.find((kit) => kit.id === "trasplanta-arranca");
    expect(transplant?.availability).toBe("blocked");
    expect(transplant?.guardrail).toMatch(/no se publica como SKU/i);
  });

  it("keeps prices, checkout, B2C variants and dose calculator disabled", () => {
    expect(homeGardenRelease).toMatchObject({
      indexable: false,
      checkoutEnabled: false,
      priceEnabled: false,
      householdDoseCalculatorEnabled: false,
      householdVariantsReconciled: false,
    });
    expect(homeGardenDiagnostic.calculatorEnabled).toBe(false);
  });

  it("stops fertilizer-first recommendations when a safety trigger is present", () => {
    expect(homeGardenDiagnostic.safetyTriggers).toEqual([
      "very-wilted",
      "waterlogged",
      "pest-damage",
      "root-problem",
    ]);
    expect(homeGardenDiagnostic.safetyMessage).toMatch(/NO EMPIECES FERTILIZANDO/i);
  });

  it("routes stage logic without turning every symptom into a fertilizer recommendation", () => {
    expect(homeGardenDiagnostic.stages).toEqual({
      growing: "crece",
      stable: "equilibra",
      flowering: "florece",
      fruiting: "fructifica",
      mixed: "casa-completa",
    });
  });
});
