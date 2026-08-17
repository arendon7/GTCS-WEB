import { expect, test } from "@playwright/test";

test("OPS home exposes the daily operational surface", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hoy" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Recepciones" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Actividades" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Compostaje" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mantenimiento" })).toBeVisible();
});

test("operator can register a reception and get a generated lot", async ({ page }) => {
  await page.goto("/receptions/new");
  await page.getByLabel("Generador / proveedor").fill("QA Generador");
  await page.getByLabel("Ruta / origen").fill("QA Ruta");
  await page.getByLabel("Peso neto (kg)").fill("1000");
  await page.getByLabel("Rechazo (kg)").fill("100");
  await page.getByRole("button", { name: "Guardar recepción y crear lote" }).click();
  await expect(page).toHaveURL(/\/receptions$/);
  await expect(page.getByText(/QA Generador/).first()).toBeVisible();
  await expect(page.getByText(/900 kg/).first()).toBeVisible();
});

test("operator can create and finish an unplanned activity", async ({ page }) => {
  await page.goto("/activities/new");
  await page.getByLabel("Actividad").fill("QA Actividad no programada");
  await page.getByLabel("Proceso").fill("QA Proceso");
  await page.getByRole("group", { name: "Trabajadores" }).getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Iniciar actividad" }).click();
  await expect(page).toHaveURL(/\/activities\/[^/]+$/);
  await page.getByLabel("Cantidad").fill("20");
  await page.getByLabel("Unidad").selectOption("kg");
  await page.getByRole("button", { name: "Finalizar actividad" }).click();
  await expect(page.getByText("Finalizada", { exact: true })).toBeVisible();
});

test("maintenance ticket follows stopped to repairing to available", async ({ page }) => {
  await page.goto("/maintenance/new");
  await page.getByLabel("Equipo").selectOption({ index: 1 });
  await page.getByLabel("Descripción de la falla").fill("QA falla controlada");
  await page.getByRole("button", { name: "Registrar falla" }).click();
  await expect(page).toHaveURL(/\/maintenance\/[^/]+$/);
  await expect(page.getByText("Fuera de servicio", { exact: true }).first()).toBeVisible();
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
