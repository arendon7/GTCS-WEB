import { expect, test } from "@playwright/test";

async function jsonLdObjects(page: import("@playwright/test").Page) {
  const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return texts.flatMap((text) => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  });
}

test("priced Wondergreen product is quoteable but not checkout-ready", async ({ page }) => {
  const response = await page.goto("/wondergreen/productos/2grow-solido-40kg/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  await expect(page.getByText("Referencia comercial reconciliada")).toBeVisible();
  await expect(page.getByRole("link", { name: "Solicitar cotización" })).toBeVisible();
  await expect(page.getByText("Consultar / comprar")).toHaveCount(0);

  const objects = await jsonLdObjects(page);
  const product = objects.find((item) => item?.["@type"] === "Product");
  expect(product, "Product JSON-LD should exist").toBeTruthy();
  expect(product?.offers, "COMMERCIAL_RECONCILED must not emit schema.org Offer").toBeUndefined();
});

test("technical Wondergreen product stays technical and has no Offer", async ({ page }) => {
  const response = await page.goto("/wondergreen/productos/bioinsumo-trichoderma/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  await expect(page.getByText("Portafolio técnico").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Validar disponibilidad" })).toBeVisible();

  const objects = await jsonLdObjects(page);
  const product = objects.find((item) => item?.["@type"] === "Product");
  expect(product?.offers).toBeUndefined();
});

test("technology page does not publish unsupported UASB specificity", async ({ page }) => {
  const response = await page.goto("/tecnologia/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);

  await expect(page.getByText("Metanogénesis + biogás")).toBeVisible();
  await expect(page.getByText(/UASB/)).toHaveCount(0);
});

test("concept and access pages remain noindex", async ({ page }) => {
  for (const route of ["/wondergreen/hogar/", "/acceso/"]) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), route).toBe(200);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots?.toLowerCase(), `${route} must be noindex`).toContain("noindex");
  }
});
