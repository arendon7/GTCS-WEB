import { test, expect } from "@playwright/test";

test("public HOME presents the editorial hierarchy and governed Yarumal evidence", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformar residuos en vida/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Más que NPK." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver caso Yarumal →" })).toHaveAttribute("href", "/proyectos/yarumal");
  await expect(page.getByText(/Product Truth vigente/i)).toBeVisible();
});

test("public HOME exposes products, crops and deep knowledge routes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Ver productos" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: "Buscar por cultivo" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: "Ir al Product Master público →" })).toHaveAttribute("href", "/wondergreen/productos");

  const resources = page.getByRole("link", { name: "Abrir recurso →" });
  await expect(resources.nth(0)).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(resources.nth(1)).toHaveAttribute("href", "/biblioteca/guia-deficiencias");
  await expect(resources.nth(2)).toHaveAttribute("href", "/biblioteca/manual-uso-wondergreen");
});

test("public HOME keeps its primary routes explicit and separate from OPS", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Descubrir Wondergreen" })).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: "Explorar soluciones", exact: true }).first()).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Contactar a Greenatics" })).toHaveAttribute("href", "/contacto");
  await expect(page.getByRole("link", { name: "Acceder a la app interna" })).toHaveAttribute("href", "/app");
});
