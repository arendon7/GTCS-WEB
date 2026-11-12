import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { digitalTools } from "../src/data/digital-tools";

const toolDestinations = [
  ["GREENATICS OPS", "/app/"],
  ["GREENATICS Red", "/red/app/"],
  ["AGROWAY", "/agroway/app/"],
  ["SANA", "/sana/app/"],
] as const;

test("homepage tool cards export one truthful visual and a specific action per experience", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "out/index.html"), "utf8");

  for (const tool of digitalTools.filter((entry) => entry.code !== "CO₂")) {
    expect(tool.image, `${tool.name} needs an image`).toBeTruthy();
    expect(tool.image).toMatch(/\.jpg$/);
    expect(fs.existsSync(path.join(process.cwd(), "public", tool.image!.replace(/^\//, "")))).toBe(true);
    expect(html).toContain(`href="${tool.publicHref}"`);
    expect(html).toContain(`src="${tool.image}"`);
    expect(html).toContain(tool.imageAlt);
    expect(html).toContain(tool.homeKind);
    expect(html).toContain(tool.homeTitle);
    expect(html).toContain(tool.homeSummary);
    expect(html).toContain(tool.homeAction);
  }

  expect(html).toContain("Explora herramientas complementarias para operación, territorio y productividad agrícola.");
});

test("homepage service paths explain their audiences and keep a readable mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });

  const section = page.locator(".home-system-map");
  const directory = section.locator(".home-audience-paths");
  await expect(section.getByRole("heading", { name: "Entendemos la operación antes de diseñar la solución." })).toBeVisible();
  await expect(directory.locator("article")).toHaveCount(3);
  await expect(directory.locator(".home-audience-path--featured")).toHaveCount(1);
  await expect(directory.locator(".home-audience-path--compact")).toHaveCount(2);
  await expect(directory).toContainText("Gestión por sede");
  await expect(directory).toContainText("Análisis de biomasa");
  await expect(directory).toContainText("contenedor diseñado por Greenatics para apoyar la recolección selectiva de orgánicos");
  await expect(directory).toContainText("unidades residenciales, centros comerciales, instituciones");

  for (const [name, href] of [
    ["Ver soluciones municipales", "/municipios/"],
    ["Ver soluciones para organizaciones", "/empresas/"],
    ["Explorar soluciones agroindustriales", "/agroindustria/"],
  ]) {
    await expect(directory.getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", href);
  }

  await expect(section).not.toContainText("Incluye:");
  await expect(directory).not.toContainText("Wondergreen");
  await expect(directory).not.toContainText("Casa y Jardín");
  const mobileMetrics = await section.evaluate((element) => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    targets: [...element.querySelectorAll("a")].map((link) => link.getBoundingClientRect().height),
    cardGap: Number.parseFloat(getComputedStyle(element.querySelector(".home-audience-paths")!).rowGap),
    firstImageHeight: element.querySelector(".home-audience-path__media")!.getBoundingClientRect().height,
    cardPadding: Number.parseFloat(getComputedStyle(element.querySelector(".home-audience-path__body")!).paddingTop),
  }));
  expect(mobileMetrics.documentWidth).toBeLessThanOrEqual(mobileMetrics.viewportWidth + 2);
  expect(mobileMetrics.targets.every((height) => height >= 44)).toBe(true);
  expect(mobileMetrics.cardGap).toBeGreaterThanOrEqual(24);
  expect(mobileMetrics.firstImageHeight).toBeGreaterThanOrEqual(200);
  expect(mobileMetrics.cardPadding).toBeGreaterThanOrEqual(20);

  await page.setViewportSize({ width: 320, height: 740 });
  const narrowMetrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(narrowMetrics.documentWidth).toBeLessThanOrEqual(narrowMetrics.viewportWidth + 2);
});

