import { test, expect } from "@playwright/test";

test("Wondergreen uses the canonical public shell without duplicate chrome", async ({ page }, testInfo) => {
  await page.goto("/wondergreen");

  const header = page.getByRole("banner");
  await expect(header).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  if (testInfo.project.name === "mobile-chromium") {
    await expect(header.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
  } else {
    await expect(header.getByRole("navigation", { name: "Navegación pública" })).toBeVisible();
  }
  await expect(page.getByRole("navigation", { name: "Navegación Wondergreen" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
});

test("Wondergreen subnavigation exposes products before orientation while preserving governed destinations", async ({ page }) => {
  await page.goto("/wondergreen");

  const nav = page.getByRole("navigation", { name: "Navegación Wondergreen" });
  const labels = await nav.locator("a").allTextContents();
  expect(labels.indexOf("Productos")).toBeLessThan(labels.indexOf("Finder"));
  await expect(nav.getByRole("link", { name: "Productos" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(nav.getByRole("link", { name: "Tecnología" })).toHaveAttribute("href", "#tecnologia");
  await expect(nav.getByRole("link", { name: "Cultivos" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(nav.getByRole("link", { name: "Guías" })).toHaveAttribute("href", "/biblioteca");
  await expect(nav.getByRole("link", { name: "Finder" })).toHaveAttribute("href", "/wondergreen/finder");
  await expect(nav.getByRole("link", { name: "Bioinsumos" })).toHaveAttribute("href", "#bioinsumos");
  await expect(nav.getByRole("link", { name: "Casa & Jardín" })).toHaveAttribute("href", "/casa-jardin");
  await expect(nav.getByRole("link", { name: "Qué es" })).toHaveAttribute("href", "#que-es");
});

test("Wondergreen exposes a household entry without turning Casa Jardin into ecommerce", async ({ page }) => {
  await page.goto("/wondergreen");

  const householdEntry = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Tengo plantas en casa", exact: true }),
  });
  await expect(householdEntry.getByRole("link", { name: "Continuar →" })).toHaveAttribute("href", "/casa-jardin");

  await page.goto("/casa-jardin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
});

test("Wondergreen keeps Finder available as secondary orientation rather than the primary product shortcut", async ({ page }) => {
  await page.goto("/wondergreen");

  const hero = page.locator("section").filter({ has: page.getByRole("heading", { name: "Nutrición que trabaja con el suelo." }) }).first();
  await expect(hero.getByRole("link", { name: "Ver productos" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(hero.getByRole("link", { name: /No sé qué producto revisar/ })).toHaveAttribute("href", "/wondergreen/finder");

  const needEntry = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "No sé qué producto revisar", exact: true }),
  });
  await expect(needEntry.getByRole("link", { name: "Continuar →" })).toHaveAttribute("href", "/wondergreen/finder");

  const finder = page.locator("#finder");
  await expect(finder.getByRole("link", { name: "Abrir Finder Wondergreen" })).toHaveAttribute("href", "/wondergreen/finder");
  await expect(finder.getByText(/cinco programas publicados/i)).toBeVisible();
  await expect(finder.getByText(/no una prescripción automática/i)).toBeVisible();

  await hero.getByRole("link", { name: /No sé qué producto revisar/ }).click();
  await expect(page).toHaveURL(/\/wondergreen\/finder$/);
  await expect(page.getByRole("heading", { name: "Empieza por el cultivo y la etapa." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /comprar/i })).toHaveCount(0);
});

test("Wondergreen hero uses the approved soil message and makes product discovery primary", async ({ page }) => {
  await page.goto("/wondergreen");

  const hero = page.locator("section").filter({ has: page.getByRole("heading", { name: "Nutrición que trabaja con el suelo." }) }).first();
  await expect(page.getByRole("heading", { name: "Nutrición que trabaja con el suelo." })).toBeVisible();
  await expect(hero.getByText(/referencias organominerales sólidas, soluciones líquidas, compost y bioinsumos/i)).toBeVisible();
  await expect(hero.getByText(/empezar por el producto y profundizar hasta formulación, presentación, tecnología y documentación/i)).toBeVisible();
  await expect(hero.getByRole("link", { name: "Ver productos" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(hero.getByRole("link", { name: "Explorar cultivos y guías" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(hero.getByRole("link", { name: /No sé qué producto revisar/ })).toHaveAttribute("href", "/wondergreen/finder");
  await expect(hero.getByText("Product Master público", { exact: true })).toBeVisible();
});

test("Wondergreen places real commercial products before explanatory and orientative layers", async ({ page }) => {
  await page.goto("/wondergreen");

  const showcase = page.locator("#productos-destacados");
  await expect(showcase.getByRole("heading", { name: "Empieza por los productos que ya puedes revisar." })).toBeVisible();
  for (const product of ["2Grow Sólido", "2Balance Sólido", "2Bloom Sólido", "2Fruit Sólido"]) {
    await expect(showcase.getByRole("link", { name: new RegExp(product) })).toBeVisible();
  }
  await expect(showcase.getByRole("img", { name: /Identidad visual aprobada de la línea Wondergreen 2Grow/ })).toBeVisible();
  await expect(showcase.getByText(/Producto primero, sin confundir producto con recomendación/i)).toBeVisible();

  const productComesFirst = await page.evaluate(() => {
    const products = document.querySelector("#productos-destacados");
    const definition = document.querySelector("#que-es");
    const finder = document.querySelector("#finder");
    if (!products || !definition || !finder) return false;
    return Boolean(products.compareDocumentPosition(definition) & Node.DOCUMENT_POSITION_FOLLOWING)
      && Boolean(products.compareDocumentPosition(finder) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(productComesFirst).toBe(true);
});

test("Wondergreen explains the system after exposing the commercial offer", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Un sistema de nutrición y manejo alrededor del suelo y del cultivo." })).toBeVisible();
  await expect(page.getByText(/fertilizantes organominerales sólidos, referencias líquidas, compost, bioinsumos, conocimiento y acompañamiento técnico/i)).toBeVisible();
  await expect(page.getByText(/El portafolio es una entrada comercial real/i)).toBeVisible();
  await expect(page.getByText(/El contexto agronómico determina después cómo y cuándo una referencia puede convertirse en una recomendación específica/i)).toBeVisible();
});

test("Wondergreen V2 separates organomineral, occlusion and slow release without universal claims", async ({ page }) => {
  await page.goto("/wondergreen");

  const technology = page.locator("#tecnologia");
  await expect(technology.getByRole("heading", { name: "Organomineral. Oclusión. Lenta liberación." })).toBeVisible();

  const organomineral = page.locator("#organomineral");
  await expect(organomineral.getByText("Organomineral", { exact: true })).toBeVisible();
  await expect(organomineral.getByText(/base orgánica estabilizada/i)).toBeVisible();
  await expect(organomineral.getByText(/componentes minerales/i)).toBeVisible();

  const occlusion = page.locator("#oclusion");
  await expect(occlusion.getByText("Oclusión", { exact: true })).toBeVisible();
  await expect(occlusion.getByText(/incorporación de componentes minerales dentro de la matriz organomineral/i)).toBeVisible();
  await expect(occlusion.getByText(/No demuestra una duración específica, una eficiencia porcentual ni una respuesta de rendimiento universal/i)).toBeVisible();

  const slowRelease = page.locator("#lenta-liberacion");
  await expect(slowRelease.getByText("Lenta liberación", { exact: true })).toBeVisible();
  await expect(slowRelease.getByText(/referencias y versiones donde esa característica esté documentada/i)).toBeVisible();
  await expect(slowRelease.getByText(/no se extiende automáticamente a todo el portafolio sólido/i)).toBeVisible();
  await expect(slowRelease.getByText(/no implica por sí sola una respuesta agronómica universal/i)).toBeVisible();
  await expect(slowRelease.getByText(/No es una curva experimental ni expresa un tiempo específico/i)).toBeVisible();
});

test("Wondergreen keeps agronomic implications separate from product characteristics", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "La tecnología ayuda a entender el producto; el contexto define la recomendación." })).toBeVisible();
  for (const heading of [
    "El suelo es parte del sistema",
    "La etapa cambia la decisión",
    "La disponibilidad necesita contexto",
    "La evidencia manda",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/Una característica documentada del producto no se convierte automáticamente en un resultado agronómico universal/i)).toBeVisible();
});

test("Wondergreen editorial hub preserves governed product truth and opens exact references", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Fertilizantes y bioinsumos, con su estado visible." })).toBeVisible();

  const portfolio = page.locator("#portafolio");
  await expect(portfolio.getByText("2Grow Sólido · 15-3-3", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto de Neem", { exact: true })).toBeVisible();
  await expect(portfolio.getByText("Extracto Ajo–Ají", { exact: true })).toBeVisible();
  await expect(portfolio.getByRole("link", { name: /2Grow Sólido · 15-3-3/ })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(portfolio.getByRole("link", { name: "Abrir catálogo completo" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(portfolio.getByRole("link", { name: "Abrir Biblioteca Wondergreen" })).toHaveAttribute("href", "/biblioteca");
  await expect(portfolio.getByRole("link", { name: "Casa & Jardín" })).toHaveAttribute("href", "/casa-jardin");
  await expect(page.getByText(/únicamente desde la versión técnica vigente/i)).toBeVisible();
});

test("Wondergreen finder follows context to follow-up without automatic prescription", async ({ page }) => {
  await page.goto("/wondergreen");

  const finder = page.locator("#finder");
  await expect(finder.getByRole("heading", { name: "Del contexto al seguimiento." })).toBeVisible();
  await expect(finder.getByText("Diagnóstico y análisis", { exact: true })).toBeVisible();
  await expect(finder.getByText("Seguimiento y ajuste", { exact: true })).toBeVisible();
  await expect(finder.getByText(/no una prescripción automática/i)).toBeVisible();
  await expect(finder.getByRole("link", { name: "Abrir Finder Wondergreen" })).toHaveAttribute("href", "/wondergreen/finder");
  await expect(finder.getByRole("link", { name: "Consultar guías" })).toHaveAttribute("href", "/biblioteca");
});

test("Wondergreen knowledge layer connects web context with official documents", async ({ page }) => {
  await page.goto("/wondergreen");

  await expect(page.getByRole("heading", { name: "Profundiza desde el producto hasta el documento oficial." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programas por cultivo", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deficiencias nutricionales", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Criterios nutricionales", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Manual de uso", exact: true })).toBeVisible();
  await expect(page.getByText(/Las guías y PDF aprobados conservan su diseño y contenido como piezas documentales/i)).toBeVisible();
});

test("Wondergreen audience routes end in real governed destinations", async ({ page }) => {
  await page.goto("/wondergreen");

  const routes = page.locator("#acompanamiento");
  await expect(routes.getByRole("link", { name: "Ver productos →" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(routes.getByRole("link", { name: "Explorar Casa & Jardín →" })).toHaveAttribute("href", "/casa-jardin");
  await expect(routes.getByRole("link", { name: "Quiero vender Wondergreen →" })).toHaveAttribute("href", "/contacto");
  await expect(routes.getByRole("link", { name: "Abrir biblioteca técnica →" })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: "Hablar con equipo técnico" }).last()).toHaveAttribute("href", "/contacto");
});
