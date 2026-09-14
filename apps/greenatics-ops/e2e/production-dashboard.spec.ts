import { test, expect } from "@playwright/test";

async function recordProduction(page: import("@playwright/test").Page, productId: string, quantity: string, process: string) {
  await page.goto("/production/new");
  await page.getByLabel("Producto").selectOption(productId);
  await page.getByLabel(/Cantidad producida/).fill(quantity);
  await page.getByLabel("Proceso fuente").fill(process);
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
  await expect(page).toHaveURL(/\/production$/);
}

test("dashboard separates production units and keeps stock as current snapshot", async ({ page }) => {
  await recordProduction(page, "wondergreen-solido", "250", "Formulación sólida QA");
  await recordProduction(page, "wondergreen-liquido", "600", "Formulación líquida QA");

  await page.goto("/dashboard");
  const production = page.getByLabel("Producción del periodo");
  const stock = page.getByLabel("Stock actual");

  await expect(production).toContainText("250");
  await expect(production).toContainText("kg");
  await expect(production).toContainText("600");
  await expect(production).toContainText("L");
  await expect(stock).toContainText("250");
  await expect(stock).toContainText("600");

  await page.getByLabel("Fecha").fill("2026-08-10");
  await expect(production).toContainText("Sin producción terminada registrada en este periodo.");
  await expect(stock).toContainText("250");
  await expect(stock).toContainText("kg");
  await expect(stock).toContainText("600");
  await expect(stock).toContainText("L");
});

test("inventory events join the dashboard operational timeline", async ({ page }) => {
  await recordProduction(page, "wondergreen-solido", "125", "Peletizado QA");
  await page.goto("/dashboard");
  const timeline = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Eventos operativos recientes" }) });
  await expect(timeline).toContainText(/Producción TAM-PROD-/);
  await expect(timeline).toContainText("Wondergreen sólido · 125 kg");
});
