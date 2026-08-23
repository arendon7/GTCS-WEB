import { test, expect } from "@playwright/test";

test("Wondergreen catalog starts with commercial products and keeps orientation secondary", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  await expect(page.getByRole("heading", { name: "Productos concretos, formulación por formulación." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Comerciales reconciliadas" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /Encontrar mi programa/ })).toHaveAttribute("href", "/wondergreen/finder");

  const growCard = page.getByRole("link", { name: /2Grow Sólido/ }).first();
  await expect(growCard).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(growCard.getByRole("img", { name: "Identidad visual aprobada de la línea Wondergreen 2Grow" })).toBeVisible();
});

test("Wondergreen product page exposes presentations and official PDF relationships without inventing an individual technical sheet", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");

  await expect(page.getByRole("heading", { name: /2Grow Sólido/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Identidad visual aprobada de la línea Wondergreen 2Grow" })).toBeVisible();
  await expect(page.getByText("Documentación oficial", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Abre los documentos aprobados, no una reconstrucción de ellos." })).toBeVisible();
  await expect(page.getByText("5 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("40 kg", { exact: true })).toBeVisible();

  const hrefs = await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs).toContain("/api/public-resources/wondergreen-product-master");
  expect(hrefs).toContain("/api/public-resources/wondergreen-guide-cafe");
  expect(hrefs).toContain("/api/public-resources/wondergreen-guide-cacao");
  expect(hrefs.join(" ")).not.toMatch(/sharepoint|graph\.microsoft/i);

  await expect(page.getByRole("heading", { name: "Ficha técnica específica" })).toBeVisible();
  await expect(page.getByText("Pendiente de vincular master público", { exact: true })).toBeVisible();
});
