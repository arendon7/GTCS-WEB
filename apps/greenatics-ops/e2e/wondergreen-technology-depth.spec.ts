import { test, expect } from "@playwright/test";

test("Wondergreen commercial offer exposes the deep technology route without making it the primary product CTA", async ({ page }) => {
  await page.goto("/wondergreen");

  const showcase = page.locator("#productos-destacados");
  await expect(showcase.getByRole("link", { name: "Ver todos los productos →", exact: true })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(showcase.getByRole("link", { name: "Profundizar en la tecnología →", exact: true })).toHaveAttribute("href", "/wondergreen/tecnologia");

  const links = await showcase.locator("a").allTextContents();
  expect(links.indexOf("Ver todos los productos →")).toBeLessThan(links.indexOf("Profundizar en la tecnología →"));
});

test("Wondergreen technology separates product characteristics from agronomic results", async ({ page }) => {
  await page.goto("/wondergreen/tecnologia");

  await expect(page.getByRole("heading", { name: "Organomineral. Oclusión. Lenta liberación." })).toBeVisible();
  await expect(page.getByText("Característica ≠ resultado.", { exact: true })).toBeVisible();

  const organomineral = page.locator("#organomineral");
  await expect(organomineral.getByText("Organomineral", { exact: true })).toBeVisible();
  await expect(organomineral.getByText(/base orgánica estabilizada/i)).toBeVisible();
  await expect(organomineral.getByText(/no demuestra por sí sola eficiencia, duración, rendimiento/i)).toBeVisible();

  const occlusion = page.locator("#oclusion");
  await expect(occlusion.getByText("Oclusión", { exact: true })).toBeVisible();
  await expect(occlusion.getByText(/incorporación de componentes minerales dentro de la matriz organomineral/i)).toBeVisible();
  await expect(occlusion.getByText(/No demuestra una duración específica, una eficiencia porcentual/i)).toBeVisible();

  const slowRelease = page.locator("#lenta-liberacion");
  await expect(slowRelease.getByText("Lenta liberación", { exact: true })).toBeVisible();
  await expect(slowRelease.getByText(/no se extiende automáticamente a todo el portafolio sólido/i)).toBeVisible();
  await expect(slowRelease.getByText(/no implica por sí sola un tiempo específico, una curva experimental, una dosis, una frecuencia/i)).toBeVisible();

  await expect(page.getByText(/liberación controlada/i)).toHaveCount(0);
});

test("technology page publishes the four evidence levels without turning mechanism into promise", async ({ page }) => {
  await page.goto("/wondergreen/tecnologia");

  await expect(page.getByRole("heading", { name: "Cuatro niveles que no deben confundirse." })).toBeVisible();
  for (const level of ["Característica", "Mecanismo", "Beneficio", "Resultado"]) {
    await expect(page.getByRole("heading", { name: level, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/Solo se comunica con evidencia específica, alcance, condiciones y fuente identificables/i)).toBeVisible();
});

test("technology page returns to exact commercial solids instead of assigning technology by association", async ({ page }) => {
  await page.goto("/wondergreen/tecnologia");

  for (const [name, slug] of [
    ["2Grow Sólido · 15-3-3", "2grow-solido-15-3-3"],
    ["2Balance Sólido · 7-7-7", "2balance-solido-7-7-7"],
    ["2Bloom Sólido · 3-8-3", "2bloom-solido-3-8-3"],
    ["2Fruit Sólido · 3-3-8", "2fruit-solido-3-3-8"],
  ] as const) {
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("link", { name: "Abrir producto y documentación →" })).toHaveAttribute("href", `/wondergreen/productos/${slug}`);
  }

  await expect(page.getByText(/no significa que todas compartan automáticamente todas las características tecnológicas/i)).toBeVisible();
  await expect(page.getByText(/la página de tecnología no amplía esos atributos por asociación/i)).toBeVisible();
});

test("technology remains product-first and connects to governed technical documents", async ({ page, request }) => {
  await page.goto("/wondergreen/tecnologia");

  await expect(page.getByRole("link", { name: "Ver productos", exact: true })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: "Revisar criterios nutricionales", exact: true })).toHaveAttribute("href", "/biblioteca/criterios-nutricionales");
  await expect(page.getByRole("link", { name: "Explorar cultivos y guías", exact: true })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: "Abrir biblioteca técnica", exact: true })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: "Usar Finder", exact: true })).toHaveAttribute("href", "/wondergreen/finder");

  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Tecnología", exact: true })).toHaveAttribute("href", "/wondergreen/tecnologia");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("https://greenatics.com.co/wondergreen/tecnologia");
});
