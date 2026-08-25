import { test, expect } from "@playwright/test";

const criticalRoutes = [
  ["/", "Transformamos residuos en vida."],
  ["/soluciones", "Servicios para convertir necesidades de gestión en resultados concretos."],
  ["/wondergreen", "Nutrición que trabaja con el suelo."],
  ["/wondergreen/productos", "Productos concretos, formulación por formulación."],
  ["/wondergreen/lineas", "Una identidad por línea. Una ficha exacta por referencia."],
  ["/wondergreen/tecnologia", "Organomineral. Oclusión. Lenta liberación."],
  ["/wondergreen/cultivos", "El cultivo cambia la pregunta."],
  ["/casa-jardin", "Nutrición por etapas para tus plantas."],
  ["/proyectos", "Proyectos"],
  ["/biblioteca", "Biblioteca"],
  ["/nosotros", "Diseñamos sistemas que tienen que funcionar en la vida real"],
  ["/contacto", "Cuéntanos qué quieres resolver."],
] as const;

test("release gate: critical public routes render useful HTML without server errors", async ({ request }) => {
  for (const [path, marker] of criticalRoutes) {
    const response = await request.get(path);
    expect(response.status(), `${path} should return HTTP 200`).toBe(200);
    const html = await response.text();
    expect(html.length, `${path} should return substantial HTML`).toBeGreaterThan(1000);
    expect(html, `${path} should contain its release marker`).toContain(marker);
    expect(html, `${path} should not expose a server error`).not.toMatch(/Internal Server Error|Application error|This page could not be found/i);
  }
});

test("release gate: known service reaches contact with the exact commercial context", async ({ page }) => {
  await page.goto("/soluciones/rehabilitacion");
  const consult = page.getByRole("link", { name: "Solicitar conversación comercial" });
  await expect(consult).toHaveAttribute("href", /service=/);
  await expect(consult).toHaveAttribute("href", /source=solucion/);
  await consult.click();

  const inherited = page.getByLabel("Contexto heredado de navegación");
  await expect(inherited.getByText(/Servicio:/)).toBeVisible();
  await expect(inherited).toContainText(/Diagnóstico, rehabilitación y puesta en marcha de infraestructura existente/i);
  await expect(page.getByText(/Origen:/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Agendar reunión", exact: true }).first()).toHaveAttribute("href", /^https:\/\/outlook\.office\.com\//);
});

test("release gate: Wondergreen line reaches an exact reference and preserves line context into contact", async ({ page }) => {
  await page.goto("/wondergreen/lineas/2grow");
  await expect(page.getByText("Estado comercial confirmado").first()).toBeVisible();
  await page.getByRole("link", { name: /2Grow Sólido/ }).click();
  await expect(page).toHaveURL(/\/wondergreen\/productos\/2grow-solido-15-3-3$/);
  await expect(page.getByText("Estado comercial confirmado").first()).toBeVisible();

  await page.goto("/wondergreen/lineas/2grow");
  await page.getByRole("link", { name: "Consultar línea" }).click();
  await expect(page).toHaveURL(/\/contacto\?.*source=wondergreen-linea/);
  await expect(page.getByRole("heading", { name: /Cuéntanos sobre tu cultivo o tu interés en Wondergreen/i })).toBeVisible();
  await expect(page.getByLabel("Contexto heredado de navegación")).toContainText("Interés en la línea Wondergreen 2Grow");
});

test("release gate: sitemap and robots remain aligned with public versus OPS boundaries", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  for (const path of ["/soluciones", "/wondergreen", "/wondergreen/productos", "/wondergreen/lineas", "/wondergreen/tecnologia", "/proyectos", "/biblioteca", "/contacto"]) {
    expect(sitemapText).toContain(`https://greenatics.com.co${path}`);
  }
  expect(sitemapText).not.toContain("https://greenatics.com.co/app");
  expect(sitemapText).not.toContain("https://greenatics.com.co/login");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /app");
  expect(robotsText).toContain("Sitemap: https://greenatics.com.co/sitemap.xml");
});
