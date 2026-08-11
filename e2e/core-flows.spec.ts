import { test, expect } from "@playwright/test";

test("home exposes the daily operational surface", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Calendario", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Recepciones", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Equipos", exact: true })).toBeVisible();
});

test("operator can register a reception and get a generated lot", async ({ page }) => {
  await page.goto("/receptions/new");
  await page.getByLabel("Generador / proveedor").fill("QA Generador");
  await page.getByLabel("Ruta / origen").fill("Ruta QA");
  await page.getByLabel("Peso neto (kg)").fill("1000");
  await page.getByLabel("Rechazo (kg)").fill("50");
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
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});

test("maintenance ticket follows stopped to repairing to available", async ({ page }) => {
  await page.goto("/equipment/eq-tam-bp01");
  await expect(page.getByText("Detenido", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Iniciar reparación" }).click();
  await expect(page.getByRole("button", { name: "Cerrar reparación" })).toBeVisible();
  await expect(page.getByLabel("Causa encontrada")).toBeVisible();
  await page.getByLabel("Causa encontrada").fill("Obstrucción QA");
  await page.getByLabel("Acción realizada").fill("Limpieza y prueba funcional QA");
  await page.getByRole("button", { name: "Cerrar reparación" }).click();
  await expect(page.getByText("Disponible", { exact: true })).toBeVisible();
  await expect(page.getByText("Reparación cerrada y equipo disponible.")).toBeVisible();
});
