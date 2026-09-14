import { test, expect } from "@playwright/test";

test("Wondergreen hero logo is served through Next image optimization", async ({ page }) => {
  await page.goto("/wondergreen");

  const logo = page.getByRole("img", { name: "Wondergreen Nutrients" });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("width", "420");
  await expect(logo).toHaveAttribute("height", "221");
  await expect(logo).toHaveAttribute("srcset", /\/_next\/image\?url=%2Fbrand%2Fwondergreen-nutrients\.webp/);
});

test("404 brand symbol keeps its canonical ratio without Next image warnings", async ({ page }) => {
  const imageWarnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" && message.text().includes("Image with src")) {
      imageWarnings.push(message.text());
    }
  });

  const response = await page.goto("/ruta-publica-que-no-existe-runtime-gate");
  expect(response?.status()).toBe(404);

  const symbol = page.locator('img[src*="greenatics-symbol.svg"]');
  await expect(symbol).toBeVisible();
  await expect(symbol).toHaveAttribute("width", "80");
  await expect(symbol).toHaveAttribute("height", "52");

  const rendered = await symbol.evaluate((image) => ({
    width: (image as HTMLImageElement).getBoundingClientRect().width,
    height: (image as HTMLImageElement).getBoundingClientRect().height,
  }));
  expect(Math.round(rendered.width)).toBe(80);
  expect(Math.round(rendered.height)).toBe(52);
  expect(imageWarnings).toEqual([]);
});
