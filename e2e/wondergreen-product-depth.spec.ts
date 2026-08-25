import { test, expect } from "@playwright/test";

test("Wondergreen catalog starts with commercial products and keeps orientation secondary", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  await expect(page.getByRole("heading", { name: "Productos concretos, formulación por formulación." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Estado comercial confirmado" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /Encontrar mi programa/ })).toHaveAttribute("href", "/wondergreen/finder");

  const growCard = page.getByRole("link", { name: /2Grow Sólido/ }).first();
  await expect(growCard).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(growCard.getByRole("img", { name: "Identidad visual aprobada de la línea Wondergreen 2Grow" })).toBeVisible();
});

test("Wondergreen product page exposes presentations plus open and download PDF actions without inventing an individual technical sheet", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: /2Grow Sólido/ })).toBeVisible();
  await expect(main.getByRole("img", { name: "Identidad visual aprobada de la línea Wondergreen 2Grow" })).toBeVisible();
  await expect(main.getByText("Documentación oficial", { exact: true })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Abre o descarga los documentos aprobados, no una reconstrucción de ellos." })).toBeVisible();
  await expect(main.getByText("5 kg", { exact: true })).toBeVisible();
  await expect(main.getByText("40 kg", { exact: true })).toBeVisible();

  const hrefs = await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs).toContain("/api/public-resources/wondergreen-product-master");
  expect(hrefs).toContain("/api/public-resources/wondergreen-product-master?download=1");
  expect(hrefs).toContain("/api/public-resources/wondergreen-guide-cafe");
  expect(hrefs).toContain("/api/public-resources/wondergreen-guide-cafe?download=1");
  expect(hrefs).toContain("/api/public-resources/wondergreen-guide-cacao");
  expect(hrefs).toContain("/api/public-resources/wondergreen-guide-cacao?download=1");
  expect(hrefs.join(" ")).not.toMatch(/sharepoint|graph\.microsoft/i);

  await expect(main.getByRole("link", { name: /Descargar catálogo PDF/ })).toHaveAttribute("href", "/api/public-resources/wondergreen-product-master?download=1");
  await expect(main.getByRole("link", { name: /Descargar guía PDF/ }).first()).toHaveAttribute("href", /\?download=1$/);
  await expect(main.getByRole("heading", { name: "Ficha técnica específica" })).toBeVisible();
  await expect(main.getByText("Pendiente de vincular documento público", { exact: true })).toBeVisible();
});