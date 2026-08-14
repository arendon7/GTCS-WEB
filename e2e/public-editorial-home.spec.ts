import { test, expect } from "@playwright/test";

test("public HOME presents the editorial hierarchy and governed Yarumal evidence", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformar residuos en vida/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Más que NPK." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Segunda vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByText("2 activos conciliados", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver caso Yarumal →" })).toHaveAttribute("href", "/proyectos/yarumal");
  await expect(page.getByText(/Product Truth vigente/i)).toBeVisible();
});

test("public HOME exposes all five governed crop programs", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Cinco cultivos. Decisiones distintas según la etapa." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cacao/ })).toHaveAttribute("href", "/wondergreen/cultivos/cacao");
  await expect(page.getByRole("link", { name: /Café/ })).toHaveAttribute("href", "/wondergreen/cultivos/cafe");
  await expect(page.getByRole("link", { name: /Aguacate/ })).toHaveAttribute("href", "/wondergreen/cultivos/aguacate");
  await expect(page.getByRole("link", { name: /Limón Tahití/ })).toHaveAttribute("href", "/wondergreen/cultivos/limon-tahiti");
  await expect(page.getByRole("link", { name: /Pastos y gramíneas/ })).toHaveAttribute("href", "/wondergreen/cultivos/pastos-gramineas");
  await expect(page.getByRole("link", { name: "Revisar criterios" })).toHaveAttribute("href", "/biblioteca/criterios-nutricionales");
  await expect(page.getByRole("link", { name: "Ver Product Master" })).toHaveAttribute("href", "/wondergreen/productos");
});

test("public HOME keeps its primary routes explicit and separate from OPS", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Descubrir Wondergreen" })).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: "Explorar soluciones", exact: true }).first()).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Contactar a Greenatics" })).toHaveAttribute("href", "/contacto");
  await expect(page.getByRole("link", { name: "Acceder a la app interna" })).toHaveAttribute("href", "/app");
});
