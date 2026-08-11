import { test, expect } from "@playwright/test";

function latestImportRun(page: import("@playwright/test").Page) {
  return page.locator("section.panel").filter({
    has: page.getByRole("heading", { name: "Fixture histórico GREENATICS · anomalías conocidas" }),
  }).first();
}

test("historical fixture produces deterministic staging and quarantine counts", async ({ page }) => {
  await page.goto("/imports");
  await expect(page.getByRole("heading", { name: "Importaciones históricas" })).toBeVisible();
  await page.getByRole("button", { name: "Cargar fixture histórico QA" }).click();
  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Dry-run creado: IMP-/)).toBeVisible();

  const latestRun = latestImportRun(page);
  await expect(latestRun).toBeVisible();
  await expect(latestRun).toContainText("Filas");
  await expect(latestRun).toContainText("12");
  await expect(latestRun).toContainText("Válidas");
  await expect(latestRun).toContainText("Warnings");
  await expect(latestRun).toContainText("Cuarentena");
  await expect(latestRun).toContainText("Duplicados");
  await expect(latestRun).toContainText("DURATION_EXCESSIVE");
  await expect(latestRun).toContainText("WORKER_ALIAS_RESOLVED");
  await expect(latestRun).toContainText("DUPLICATE_EXACT");
  await expect(latestRun).toContainText("Alejandro + Gabriel");
});

test("same source cannot create a second import run and reviewed staging cannot be promoted twice", async ({ page }) => {
  await page.goto("/imports");
  await page.getByRole("button", { name: "Cargar fixture histórico QA" }).click();
  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Dry-run creado: IMP-/)).toBeVisible();

  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Esta fuente ya fue procesada/)).toBeVisible();

  const latestRun = latestImportRun(page);
  await latestRun.getByRole("button", { name: "Aprobar candidatos válidos" }).click();
  await expect(latestRun.getByText("Promovido", { exact: true })).toBeVisible();
  await expect(latestRun.getByRole("button", { name: "Promovido" })).toBeDisabled();
});