test("homepage service feature leads the visual hierarchy without turning all routes into equal cards", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "load" });
  const directory = page.locator(".home-audience-paths");
  const feature = directory.locator(".home-audience-path--featured");
  const secondary = directory.locator(".home-audience-path--compact");

  await expect(feature.locator("img")).toHaveAttribute("alt", /configuración sobre base Ceronte desarrollada con Auteco Mobility, con contenedor verde diseñado por Greenatics/);
  await expect(feature.locator("img")).toBeVisible();
  await expect(secondary).toHaveCount(2);

  const geometry = await directory.evaluate((element) => {
    const rect = (node: Element) => {
      const bounds = node.getBoundingClientRect();
      return { top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height };
    };
    return {
      feature: rect(element.querySelector(".home-audience-path--featured")!),
      secondary: [...element.querySelectorAll(".home-audience-path--compact")].map(rect),
      imageWidths: [...element.querySelectorAll("figure img")].map((image) => image.getBoundingClientRect().width),
    };
  });

  expect(geometry.feature.width).toBeGreaterThan(geometry.secondary[0].width * 1.9);
  expect(Math.abs(geometry.secondary[0].top - geometry.secondary[1].top)).toBeLessThan(4);
  expect(geometry.imageWidths.every((width) => width > 250)).toBe(true);

  for (const width of [900, 680, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      images: [...document.querySelectorAll(".home-audience-path__media img")].map((image) => image.getBoundingClientRect().width),
    }));
    expect(layout.document, `no horizontal overflow at ${width}px`).toBeLessThanOrEqual(layout.viewport + 2);
    expect(layout.images.every((imageWidth) => imageWidth > 0), `service images remain visible at ${width}px`).toBe(true);
  }
});

test("homepage closing offers two distinct and accessible next steps without narrow-screen overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });

  const closing = page.locator(".home-conversion-block");
  const diagnosis = closing.getByRole("link", { name: /Definir el alcance/ });
  const inquiry = closing.getByRole("link", { name: /Hablar sobre mi proyecto/ });
  await expect(closing.getByRole("heading", { name: "¿Qué reto ambiental necesitas resolver?" })).toBeVisible();
  await expect(diagnosis).toHaveAttribute("href", "/diagnostico/");
  await expect(inquiry).toHaveAttribute("href", "/contacto/?interes=soluciones");
  await expect(closing.locator(".home-conversion-block__action")).toHaveCount(2);

  for (const link of [diagnosis, inquiry]) {
    expect(await link.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  }

  await page.setViewportSize({ width: 320, height: 740 });
  const narrowMetrics = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    actions: [...document.querySelectorAll<HTMLElement>(".home-conversion-block__action")]
      .map((action) => action.getBoundingClientRect().width),
  }));
  expect(narrowMetrics.document).toBeLessThanOrEqual(narrowMetrics.viewport + 2);
  expect(narrowMetrics.actions.every((width) => width > 0 && width <= narrowMetrics.viewport)).toBe(true);
});

test("homepage switches to a spacious single-column editorial layout before the navigation collapses", async ({ page }) => {
  await page.setViewportSize({ width: 806, height: 900 });
  await page.goto("/", { waitUntil: "load" });

  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    heroColumns: getComputedStyle(document.querySelector(".home-system-hero__grid")!).gridTemplateColumns,
    mapColumns: getComputedStyle(document.querySelector(".home-system-map__heading")!).gridTemplateColumns,
    audienceColumns: getComputedStyle(document.querySelector(".home-audience-paths")!).gridTemplateColumns,
    productColumns: getComputedStyle(document.querySelector(".home-product-family-grid")!).gridTemplateColumns,
  }));
  const trackCount = (value: string) => {
    let depth = 0;
    let tracks = 0;
    let hasTrack = false;
    for (const character of value.trim()) {
      if (character === "(") depth += 1;
      else if (character === ")") depth -= 1;
      else if (/\s/.test(character) && depth === 0) {
        if (hasTrack) tracks += 1;
        hasTrack = false;
      } else hasTrack = true;
    }
    return tracks + Number(hasTrack);
  };

  expect(layout.width).toBeLessThanOrEqual(layout.viewport + 1);
  expect(trackCount(layout.heroColumns)).toBe(1);
  expect(trackCount(layout.mapColumns)).toBe(1);
  expect(trackCount(layout.audienceColumns)).toBe(1);
  expect(trackCount(layout.productColumns)).toBe(1);
});

