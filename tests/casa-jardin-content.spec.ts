import { expect, test } from "@playwright/test";

test("Casa & Jardín landing keeps routes, products and orientation clear", async ({ page }) => {
  await page.goto("/casa-jardin/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Nutrición clara para plantas, jardines y huertas." })).toBeVisible();
  await expect(page.locator(".homegarden-v4-hero__brand")).toHaveAttribute("src", /wondergreen-nutrients-transparent\.png/);
  await expect(page.locator(".homegarden-v4-hero__image figcaption strong")).toHaveText("Tu planta cambia. Su nutrición también.");
  await expect(page.locator(".homegarden-v4-hero__image figcaption span")).toHaveText("Una guía práctica para elegir con criterio, no a ciegas.");
  await expect(page.locator(".homegarden-v4-review__map li")).toHaveCount(7);
  await expect(page.locator(".homegarden-v4-review__card")).toHaveCount(9);
  await expect(page.getByRole("heading", { name: "Nueve rutas para distintos espacios y plantas." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casa Completa", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casa Completa XL", exact: true })).toBeVisible();
  await expect(page.locator(".homegarden-v4-product-card")).toHaveCount(5);
  await expect(page.locator(".homegarden-v4-product-card__body > strong")).toHaveText(["COMPOST", "CRECE", "EQUILIBRA", "FLORECE", "FRUCTIFICA"]);
  await expect(page.getByText(/no todas las especies pasan por cada etapa/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver propuestas de kits" })).toHaveAttribute("href", "#kits-v4-title");
  const kitLinks = page.locator(".homegarden-v4-review__detail-link");
  await expect(kitLinks).toHaveCount(9);
  await expect(kitLinks.nth(0)).toHaveAttribute("href", "/casa-jardin/kits/v4/mi-primera-matera/");
  await expect(kitLinks.nth(8)).toHaveAttribute("href", "/casa-jardin/kits/v4/proteccion-de-hojas/");
  const kitArt = page.locator(".homegarden-v4-review__art img");
  await expect(kitArt).toHaveCount(9);
  for (const [index, asset] of [
    "mi-primera-matera.jpg",
    "plantas-verdes.jpg",
    "plantas-con-flor.jpg",
    "aromaticas-y-hojas.jpg",
    "trasplanta-y-activa.jpg",
    "mi-huerta.jpg",
    "casa-completa.jpg",
    "casa-completa-xl.jpg",
    "proteccion-de-hojas.jpg",
  ].entries()) {
    await expect(kitArt.nth(index)).toHaveAttribute("src", new RegExp(asset.replaceAll(".", "\\.")));
    await expect(kitArt.nth(index)).toHaveAttribute("alt", /Arte de referencia/);
  }
  await expect(page.getByRole("heading", { name: "CRECE" })).toBeVisible();
  await expect(page.getByText("Una rutina que sí se puede sostener")).toHaveCount(0);
  await expect(page.getByText("Semáforo de decisión")).toHaveCount(0);
  await expect(page.locator(".homegarden-v4-decision img")).toHaveAttribute("src", /casa-guia-drenaje\.webp/);
  await expect(page.locator(".homegarden-v4-decision img")).toHaveAttribute("alt", /dos materas.*una con drenaje y otra sin/i);
  await expect(page.locator(".homegarden-v4-decision figcaption")).toHaveText("El drenaje y el estado de las raíces orientan el cuidado antes de fertilizar.");
  await expect(page.getByRole("heading", { name: "Antes de nutrir, revisa agua y drenaje." })).toBeVisible();

  const wetSubstrate = page.getByRole("button", { name: "Sustrato encharcado" });
  await expect(wetSubstrate).toHaveAttribute("aria-pressed", "false");
  await wetSubstrate.scrollIntoViewIfNeeded();
  await wetSubstrate.click();
  await expect(wetSubstrate).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Primero revisa qué está afectando la planta." })).toBeVisible();
  await expect(page.getByText("Esta herramienta no diagnostica el problema")).toBeVisible();

  const activePlant = page.getByRole("button", { name: "Activa y sin señales de estrés" });
  await activePlant.click();
  await expect(activePlant).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "CRECE" })).toBeVisible();
  await expect(page.locator(".homegarden-v4-product-card--crece .homegarden-v4-product-card__link")).toHaveAttribute("href", "/casa-jardin/productos/crece/");
});

