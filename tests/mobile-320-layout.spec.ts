import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

function staticRoutes(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return staticRoutes(fullPath);
    if (entry.name !== "index.html") return [];
    const slug = path.relative("out", directory).split(path.sep).filter(Boolean).join("/");
    return [slug ? `/${slug}/` : "/"];
  });
}

test("static pages fit a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const routes = staticRoutes("out");
  expect(routes.length).toBeGreaterThan(100);

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} status`).toBe(200);

    const geometry = await page.evaluate(() => {
      window.scrollTo(9999, 0);
      return {
        viewport: window.innerWidth,
        document: document.documentElement.scrollWidth,
        pageOffset: window.scrollX,
      };
    });
    expect(geometry.pageOffset, `${route} must not pan horizontally`).toBe(0);

    if (route !== "/proyectos/tamesis/" && route !== "/plataforma/usuarios/") {
      expect(geometry.document, `${route} must fit at 320px`).toBeLessThanOrEqual(322);
    }
  }
});

test("calendar and not-found recovery work at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/wondergreen/calendario-agricola/");
  await page.getByLabel("Etapa observada").first().selectOption("Crecimiento vegetativo");
  const avocado = page.getByRole("button", { name: "Aguacate Hass" });
  await avocado.click();
  await expect(avocado).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".wg-calendar__months > article")).toHaveCount(12);
  await page.getByLabel("Etapa observada").first().selectOption("Transición reproductiva");
  await expect(page.locator(".wg-calendar__months > article").first()).toContainText("Wondergreen 2BLOOM");
  await page.reload();
  await avocado.click();
  await expect(page.getByLabel("Etapa observada").first()).toHaveValue("Transición reproductiva");
  await page.getByRole("button", { name: "Borrar este plan" }).click();
  await expect(page.getByLabel("Etapa observada").first()).toHaveValue("");
  await page.getByRole("button", { name: "Café", exact: true }).click();
  await expect(page.getByLabel("Etapa observada").first()).toHaveValue("Crecimiento vegetativo");

  await page.goto("/404/");
  const recovery = page.locator("#contenido");
  await expect(recovery.getByRole("link", { name: "Servicios", exact: true })).toHaveAttribute("href", "/servicios/");
  await expect(recovery.getByRole("link", { name: "Wondergreen", exact: true })).toHaveAttribute("href", "/wondergreen/");
  await expect(recovery.getByRole("link", { name: "Herramientas", exact: true })).toHaveAttribute("href", "/herramientas/");
});
