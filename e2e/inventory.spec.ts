import { test, expect } from "@playwright/test";

test("production creates lot stock and dispatch cannot make it negative", async ({ page }) => {
  await page.goto("/production/new");
  await expect(page.getByRole("heading", { name: "Registrar producción" })).toBeVisible();
  await page.getByLabel(/Cantidad producida/).fill("250");
  await page.getByLabel("Proceso fuente").fill("Formulación QA");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();

  await expect(page).toHaveURL(/\/production$/);
  const production = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(production).toBeVisible();
  await expect(production).toContainText("TAM-PROD-");
  await expect(production).toContainText("250 kg");

  await page.getByRole("link", { name: "Ver inventario" }).click();
  const stockCard = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(stockCard).toContainText("250 kg");
  await expect(page.getByText(/TAM-PROD-/).first()).toBeVisible();

  await page.getByRole("link", { name: "Registrar salida" }).click();
  await expect(page.getByRole("heading", { name: "Registrar despacho / salida" })).toBeVisible();
  await page.getByLabel(/Cantidad de salida/).fill("300");
  await page.getByLabel("Destino").fill("Cliente QA");
  await page.getByRole("button", { name: "Registrar salida" }).click();
  await expect(page.getByRole("alert")).toContainText("Stock insuficiente");
  await expect(page.getByRole("alert")).toContainText("250");

  await page.getByLabel(/Cantidad de salida/).fill("60");
  await page.getByRole("button", { name: "Registrar salida" }).click();
  await expect(page).toHaveURL(/\/inventory$/);
  const updatedStock = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(updatedStock).toContainText("190 kg");
  await expect(page.getByText("− 60 kg", { exact: true })).toBeVisible();
});
