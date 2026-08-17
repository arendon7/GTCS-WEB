import { test, expect } from "@playwright/test";

test("OPS home exposes the daily operational surface", async ({ page }) => {
  await page.goto("/app");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Registrar recepción" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Registrar actividad" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Excepciones" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Estado operativo" })).toBeVisible();
});

test("operator can register a reception and get a generated lot", async ({ page }) => {
  await page.goto("/receptions/new");
  await page.getByLabel("Generador / proveedor").fill("QA Generador");
  await page.getByLabel("Ruta / origen").fill("QA Ruta");
  await page.getByLabel("Peso neto (kg)").fill("100");
  await page.getByLabel("Rechazo (kg)").fill("5");
  await page.getByRole("button", { name: "Guardar recepción y crear lote" }).click();
  await expect(page).toHaveURL(/\/receptions$/);
  const row = page.locator("article").filter({ hasText: "QA Generador" });
  await expect(row).toBeVisible();
  await expect(row).toContainText("TAM-FORSU-");
  await expect(row).toContainText("5.0 %");
});

test("operator can create and finish an unplanned activity", async ({ page }) => {
  await page.goto("/activities/new");
  await page.getByLabel("Proceso", { exact: true }).fill("QA proceso");
  await page.getByLabel("Actividad", { exact: true }).fill("QA actividad");
  await page.getByLabel("Juan").check();
  await page.getByRole("button", { name: "Iniciar actividad" }).click();
  await expect(page.getByRole("heading", { name: "QA actividad" })).toBeVisible();
  await expect(page.getByText("En curso", { exact: true })).toBeVisible();
  await page.getByLabel(/Cantidad procesada/).fill("250");
  await page.getByRole("button", { name: "Finalizar actividad" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});

test("maintenance ticket follows stopped to repairing to available", async ({ page }) => {
  await page.goto("/equipment/eq-tam-bp01");
  await expect(page.getByText("Detenido", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Iniciar reparación" }).click();
  await expect(page.getByText("En reparación", { exact: true }).first()).toBeVisible();
  await page.getByLabel("Causa encontrada").fill("QA causa verificada");
  await page.getByLabel("Acción realizada").fill("QA ajuste ejecutado");
  await page.getByRole("button", { name: "Cerrar reparación" }).click();
  await expect(page.getByText("Disponible", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Reparación cerrada y equipo disponible.")).toBeVisible();
});

test("operator can create, monitor and close a compost pile", async ({ page }) => {
  await page.goto("/receptions/new");
  await page.getByLabel("Generador / proveedor").fill("QA Origen compostaje");
  await page.getByLabel("Ruta / origen").fill("QA Ruta compostaje");
  await page.getByLabel("Peso neto (kg)").fill("1500");
  await page.getByLabel("Rechazo (kg)").fill("0");
  await page.getByRole("button", { name: "Guardar recepción y crear lote" }).click();
  await expect(page).toHaveURL(/\/receptions$/);

  await page.goto("/compost/new");
  await page.getByLabel("Ubicación").fill("QA Zona compostaje");
  const sourceGroup = page.getByRole("group", { name: "Lotes físicos y masa asignada" });
  await sourceGroup.getByRole("checkbox").first().check();
  await page.getByLabel("Asignar (kg)").fill("1500");
  await page.getByLabel("Volumen conformado (m³)").fill("8");
  await page.getByRole("group", { name: "Trabajadores de conformación" }).getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Conformar pila" }).click();
  await expect(page).toHaveURL(/\/compost\/[^/]+$/);
  await expect(page.getByText("Trazabilidad física, eventos operacionales, bitácora canónica, controles técnicos y rendimiento.")).toBeVisible();

  await page.getByLabel("Temperatura punto 1 (°C)").fill("58");
  await page.getByLabel("Temperatura punto 2 (°C)").fill("58");
  await page.getByLabel("Temperatura punto 3 (°C)").fill("58");
  await page.getByLabel("Temperatura ambiente (°C)").fill("22");
  await page.getByLabel(/Humedad \(%\)/).fill("52");
  await page.getByRole("button", { name: "Guardar control" }).click();
  await expect(page.getByText("58.0 °C promedio")).toBeVisible();

  await page.getByRole("button", { name: "Pasar a maduración" }).click();
  await page.getByLabel("Peso final medido (kg)").fill("1000");
  await page.getByRole("button", { name: "Cerrar pila" }).click();
  await expect(page.getByText("Cerrada", { exact: true })).toBeVisible();
  await expect(page.getByText("Pila cerrada y rendimiento calculado.")).toBeVisible();
});