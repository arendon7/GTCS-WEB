import { test, expect } from "@playwright/test";

test("public HOME presents the editorial hierarchy and governed Yarumal evidence", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformar residuos en vida/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Más que NPK." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada de la planta de Yarumal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver caso Yarumal →" })).toHaveAttribute("href", "/proyectos/yarumal");
  await expect(page.getByText(/Product Truth vigente/i)).toBeVisible();
});

test("public HOME keeps its primary routes explicit and separate from OPS", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Descubrir Wondergreen" })).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: "Explorar soluciones", exact: true }).first()).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Contactar a Greenatics" })).toHaveAttribute("href", "/contacto");
  await expect(page.getByRole("link", { name: "Acceder a la app interna" })).toHaveAttribute("href", "/app");
});
