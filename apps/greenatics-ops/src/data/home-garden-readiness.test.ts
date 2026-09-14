import { describe, expect, it } from "vitest";
import {
  blockedHomeGardenLaunchItems,
  homeGardenAllInCostChecklist,
  homeGardenCommerceGate,
  homeGardenLaunchReadiness,
  pendingHomeGardenLaunchItems,
  readyHomeGardenLaunchItems,
} from "./home-garden-readiness";

describe("Casa, Jardín y Vivero commercial readiness", () => {
  it("separates what is already governed from launch dependencies", () => {
    expect(readyHomeGardenLaunchItems.map((item) => item.id)).toEqual([
      "technical-product-truth",
      "kit-composition-v1",
      "safe-diagnostic",
    ]);

    expect(pendingHomeGardenLaunchItems.map((item) => item.id)).toEqual([
      "household-skus",
      "regulatory",
      "dose-and-dosifier",
      "all-in-cost",
      "fulfillment",
      "public-assets",
    ]);

    expect(blockedHomeGardenLaunchItems.map((item) => item.id)).toEqual(["transplant-kit"]);
  });

  it("binds launch dependencies to explicit evidence gates", () => {
    expect(pendingHomeGardenLaunchItems.map((item) => [item.id, item.evidenceGate])).toEqual([
      ["household-skus", "household-skus"],
      ["regulatory", "regulatory"],
      ["dose-and-dosifier", "dose-and-dosifier"],
      ["all-in-cost", "all-in-cost"],
      ["fulfillment", "fulfillment"],
      ["public-assets", "public-assets"],
    ]);

    expect(readyHomeGardenLaunchItems.find((item) => item.id === "technical-product-truth")?.evidenceGate)
      .toBe("technical-product-truth");
  });

  it("keeps ecommerce, price and margin claims fail-closed", () => {
    expect(homeGardenCommerceGate).toMatchObject({
      indexable: false,
      checkoutEnabled: false,
      priceEnabled: false,
      canPublishPrice: false,
      canClaimMargin: false,
    });
    expect(homeGardenCommerceGate.rule).toMatch(/regulatorios/i);
    expect(homeGardenCommerceGate.rule).toMatch(/costo all-in/i);
    expect(homeGardenCommerceGate.rule).toMatch(/misma referencia y presentación/i);
  });

  it("requires an all-in cost instead of deriving margin from fertilizer content alone", () => {
    expect(homeGardenAllInCostChecklist).toEqual(expect.arrayContaining([
      "Contenido/fertilizante por presentación",
      "Empaque individual y cierre",
      "Etiqueta y material impreso",
      "Dosificador",
      "Contenedor del kit / fique",
      "Caja o embalaje exterior",
      "Mano de obra y ensamble",
      "Control de calidad",
      "Merma y reproceso",
      "Pasarela de pago y comisiones",
      "Logística y flete según política comercial",
    ]));
    expect(homeGardenAllInCostChecklist.length).toBeGreaterThanOrEqual(14);
  });

  it("contains no price or margin numeric assumptions", () => {
    const serialized = JSON.stringify({ homeGardenLaunchReadiness, homeGardenAllInCostChecklist, homeGardenCommerceGate });
    expect(serialized).not.toMatch(/\$\s?\d/);
    expect(serialized).not.toMatch(/\b\d+(?:[.,]\d+)?\s?%/);
  });
});
