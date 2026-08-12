import { test, expect } from "@playwright/test";

test("public home presents Greenatics and links to OPS", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Convertimos residuos orgánicos/i })).toBeVisible();
  await expect(page.getByRole("img", { name: "Greenatics" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Acceder a Greenatics" })).toHaveAttribute("href", "/app");
  await expect(page.getByRole("heading", { name: /Suelo, nutrición y biología trabajando como un sistema/i })).toBeVisible();
  await expect(page.getByText("5", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("referencias líquidas", { exact: true })).toBeVisible();
});

test("Wondergreen exposes fertilizers, bioinputs and technology narrative", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Nutrición que vuelve a la tierra." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dos grandes líneas dentro de una misma marca." })).toBeVisible();

  const portfolio = page.locator("#portafolio");
  await expect(portfolio.getByText("2Grow 15-3-3", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto de Neem", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto Ajo–Ají", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: /Tecnología organomineral pensada para trabajar con el suelo/i })).toBeVisible();
});

test("public-to-internal bridge lands on OPS home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Acceder a Greenatics" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});