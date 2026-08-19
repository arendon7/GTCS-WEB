import { describe, expect, it } from "vitest";
import {
  homeGardenDiagnostic,
  homeGardenKits,
  homeGardenProducts,
  homeGardenRegulatoryGate,
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

  it("keeps household variants as sourced proposals rather than reconciled SKUs", () => {
    expect(homeGardenProducts.find((product) => product.id === "prepara")?.plannedHouseholdVariants).toEqual(["2 kg", "5 kg"]);
    for (const id of ["crece", "equilibra", "florece", "fructifica"]) {
      expect(homeGardenProducts.find((product) => product.id === id)?.plannedHouseholdVariants).toEqual(["500 g", "1 kg", "2 kg", "5 kg"]);
    }
    expect(homeGardenRelease.householdVariantsReconciled).toBe(false);
  });

  it("keeps the exact V1 kit compositions while transplant remains blocked", () => {
    expect(visibleHomeGardenKits).toHaveLength(5);
    expect(homeGardenKits.find((kit) => kit.id === "plantas-verdes")?.contents).toEqual([
      "CRECE · 500 g",
      "EQUILIBRA · 500 g",
      "Dosificador · calibración pendiente",
      "Guía de uso · QR pendiente",
    ]);
    expect(homeGardenKits.find((kit) => kit.id === "mi-huerta")?.contents).toContain("COMPOST · 2 kg");
    expect(homeGardenKits.find((kit) => kit.id === "casa-completa-xl")?.contents.slice(0, 4)).toEqual([
      "CRECE · 1 kg",
      "EQUILIBRA · 1 kg",
      "FLORECE · 1 kg",
      "FRUCTIFICA · 1 kg",
    ]);

    const transplant = homeGardenKits.find((kit) => kit.id === "trasplanta-arranca");
    expect(transplant?.availability).toBe("blocked");
    expect(transplant?.guardrail).toMatch(/no se publica como SKU/i);
  });

  it("keeps prices, checkout and dose calculator disabled", () => {
    expect(homeGardenRelease).toMatchObject({
      indexable: false,
      checkoutEnabled: false,
      priceEnabled: false,
      householdDoseCalculatorEnabled: false,
    });
    expect(homeGardenDiagnostic.calculatorEnabled).toBe(false);
  });

  it("captures S M L XL for future sizing without assigning dose", () => {
    expect(homeGardenDiagnostic.potSizes).toEqual(["S", "M", "L", "XL"]);
    expect(homeGardenRelease.householdDoseCalculatorEnabled).toBe(false);
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

  it("requires regulatory verification before household presentations become sellable", () => {
    expect(homeGardenRegulatoryGate.status).toBe("pending-verification");
    expect(homeGardenRegulatoryGate.authority).toBe("ICA");
    expect(homeGardenRegulatoryGate.rule).toMatch(/registro de venta/i);
    expect(homeGardenRegulatoryGate.rule).toMatch(/etiquetado/i);
    expect(homeGardenRegulatoryGate.rule).toMatch(/envasador\/empacador/i);
  });
});
