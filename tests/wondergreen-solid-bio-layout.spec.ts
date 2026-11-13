import { expect, test } from "@playwright/test";

test("Wondergreen solids show four lines, product imagery and specific routes at desktop and mobile", async ({ page }, testInfo) => {
  await page.goto("/wondergreen/#solidos");

  const section = page.locator("#solidos");
  const cards = section.locator(".wg-solid-showcase__item");
  await section.scrollIntoViewIfNeeded();
  await expect(cards).toHaveCount(4);
  await expect(section.getByRole("heading", { name: "Nutrición organomineral por etapa del cultivo." })).toBeVisible();
  await expect(section).toContainText("organominerales ocluidos");
  await expect(section).toContainText("materia orgánica");
  await expect(section).toContainText("volatilización");

  for (const [slug, formula] of [["2grow", "15-3-3"], ["2balance", "7-7-7"], ["2bloom", "3-8-3"], ["2fruit", "3-3-8"]]) {
    const card = section.locator(`.wg-solid-showcase__item--${slug}`);
    await expect(card).toHaveCount(1);
    await expect(card).toContainText(formula);
    await expect.poll(() => card.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(card.locator("figcaption")).toHaveCount(0);
    await expect(card.getByRole("link")).toHaveAttribute("href", `/wondergreen/productos/${slug}/`);
  }
  await expect(section.getByRole("tablist")).toHaveCount(0);

  const geometry = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    header: document.querySelector(".site-header")?.getBoundingClientRect().toJSON(),
    section: document.querySelector("#solidos")?.getBoundingClientRect().toJSON(),
    gridColumns: getComputedStyle(document.querySelector(".wg-solid-showcase__grid")!).gridTemplateColumns,
  }));
  expect(geometry.document).toBeLessThanOrEqual(geometry.viewport + 2);
  expect(geometry.section!.top).toBeGreaterThanOrEqual(geometry.header!.bottom - 2);
  expect(geometry.gridColumns.split(" ")).toHaveLength(2);
  await page.screenshot({ path: `/private/tmp/greenatics-wondergreen-solid-layout-${testInfo.project.name}-2026-10-01.png` });
});

test("Wondergreen bioinputs distinguish microbiological and botanical references", async ({ page }, testInfo) => {
  await page.goto("/wondergreen/#bioinsumos");

  const section = page.locator("#bioinsumos");
  await section.scrollIntoViewIfNeeded();
  const cards = section.locator(".wg-bio-lines__item");
  await expect(cards).toHaveCount(6);
  await expect(section.locator(".wg-bio-lines__group")).toHaveCount(2);
  await expect(section.getByRole("heading", { name: "Microbiológicos" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "Botánicos" })).toBeVisible();
  await expect(section.locator(".wg-bio-lines__group").nth(0).locator(".wg-bio-lines__item")).toHaveCount(4);
  await expect(section.locator(".wg-bio-lines__group").nth(1).locator(".wg-bio-lines__item")).toHaveCount(2);

  for (const slug of ["bioinsumo-trichoderma", "bioinsumo-bacillus-subtilis", "bioinsumo-beauveria", "bioinsumo-metarhizium", "bioinsumo-ajo-aji", "bioinsumo-neem"]) {
    const card = cards.filter({ has: page.locator(`a[href="/wondergreen/productos/${slug}/"]`) });
    await expect(card).toHaveCount(1);
    await expect(card.locator("img")).toBeVisible();
    await expect(card.locator("figcaption")).toHaveCount(0);
    await expect(card.getByRole("link")).toHaveAttribute("href", `/wondergreen/productos/${slug}/`);
  }

  const geometry = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    header: document.querySelector(".site-header")?.getBoundingClientRect().toJSON(),
    section: document.querySelector("#bioinsumos")?.getBoundingClientRect().toJSON(),
    gridColumns: getComputedStyle(document.querySelector(".wg-bio-lines__items")!).gridTemplateColumns,
  }));
  expect(geometry.document).toBeLessThanOrEqual(geometry.viewport + 2);
  expect(geometry.section!.top).toBeGreaterThanOrEqual(geometry.header!.bottom - 2);
  expect(geometry.gridColumns.split(" ")).toHaveLength(2);
  await page.screenshot({ path: `/private/tmp/greenatics-wondergreen-bio-layout-${testInfo.project.name}-2026-10-01.png` });
});

test("Wondergreen product grids collapse to readable single columns on narrow phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Narrow-phone coverage runs in the mobile project.");
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/wondergreen/#solidos");

  const gridColumns = await page.evaluate(() => [
    ".wg-solid-showcase__grid",
    ".wg-liquid-lines__grid",
    ".wg-bio-lines__items",
  ].map((selector) => getComputedStyle(document.querySelector(selector)!).gridTemplateColumns.split(" ").length));
  expect(gridColumns).toEqual([1, 1, 1]);
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 2);
});

