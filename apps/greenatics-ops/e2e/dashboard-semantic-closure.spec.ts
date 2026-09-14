import { test, expect } from "@playwright/test";

test("dashboard separates period results from attention signals without inventing a global score", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Resultado del periodo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atención requerida" })).toBeVisible();

  const results = page.getByLabel("Indicadores operativos");
  await expect(results).toContainText("Recibido");
  await expect(results).toContainText("Procesado");
  await expect(results).toContainText("Rechazo");
  await expect(results).toContainText("Horas-hombre");
  await expect(results).toContainText("Cumplimiento plan");
  await expect(results).not.toContainText("Inventario crítico");

  const attention = page.getByLabel("Indicadores de atención");
  await expect(attention).toContainText("Mantenimiento abierto");
  await expect(attention).toContainText("Parada mantenimiento");
  await expect(attention).toContainText("Inventario crítico");
  await expect(attention).toContainText("Calidad de datos");
  await expect(attention).toContainText("Excepciones");

  await expect(page.getByText(/score global/i)).toBeVisible();
  await expect(page.getByText(/salud general|índice global|score:\s*\d/i)).toHaveCount(0);
});

test("dashboard keeps the certified analytical detail after the semantic close", async ({ page }) => {
  await page.goto("/dashboard");

  for (const heading of [
    "Stock frente a política vigente",
    "Cobertura e incertidumbre",
    "Recibido, horas-hombre y parada",
    "Estado de proceso",
    "Flujo del periodo",
    "Inventario disponible",
    "Facturación bruta registrada",
    "Gasto registrado",
    "Horas-hombre por proceso",
    "Horas por trabajador",
    "Tiempo fuera de servicio",
    "Comparación operacional",
    "Eventos operativos recientes",
  ]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
