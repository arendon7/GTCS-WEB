import { test, expect } from "@playwright/test";

test("legacy knowledge and impact paths land on governed public surfaces", async ({ page }) => {
  await page.goto("/blog");
  await expect(page).toHaveURL(/\/biblioteca$/);
  await expect(page.getByRole("heading", { name: /Guías que puedes leer, usar y descargar/i })).toBeVisible();

  await page.goto("/impacto-y-resultados");
  await expect(page).toHaveURL(/\/impacto$/);
  await expect(page.getByRole("heading", { name: /No basta con decir que aprovechamos residuos/i })).toBeVisible();
});

test("legacy selective collection article preserves intent through the service route", async ({ page }) => {
  await page.goto("/el-potencial-de-la-ruta-selectiva-de-recoleccion-de-residuos");
  await expect(page).toHaveURL(/\/soluciones\/rutas-selectivas$/);
  await expect(page.getByRole("heading", { name: /Diseño e implementación de rutas selectivas/i })).toBeVisible();
});

test("legacy product discovery lands on Wondergreen without preserving old claims", async ({ page }) => {
  for (const path of [
    "/store",
    "/fertilizantes-que-nutren",
    "/winds-of-change-in-the-turbines-service-industries",
    "/a-decline-in-solar-growth-root-cause-of-analysis-records",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/wondergreen$/);
    await expect(page.getByRole("heading", { name: /Nutrición que trabaja con el suelo/i })).toBeVisible();
  }
});

test("spam-contaminated legacy slug remains quarantined", async ({ page }) => {
  const response = await page.goto("/cities-must-show-the-way-forward-on-renewable-energy");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Esta ruta no existe o cambió." })).toBeVisible();
});
