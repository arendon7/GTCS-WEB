import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Wondergreen landing prioritizes products and keeps its full crop library discoverable", async ({ page }) => {
  await page.goto("/wondergreen/");

  await expect(page.getByRole("heading", { level: 1, name: "Wondergreen: nutrición para el suelo y el cultivo." })).toBeVisible();
  await expect(page.locator(".wg-v4-hero__proof")).toHaveCount(0);
  await expect(page.locator(".wg-v4-decision")).toHaveCount(0);
  await expect(page.locator(".wg-family-map")).toHaveCount(0);
  await expect(page.locator("#productos")).toBeVisible();
  await expect(page.locator("#familias").getByRole("link", { name: "Compost" })).toHaveAttribute("href", "/wondergreen/productos/compost/");
  await expect(page.locator("#compost")).toContainText("Compost Wondergreen");
  await expect(page.locator("#bioinsumos article")).toHaveCount(6);
  await expect(page.locator("#liquidos")).toContainText("Una línea con dos concentraciones: 100-20-20 para crecimiento vegetativo y 200-0-0");
  await expect(page.locator(".crop-library-grid--featured .crop-library-card")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Explorar las 12 rutas por cultivo" })).toHaveAttribute("href", "/wondergreen/cultivos/");

  const productTop = await page.locator("#productos").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  const servicesTop = await page.locator(".wg-v4-guidance").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
  expect(productTop).toBeLessThan(servicesTop);
});

