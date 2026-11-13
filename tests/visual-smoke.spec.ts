import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["servicios", "/servicios/"],
  ["servicio-diagnostico", "/servicios/diagnostico-residuos/"],
  ["servicio-pgirs", "/servicios/pgirs-pmirs/"],
  ["servicio-motocarguero", "/servicios/microrrutas-motocarguero/"],
  ["servicio-plantas", "/servicios/plantas-modulares/"],
  ["servicio-operacion", "/servicios/operacion-delegada/"],
  ["servicio-ops", "/servicios/greenatics-ops/"],
  ["servicio-valorizacion", "/servicios/aprovechamiento-productivo/"],
  ["servicio-wondergreen", "/servicios/programas-wondergreen/"],
  ["parque-ambiental", "/parque-ambiental/"],
  ["wondergreen", "/wondergreen/"],
  ["casa-jardin", "/casa-jardin/"],
  ["casa-jardin-guias", "/casa-jardin/guias/"],
  ["casa-jardin-kits", "/casa-jardin/kits/"],
  ["casa-jardin-productos", "/casa-jardin/productos/"],
  ["cultivos", "/wondergreen/cultivos/"],
  ["cafe", "/wondergreen/cultivos/cafe/"],
  ["cotizador", "/wondergreen/cotizador/"],
  ["producto-2grow", "/wondergreen/productos/2grow/"],
  ["producto-2balance", "/wondergreen/productos/2balance/"],
  ["producto-2bloom", "/wondergreen/productos/2bloom/"],
  ["producto-2fruit", "/wondergreen/productos/2fruit/"],
  ["producto-compost", "/wondergreen/productos/compost/"],
  ["producto-bioinsumos", "/wondergreen/productos/bioinsumos/"],
  ["producto-trichoderma", "/wondergreen/productos/bioinsumo-trichoderma/"],
  ["producto-bacillus", "/wondergreen/productos/bioinsumo-bacillus-subtilis/"],
  ["producto-beauveria", "/wondergreen/productos/bioinsumo-beauveria/"],
  ["producto-metarhizium", "/wondergreen/productos/bioinsumo-metarhizium/"],
  ["producto-ajo-aji", "/wondergreen/productos/bioinsumo-ajo-aji/"],
  ["producto-neem", "/wondergreen/productos/bioinsumo-neem/"],
  ["producto-2grow-liquido", "/wondergreen/productos/2grow-liquido/"],
  ["producto-2balance-liquido", "/wondergreen/productos/2balance-liquido/"],
  ["producto-2bloom-liquido", "/wondergreen/productos/2bloom-liquido/"],
  ["producto-2fruit-liquido", "/wondergreen/productos/2fruit-liquido/"],
  ["producto-biol", "/wondergreen/productos/biol/"],
  ["municipios", "/municipios/"],
  ["empresas", "/empresas/"],
  ["agroindustria", "/agroindustria/"],
  ["soluciones", "/soluciones/"],
  ["tecnologia", "/tecnologia/"],
  ["proyectos", "/proyectos/"],
  ["portafolio", "/portafolio/"],
  ["portafolio-wondergreen", "/portafolio/wondergreen/"],
  ["yarumal", "/proyectos/yarumal/"],
  ["tamesis", "/proyectos/tamesis/"],
  ["recursos", "/recursos/"],
  ["impacto", "/impacto/"],
  ["organic-flow-estimator", "/herramientas/estimador-organicos/"],
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
  ["herramientas", "/herramientas/"],
  ["huella", "/huella/"],
  ["plataforma", "/plataforma/"],
  ["usuarios", "/plataforma/usuarios/"],
  ["red", "/red/"],
  ["red-app", "/red/app/"],
  ["agroway", "/agroway/"],
  ["sana", "/sana/"],
] as const;

