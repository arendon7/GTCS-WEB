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
  const contactHref = await page.getByRole("link", { name: "Hablar con Greenatics" }).getAttribute("href");
  expect(contactHref).toBeTruthy();
  const contact = new URL(contactHref!, "https://greenatics.com.co");
  expect(contact.pathname).toBe("/contacto");
  expect(contact.searchParams.get("source")).toBe("solucion");
  expect(contact.searchParams.get("service")).toBe("Diagnóstico y caracterización de residuos orgánicos");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/soluciones\/diagnostico-caracterizacion$/);

  await page.goto("/proyectos/yarumal");
  await expect(page.getByText("Contexto de publicación", { exact: true })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/proyectos\/yarumal$/);
});