test("A212 liquid product fichas and shared guidance keep their verified claims at every breakpoint", async ({ page }, testInfo) => {
  const products = [
    { slug: "2grow-liquido", name: "Wondergreen 2GROW Líquido", formula: "100-20-20", stage: "Arranque & Crecimiento", facts: ".product-variant-note" },
    { slug: "2balance-liquido", name: "Wondergreen 2BALANCE Líquido", formula: "70-70-70", stage: "Equilibrio & Transición", facts: ".product-facts" },
    { slug: "2bloom-liquido", name: "Wondergreen 2BLOOM Líquido", formula: "30-80-30", stage: "Floración & Cuajado", facts: ".product-facts" },
    { slug: "2fruit-liquido", name: "Wondergreen 2FRUIT Líquido", formula: "30-30-80", stage: "Llenado & Maduración", facts: ".product-facts" },
  ];
  const unsupportedLiquidClaim = /microorganismos?|actividad microbiana|bioma(?: del suelo| suelo-planta)|microbiota(?: del suelo)?|actividad de la raíz/i;
  const widths = [1440, 1024, 768, 390, 320];

  for (const product of products) {
    await page.goto(`/wondergreen/productos/${product.slug}/`);
    await expect(page.getByRole("heading", { level: 1, name: product.name })).toBeVisible();
    await expect(page.locator(".product-detail")).not.toContainText(unsupportedLiquidClaim);
    await expect(page.locator("#papel")).not.toContainText(unsupportedLiquidClaim);
    await expect(page.locator("#aplicacion")).not.toContainText(unsupportedLiquidClaim);
    await expect(page.locator(product.facts)).toContainText(product.formula);
    await expect(page.locator(".product-facts")).toContainText(product.stage);
    await expect(page.getByRole("link", { name: /Ver tienda Greenatics en Croper/ })).toHaveAttribute(
      "href",
      "https://croper.com/provider/1231-greenatics",
    );

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(dimensions.document, `${product.slug} document overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.body, `${product.slug} body overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
      await expect(page.getByRole("heading", { level: 1, name: product.name })).toBeVisible();
      if ([1440, 768, 390, 320].includes(width)) {
        await page.screenshot({
          path: testInfo.outputPath(`${product.slug}-${width}.png`),
          fullPage: true,
          animations: "disabled",
        });
      }
    }
  }

  await page.goto("/wondergreen/");
  const liquidCatalog = page.locator("#liquidos");
  await expect(liquidCatalog).not.toContainText(unsupportedLiquidClaim);
  await expect(liquidCatalog).toContainText("Las líneas líquidas se elaboran a partir de bioles de digestión anaerobia multietapa.");

  await page.goto("/wondergreen/ciencia/");
  const liquidScience = page.locator(".wg-bio-science-connections article").filter({ hasText: "Bioles de digestión anaerobia" });
  await expect(liquidScience).not.toContainText(unsupportedLiquidClaim);
  const liquidProgram = page.locator(".wg-bio-science-program__grid article").filter({ hasText: "Fertilizantes líquidos" });
  await expect(liquidProgram).not.toContainText(unsupportedLiquidClaim);
  await expect(liquidProgram).toContainText("La concentración, la etapa y las condiciones de uso se consultan en la ficha vigente");

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.screenshot({
      path: testInfo.outputPath(`science-liquid-guidance-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
});

test("Neem is discoverable in the bioinput family and opens its own product page", async ({ page }) => {
  await page.goto("/wondergreen/");

  await expect(page.locator("#bioinsumos article")).toHaveCount(6);
  await expect(page.locator("#bioinsumos .wg-bio-lines__truth")).toHaveCount(0);
  const neemCard = page.locator("#bioinsumos article").filter({ hasText: "Extracto de Neem" });
  await expect(neemCard).toHaveCount(1);
  await expect(neemCard.getByRole("link", { name: /Ver ficha técnica/ })).toHaveAttribute(
    "href",
    "/wondergreen/productos/bioinsumo-neem/",
  );

  await page.goto("/wondergreen/productos/bioinsumo-neem/");
  await expect(page.getByRole("heading", { level: 1, name: "Wondergreen Extracto de Neem" })).toBeVisible();
  await expect(page.getByText("Extracto de Neem", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".presentation-pills span")).toHaveText(["1 L", "5 L", "20 L"]);
});

test("2BLOOM liquid stays technical and does not inherit commercial liquid sizes", async ({ page }) => {
  await page.goto("/wondergreen/productos/2bloom-liquido/");

  await expect(page.getByRole("heading", { level: 1, name: "Wondergreen 2BLOOM Líquido" })).toBeVisible();
  await expect(page.locator("#presentaciones")).toContainText("2BLOOM líquido 30-80-30");
  await expect(page.locator("#presentaciones .presentation-pills span")).toHaveText(["Formato por consultar"]);
  await expect(page.locator("#presentaciones")).not.toContainText("Presentaciones en catálogo comercial");
  for (const commercialSize of ["1 L", "3,75 L", "20 L", "200 L", "1.000 L"]) {
    await expect(page.locator("#presentaciones")).not.toContainText(commercialSize);
  }
  await expect(page.getByRole("link", { name: "Consultar Wondergreen 2BLOOM Líquido" })).toHaveAttribute(
    "href",
    /\/contacto\//,
  );

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    body: document.documentElement.scrollWidth,
  }));
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
});

test("Trichoderma ficha communicates its validation gate without hiding the next step", async ({ page }, testInfo) => {
  await page.goto("/wondergreen/productos/bioinsumo-trichoderma/");
  await expect(page.getByRole("heading", { level: 1, name: "Wondergreen Trichoderma" })).toBeVisible();
  await expect(page.locator(".product-info")).toContainText("La ficha, etiqueta y registro vigentes determinan su uso autorizado y condiciones.");
  await expect(page.locator("body")).not.toContainText(/Trichoderma harzianum/i);
  await expect(page.locator('img[src*="wondergreen-cropper-ref-bioinput-trichoderma.jpg"]')).toHaveCount(0);
  await expect(page.locator("#papel")).toContainText("Qué confirmar antes de considerarlo");
  await expect(page.locator("#aplicacion")).toContainText("Cultivos autorizados por confirmar");
  await expect(page.locator("#aplicacion")).toContainText("No se publican cultivos recomendados");
  await expect(page.locator("#aplicacion .product-crop-pill")).toHaveCount(0);

  const croperLink = page.getByRole("link", { name: /Ver tienda Greenatics en Croper/ });
  await expect(croperLink).toHaveAttribute("href", "https://croper.com/provider/1231-greenatics");
  const contactLink = page.getByRole("link", { name: "Consultar Wondergreen Trichoderma" });
  const contactHref = await contactLink.getAttribute("href");
  expect(contactHref).toBeTruthy();
  const contactUrl = new URL(contactHref!, "https://greenatics.com");
  expect(contactUrl.pathname).toBe("/contacto/");
  expect(contactUrl.searchParams.get("prioridad")).toBe("Confirmar alcance, uso autorizado y condiciones de Trichoderma");

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document, `document overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.body, `body overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.getByRole("heading", { level: 1, name: "Wondergreen Trichoderma" })).toBeVisible();
    await expect(contactLink).toBeVisible();
    await expect(croperLink).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`trichoderma-${width}.png`), fullPage: true, animations: "disabled" });
  }
});

test("Trichoderma is generic and its held image is absent across the public product journey", async ({ page }, testInfo) => {
  const heldPath = "/products/wondergreen-cropper-ref-bioinput-trichoderma.jpg";
  const routes = ["/", "/wondergreen/", "/biblioteca/catalogo-wondergreen/", "/wondergreen/productos/bioinsumo-trichoderma/"];
  const widths = [1440, 1024, 768, 390, 320];

  for (const route of routes) {
    await page.goto(route);
    if (route === "/") {
      const bioinputs = page.locator(".home-product-family").filter({ has: page.getByRole("heading", { name: "Bioinsumos" }) });
      await bioinputs.getByRole("button", { name: "Ver siguiente referencia de Bioinsumos" }).click();
      await expect(bioinputs.locator(".home-product-family__image-placeholder")).toContainText("Especie y ficha por confirmar");
    }
    if (route === "/biblioteca/catalogo-wondergreen/") {
      await page.locator("#familia-bioinsumos > summary").click();
      await expect(page.locator("#familia-bioinsumos .wg-catalog-family__visual-holdback")).toContainText("Trichoderma");
    }

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator("body")).not.toContainText(/Trichoderma harzianum/i);
      const result = await page.evaluate((path) => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        references: [...document.querySelectorAll("img")].map((image) => image.getAttribute("src") ?? ""),
        htmlContainsHeldPath: document.documentElement.innerHTML.includes(path),
      }), heldPath);
      expect(result.document, `${route} document overflow at ${width}px`).toBeLessThanOrEqual(result.viewport);
      expect(result.references.join(" ")).not.toContain(heldPath);
      expect(result.htmlContainsHeldPath).toBe(false);
      if ([1440, 390, 320].includes(width)) {
        await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll("/", "-") || "home"}-${width}.png`), fullPage: false, animations: "disabled" });
      }
    }
  }
});