const screenshotRoutes = new Set([
  "home",
  "servicios",
  "servicio-pgirs",
  "servicio-motocarguero",
  "servicio-diagnostico",
  "servicio-plantas",
  "servicio-operacion",
  "servicio-ops",
  "servicio-valorizacion",
  "servicio-wondergreen",
  "parque-ambiental",
  "wondergreen",
  "casa-jardin",
  "casa-jardin-guias",
  "casa-jardin-kits",
  "casa-jardin-productos",
  "producto-2grow",
  "producto-2balance",
  "producto-2bloom",
  "producto-2fruit",
  "producto-compost",
  "producto-bioinsumos",
  "producto-trichoderma",
  "producto-bacillus",
  "producto-beauveria",
  "producto-metarhizium",
  "producto-ajo-aji",
  "producto-biol",
  "producto-2grow-liquido",
  "producto-2balance-liquido",
  "producto-2bloom-liquido",
  "producto-2fruit-liquido",
  "producto-neem",
  "municipios",
  "empresas",
  "agroindustria",
  "soluciones",
  "tecnologia",
  "portafolio",
  "portafolio-wondergreen",
  "cafe",
  "yarumal",
  "tamesis",
  "recursos",
  "organic-flow-estimator",
  "biblioteca",
  "huella",
  "catalogo-wondergreen",
  "guia-deficiencias",
  "manual-uso-wondergreen",
  "contacto",
  "diagnostico",
  "acceso",
  "herramientas",
  "huella",
]);

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

    // Product routes may carry their own identity; they must not be forced into the Greenatics header logo.
    // RED renders an application shell with its own identity, not the public-site header.
    if (slug !== "red-app") {
      const expectedHeaderLogo = slug === "huella" ? "Back 2 Green" : "Greenatics";
      const headerLogo = page.locator(`header img[alt='${expectedHeaderLogo}']:visible`).first();
      await expect(headerLogo).toBeVisible();
      const logoBox = await headerLogo.boundingBox();
      const viewportWidth = page.viewportSize()?.width ?? 1280;
      const minimumLogoWidth = viewportWidth <= 620 ? 100 : 135;
      expect(logoBox?.width ?? 0, `${route} ${expectedHeaderLogo} logo must retain a useful rendered width at ${viewportWidth}px`).toBeGreaterThanOrEqual(minimumLogoWidth);

      if (slug !== "huella") {
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
      }
    }

    const geometry = await page.evaluate(() => ({ viewport: window.visualViewport?.width ?? document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth }));
    expect(Math.max(geometry.scrollWidth, geometry.bodyScrollWidth), `${route} must not overflow horizontally at ${geometry.viewport}px`).toBeLessThanOrEqual(geometry.viewport + 2);

    expect(pageErrors, `${route} page errors`).toEqual([]);
    expect(consoleErrors, `${route} console errors`).toEqual([]);

    if (screenshotRoutes.has(slug)) {
      const directory = path.join("qa-screenshots", testInfo.project.name);
      fs.mkdirSync(directory, { recursive: true });
      await page.locator('img[loading="lazy"]').evaluateAll((images) => {
        for (const image of images) (image as HTMLImageElement).loading = "eager";
      });
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => Promise.all(Array.from(document.images, (image) => image.decode().catch(() => undefined))));
      await page.screenshot({ path: path.join(directory, `${slug}.png`), fullPage: true });
      if (slug === "huella") {
        await page.screenshot({ path: path.join(directory, "huella-hero.png") });
      }
    }
  });
}

test.describe("tablet breakpoint regressions", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "Run once with an explicit tablet viewport.");
    await page.setViewportSize({ width: 768, height: 1024 });
  });

  test("Casa & Jardín stacks its full-width guide action without page overflow", async ({ page }) => {
    const response = await page.goto("/casa-jardin/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(Math.max(geometry.document, geometry.body)).toBeLessThanOrEqual(geometry.viewport + 2);
  });

  test("the sample user table stays internally scrollable without widening the page", async ({ page }) => {
    const response = await page.goto("/plataforma/usuarios/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
    expect(Math.max(geometry.document, geometry.body)).toBeLessThanOrEqual(geometry.viewport + 2);
    const tableViewport = page.locator(".platform-admin__table-wrap");
    expect(await tableViewport.evaluate((element) => getComputedStyle(element).overflowX)).toBe("auto");
    expect(await tableViewport.evaluate((element) => element.scrollWidth)).toBeGreaterThan(await tableViewport.evaluate((element) => element.clientWidth));
    expect(await tableViewport.evaluate((element) => { element.scrollLeft = 24; return element.scrollLeft; })).toBeGreaterThan(0);
  });
});
