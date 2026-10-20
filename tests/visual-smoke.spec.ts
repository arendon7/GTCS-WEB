import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["servicios", "/servicios/"],
  ["servicio-pgirs", "/servicios/pgirs-pmirs/"],
  ["servicio-motocarguero", "/servicios/microrrutas-motocarguero/"],
  ["parque-ambiental", "/parque-ambiental/"],
  ["wondergreen", "/wondergreen/"],
  ["casa-jardin", "/casa-jardin/"],
  ["cultivos", "/wondergreen/cultivos/"],
  ["cafe", "/wondergreen/cultivos/cafe/"],
  ["cotizador", "/wondergreen/cotizador/"],
  ["producto-2grow", "/wondergreen/productos/2grow/"],
  ["producto-2balance", "/wondergreen/productos/2balance/"],
  ["municipios", "/municipios/"],
  ["empresas", "/empresas/"],
  ["tecnologia", "/tecnologia/"],
  ["proyectos", "/proyectos/"],
  ["yarumal", "/proyectos/yarumal/"],
  ["impacto", "/impacto/"],
  ["biblioteca", "/biblioteca/"],
  ["guia-deficiencias", "/biblioteca/guia-deficiencias/"],
  ["manual-uso-wondergreen", "/biblioteca/manual-uso-wondergreen/"],
  ["catalogo-wondergreen", "/biblioteca/catalogo-wondergreen/"],
  ["pastos-gramineas", "/biblioteca/pastos-gramineas/"],
  ["huertas", "/biblioteca/huertas/"],
  ["nosotros", "/nosotros/"],
  ["diagnostico", "/diagnostico/"],
  ["contacto", "/contacto/"],
  ["acceso", "/acceso/"],
] as const;

const screenshotRoutes = new Set([
  "home",
  "servicios",
  "servicio-pgirs",
  "servicio-motocarguero",
  "parque-ambiental",
  "wondergreen",
  "casa-jardin",
  "producto-2grow",
  "municipios",
  "empresas",
  "tecnologia",
  "cafe",
  "yarumal",
  "biblioteca",
  "catalogo-wondergreen",
  "guia-deficiencias",
  "manual-uso-wondergreen",
  "contacto",
]);

test("home header switches to compact navigation before horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The width transition is exercised in the desktop project.");

  await page.goto("/", { waitUntil: "networkidle" });
  const desktopNav = page.locator(".site-header .desktop-nav");
  const mobileToggle = page.locator(".site-header .mobile-toggle-btn");

  for (const { width, compact } of [
    { width: 1401, compact: true },
    { width: 1440, compact: true },
    { width: 1600, compact: true },
    { width: 1601, compact: true },
    { width: 1840, compact: true },
    { width: 1841, compact: false },
  ]) {
    await page.setViewportSize({ width, height: 900 });
    if (compact) {
      await expect(desktopNav).toBeHidden();
      await expect(mobileToggle).toBeVisible();
    } else {
      await expect(desktopNav).toBeVisible();
      await expect(mobileToggle).toBeHidden();
    }

    const geometry = await page.evaluate(() => {
      const offenders = Array.from(document.querySelectorAll("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          };
        })
        .filter((element) => element.right > window.innerWidth + 2 && element.left < window.innerWidth)
        .sort((a, b) => b.right - a.right)
        .slice(0, 6);
      return { viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, offenders };
    });
    expect(
      Math.max(geometry.scrollWidth, geometry.bodyScrollWidth),
      `home must not overflow horizontally at ${width}px; offenders: ${JSON.stringify(geometry.offenders)}`,
    ).toBeLessThanOrEqual(width + 2);
  }
});


test("la guía principal de Casa & Jardín no se precarga como ruta Next", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "La descarga se comprueba una vez en desktop.");

  const invalidPdfPrefetches: string[] = [];
  page.on("request", (requestEvent) => {
    if (requestEvent.url().includes("/downloads/guia-casa-jardin.pdf/__next._tree.txt")) {
      invalidPdfPrefetches.push(requestEvent.url());
    }
  });

  await page.goto("/casa-jardin/", { waitUntil: "networkidle" });

  const download = page.locator(".homegarden-v4-hero a[download]");
  await expect(download).toHaveCount(1);
  await expect(download).toHaveAttribute("href", "/downloads/guia-casa-jardin.pdf");
  expect(await download.getAttribute("download")).not.toBeNull();

  const pdfUrl = new URL("/downloads/guia-casa-jardin.pdf", page.url()).toString();
  const pdf = await request.get(pdfUrl);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect(invalidPdfPrefetches).toEqual([]);
});

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
    const logoBox = await headerLogo.boundingBox();
    const viewportWidth = page.viewportSize()?.width ?? 1280;
    const minimumLogoWidth = viewportWidth <= 620 ? 100 : 135;
    expect(logoBox?.width ?? 0, `${route} Greenatics logo must retain a useful rendered width at ${viewportWidth}px`).toBeGreaterThanOrEqual(minimumLogoWidth);

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

    const geometry = await page.evaluate(() => {
      const offenders = Array.from(document.querySelectorAll("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          };
        })
        .filter((element) => element.right > window.innerWidth + 2 && element.left < window.innerWidth)
        .sort((a, b) => b.right - a.right)
        .slice(0, 6);
      return { viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, offenders };
    });
    expect(
      Math.max(geometry.scrollWidth, geometry.bodyScrollWidth),
      `${route} must not overflow horizontally at ${geometry.viewport}px; offenders: ${JSON.stringify(geometry.offenders)}`,
    ).toBeLessThanOrEqual(geometry.viewport + 2);

    expect(pageErrors, `${route} page errors`).toEqual([]);
    expect(consoleErrors, `${route} console errors`).toEqual([]);

    if (screenshotRoutes.has(slug)) {
      const directory = path.join("qa-screenshots", testInfo.project.name);
      fs.mkdirSync(directory, { recursive: true });
      await page.screenshot({ path: path.join(directory, `${slug}.png`), fullPage: true });
    }
  });
}