test("product application keeps its real sequence without padded ledger numbers", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow/");

  const applicationList = page.locator(".product-application-grid > div:first-child > ol");
  const applicationSteps = applicationList.locator(":scope > li");
  const caution = page.locator(".product-caution-card li").first();
  await expect(applicationList).toHaveAttribute("class", /applicationList/);
  await expect(applicationSteps).toHaveCount(3);
  await expect(applicationSteps.first()).toHaveCSS("display", "list-item");
  await expect(applicationList.locator(":scope > li > span")).toHaveCount(0);
  await expect(caution).toHaveCSS("display", "list-item");
  await expect.poll(() => caution.evaluate((item) => item.getBoundingClientRect().width)).toBeGreaterThan(240);
});

test("crop routes distinguish readable technical routes from approved public documents", async ({ page }) => {
  await page.goto("/wondergreen/cultivos/");
  const coffeeRoute = page.locator(".crop-explorer-card").filter({ hasText: "Café" });
  await expect(coffeeRoute.getByRole("link", { name: "Abrir ruta técnica" })).toHaveAttribute("href", "/wondergreen/cultivos/cafe/");
  await expect(coffeeRoute.getByRole("link", { name: "Descargar guía de Café en PDF" })).toHaveCount(0);
  await expect(coffeeRoute.getByRole("link", { name: "Manual técnico · 20 páginas" })).toHaveCount(0);

  const cacaoRoute = page.locator(".crop-explorer-card").filter({ hasText: "Cacao" });
  await expect(cacaoRoute.getByRole("link", { name: "Abrir ruta técnica" })).toHaveAttribute("href", "/wondergreen/cultivos/cacao/");
  await expect(cacaoRoute.getByRole("link", { name: "Descargar guía de Cacao en PDF" })).toHaveCount(0);
  await expect(cacaoRoute.getByRole("link", { name: "Manual técnico · 20 páginas" })).toHaveCount(0);

  await page.goto("/wondergreen/cultivos/cafe/");
  await expect(page.getByRole("heading", { name: "Usa esta ruta para preparar el manejo de Café." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Repasar etapas y señales" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Descargar guía breve PDF" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Abrir manual técnico · 20 páginas" })).toHaveCount(0);

  await page.goto("/wondergreen/cultivos/cacao/");
  await expect(page.getByRole("heading", { name: "Usa esta ruta para preparar el manejo de Cacao." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Repasar etapas y señales" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Descargar guía breve PDF" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Abrir manual técnico · 20 páginas" })).toHaveCount(0);

  await page.goto("/wondergreen/cultivos/platano-banano/");
  await expect(page.getByRole("link", { name: "Abrir manual técnico · 20 páginas" })).toHaveAttribute(
    "href",
    "/downloads/MANUAL_TECNICO_WONDERGREEN_BANANO_PLATANO_PROFUNDO_20P.pdf",
  );
  await expect(page.getByRole("link", { name: "Descargar guía breve PDF" })).toHaveAttribute(
    "href",
    "/downloads/01_GUIA_WONDERGREEN_PLATANO_BANANO_V2.pdf",
  );
  await expect(page.locator(".crop-guide-document figure")).toHaveCount(0);
});

test("Wondergreen catalog stays legible, operable, and overflow-free from 320 to 1440 px", async ({ page }, testInfo) => {
  const accessibilityFindings: string[] = [];
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/biblioteca/catalogo-wondergreen/");
  await expect(page.getByRole("heading", { level: 1, name: "Nutrición organomineral y biológica para suelo y cultivo." })).toBeVisible();

  for (const width of [1440, 1280, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator("#familias")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    const overflowers = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
      .map((element) => ({
        tag: element.tagName,
        className: typeof element.className === "string" ? element.className : "",
        text: element.innerText?.slice(0, 55) ?? "",
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        parents: [element.parentElement, element.parentElement?.parentElement, element.parentElement?.parentElement?.parentElement]
          .filter((parent): parent is HTMLElement => parent instanceof HTMLElement)
          .map((parent) => ({
            tag: parent.tagName,
            className: typeof parent.className === "string" ? parent.className : "",
            left: Math.round(parent.getBoundingClientRect().left),
            right: Math.round(parent.getBoundingClientRect().right),
            width: Math.round(parent.getBoundingClientRect().width),
          })),
      }))
      .filter((element) => element.right > document.documentElement.clientWidth + 1 || element.left < -1)
      .slice(0, 12));
    expect(dimensions.document, `document overflow at ${width}px: ${JSON.stringify(overflowers)}`).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.body, `body overflow at ${width}px: ${JSON.stringify(overflowers)}`).toBeLessThanOrEqual(dimensions.viewport);

    for (const family of ["compost", "solidos", "liquidos", "bioinsumos"]) {
      const identity = await page.locator(`#familia-${family} .wg-catalog-family__identity`).boundingBox();
      const count = await page.locator(`#familia-${family} .wg-catalog-family__count`).boundingBox();
      const overlapWidth = Math.max(0, Math.min(identity!.x + identity!.width, count!.x + count!.width) - Math.max(identity!.x, count!.x));
      const overlapHeight = Math.max(0, Math.min(identity!.y + identity!.height, count!.y + count!.height) - Math.max(identity!.y, count!.y));
      expect(overlapWidth * overlapHeight, `${family} summary text and count overlap at ${width}px`).toBe(0);
    }

    for (const family of ["solidos", "liquidos", "bioinsumos"]) {
      const preview = page.locator(`#familia-${family} summary .wg-catalog-family__visual-grid`);
      await expect(preview, `${family} visual references at ${width}px`).toBeVisible();
      if (width <= 390) {
        const box = await preview.boundingBox();
        expect(box?.width, `${family} visual row should remain readable at ${width}px`).toBeGreaterThanOrEqual(width - 64);
      }
    }

    const axe = await new AxeBuilder({ page }).analyze();
    accessibilityFindings.push(...axe.violations.map(({ id }) => `${width}px: ${id}`));
    await page.screenshot({
      path: testInfo.outputPath(`catalog-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }

  const liquidReferences = page.locator("#familia-liquidos summary .wg-catalog-family__visual-grid figure");
  await expect(liquidReferences).toHaveCount(5);
  await expect(page.locator("#familia-liquidos summary")).toContainText("2GROW · 200-0-0");

  for (const [family, count] of [["solidos", 4], ["liquidos", 4], ["bioinsumos", 6]] as const) {
    const details = page.locator(`#familia-${family}`);
    await details.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", "");
    await expect(details.locator(".wg-catalog-product")).toHaveCount(count);
    if (family === "liquidos") {
      await expect(details).toContainText("2GROW 100-20-20 y 2GROW 200-0-0");
    }
    await details.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(details).not.toHaveAttribute("open", "");
  }

  expect(accessibilityFindings).toEqual([]);
});
