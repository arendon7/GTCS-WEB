import { test, expect } from "@playwright/test";

test("technology depth is discoverable from the commercial product layer and shared footer", async ({ page }) => {
  await page.goto("/wondergreen");
  const showcase = page.locator("#productos-destacados");
  const technology = showcase.getByRole("link", { name: "Profundizar en la tecnología →", exact: true });
  await expect(technology).toHaveAttribute("href", "/wondergreen/tecnologia");

  await technology.click();
  await expect(page).toHaveURL(/\/wondergreen\/tecnologia$/);
  await expect(page.getByRole("heading", { name: "Organomineral. Oclusión. Lenta liberación." })).toBeVisible();

  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Tecnología", exact: true })).toHaveAttribute(
    "href",
    "/wondergreen/tecnologia",
  );
});
