import { test, expect } from "@playwright/test";

test("Today makes local demo controls explicit", async ({ page }) => {
  await page.goto("/app");

  await expect(page.getByRole("heading", { name: "Operación de hoy", exact: true })).toBeVisible();
  await expect(page.getByText("Demo local · este navegador", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restablecer demo", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Actualizar datos", exact: true })).toHaveCount(0);
  await expect(page.getByText("Persistencia local activa", { exact: true })).toHaveCount(0);
});
