import { expect, test } from "@playwright/test";

for (const route of ["/", "/huella/"]) {
  test(`${route} skip link moves keyboard focus into main content`, async ({ page }) => {
    await page.goto(route);
    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skipLink).toBeFocused();
    await skipLink.press("Enter");
    await expect(page).toHaveURL(/#contenido$/);

    const main = page.getByRole("main");
    await expect(main).toBeFocused();
    await page.keyboard.press("Tab");
    expect(await main.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  });
}
