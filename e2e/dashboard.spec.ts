import { test, expect } from "@playwright/test";

test("dashboard changes horizon and plant without changing metric semantics", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByLabel("Indicadores operativos").getByText("3.94 t", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Semana" }).click();
  await expect(page.getByText(/10 ago|11 ago/i).first()).toBeVisible();
  await page.getByLabel("Planta").selectOption("yarumal");
  await expect(page.getByLabel("Indicadores operativos").getByText("1.84 t", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Comparación operacional" })).toBeVisible();
});

test("dashboard exposes rankings and operational history", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Horas-hombre por proceso" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Horas por trabajador" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tiempo fuera de servicio" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eventos operativos recientes" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Exportar CSV" })).toBeVisible();
});
