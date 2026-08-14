import { test, expect } from "@playwright/test";

test("OPS home exposes the daily operational surface", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  await expect(page.getByText("Recepción", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Actividades", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Equipos", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Incidencias", { exact: true }).first()).toBeVisible();
});

test("operator can register a reception and get a generated lot", async ({ page }) => {
  await page.goto("/receptions/new");
  await page.getByLabel("Generador o proveedor").fill("QA Generador");
  await page.getByLabel("Ruta u origen").fill("QA Ruta");
  await page.getByLabel("Peso neto").fill("100");
  await page.getByLabel("Rechazo").fill("5");
  await page.getByRole("button", { name: "Guardar recepción y crear lote" }).click();
  await expect(page).toHaveURL(/\/receptions$/);
  const row = page.locator("article").filter({ hasText: "QA Generador" });
  await expect(row).toBeVisible();
  await expect(row).toContainText("TAM-FORSU-");
  await expect(row).toContainText("5.0 %");
});

test("operator can create and finish an unplanned activity", async ({ page }) => {
  await page.goto("/activities/new");
  await page.getByPlaceholder("Proceso").fill("QA proceso");
  await page.getByPlaceholder("Actividad").fill("QA actividad");
  await page.getByLabel("Juan").check();
  await page.getByRole("button", { name: "Registrar e iniciar" }).click();
  await expect(page.getByRole("heading", { name: "QA actividad" })).toBeVisible();
  await expect(page.getByText("En curso", { exact: true })).toBeVisible();
  await page.getByLabel(/Cantidad procesada/).fill("250");
  await page.getByRole("button", { name: "Finalizar actividad" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});

test("maintenance ticket follows stopped to repairing to available", async ({ page }) => {
  await page.goto("/equipment/eq-tam-bp01");
  await expect(page.getByText("Detenido", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Iniciar reparación" }).click();
  await expect(page.getByText("En reparación", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Marcar disponible" }).click();
  await expect(page.getByText("Disponible", { exact: true })).toBeVisible();
});

test("operator can create, monitor and close a compost pile", async ({ page }) => {
  await page.goto("/compost/new");
  await page.getByLabel("Código de lote").fill("QA-COMP-001");
  await page.getByLabel("Peso inicial").fill("1500");
  await page.getByRole("button", { name: "Crear pila" }).click();
  await expect(page).toHaveURL(/\/compost\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "QA-COMP-001" })).toBeVisible();
  await page.getByLabel("Temperatura").fill("58");
  await page.getByLabel("Humedad").fill("52");
  await page.getByRole("button", { name: "Guardar monitoreo" }).click();
  await expect(page.getByText("58 °C")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar pila" }).click();
  await expect(page.getByText("Cerrada", { exact: true })).toBeVisible();
});
