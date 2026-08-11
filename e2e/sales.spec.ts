import { test, expect } from "@playwright/test";

async function createStock(page: import("@playwright/test").Page) {
  await page.goto("/production/new");
  await page.getByLabel(/Cantidad producida/).fill("250");
  await page.getByLabel("Proceso fuente").fill("Formulación comercial QA");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
  await expect(page).toHaveURL(/\/production$/);
}

test("sale creates linked commercial dispatch and reduces lot stock", async ({ page }) => {
  await createStock(page);
  await page.goto("/sales/new");
  await expect(page.getByRole("heading", { name: "Registrar venta" })).toBeVisible();
  await page.getByLabel("Cliente").fill("Cliente QA S.A.S.");
  await page.getByLabel(/Cantidad vendida/).fill("60");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await expect(page.getByText(/120[.]000/).first()).toBeVisible();
  await page.getByRole("button", { name: "Guardar venta y descontar inventario" }).click();

  await expect(page).toHaveURL(/\/sales$/);
  const sale = page.locator("article").filter({ hasText: "Cliente QA S.A.S." }).first();
  await expect(sale).toBeVisible();
  await expect(sale).toContainText("60 kg");
  await expect(sale).toContainText(/120[.]000/);
  await expect(sale).toContainText("pago no modelado");

  await page.getByRole("link", { name: "Ver inventario" }).click();
  const stock = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(stock).toContainText("190 kg");
  const commercialMovement = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Kardex reciente" }) });
  await expect(commercialMovement).toContainText("Cliente QA S.A.S.");
  await expect(commercialMovement).toContainText("− 60 kg");
});

test("oversell fails without creating a second sale", async ({ page }) => {
  await createStock(page);
  await page.goto("/sales/new");
  await page.getByLabel("Cliente").fill("Cliente Inicial");
  await page.getByLabel(/Cantidad vendida/).fill("60");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await page.getByRole("button", { name: "Guardar venta y descontar inventario" }).click();
  await expect(page).toHaveURL(/\/sales$/);

  await page.getByRole("link", { name: "Registrar venta" }).click();
  await page.getByLabel("Cliente").fill("Cliente Sobreventa");
  await page.getByLabel(/Cantidad vendida/).fill("300");
  await page.getByLabel(/Precio unitario COP/).fill("2100");
  await page.getByRole("button", { name: "Guardar venta y descontar inventario" }).click();
  const businessAlert = page.locator('p[role="alert"]');
  await expect(businessAlert).toContainText("Stock insuficiente");
  await expect(businessAlert).toContainText("190");

  await page.goto("/sales");
  await expect(page.locator("article").filter({ hasText: "Cliente Inicial" })).toHaveCount(1);
  await expect(page.locator("article").filter({ hasText: "Cliente Sobreventa" })).toHaveCount(0);
  await expect(page.getByText(/120[.]000/).first()).toBeVisible();
});

test("customer master reuses normalized equivalent names", async ({ page }) => {
  await createStock(page);
  await page.goto("/sales/new");
  await page.getByLabel("Cliente").fill("Café José S.A.S.");
  await page.getByLabel(/Cantidad vendida/).fill("20");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await page.getByRole("button", { name: "Guardar venta y descontar inventario" }).click();

  await page.getByRole("link", { name: "Registrar venta" }).click();
  await page.getByLabel("Cliente").fill("CAFE JOSE SAS");
  await page.getByLabel(/Cantidad vendida/).fill("10");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await page.getByRole("button", { name: "Guardar venta y descontar inventario" }).click();

  await expect(page).toHaveURL(/\/sales$/);
  await expect(page.getByLabel("Indicadores de ventas")).toContainText("1");
  await expect(page.locator("article").filter({ hasText: "Café José S.A.S." })).toHaveCount(2);
});
