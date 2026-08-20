import { test, expect } from "@playwright/test";

test("Wondergreen uses the canonical public shell without duplicate chrome", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Navegación pública" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navegación Wondergreen" })).toBeVisible();
  await expect(page.getByRole("link", { name: "GREENATICS OPS" })).toHaveAttribute("href", "/app");
});

test("Wondergreen subnavigation connects products, crops, Casa Jardin and knowledge", async ({ page }) => {
  await page.goto("/wondergreen");

  const nav = page.getByRole("navigation", { name: "Navegación Wondergreen" });
  await expect(nav.getByRole("link", { name: "Productos" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(nav.getByRole("link", { name: "Cultivos" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(nav.getByRole("link", { name: "Casa & Jardín" })).toHaveAttribute("href", "/casa-jardin");
  await expect(nav.getByRole("link", { name: "Guías" })).toHaveAttribute("href", "/biblioteca");
});

test("Wondergreen exposes a household entry without turning Casa Jardin into ecommerce", async ({ page }) => {
  await page.goto("/wondergreen");

  const householdEntry = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Tengo plantas en casa", exact: true }),
  });
  await expect(householdEntry.getByRole("link", { name: "Continuar →" })).toHaveAttribute("href", "/casa-jardin");

  await page.goto("/casa-jardin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
});

test("Wondergreen editorial hub preserves governed product truth and opens exact references", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Nutrición que vuelve a la tierra." })).toBeVisible();
  await expect(page.getByText("Product Master público", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dos grandes líneas dentro de una misma marca." })).toBeVisible();

  const portfolio = page.locator("#portafolio");
  await expect(portfolio.getByText("2Grow Sólido · 15-3-3", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto de Neem", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto Ajo–Ají", { exact: true })).toBeVisible();
  await expect(portfolio.getByRole("link", { name: /2Grow Sólido · 15-3-3/ })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(portfolio.getByRole("link", { name: "Abrir catálogo completo" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(portfolio.getByRole("link", { name: "Abrir Biblioteca Wondergreen" })).toHaveAttribute("href", "/biblioteca");
  await expect(portfolio.getByRole("link", { name: "Casa & Jardín" })).toHaveAttribute("href", "/casa-jardin");
  await expect(page.getByText(/únicamente desde la versión técnica vigente/i)).toBeVisible();
});

test("Wondergreen finder follows diagnosis to follow-up without automatic prescription", async ({ page }) => {
  await page.goto("/wondergreen");

  const finder = page.locator("#finder");
  await expect(finder.getByRole("heading", { name: "Del contexto al seguimiento." })).toBeVisible();
  await expect(finder.getByText("Diagnóstico y análisis", { exact: true })).toBeVisible();
  await expect(finder.getByText("Seguimiento y ajuste", { exact: true })).toBeVisible();
  await expect(finder.getByText(/no una prescripción automática/i)).toBeVisible();
  await expect(finder.getByRole("link", { name: "Empezar por cultivo" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(finder.getByRole("link", { name: "Consultar guías" })).toHaveAttribute("href", "/biblioteca");
});

test("Wondergreen audience routes end in real governed destinations", async ({ page }) => {
  await page.goto("/wondergreen");

  const routes = page.locator("#acompanamiento");
  await expect(routes.getByRole("link", { name: "Empezar por cultivo →" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(routes.getByRole("link", { name: "Explorar Casa & Jardín →" })).toHaveAttribute("href", "/casa-jardin");
  await expect(routes.getByRole("link", { name: "Quiero vender Wondergreen →" })).toHaveAttribute("href", "/contacto");
  await expect(routes.getByRole("link", { name: "Abrir biblioteca técnica →" })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: "Hablar con equipo técnico" })).toHaveAttribute("href", "/contacto");
});