test("each solid product ficha shows its product image and current 40 kg presentation", async ({ page }, testInfo) => {
  for (const [slug, formula] of [["2grow", "15-3-3"], ["2balance", "7-7-7"], ["2bloom", "3-8-3"], ["2fruit", "3-3-8"]]) {
    await page.goto(`/wondergreen/productos/${slug}/`);
    const visual = page.locator(".product-reference-visual--detail");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".product-facts")).toContainText(formula);
    await expect(page.locator(".product-facts")).toHaveCSS("display", "grid");
    await expect(page.locator("#presentaciones")).toContainText("40 kg");
    await expect(visual.locator("img")).toBeVisible();
    await expect(visual.locator("figcaption")).toHaveCount(0);
    await expect(visual.locator("img")).toHaveAttribute("alt", new RegExp(`Wondergreen ${slug === "2grow" ? "2GROW" : slug.toUpperCase()}`));
    await expect(page.locator(".price-panel--technical")).toHaveCSS("display", "grid");
    const actionColumns = await page.locator(".price-panel--technical .button-row").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(actionColumns).toBe(testInfo.project.name === "mobile" ? 1 : 2);
    const actionsFit = await page.locator(".price-panel--technical").evaluate((panel) => {
      const panelBox = panel.getBoundingClientRect();
      const boxes = [...panel.querySelectorAll<HTMLElement>(".button-row .button")].map((button) => button.getBoundingClientRect());
      return boxes.every((box) => box.left >= panelBox.left && box.right <= panelBox.right);
    });
    expect(actionsFit).toBe(true);
    const sectionIndex = page.getByRole("navigation", { name: "Secciones de esta ficha" });
    await expect(sectionIndex.getByRole("link")).toHaveCount(["2grow", "2balance", "2bloom", "2fruit"].includes(slug) ? 6 : 5);
    if (slug === "2grow") {
      await expect(sectionIndex.getByRole("link", { name: "Matriz ocluida" })).toHaveAttribute("href", "#matriz");
      await expect(page.locator("#matriz")).toContainText("Nutrientes integrados en una matriz organomineral ocluida");
      await expect(page.locator("#matriz blockquote")).toContainText("integra nutrientes minerales y materia orgánica en una matriz ocluida");
      await expect(page.locator("#matriz a")).toHaveAttribute("href", "/wondergreen/ciencia/#wg-matrix-story-title");
      await expect.poll(() => page.locator("#matriz .solidMatrixVisual img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    if (slug === "2balance") {
      await expect(sectionIndex.getByRole("link", { name: "Leer el 7-7-7" })).toHaveAttribute("href", "#balance-solido");
      const formula = page.locator("#balance-solido .balanceSolidFormula dl");
      await expect(formula).toContainText("Nitrógeno");
      await expect(formula).toContainText("Fósforo");
      await expect(formula).toContainText("Potasio");
      await expect(formula).toContainText("7");
      await expect(page.locator("#balance-solido")).toContainText("El resultado contextualiza el valor de considerar N-P-K en conjunto");
      await expect(page.locator("#balance-solido a")).toHaveAttribute("href", "https://doi.org/10.1016/j.fcr.2024.109616");
      await expect(page.locator("#balance-solido")).toContainText("Propuesta de claim para revisión agronómica");
    }
    if (slug === "2bloom") {
      await expect(sectionIndex.getByRole("link", { name: "Leer el 3-8-3" })).toHaveAttribute("href", "#bloom-solido");
      await expect(page.locator("#bloom-solido .bloomSolidRows")).toHaveAttribute("aria-label", /N 3, P 8 y K 3/);
      await expect(page.locator("#bloom-solido")).toContainText("El fósforo destaca en la fórmula");
      await expect(page.locator('#bloom-solido a[href^="https://doi.org/"]')).toHaveAttribute("href", "https://doi.org/10.1016/j.scienta.2020.109596");
      await expect(page.locator('#bloom-solido a[href^="https://biblioteca.cenicafe.org/"]')).toHaveAttribute("href", "https://biblioteca.cenicafe.org/handle/10778/4297");
      await expect(page.locator("#bloom-solido")).toContainText("Propuesta de claim para revisión agronómica");
      await expect(page.locator("#bloom-solido")).toContainText("los estudios no miden 2BLOOM");
    }
    if (slug === "2fruit") {
      await expect(sectionIndex.getByRole("link", { name: "Leer el 3-3-8" })).toHaveAttribute("href", "#fruit-solido");
      await expect(page.locator("#fruit-solido .fruitSolidRows")).toHaveAttribute("aria-label", /N 3, P 3 y K 8/);
      await expect(page.locator("#fruit-solido .fruitSolidExport")).toContainText("67.7 kg/ha");
      await expect(page.locator("#fruit-solido .fruitSolidEvidenceNote")).toContainText("60,4 lb/acre");
      await expect(page.locator('#fruit-solido a[href="https://ucanr.edu/sites/alternativefruits/files/291780.pdf"]')).toHaveCount(1);
      await expect(page.locator("#fruit-solido")).toContainText("no mide 2FRUIT");
      await expect(page.locator("#fruit-solido")).toContainText("Propuesta de claim para revisión agronómica");
    }
    await expect(sectionIndex.getByRole("link", { name: "Qué aporta" })).toHaveAttribute("href", "#papel");
    await expect(sectionIndex.getByRole("link", { name: "Precauciones" })).toHaveAttribute("href", "#criterio");
    for (const link of await sectionIndex.getByRole("link").all()) await expect(link).toBeVisible();
    const relatedCardWidths = await page.locator(".product-related-card").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    expect(relatedCardWidths).toHaveLength(3);
    expect(Math.max(...relatedCardWidths) - Math.min(...relatedCardWidths)).toBeLessThan(2);
    expect(relatedCardWidths[0]).toBeGreaterThan(testInfo.project.name === "mobile" ? 300 : 260);
    await expect(page.getByRole("link", { name: `Consultar Wondergreen ${slug.toUpperCase()}` })).toHaveAttribute("href", /\/contacto\/\?interes=wondergreen/);
    const width = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(width.document).toBeLessThanOrEqual(width.viewport + 2);
    if (slug === "2grow") {
      await page.screenshot({ path: `/private/tmp/greenatics-wondergreen-2grow-detail-${testInfo.project.name}-2026-10-01.png` });
      await page.locator("#presentaciones").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `/private/tmp/greenatics-wondergreen-2grow-presentations-${testInfo.project.name}-2026-10-01.png` });
    }
  }
});
