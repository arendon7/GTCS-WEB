import { test, expect } from "@playwright/test";

test("Wondergreen product catalog exposes governed references", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  await expect(page.getByRole("heading", { name: /Un portafolio que muestra también/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar por cultivo →" })).toHaveAttribute("href", "/wondergreen/cultivos");
});

test("commercial product page shows reconciled state without inventing a packshot", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");

  await expect(page.getByRole("heading", { name: /2Grow Sólido/ })).toBeVisible();
  await expect(page.getByText("Referencia comercial reconciliada").first()).toBeVisible();
  await expect(page.getByText("Reconciliada", { exact: true })).toBeVisible();
  await expect(page.getByText(/El packshot se publicará únicamente/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Manual de uso Wondergreen" })).toHaveAttribute("href", "/biblioteca/manual-uso-wondergreen");
});

test("technical bioinput page does not pretend to be commercially available", async ({ page }) => {
  await page.goto("/wondergreen/productos/extracto-neem");

  await expect(page.getByRole("heading", { name: /Extracto de Neem/ })).toBeVisible();
  await expect(page.getByText(/Portafolio técnico · ficha\/registro por reconciliar/).first()).toBeVisible();
  await expect(page.getByText("Requiere confirmación", { exact: true })).toBeVisible();
  await expect(page.getByText("Consultar", { exact: true })).toBeVisible();
});
