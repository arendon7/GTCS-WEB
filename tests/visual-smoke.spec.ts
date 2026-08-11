import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["wondergreen", "/wondergreen/"],
  ["cultivos", "/wondergreen/cultivos/"],
  ["cafe", "/wondergreen/cultivos/cafe/"],
  ["cotizador", "/wondergreen/cotizador/"],
  ["producto-2grow", "/wondergreen/productos/2grow-solido-40kg/"],
  ["municipios", "/municipios/"],
  ["empresas", "/empresas/"],
  ["tecnologia", "/tecnologia/"],
  ["proyectos", "/proyectos/"],
  ["yarumal", "/proyectos/yarumal/"],
  ["impacto", "/impacto/"],
  ["biblioteca", "/biblioteca/"],
  ["nosotros", "/nosotros/"],
  ["diagnostico", "/diagnostico/"],
] as const;

const screenshotRoutes = new Set(["home", "wondergreen", "yarumal", "biblioteca"]);

for (const [slug, route] of routes) {
  test(`${slug} renders without visual/runtime regressions`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route} should return HTTP 200`).toBe(200);

    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();

    const headerLogo = page.locator("header img[alt='Greenatics']");
    await expect(headerLogo).toBeVisible();
    const logoGreenPixelRatio = await headerLogo.evaluate((image) => {
      const img = image as HTMLImageElement;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context || !canvas.width || !canvas.height) return 0;
      context.drawImage(img, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let greenPixels = 0;
      let sampledPixels = 0;
      for (let index = 0; index < pixels.length; index += 16) {
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];
        sampledPixels += 1;
        if (a > 32 && g > r + 18 && g > b + 18) greenPixels += 1;
      }
      return sampledPixels ? greenPixels / sampledPixels : 0;
    });
    expect(logoGreenPixelRatio, `${route} Greenatics logo must contain visible brand-green pixels`).toBeGreaterThan(0.03);

    const geometry = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));

    expect(
      Math.max(geometry.scrollWidth, geometry.bodyScrollWidth),
      `${route} must not overflow horizontally at ${geometry.viewport}px`,
    ).toBeLessThanOrEqual(geometry.viewport + 2);

    expect(pageErrors, `${route} page errors`).toEqual([]);
    expect(consoleErrors, `${route} console errors`).toEqual([]);

    if (screenshotRoutes.has(slug)) {
      const directory = path.join("qa-screenshots", testInfo.project.name);
      fs.mkdirSync(directory, { recursive: true });
      await page.screenshot({
        path: path.join(directory, `${slug}.png`),
        fullPage: true,
      });
    }
  });
}
