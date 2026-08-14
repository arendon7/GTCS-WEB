import { test, expect } from "@playwright/test";

test("operational master administration remains explicit in local mode", async ({ page }) => {
  await page.goto("/admin/operations");
  await expect(page.getByRole("heading", { name: "Maestros operacionales" })).toBeVisible();
  await expect(page.getByText(/disponibles en el backend corporativo/i)).toBeVisible();
});
