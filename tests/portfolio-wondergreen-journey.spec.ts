import { expect, test } from "@playwright/test";

test("portfolio presents the Wondergreen program route without horizontal overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/portafolio/");

  const programLink = page.getByRole("link", {
    name: "Diseñar un programa para mi cultivo",
    exact: true,
  });

  await expect(programLink).toBeVisible();
  await expect(programLink).toHaveAttribute("href", "/servicios/programas-wondergreen/");
  await programLink.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath(`portfolio-wondergreen-overview-${testInfo.project.name}.png`) });

  const expectedProducts = [
    { name: "2GROW · 15-3-3", src: "/products/wondergreen-cropper-ref-2grow-solid-40kg.webp", alt: "Empaque Wondergreen 2GROW 15-3-3, presentación de 40 kg." },
    { name: "2BALANCE · 7-7-7", src: "/products/wondergreen-cropper-ref-2balance-solid-40kg.webp", alt: "Empaque Wondergreen 2BALANCE 7-7-7, presentación de 40 kg." },
    { name: "2BLOOM · 3-8-3", src: "/products/wondergreen-cropper-ref-2bloom-solid-40kg.webp", alt: "Empaque Wondergreen 2BLOOM 3-8-3, presentación de 40 kg." },
    { name: "2FRUIT · 3-3-8", src: "/products/wondergreen-cropper-ref-2fruit-solid-40kg.webp", alt: "Empaque Wondergreen 2FRUIT 3-3-8, presentación de 40 kg." },
  ];

  const sampleFigures = page.locator(".portfolio-product-feature__samples figure");
  await expect(sampleFigures).toHaveCount(expectedProducts.length);
  for (const product of expectedProducts) {
    const figure = sampleFigures.filter({ hasText: product.name });
    await expect(figure).toHaveCount(1);
    await expect(figure.locator("figcaption strong")).toHaveText(product.name);
    await expect(figure.locator("figcaption span")).toHaveText("40 kg");
    const productImage = figure.locator("img");
    await expect(productImage).toHaveAttribute("alt", product.alt);
    await productImage.scrollIntoViewIfNeeded();
    const loadedSource = await productImage.evaluate((image: HTMLImageElement) => {
      const current = new URL(image.currentSrc);
      return current.searchParams.get("url") ?? current.pathname;
    });
    expect(loadedSource).toBe(product.src);
    const loaded = await productImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0);
    expect(loaded, `${product.name} reference image should load`).toBe(true);
  }

  await expect(page.getByText("El precio y la disponibilidad de cada presentación se confirman con el equipo en cada solicitud.", { exact: true })).toBeVisible();

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document, `${dimensions.viewport}px document width`).toBeLessThanOrEqual(dimensions.viewport + 1);
    expect(dimensions.body, `${dimensions.viewport}px body width`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }

  await page.setViewportSize({ width: testInfo.project.name === "mobile" ? 390 : 1440, height: 900 });
  const anchorPage = await page.context().newPage();
  await anchorPage.setViewportSize({ width: testInfo.project.name === "mobile" ? 390 : 1440, height: 900 });
  await anchorPage.goto(new URL("/portafolio/#portafolio-productos", page.url()).toString());
  const productSection = anchorPage.locator("#portafolio-productos");
  await expect(productSection).toBeVisible();
  await anchorPage.waitForFunction(() => {
    const section = document.querySelector<HTMLElement>("#portafolio-productos");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!section || !header) return false;
    const scrollStateWindow = window as Window & {
      __portfolioAnchorState?: { scrollY: number; stableFrames: number };
    };
    const scrollY = window.scrollY;
    const state = scrollStateWindow.__portfolioAnchorState;
    if (!state) {
      scrollStateWindow.__portfolioAnchorState = { scrollY, stableFrames: 0 };
      return false;
    }
    if (Math.abs(scrollY - state.scrollY) < 1) state.stableFrames += 1;
    else {
      state.scrollY = scrollY;
      state.stableFrames = 0;
    }
    const offset = section.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    return state.stableFrames >= 3 && offset >= 0 && offset <= 32;
  }, undefined, { polling: "raf" });
  const anchorGeometry = await anchorPage.evaluate(() => {
    const section = document.querySelector<HTMLElement>("#portafolio-productos");
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!section || !header) throw new Error("Portfolio product anchor or site header is missing.");
    return {
      sectionTop: section.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
    };
  });
  expect(anchorGeometry.sectionTop).toBeGreaterThanOrEqual(anchorGeometry.headerBottom);
  await anchorPage.screenshot({ path: testInfo.outputPath(`portfolio-wondergreen-${testInfo.project.name}.png`) });

  if (testInfo.project.name === "mobile") {
    await anchorPage.locator(".portfolio-product-feature__samples").screenshot({
      path: testInfo.outputPath("portfolio-wondergreen-mobile-sacks.png"),
    });
  }

  await anchorPage.close();

  await programLink.click();
  await expect(page).toHaveURL(/\/servicios\/programas-wondergreen\/$/);
  await expect(
    page.getByRole("heading", { name: "Programas Agronómicos Wondergreen", exact: true }),
  ).toBeVisible();
});

test("Wondergreen portfolio connects formulations to published research without attributing studies to its products", async ({ page }) => {
  await page.goto("/portafolio/wondergreen/");

  await expect(page.getByRole("heading", { name: "La formulación también trabaja con el suelo." })).toBeVisible();
  await expect(page.getByText("15–28 %", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ngo et al/ })).toHaveAttribute(
    "href",
    "https://doi.org/10.1016/j.scitotenv.2021.151977",
  );
  await expect(page.getByText("17 %", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Weimers et al/ })).toHaveAttribute(
    "href",
    "https://doi.org/10.3389/fpls.2022.770179",
  );
  await expect(page.getByText(/no corresponden a ensayos de productos Wondergreen/)).toBeVisible();

  await page.goto("/wondergreen/ciencia/");
  await expect(page.getByRole("link", { name: /Weimers et al\. \(2022\)/ })).toBeVisible();
  await expect(page.getByText(/17 % más de materia seca/)).toBeVisible();
});
