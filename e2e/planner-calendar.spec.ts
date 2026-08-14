import { test, expect } from "@playwright/test";

test("calendar planner is dynamic and navigable in local fallback mode", async ({ page }) => {
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { name: "Calendario operativo" })).toBeVisible();
  await expect(page.getByText("Modo local", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mes", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Semana", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Día", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Anterior", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hoy", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Mes", exact: true }).click();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await expect(page.getByRole("button", { name: "Hoy", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Hoy", exact: true }).click();
  await page.getByRole("button", { name: "Día", exact: true }).click();
  await expect(page.getByText(/actividades$/).first()).toBeVisible();
});
