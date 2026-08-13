import { test, expect } from "@playwright/test";

test("Wondergreen uses the canonical public shell without duplicate chrome", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Navegación pública" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación Wondergreen" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GREENATICS OPS" })).toHaveAttribute("href", "/app");
});

test("Wondergreen editorial hub preserves governed product truth", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Nutrición que vuelve a la tierra." })).toBeVisible();
  await expect(page.getByText("Product Master público", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dos grandes líneas dentro de una misma marca." })).toBeVisible();

  const portfolio = page.locator("#portafolio");
  await expect(portfolio.getByText("2Grow Sólido · 15-3-3", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto de Neem", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto Ajo–Ají", { exact: true })).toBeVisible();
  await expect(page.getByText(/únicamente desde la versión técnica vigente/i)).toBeVisible();
});

test("Wondergreen commercial routes end in real public destinations", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("link", { name: "Empezar por cultivo" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: "Hablar con equipo técnico" })).toHaveAttribute("href", "/contacto");
  await expect(page.getByRole("link", { name: "Quiero vender Wondergreen →" })).toHaveAttribute("href", "/contacto");
});
