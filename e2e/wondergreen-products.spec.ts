import { test, expect } from "@playwright/test";

test("Wondergreen product catalog exposes governed references", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  await expect(page.getByRole("heading", { name: /Un portafolio que muestra también/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar por cultivo →" }).first()).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByText("17 referencias", { exact: true })).toBeVisible();
});

test("catalog browser filters by search, commercial truth and format without changing Product Master", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  const search = page.getByRole("searchbox", { name: "Buscar en el portafolio" });
  await search.fill("Neem");
  await expect(page.getByText("1 referencia", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByRole("button", { name: "Comerciales reconciliadas" }).click();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Líquidos" }).click();
  await expect(page.getByRole("link", { name: /2Grow Líquido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ })).toHaveCount(0);
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
