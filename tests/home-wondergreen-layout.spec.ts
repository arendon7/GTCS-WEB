import { expect, test } from "@playwright/test";

test("Wondergreen exposes every solid, liquid and bioinput reference through manual accessible controls", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "load" });

  const families = page.locator(".home-product-family");
  await expect(families).toHaveCount(3);
  await expect(families.nth(0).getByRole("heading", { name: "Fertilizantes sólidos" })).toBeVisible();
  await expect(families.nth(1).getByRole("heading", { name: "Fertilizantes líquidos" })).toBeVisible();
  await expect(families.nth(2).getByRole("heading", { name: "Bioinsumos" })).toBeVisible();

  const loadedImages = await families.locator("img").evaluateAll((images) =>
    images.filter((image) => (image as HTMLImageElement).naturalWidth > 0).length,
  );
  expect(loadedImages).toBe(3);

  const solids = families.nth(0);
  const solidImage = solids.locator("img");
  const nextSolid = solids.getByRole("button", { name: "Ver siguiente referencia de Fertilizantes sólidos" });
  const solidReferences = [
    ["2GROW · 15-3-3", "Saco de fertilizante sólido organomineral Wondergreen 2GROW 15-3-3."],
    ["2BALANCE · 7-7-7", "Saco de fertilizante sólido organomineral Wondergreen 2BALANCE 7-7-7."],
    ["2BLOOM · 3-8-3", "Saco de fertilizante sólido organomineral Wondergreen 2BLOOM 3-8-3."],
    ["2FRUIT · 3-3-8", "Saco de fertilizante sólido organomineral Wondergreen 2FRUIT 3-3-8."],
  ];

  for (const [index, [name, alt]] of solidReferences.entries()) {
    await expect(solids.getByText(name)).toBeVisible();
    await expect(solidImage).toHaveAttribute("alt", alt);
    const src = await solidImage.getAttribute("src");
    expect(decodeURIComponent(src ?? "")).toContain(`wondergreen-cropper-ref-${name.split(" · ")[0].toLowerCase()}-solid-40kg.webp`);
    if (index < solidReferences.length - 1) await nextSolid.click();
  }
  await expect(solids.getByText("Sacos de 40 kg. El equipo confirma precio, disponibilidad y condiciones por solicitud.")).toBeVisible();
  await solids.getByRole("button", { name: "Ver referencia anterior de Fertilizantes sólidos" }).click();
  await expect(solids.locator(".home-product-family__selected strong")).toHaveText("2BLOOM · 3-8-3");

  const liquids = families.nth(1);
  for (const label of ["2GROW · 200-0-0", "2BALANCE · 70-70-70", "2BLOOM · 30-80-30", "2FRUIT · 30-30-80"]) {
    await liquids.getByRole("button", { name: "Ver siguiente referencia de Fertilizantes líquidos" }).click();
    await expect(liquids.getByText(label)).toBeVisible();
  }
  await liquids.getByRole("button", { name: "Ver referencia anterior de Fertilizantes líquidos" }).click();
  await expect(liquids.locator(".home-product-family__selected strong")).toHaveText("2BLOOM · 30-80-30");

  const bioinputs = families.nth(2);
  for (const [index, label] of ["Trichoderma", "Metarhizium anisopliae", "Beauveria bassiana", "Neem", "Extracto Ajo-Ají"].entries()) {
    await bioinputs.getByRole("button", { name: "Ver siguiente referencia de Bioinsumos" }).click();
    await expect(bioinputs.locator(".home-product-family__selected strong")).toHaveText(label);
    if (index === 0) {
      await expect(bioinputs.locator(".home-product-family__image-placeholder")).toContainText("Especie y ficha por confirmar");
      await expect(bioinputs.locator(".home-product-family__image-wrap img")).toHaveCount(0);
    }
  }
  await bioinputs.getByRole("button", { name: "Ver referencia anterior de Bioinsumos" }).click();
  await expect(bioinputs.locator(".home-product-family__selected strong")).toHaveText("Neem");
});

test("Wondergreen cards and controls remain legible across responsive widths", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".home-product-family")).toHaveCount(3);

  const bioinputs = page.locator(".home-product-family").filter({
    has: page.getByRole("heading", { name: "Bioinsumos", exact: true }),
  });
  const image = bioinputs.locator(".home-product-family__image-wrap");
  const body = bioinputs.locator(".home-product-family__body");
  const controls = bioinputs.locator(".home-product-family__controls");
  const buttons = controls.getByRole("button");

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width <= 390 ? 2400 : 1000 });
    const narrow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(narrow.document).toBeLessThanOrEqual(narrow.viewport + 1);

    const cardWidth = await bioinputs.evaluate((element) => element.getBoundingClientRect().width);
    const controlWidth = await controls.evaluate((element) => element.getBoundingClientRect().width);
    expect(controlWidth).toBeGreaterThan(cardWidth * 0.8);
    await expect(body.getByRole("heading", { name: "Bioinsumos" })).toBeVisible();
    await expect(body.locator("p").first()).toBeVisible();
    if (width <= 390) {
      const imageBox = await image.boundingBox();
      const bodyBox = await body.boundingBox();
      const bodyWidth = await body.evaluate((element) => element.getBoundingClientRect().width);
      expect(bodyWidth).toBeGreaterThan(cardWidth * 0.8);
      expect(bodyBox?.y).toBeGreaterThanOrEqual((imageBox?.y ?? 0) + (imageBox?.height ?? 0) - 1);
    }

    const buttonRects = [];
    for (const button of await buttons.all()) {
      const geometry = await button.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          centerY: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
          textFits: element.scrollWidth <= element.clientWidth,
          whiteSpace: getComputedStyle(element).whiteSpace,
        };
      });
      expect(geometry.width).toBeGreaterThanOrEqual(44);
      expect(geometry.height).toBeGreaterThanOrEqual(44);
      expect(geometry.textFits).toBe(true);
      if (width <= 390) expect(geometry.whiteSpace).toBe("nowrap");
      buttonRects.push(geometry);
    }

    const counter = controls.locator("span");
    const counterGeometry = await counter.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        centerY: rect.top + rect.height / 2,
        textFits: element.scrollWidth <= element.clientWidth,
        whiteSpace: getComputedStyle(element).whiteSpace,
      };
    });
    expect(counterGeometry.textFits).toBe(true);
    if (width <= 390) expect(counterGeometry.whiteSpace).toBe("nowrap");
    expect(Math.abs(buttonRects[0].centerY - buttonRects[1].centerY)).toBeLessThanOrEqual(1);
    expect(Math.abs(buttonRects[0].centerY - counterGeometry.centerY)).toBeLessThanOrEqual(1);

    for (const familyControls of await page.locator(".home-product-family__controls").all()) {
      const items = await familyControls.locator("button, span").evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, centerY: rect.top + rect.height / 2, height: rect.height };
        }),
      );
      expect(items.every((item) => Math.abs(item.centerY - items[0].centerY) <= 1)).toBe(true);
      for (const target of items.filter((item) => item.tag === "BUTTON")) {
        expect(target.height).toBeGreaterThanOrEqual(44);
      }
    }
  }

  await buttons.nth(1).click();
  await expect(bioinputs.locator(".home-product-family__selected strong")).toHaveText("Trichoderma");
  await buttons.nth(0).click();
  await expect(bioinputs.locator(".home-product-family__selected strong")).toHaveText("Bacillus subtilis");
});
