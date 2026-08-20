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

test("public HOME exposes the three Greenatics pillars and commercial doors before Wondergreen depth", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Biotecnología aplicada" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Economía circular" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operación y acompañamiento" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Empieza por el problema que necesitas resolver." })).toBeVisible();
  await expect(page.getByText("Seis puertas de entrada", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar Casa & Jardín →", exact: true })).toHaveAttribute("href", "/casa-jardin");
  await expect(page.getByRole("link", { name: "Abrir biblioteca →", exact: true })).toHaveAttribute("href", "/biblioteca");

  const levelTwoHeadings = await page.getByRole("heading", { level: 2 }).allTextContents();
  const doorsIndex = levelTwoHeadings.indexOf("Empieza por el problema que necesitas resolver.");
  const wondergreenIndex = levelTwoHeadings.indexOf("Más que NPK.");
  expect(doorsIndex).toBeGreaterThanOrEqual(0);
  expect(wondergreenIndex).toBeGreaterThan(doorsIndex);
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
  await expect(page.getByRole("link", { name: "Casa & Jardín", exact: true })).toHaveAttribute("href", "/casa-jardin");
  await expect(page.getByRole("link", { name: "Contactar a Greenatics" })).toHaveAttribute("href", "/contacto");
  await expect(page.getByRole("link", { name: "Acceder a la app interna" })).toHaveAttribute("href", "/app");
});
