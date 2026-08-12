import { test, expect } from "@playwright/test";

test("services page exposes governed capabilities and audience paths", async ({ page }) => {
  await page.goto("/servicios");

  await expect(page.getByRole("heading", { name: "Del residuo al sistema que puede operar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Municipios y ESP", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Empresas y grandes generadores", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diseño e implementación de plantas de aprovechamiento" })).toBeVisible();
  await expect(page.getByText("Alcance gobernado:", { exact: true })).toBeVisible();
});

test("public home routes Soluciones and Conocimiento to real pages", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navegación pública" });
  await expect(nav.getByRole("link", { name: "Soluciones" })).toHaveAttribute("href", "/servicios");
  await expect(nav.getByRole("link", { name: "Conocimiento" })).toHaveAttribute("href", "/biblioteca");

  await nav.getByRole("link", { name: "Soluciones" }).click();
  await expect(page).toHaveURL(/\/servicios$/);
  await expect(page.getByRole("heading", { name: "Del residuo al sistema que puede operar." })).toBeVisible();
});

test("public home routes territorial and company doors into service audiences", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /Explorar soluciones/i }).first()).toHaveAttribute("href", "/servicios#municipios");
  await expect(page.getByRole("link", { name: /Explorar soluciones/i }).nth(1)).toHaveAttribute("href", "/servicios#empresas");
});

test("services page keeps knowledge and OPS bridges visible", async ({ page }) => {
  await page.goto("/servicios");

  await expect(page.getByRole("link", { name: "Biblioteca", exact: true })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: "Acceder a Greenatics" })).toHaveAttribute("href", "/app");
});