test("hero composes the kit art over desktop imagery and gives it a full mobile card", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/casa-jardin/", { waitUntil: "networkidle" });

  const stage = page.locator(".homegarden-v4-hero__visual-stage");
  const kit = page.locator(".homegarden-v4-hero__kit-art");
  if (testInfo.project.name !== "mobile") {
    const desktopGeometry = await stage.evaluate((stageElement) => {
      const image = stageElement.querySelector(".homegarden-v4-hero__image-frame")!;
      const art = stageElement.querySelector(".homegarden-v4-hero__kit-art")!;
      const imageRect = image.getBoundingClientRect();
      const artRect = art.getBoundingClientRect();
      return {
        artBottomGap: Math.round(imageRect.bottom - artRect.bottom),
        overlapsImage: artRect.left < imageRect.right && artRect.right > imageRect.left && artRect.top < imageRect.bottom && artRect.bottom > imageRect.top,
        width: Math.round(artRect.width),
      };
    });
    expect(desktopGeometry.artBottomGap).toBe(14);
    expect(desktopGeometry.overlapsImage).toBe(true);
    expect(desktopGeometry.width).toBeGreaterThan(200);
    await expect(kit.locator("img")).toHaveCount(1);
    await expect(kit.locator("img")).toHaveAttribute("alt", "");

    await page.setViewportSize({ width: 768, height: 900 });
    const tabletGeometry = await stage.evaluate((stageElement) => {
      const image = stageElement.querySelector(".homegarden-v4-hero__image-frame")!;
      const art = stageElement.querySelector(".homegarden-v4-hero__kit-art")!;
      const imageRect = image.getBoundingClientRect();
      const artRect = art.getBoundingClientRect();
      return {
        artBottomGap: Math.round(imageRect.bottom - artRect.bottom),
        overlapsImage: artRect.top < imageRect.bottom,
      };
    });
    expect(tabletGeometry.artBottomGap).toBe(14);
    expect(tabletGeometry.overlapsImage).toBe(true);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileGeometry = await stage.evaluate((stageElement) => {
    const image = stageElement.querySelector(".homegarden-v4-hero__image-frame")!;
    const art = stageElement.querySelector(".homegarden-v4-hero__kit-art")!;
    const imageRect = image.getBoundingClientRect();
    const artRect = art.getBoundingClientRect();
    return {
      position: getComputedStyle(art).position,
      followsImage: artRect.top >= imageRect.bottom,
      width: Math.round(artRect.width),
    };
  });
  expect(mobileGeometry.position).toBe("static");
  expect(mobileGeometry.followsImage).toBe(true);
  expect(mobileGeometry.width).toBeLessThanOrEqual(390);
  await expect(kit).toHaveAttribute("href", "#aromaticas-y-hojas");
});

