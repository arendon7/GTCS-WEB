import { test, expect } from "@playwright/test";

test("operational master administration remains explicit in local mode", async ({ page }) => {
  await page.goto("/admin/operations");
  await expect(page.getByRole("heading", { name: "Maestros operacionales" })).toBeVisible();
  await expect(page.getByText(/catálogos corporativos se administran únicamente contra Supabase/i)).toBeVisible();
});
