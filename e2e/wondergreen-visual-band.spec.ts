import { test, expect } from "@playwright/test";

const expectedVisuals = [
  ["Línea Wondergreen 2Grow", "/api/public-media/wondergreen-2grow"],
  ["Línea Wondergreen 2Balance", "/api/public-media/wondergreen-2balance"],
  ["Línea Wondergreen 2Bloom", "/api/public-media/wondergreen-2bloom"],
  ["Línea Wondergreen 2Fruit", "/api/public-media/wondergreen-2fruit"],
] as const;

async function expectWondergreenVisualBand(page: import("@playwright/test").Page) {
  await expect(page.getByRole("heading", { name: "Del suelo a cada etapa de la planta." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Sistema Wondergreen por etapas", exact: true })).toHaveAttribute("src", "/api/public-media/wondergreen-system-stages");
  await expect(page.getByRole("img", { name: "Bioinsumos Wondergreen", exact: true })).toHaveAttribute("src", "/api/public-media/wondergreen-bioinsumos");

  for (const [alt, src] of expectedVisuals) {
    await expect(page.getByRole("img", { name: alt, exact: true })).toHaveAttribute("src", src);
  }

  await expect(page.getByRole("link", { name: /Descargar catálogo PDF/i })).toHaveAttribute("href", "/api/public-resources/wondergreen-product-master");
  await expect(page.getByRole("link", { name: "Ver Product Master →", exact: true })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: "Casa & Jardín →", exact: true })).toHaveAttribute("href", "/casa-jardin");
}

test("Wondergreen landing closes with the real visual product system", async ({ page }) => {
  await page.goto("/wondergreen");
  await expectWondergreenVisualBand(page);
});

test("Wondergreen product pages retain the shared visual catalogue band", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");
  await expectWondergreenVisualBand(page);
});