test("las imágenes de las colecciones se ajustan a móviles estrechos", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/casa-jardin/", { waitUntil: "networkidle" });

  const kitCards = page.locator(".homegarden-v4-review__card");
  await expect(kitCards).toHaveCount(9);
  await kitCards.first().scrollIntoViewIfNeeded();

  const widths = await kitCards.evaluateAll((cards) => cards.map((card) => {
    const figure = card.querySelector(".homegarden-v4-review__art");
    return {
      card: card.clientWidth,
      figure: figure?.getBoundingClientRect().width ?? 0,
      scroll: card.scrollWidth,
    };
  }));

  expect(widths.every(({ card, figure, scroll }) => figure <= card + 1 && scroll <= card + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("guías usan arte directo y distinguen lectura web de descarga PDF", async ({ page }) => {
  await page.goto("/casa-jardin/guias/", { waitUntil: "networkidle" });

  await expect(page.locator(".homegarden-guide-card")).toHaveCount(4);
  const images = await page.locator(".homegarden-guide-card img").evaluateAll((elements) => elements.map((element) => (element as HTMLImageElement).src));
  expect(images.filter((src) => /casa-observar-(activa|revisar|detener)\.jpg/.test(src))).toHaveLength(3);
  expect(images.some((src) => src.includes("casa-guia-etapas.jpg"))).toBe(true);
  expect(images.some((src) => src.includes("casa-transplante-planting-detail.jpg"))).toBe(true);
  expect(images.some((src) => src.includes("casa-hierbas-editorial.jpg"))).toBe(true);
  expect(images.some((src) => /home-garden-(not-all-stress|pot-sizes)\.webp/.test(src))).toBe(false);
  expect(images.some((src) => /home-garden-(casa-jardin|etapas|trasplante|mi-huerta)-cover/.test(src))).toBe(false);

  await expect(page.getByRole("heading", { level: 1, name: "Guías para entender qué necesita tu planta." })).toBeVisible();
  await expect(page.locator(".homegarden-guide-card__question")).toHaveText([
    "¿Qué reviso antes de nutrir?",
    "¿En qué etapa está mi planta?",
    "¿Cómo preparo el cambio de matera?",
    "¿Qué ruta sigue mi aromática u hortaliza?",
  ]);
  await expect(page.locator(".homegarden-guide-card a[download]")).toHaveText([
    "Descargar PDF · etapas ↓",
  ]);

  const downloads = await page.locator(".homegarden-guide-card a[download]").evaluateAll((elements) => elements.map((element) => (element as HTMLAnchorElement).getAttribute("href")));
  expect(downloads).toEqual([
    "/downloads/guia-rapida-etapas.pdf",
  ]);
});

test("Mi Huerta explica que las aromáticas no siguen necesariamente hasta el fruto", async ({ page }) => {
  await page.goto("/casa-jardin/kits/mi-huerta/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Mi Huerta" })).toBeVisible();
  await expect(page.getByText(/FRUCTIFICA corresponde solo a cultivos que formen fruto/)).toBeVisible();
  await expect(page.locator(".homegarden-kit-route").getByText(/albahaca, cilantro, perejil, tomillo y romero/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Consultar Guía Mi Huerta" })).toHaveAttribute("href", "/biblioteca/huertas/");
  await expect(page.locator(".homegarden-kit-route li")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "La cosecha define el recorrido." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver ruta de uso" })).toHaveAttribute("href", "#ruta-cultivo");
  await expect(page.locator(".homegarden-huerta-path")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "De la preparación a la cosecha de hojas." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "De la etapa vegetativa al desarrollo del fruto." })).toBeVisible();
  await expect(page.getByText(/2BALANCE · nutrición equilibrada y mantenimiento/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Conocer 2BALANCE" })).toHaveAttribute("href", "/casa-jardin/productos/equilibra/");
});

test("las cinco fichas de kit describen el arte sin notas de producción", async ({ page }) => {
  const kits = [
    ["plantas-verdes", "Plantas Verdes"],
    ["plantas-con-flor", "Plantas con Flor"],
    ["mi-huerta", "Mi Huerta"],
    ["casa-completa", "Casa Completa"],
    ["casa-completa-xl", "Casa Completa XL"],
  ];

  for (const [slug, name] of kits) {
    await page.goto(`/casa-jardin/kits/${slug}/`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    const image = page.locator(".homegarden-kit-detail-art img");
    await expect(image).toHaveAttribute("alt", `Productos Wondergreen del kit ${name}, junto a una bolsa de yute y plantas.`);
    await expect(image).not.toHaveAttribute("alt", /editorial|ilustrativa|generada con IA|no documenta/i);
  }
});

test("las fichas conectan cada etapa con una guía y un criterio de uso propio", async ({ page }) => {
  await page.goto("/casa-jardin/productos/fructifica/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "Qué observar en esta etapa." })).toBeVisible();
  await expect(page.getByText(/Las aromáticas de hoja pueden completar su ciclo sin llegar a ella/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Consultar Guía Mi Huerta" })).toHaveAttribute("href", "/biblioteca/huertas/");
  await expect(page.locator(".homegarden-product-route ol")).toHaveCount(0);
});

test("el catálogo presenta productos con claridad y las fichas evitan rótulos editoriales", async ({ page }) => {
  await page.goto("/casa-jardin/productos/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Compost prepara. Elige según la etapa." })).toBeVisible();
  await expect(page.getByText("No todas las especies recorren las mismas etapas.")).toBeVisible();
  await expect(page.getByText(/recortes de artes|arte aprobado|packshot individual vigente/i)).toHaveCount(0);
  await expect(page.locator(".homegarden-product-family-map--products ol")).toHaveCount(0);
  const stageMarkers = await page.locator(".homegarden-product-family-map--products li").evaluateAll((items) => items.map((item) => getComputedStyle(item, "::before").content));
  expect(stageMarkers).toEqual(["none", "none", "none", "none"]);
  await expect(page.locator(".homegarden-product-card__media figcaption")).toHaveCount(0);
  await expect(page.locator(".homegarden-product-card__number")).toHaveCount(0);
  await expect(page.locator(".homegarden-product-card a")).toHaveText([
    "Ver ficha de COMPOST →",
    "Ver ficha de CRECE →",
    "Ver ficha de EQUILIBRA →",
    "Ver ficha de FLORECE →",
    "Ver ficha de FRUCTIFICA →",
  ]);

  const catalogImages = page.locator(".homegarden-product-card__media img");
  await expect(catalogImages).toHaveCount(5);
  await expect(catalogImages.nth(0)).toHaveAttribute("src", /casa-jardin-compost-huerta\.jpg/);
  await expect(catalogImages.nth(1)).toHaveAttribute("src", /casa-jardin-crece-kit\.jpg/);
  await expect(catalogImages.nth(2)).toHaveAttribute("src", /casa-jardin-equilibra-kit\.jpg/);
  await expect(catalogImages.nth(3)).toHaveAttribute("src", /casa-jardin-florece-huerta\.jpg/);
  await expect(catalogImages.nth(4)).toHaveAttribute("src", /casa-jardin-fructifica-huerta\.jpg/);
  await expect(catalogImages.nth(0)).toHaveAttribute("alt", "Envase ilustrado de COMPOST en el kit Mi Huerta.");
  await expect(catalogImages.nth(1)).toHaveAttribute("alt", "Envase ilustrado de CRECE en el kit Plantas Verdes.");
  await expect(catalogImages.nth(2)).toHaveAttribute("alt", "Envase ilustrado de EQUILIBRA en el kit Plantas Verdes.");
  await expect(catalogImages.nth(3)).toHaveAttribute("alt", "Envase ilustrado de FLORECE en el kit Mi Huerta.");
  await expect(catalogImages.nth(4)).toHaveAttribute("alt", "Envase ilustrado de FRUCTIFICA en el kit Mi Huerta.");

  const failedImages = await catalogImages.evaluateAll((images) => images.filter((image) => !(image as HTMLImageElement).complete || (image as HTMLImageElement).naturalWidth === 0).length);
  expect(failedImages).toBe(0);

  await page.goto("/casa-jardin/productos/fructifica/", { waitUntil: "networkidle" });
  await expect(page.locator(".homegarden-detail-visual img")).toHaveAttribute("src", /casa-stage-fructifica\.jpg/);
  await expect(page.locator(".homegarden-detail-visual img")).toHaveAttribute("alt", "Planta de fruto en maceta con frutos anaranjados en desarrollo.");
  await expect(page.locator(".homegarden-detail-visual figcaption")).toHaveCount(0);
});
