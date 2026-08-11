import { test, expect } from "@playwright/test";

async function createStock(page: import("@playwright/test").Page) {
  await page.goto("/production/new");
  await page.getByLabel(/Cantidad producida/).fill("250");
  await page.getByLabel("Proceso fuente").fill("Formulación comercial dashboard QA");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
  await expect(page).toHaveURL(/\/production$/);
}

async function createSale(page: import("@playwright/test").Page) {
  await page.goto("/sales/new");
  await page.getByLabel("Cliente").fill("Cliente Dashboard QA");
  await page.getByLabel(/Cantidad vendida/).fill("60");
  await page.getByLabel(/Precio unitario COP/).fill("2000");
  await page.getByRole("button", { name: "Guardar venta y descontar inventario" }).click();
  await expect(page).toHaveURL(/\/sales$/);
}

test("dashboard shows gross billing for selected period while stock remains current", async ({ page }) => {
  await createStock(page);
  await createSale(page);

  await page.goto("/dashboard");
  const sales = page.getByLabel("Ventas del periodo");
  const stock = page.getByLabel("Stock actual");

  await expect(sales).toContainText(/120[.]000/);
  await expect(sales).toContainText("1 venta");
  await expect(sales).toContainText("60");
  await expect(sales).toContainText("kg");
  await expect(sales).toContainText("Cliente Dashboard QA");
  await expect(stock).toContainText("190");
  await expect(stock).toContainText("kg");

  await page.getByLabel("Fecha").fill("2026-08-10");
  await expect(sales).toContainText("$0");
  await expect(sales).toContainText("Sin ventas registradas en este periodo.");
  await expect(stock).toContainText("190");
  await expect(stock).toContainText("kg");
});

test("sale joins the shared dashboard timeline", async ({ page }) => {
  await createStock(page);
  await createSale(page);
  await page.goto("/dashboard");

  const timeline = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Eventos operativos recientes" }) });
  await expect(timeline).toContainText(/Venta TAM-PROD-/);
  await expect(timeline).toContainText("Cliente Dashboard QA");
  await expect(timeline).toContainText("60 kg");
  await expect(timeline).toContainText(/120[.]000/);
});
