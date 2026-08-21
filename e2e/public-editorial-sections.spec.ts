import { test, expect } from "@playwright/test";

for (const route of ["/soluciones", "/proyectos"]) {
  test(`${route} uses one canonical public shell`, async ({ page }) => {
    await page.goto(route);

    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);

    const viewport = page.viewportSize();
    if (viewport && viewport.width < 900) {
      await expect(page.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "Navegación pública" })).toHaveCount(1);
    }

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route.replace("/", "\\/")}$`));
  });
}

test("solution and project details keep governed public routes", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");
  await expect(page.getByRole("link", { name: "Hablar con Greenatics" })).toHaveAttribute("href", "/contacto");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/soluciones\/diagnostico-caracterizacion$/);

  await page.goto("/proyectos/yarumal");
  await expect(page.getByText("Contexto de publicación", { exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/proyectos\/yarumal$/);
});
