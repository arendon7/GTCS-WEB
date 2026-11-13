import { expect, test } from "@playwright/test";

test("Wondergreen liquid catalog groups four lines and five formulations responsively", async ({ page }, testInfo) => {
  await page.goto("/wondergreen/#liquidos");

  const section = page.locator("#liquidos");
  const catalog = page.locator(".wg-liquid-lines__grid");
  await section.scrollIntoViewIfNeeded();
  await expect(catalog).toHaveAttribute("aria-label", "Cuatro líneas y cinco formulaciones líquidas Wondergreen");
  await expect(catalog.locator(":scope > article")).toHaveCount(4);

  const grow = catalog.locator(".wg-liquid-lines__card--2grow");
  await expect(grow).toHaveCount(1);
  await expect(grow.locator(".wg-liquid-lines__formulation")).toHaveCount(2);
  await expect(grow).toContainText("100-20-20");
  await expect(grow).toContainText("200-0-0");
  await expect(grow.getByRole("link", { name: "Ver ficha de 2GROW →" })).toHaveCount(1);

  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    header: document.querySelector(".site-header")?.getBoundingClientRect().toJSON(),
    section: document.querySelector("#liquidos")?.getBoundingClientRect().toJSON(),
    catalog: document.querySelector(".wg-liquid-lines__grid")?.getBoundingClientRect().toJSON(),
    grow: document.querySelector(".wg-liquid-lines__card--2grow")?.getBoundingClientRect().toJSON(),
    other: document.querySelector(".wg-liquid-lines__card--2balance")?.getBoundingClientRect().toJSON(),
  }));

  expect(layout.document).toBeLessThanOrEqual(layout.viewport);
  expect(layout.header).toBeTruthy();
  expect(layout.section).toBeTruthy();
  expect(layout.section!.top).toBeGreaterThanOrEqual(layout.header!.bottom);
  expect(layout.catalog).toBeTruthy();
  expect(layout.grow).toBeTruthy();
  expect(layout.other).toBeTruthy();
  expect(Math.abs(layout.grow!.width - layout.other!.width)).toBeLessThan(2);

  await catalog.screenshot({ path: `/private/tmp/greenatics-wondergreen-liquid-layout-${testInfo.project.name}-2026-10-01.png` });

  await page.goto("/wondergreen/productos/2grow-liquido/");
  // CSS Modules scope this class; match its stable source-name token.
  const profiles = page.locator('figure[class*="profileValues"]');
  await expect(profiles).toHaveCount(2);
  await expect(profiles.nth(0)).toHaveAttribute("aria-label", /100-20-20: nitrógeno 100, fósforo 20, potasio 20/);
  await expect(profiles.nth(1)).toHaveAttribute("aria-label", /200-0-0: nitrógeno 200, fósforo 0, potasio 0/);
  await expect(profiles.first().locator("figcaption")).toContainText("escala visual común 0–200");

  const processVisual = page.locator('figure[class*="liquidSystemVisual"]');
  await processVisual.scrollIntoViewIfNeeded();
  const processImage = processVisual.locator('img[class*="liquidSystemScene"]');
  await expect(processImage).toHaveAttribute("alt", /Ilustración conceptual de una planta de digestión anaerobia multietapa/);
  await expect.poll(() => processImage.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(processVisual.locator("figcaption")).toContainText("Visualización conceptual");

  const profileLayout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    diagrams: [...document.querySelectorAll('figure[class*="profileValues"]')].map((element) => element.getBoundingClientRect().width),
  }));
  expect(profileLayout.document).toBeLessThanOrEqual(profileLayout.viewport);
  expect(profileLayout.diagrams).toHaveLength(2);
  expect(profileLayout.diagrams.every((width) => width > 0)).toBe(true);
});
