import { test, expect } from "@playwright/test";

test("dashboard separates critical stock from stock without governed threshold", async ({ page }) => {
  await page.goto("/production/new");
  await page.getByLabel("Producto terminado").selectOption("wondergreen-solido");
  await page.getByLabel(/Cantidad producida/).fill("100");
  await page.getByLabel("Proceso fuente").fill("Producción QA sólido");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
  await expect(page).toHaveURL(/\/production$/);

  await page.getByRole("link", { name: "Registrar producción" }).click();
  await page.getByLabel("Producto terminado").selectOption("wondergreen-liquido");
  await page.getByLabel(/Cantidad producida/).fill("50");
  await page.getByLabel("Proceso fuente").fill("Producción QA líquido");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
  await expect(page).toHaveURL(/\/production$/);

  await page.goto("/inventory/thresholds");
  await expect(page.getByRole("heading", { name: "Umbrales de stock" })).toBeVisible();
  await page.getByLabel("Planta umbral").selectOption("tamesis");
  await page.getByLabel("Producto umbral").selectOption("wondergreen-solido");
  await page.getByLabel("Mínimo de inventario").fill("150");
  await page.getByLabel("Motivo del umbral").fill("Stock mínimo QA validado");
  await page.getByRole("button", { name: "Guardar revisión" }).click();
  await expect(page.getByText("Umbral guardado como nueva revisión de política.")).toBeVisible();
  await expect(page.getByText("Mínimo 150 kg")).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard integrado" })).toBeVisible();
  const criticalKpi=page.locator("article").filter({hasText:"Inventario crítico"}).first();
  await expect(criticalKpi).toContainText("1");
  await expect(criticalKpi).toContainText("1 sin umbral");
  await expect(page.getByRole("heading", { name: "Stock frente a política vigente" })).toBeVisible();
  const solidRow=page.locator("div").filter({hasText:"Wondergreen sólido · Támesis"}).filter({hasText:"Stock 100 kg · mínimo 150 kg"}).first();
  await expect(solidRow).toContainText("Crítico");
  const liquidRow=page.locator("div").filter({hasText:"Wondergreen líquido · Támesis"}).filter({hasText:"Stock 50 L · sin umbral vigente"}).first();
  await expect(liquidRow).toContainText("Sin umbral");
  await expect(page.getByText("Procesado", {exact:true})).toBeVisible();
  await expect(page.getByText("Mantenimiento abierto", {exact:true})).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cobertura e incertidumbre" })).toBeVisible();
});
