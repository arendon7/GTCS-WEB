import { test, expect } from "@playwright/test";

test("Wondergreen exposes exact liquid portfolio and technical statuses", async ({ page }) => {
  await page.goto("/wondergreen");

  const portfolio = page.locator("#portafolio");
  await expect(portfolio.getByText("2Grow Líquido · referencia nitrogenada · 200-0-0", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Portafolio técnico · disponibilidad por confirmar", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("2Bloom Líquido · 30-80-30", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Portafolio técnico · condición comercial por reconciliar", { exact: true })).toBeVisible();
});

test("crop library exposes the five initial programs", async ({ page }) => {
  await page.goto("/wondergreen/cultivos");

  for (const crop of ["Café", "Cacao", "Aguacate", "Limón Tahití", "Pastos y gramíneas"]) {
    await expect(page.getByRole("heading", { name: crop, exact: true })).toBeVisible();
  }
});

test("cacao program connects stage guidance to the product master", async ({ page }) => {
  await page.goto("/wondergreen/cultivos/cacao");

  await expect(page.getByText(/01 · Establecimiento/)).toBeVisible();
  await expect(page.getByText("Compost", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("2Grow", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Referencias que aparecen en este programa/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /2Grow Sólido · 15-3-3/i })).toBeVisible();
});
