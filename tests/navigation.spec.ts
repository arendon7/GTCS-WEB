import { expect, test } from "@playwright/test";

const draftLabels = [
  "Huella de carbono",
  "Acompañamiento jurídico y regulatorio",
  "Estructuración técnico-documental para remuneración del tratamiento",
  "Desarrollo técnico de productos derivados",
  "Transición agroecológica",
  "Valorización de residuos agroindustriales",
  "Optimización y acompañamiento técnico de composteras",
  "ESP READY",
];

test.beforeEach(async ({ page }) => {
  const response = await page.goto("/", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
});

test("header exposes the final public information architecture", async ({ page }, testInfo) => {
  const header = page.locator("header.site-header");
  await expect(header).toBeVisible();

  await expect(header.getByRole("link", { name: "Greenatics inicio" })).toBeVisible();
  await expect(header.getByText("Casa y Jardín", { exact: true })).toBeVisible();
  await expect(header.getByText("Próximamente", { exact: true })).toBeVisible();

  for (const label of draftLabels) {
    await expect(header.getByText(label, { exact: true })).toHaveCount(0);
  }

  if (testInfo.project.name === "desktop") {
    const desktop = header.locator("nav.desktop-nav");
    await expect(desktop).toBeVisible();
    await expect(header.getByRole("link", { name: "Diagnóstico", exact: true })).toBeVisible();
    await expect(header.getByRole("link", { name: "Cotizar", exact: true })).toHaveCount(0);

    for (const label of ["Soluciones", "Wondergreen", "Recursos"]) {
      await expect(desktop.locator("summary", { hasText: label })).toBeVisible();
    }
    await expect(desktop.getByRole("link", { name: /Nosotros/ })).toBeVisible();
  } else {
    await expect(header.locator("nav.desktop-nav")).toBeHidden();
    await expect(header.locator("details.mobile-menu > summary")).toBeVisible();
  }
});

test("desktop disclosure navigation works with keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop navigation contract");

  const solutions = page.locator("details.nav-group").filter({ has: page.locator("summary", { hasText: "Soluciones" }) });
  const summary = solutions.locator(":scope > summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(solutions).toHaveAttribute("open", "");
  await expect(solutions.getByRole("link", { name: /Municipios y ESP/ })).toBeVisible();
  await expect(solutions.getByRole("link", { name: /Todos los servicios/ })).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(solutions).not.toHaveAttribute("open", "");

  const resources = page.locator("details.nav-group").filter({ has: page.locator("summary", { hasText: "Recursos" }) });
  await resources.locator(":scope > summary").focus();
  await page.keyboard.press("Space");
  await expect(resources).toHaveAttribute("open", "");
  await expect(resources.getByRole("link", { name: /Impacto y datos/ })).toBeVisible();
  await expect(resources.getByRole("link", { name: /Biblioteca/ })).toBeVisible();
});

test("mobile navigation prioritizes diagnosis and supports nested groups", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile navigation contract");

  const menu = page.locator("details.mobile-menu");
  await menu.locator(":scope > summary").click();
  await expect(menu).toHaveAttribute("open", "");

  const panel = menu.locator(".mobile-menu-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link", { name: "Diagnóstico", exact: true })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Acceso Greenatics", exact: true })).toBeVisible();

  const solutions = panel.locator("details.mobile-nav-group").filter({ has: page.locator("summary", { hasText: "Soluciones" }) });
  await solutions.locator(":scope > summary").click();
  await expect(solutions).toHaveAttribute("open", "");
  await expect(solutions.getByRole("link", { name: "Municipios y ESP", exact: true })).toBeVisible();
  await expect(solutions.getByRole("link", { name: "Todos los servicios", exact: true })).toBeVisible();

  const wondergreen = panel.locator("details.mobile-nav-group").filter({ has: page.locator("summary", { hasText: "Wondergreen" }) });
  await wondergreen.locator(":scope > summary").click();
  await expect(wondergreen.getByRole("link", { name: "Cotizador", exact: true })).toBeVisible();

  await expect(panel.getByRole("link", { name: /Casa y Jardín/ })).toBeVisible();
  await expect(panel.getByRole("link", { name: /Nosotros/ })).toBeVisible();
});

test("final navigation destinations resolve without broken public links", async ({ page }, testInfo) => {
  const routes = [
    "/servicios/",
    "/municipios/",
    "/empresas/",
    "/tecnologia/",
    "/parque-ambiental/",
    "/wondergreen/",
    "/wondergreen/cultivos/",
    "/wondergreen/cotizador/",
    "/wondergreen/hogar/",
    "/proyectos/",
    "/impacto/",
    "/biblioteca/",
    "/nosotros/",
    "/diagnostico/",
  ];

  for (const route of routes) {
    const response = await page.request.get(route);
    expect(response.status(), `${testInfo.project.name}: ${route}`).toBe(200);
  }
});