test("homepage tool access uses explanatory visuals, clear destinations and truthful states", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });

  const directory = page.getByRole("navigation", { name: "Otras herramientas Greenatics" });
  const section = page.locator(".home-tools-bridge");
  const links = directory.getByRole("link");
  await expect(links).toHaveCount(toolDestinations.length);

  const featured = section.locator(".home-huella-feature");
  await expect(featured.getByRole("heading", { name: /Back 2 Green: inventario corporativo/ })).toBeVisible();
  await expect(featured.getByRole("link", { name: /Ver método, planes y precios/ })).toHaveAttribute("href", "/huella/");
  const huellaEntry = featured.getByRole("link", { name: /Entrar a la plataforma/ });
  await expect(huellaEntry).toHaveAttribute("href", /login|acceso/);
  if (/127\.0\.0\.1|localhost/.test(await huellaEntry.getAttribute("href") ?? "")) {
    await expect(huellaEntry).toHaveAccessibleName("Entrar a la plataforma local");
    await expect(featured).toContainText("Requiere que Back 2 Green esté iniciado en este equipo.");
  } else {
    await expect(featured).not.toContainText("Requiere que Back 2 Green esté iniciado en este equipo.");
  }
  await expect(featured.getByText(/Huella Esencial · \$450\.000 COP al año/)).toBeVisible();
  await expect(featured.locator("img")).toHaveAttribute("alt", /datos sintéticos/);

  for (const [name, href] of toolDestinations) {
    const link = directory.getByRole("link", { name: new RegExp(name) });
    await expect(link).toHaveAttribute("href", href);
    expect(await link.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    await expect(link.locator(".home-tool-link__media img")).toHaveAttribute("alt", /.+/);
    await expect(link.locator(".home-tool-link__title")).toBeVisible();
    await expect(link.locator(".home-tool-link__action")).toBeVisible();
  }

  await expect(directory.getByRole("link", { name: /AGROWAY/ })).toContainText("La visión de producto también conecta trazabilidad, Control y SANA Data");
  await expect(directory.getByRole("link", { name: /GREENATICS OPS/ })).toContainText("La muestra pública usa datos ficticios; no representa una operación real.");
  await expect(directory.getByRole("link", { name: /GREENATICS Red/ })).toContainText("La muestra usa datos ficticios; no representa una operación real.");

  const geometry = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    listHeight: document.querySelector<HTMLElement>(".home-tools-bridge__list")?.getBoundingClientRect().height ?? 0,
  }));
  expect(geometry.document).toBeLessThanOrEqual(geometry.viewport + 2);
  expect(geometry.listHeight).toBeLessThan(1500);

  await page.setViewportSize({ width: 320, height: 740 });
  const narrowWidth = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(narrowWidth.document).toBeLessThanOrEqual(narrowWidth.viewport + 2);
});

test("homepage mobile hierarchy preserves offers, evidence and tool entry points without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "load" });

  const metrics = await page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    claimAnimation: getComputedStyle(document.querySelector(".home-claims-rail article > strong")!).animationName,
    heroImageHeight: document.querySelector(".home-hero-figure")!.getBoundingClientRect().height,
  }));
  expect(metrics.height).toBeLessThan(14500);
  expect(metrics.width).toBeLessThanOrEqual(metrics.viewport + 2);
  expect(metrics.claimAnimation).toBe("none");
  expect(metrics.heroImageHeight).toBeLessThanOrEqual(352);
  await expect(page.locator(".home-product-family")).toHaveCount(3);
  await expect(page.locator(".home-territory__tamesis-bridge")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Otras herramientas Greenatics" }).getByRole("link")).toHaveCount(4);

  await page.setViewportSize({ width: 320, height: 740 });
  const narrow = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
  expect(narrow.width).toBeLessThanOrEqual(narrow.viewport + 2);
});
