import { test, expect } from "@playwright/test";

async function digitalEntry(page: import("@playwright/test").Page) {
  const header = page.getByRole("banner");
  const desktopEntry = header.getByRole("link", { name: "Ingresar", exact: true });
  if (await desktopEntry.isVisible()) return desktopEntry;

  await header.getByRole("button", { name: "Abrir navegación" }).click();
  return page.getByRole("dialog", { name: "Navegación Greenatics" }).getByRole("link", { name: "Ingresar", exact: true });
}

test("public home presents Greenatics and exposes the digital bridge", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformamos residuos en vida/i })).toBeVisible();
  await expect(page.getByRole("img", { name: "Greenatics" }).first()).toBeVisible();
  await expect(await digitalEntry(page)).toHaveAttribute("href", "/app");
  await expect(page.getByRole("heading", { name: "Una marca. Tres formas claras de entrar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Nutrición que vuelve a la tierra." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "La operación también necesita una capa digital." })).toBeVisible();
});

test("Wondergreen exposes fertilizers, bioinputs and technology narrative", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Nutrición que vuelve a la tierra." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dos grandes líneas dentro de una misma marca." })).toBeVisible();

  const portfolio = page.locator("#portafolio");
  await expect(portfolio.getByText("2Grow Sólido · 15-3-3", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto de Neem", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto Ajo–Ají", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: /Tecnología organomineral pensada para trabajar con el suelo/i })).toBeVisible();
});

test("public-to-internal bridge lands on OPS home", async ({ page }) => {
  await page.goto("/");
  await (await digitalEntry(page)).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});
