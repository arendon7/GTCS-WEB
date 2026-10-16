import { expect, test } from "@playwright/test";

test("GREENATICS Red landing distinguishes its demo from operational access", async ({ page }) => {
  const response = await page.goto("/red/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Del dato territorial al PMIRS vivo." })).toBeVisible();
  await expect(page.getByText("Estación demo disponible")).toBeVisible();
  await expect(page.getByRole("link", { name: /Entrar a la estación demo/ })).toHaveAttribute("href", "/red/app/");
  await expect(page.getByText(/la disponibilidad y los permisos se confirman al ingresar/)).toBeVisible();
  await expect(page.getByText("Espacio operativo conectado")).toHaveCount(0);
});
