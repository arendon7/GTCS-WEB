import { expect, test } from "@playwright/test";

const updatedBenefit =
  "Su aporte se integra a la preparación del suelo o sustrato; la respuesta depende de la madurez y calidad del material, las condiciones del sitio y el manejo.";

test("Compost presents its evidence-calibrated benefit without mobile overflow", async ({ page }) => {
  await page.goto("/wondergreen/productos/compost/");

  await expect(page.getByRole("heading", { name: "Wondergreen Compost", exact: true })).toBeVisible();
  await expect(page.getByText(updatedBenefit, { exact: true })).toBeVisible();
  await expect(page.getByText("Ayuda a mejorar el contexto físico y biológico del suelo", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Ver tienda Greenatics en Croper" })).toHaveAttribute(
    "href",
    "https://croper.com/provider/1231-greenatics",
  );

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});
