import { test, expect } from "@playwright/test";

test("production, references, dispatch and reconciliation preserve append-only traceability", async ({ page }) => {
  await page.goto("/inventory");
  await page.getByLabel("Producto para referencia").selectOption("wondergreen-solido");
  await page.getByLabel("Nueva referencia").fill("WG-SOL-QA-A");
  await page.getByRole("button", { name: "Guardar referencia" }).click();
  await expect(page.getByText(/Referencia actualizada/)).toBeVisible();

  await page.getByRole("link", { name: "Registrar producción" }).first().click();
  await expect(page.getByRole("heading", { name: "Registrar producción" })).toBeVisible();
  await expect(page.getByLabel("Producto terminado")).toContainText("WG-SOL-QA-A");
  await page.getByLabel(/Cantidad producida/).fill("250");
  await page.getByLabel("Proceso fuente").fill("Formulación QA");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();

  await expect(page).toHaveURL(/\/production$/);
  const production = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(production).toBeVisible();
  await expect(production).toContainText("TAM-PROD-");
  await expect(production).toContainText("250 kg");
  await expect(production).toContainText("Ref. WG-SOL-QA-A");
  await expect(production).toContainText("Proceso declarado");

  await page.getByRole("link", { name: "Ver inventario" }).click();
  const stockCard = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(stockCard).toContainText("250 kg");
  await expect(page.getByText(/TAM-PROD-/).first()).toBeVisible();

  await page.getByLabel("Producto para referencia").selectOption("wondergreen-solido");
  await page.getByLabel("Nueva referencia").fill("WG-SOL-QA-B");
  await page.getByRole("button", { name: "Guardar referencia" }).click();
  await expect(page.getByText(/Referencia actualizada/)).toBeVisible();
  await page.getByRole("link", { name: "Ver producción" }).click();
  const historicalProduction = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(historicalProduction).toContainText("Ref. WG-SOL-QA-A");
  await expect(historicalProduction).not.toContainText("Ref. WG-SOL-QA-B");

  await page.getByRole("link", { name: "Ver inventario" }).click();
  await page.getByRole("link", { name: "Registrar salida" }).click();
  await expect(page.getByRole("heading", { name: "Registrar despacho / salida" })).toBeVisible();
  await page.getByLabel(/Cantidad de salida/).fill("300");
  await page.getByLabel("Destino").fill("Cliente QA");
  await page.getByRole("button", { name: "Registrar salida" }).click();
  const businessAlert = page.locator('p[role="alert"]');
  await expect(businessAlert).toContainText("Stock insuficiente");
  await expect(businessAlert).toContainText("250");

  await page.getByLabel(/Cantidad de salida/).fill("60");
  await page.getByRole("button", { name: "Registrar salida" }).click();
  await expect(page).toHaveURL(/\/inventory$/);
  const updatedStock = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(updatedStock).toContainText("190 kg");
  await expect(page.getByText("− 60 kg", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Conciliar inventario" }).click();
  await expect(page.getByRole("heading", { name: "Conciliar inventario" })).toBeVisible();
  await expect(page.getByText("190 kg", { exact: true }).first()).toBeVisible();
  await page.getByLabel("Conteo físico").fill("185");
  await page.getByLabel("Observación del conteo").fill("Conteo físico de cierre QA");
  await expect(page.getByText("-5 kg", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Guardar conciliación" }).click();

  await expect(page).toHaveURL(/\/inventory$/);
  const reconciledStock = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(reconciledStock).toContainText("185 kg");
  const reconciliation = page.locator("article").filter({ hasText: "Conteo físico de cierre QA" }).first();
  await expect(reconciliation).toContainText("Esperado 190 kg · físico 185 kg");
  await expect(reconciliation).toContainText("-5 kg");
  await expect(page.getByText("− 5 kg", { exact: true })).toBeVisible();
});
