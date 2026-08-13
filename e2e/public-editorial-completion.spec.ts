import { test, expect } from "@playwright/test";

for (const route of ["/biblioteca", "/contacto", "/impacto"]) {
  test(`${route} uses one canonical public shell`, async ({ page }) => {
    await page.goto(route);

    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Navegación pública" })).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${route.replace("/", "\\/")}$`));
  });
}

test("knowledge, contact and impact preserve their governed public contracts", async ({ page }) => {
  await page.goto("/biblioteca");
  await expect(page.getByRole("heading", { name: "Guía práctica de deficiencias nutricionales" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir guía/i })).toHaveAttribute("href", "/biblioteca/guia-deficiencias");

  await page.goto("/contacto");
  const booking = page.getByRole("link", { name: "Agendar reunión" });
  await expect(booking).toHaveAttribute("target", "_blank");
  await expect(booking).toHaveAttribute("href", /^https:\/\//);

  await page.goto("/impacto");
  await expect(page.getByText("Medido → revisado → aprobado → publicado.", { exact: true })).toBeVisible();
  await expect(page.getByText("En validación", { exact: true })).toHaveCount(6);
});
