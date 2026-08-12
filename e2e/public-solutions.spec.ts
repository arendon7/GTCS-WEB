import { test, expect } from "@playwright/test";

test("solutions hub exposes the governed service architecture", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("heading", { name: /El proyecto no empieza en la planta/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Del PGIRS a una operación sostenible/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /De residuo operativo a flujo gestionado/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver solución en profundidad/i }).first()).toHaveAttribute("href", /\/soluciones\//);
});

test("solution detail preserves problem, scope and deliverables", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");

  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByText("Qué problema busca resolver", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué puede incluir" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Entregables típicos" })).toBeVisible();
  await expect(page.getByText("línea base", { exact: true })).toBeVisible();
});

test("public solutions route keeps the bridge to OPS", async ({ page }) => {
  await page.goto("/soluciones");
  await page.getByRole("banner").getByRole("link", { name: "Acceder a Greenatics" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});
