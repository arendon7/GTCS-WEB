import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .find((payload) => payload["@type"] === type);
}

function propertyValue(entity: Record<string, unknown> | undefined, name: string) {
  const properties = Array.isArray(entity?.additionalProperty)
    ? entity.additionalProperty as Record<string, unknown>[]
    : [];
  return properties.find((property) => property.name === name)?.value;
}

test("service detail emits exact non-transactional Service structured data", async ({ page }) => {
  await page.goto("/soluciones/rehabilitacion");
  const service = await jsonLdByType(page, "Service");

  expect(service).toBeTruthy();
  expect(service?.["@id"]).toBe("https://greenatics.com.co/soluciones/rehabilitacion#service");
  expect(service?.name).toBe("Diagnóstico, rehabilitación y puesta en marcha de infraestructura existente");
  expect(service?.description).toBe("Recuperamos plantas, composteras o sistemas subutilizados antes de recomendar reemplazarlos.");
  expect(service?.url).toBe("https://greenatics.com.co/soluciones/rehabilitacion");
  expect(service?.serviceType).toBe("Infraestructura");
  expect(service?.provider).toEqual({ "@id": "https://greenatics.com.co/#organization" });
  expect(service?.audience).toEqual({ "@type": "Audience", audienceType: "Ambos" });
  expect(service?.offers).toBeUndefined();
  expect(service?.aggregateRating).toBeUndefined();
  expect(service?.review).toBeUndefined();
});

test("commercial Wondergreen reference emits descriptive Product data without inventing an Offer", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");
  const product = await jsonLdByType(page, "Product");

  expect(product).toBeTruthy();
  expect(product?.["@id"]).toBe("https://greenatics.com.co/wondergreen/productos/2grow-solido-15-3-3#product");
  expect(product?.name).toBe("2Grow Sólido");
  expect(product?.description).toBe("Línea organomineral para establecimiento, brotación, crecimiento y recuperación vegetativa.");
  expect(product?.url).toBe("https://greenatics.com.co/wondergreen/productos/2grow-solido-15-3-3");
  expect(product?.brand).toEqual({ "@type": "Brand", name: "Wondergreen" });
  expect(product?.category).toBe("2Grow");
  expect(propertyValue(product, "Formulación declarada")).toBe("15-3-3");
  expect(propertyValue(product, "Momento / función")).toBe("Crecimiento vegetativo");
  expect(propertyValue(product, "Estado público")).toBe("Estado comercial confirmado");
  expect(product?.offers).toBeUndefined();
  expect(product?.aggregateRating).toBeUndefined();
  expect(product?.review).toBeUndefined();
  expect(product?.image).toBeUndefined();
  expect(product?.sku).toBeUndefined();
  expect(product?.gtin).toBeUndefined();
  expect(product?.mpn).toBeUndefined();
});

test("technical Wondergreen reference stays non-transactional in Product structured data", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-liquido-200-0-0");
  const product = await jsonLdByType(page, "Product");

  expect(product).toBeTruthy();
  expect(product?.name).toBe("2Grow Líquido · referencia nitrogenada");
  expect(product?.url).toBe("https://greenatics.com.co/wondergreen/productos/2grow-liquido-200-0-0");
  expect(propertyValue(product, "Estado público")).toBe("Portafolio técnico · condición comercial por confirmar");
  expect(product?.offers).toBeUndefined();
  expect(product?.aggregateRating).toBeUndefined();
  expect(product?.review).toBeUndefined();
  expect(product?.image).toBeUndefined();
});
