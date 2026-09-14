import { test, expect } from "@playwright/test";

test("public HOME opens with the approved Greenatics promise and integral waste-management scope", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformamos residuos en vida/i })).toBeVisible();
  await expect(page.getByText(/gestión integral de residuos/i).first()).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true }).first()).toBeVisible();
  await expect(page.getByText("Proyecto Yarumal", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Soluciones para organizaciones", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Descubrir Wondergreen", exact: true }).first()).toHaveAttribute("href", "/wondergreen");

  const capabilities = page.getByLabel("Capacidades Greenatics");
  for (const capability of ["Planeación", "Regulación", "Infraestructura", "Operación", "Datos", "Valorización"]) {
    await expect(capabilities.getByText(capability, { exact: true })).toBeVisible();
  }
});

test("public HOME keeps three commercial universes without narrating the website architecture", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Una marca. Tres formas claras de entrar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Soluciones para organizaciones", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wondergreen", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(page.getByText(/Planeación, soporte jurídico-regulatorio, rutas, plantas/i)).toBeVisible();
  await expect(page.getByText(/Fertilizantes organominerales, bioinsumos, programas por cultivo/i)).toBeVisible();
  await expect(page.getByText(/Productos por etapa, kits y guías/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Explorar soluciones/ }).first()).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: /Descubrir Wondergreen/ }).last()).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: /Explorar Casa & Jardín/ })).toHaveAttribute("href", "/casa-jardin");
  await expect(page.getByRole("main")).not.toContainText("La web separa");
});

test("public HOME uses the canonical five-stage commercial method", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conectamos la decisión técnica con la ejecución." })).toBeVisible();
  const method = page.getByLabel("Lógica de trabajo Greenatics");
  for (const step of ["Entender", "Definir el alcance", "Implementar", "Acompañar", "Mejorar y valorizar"]) {
    await expect(method.getByText(step, { exact: true })).toBeVisible();
  }
  await expect(method.getByText("Diseñar", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Conocer cómo trabajamos →" })).toHaveAttribute("href", "/soluciones");
});

test("public HOME keeps Wondergreen product-first and moves technical depth to its governed route", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Nutrición que trabaja con el suelo." })).toBeVisible();
  await expect(page.getByText(/productos, programas por cultivo y soporte técnico/i)).toBeVisible();

  const links = page.getByLabel("Profundizar en Wondergreen").getByRole("link");
  await expect(links).toHaveCount(4);
  await expect(links.nth(0)).toHaveText("Productos →");
  await expect(links.nth(0)).toHaveAttribute("href", "/wondergreen/productos");
  await expect(links.nth(1)).toHaveText("Cultivos →");
  await expect(links.nth(1)).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(links.nth(2)).toHaveText("Tecnología →");
  await expect(links.nth(2)).toHaveAttribute("href", "/wondergreen/tecnologia");
  await expect(links.nth(3)).toHaveText("Encontrar mi programa →");
  await expect(links.nth(3)).toHaveAttribute("href", "/wondergreen/finder");
});

test("public HOME keeps evidence, OPS and resources distinct without exposing internal governance vocabulary", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(page.getByRole("heading", { name: "Proyecto, operación y aprendizaje en territorio." })).toBeVisible();
  await expect(main.getByText(/registro histórico documentado/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Datos para operar, seguir y decidir." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conocimiento, experiencia e impacto en un mismo lugar." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir biblioteca/ })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: /Ver proyectos/ })).toHaveAttribute("href", "/proyectos");
  await expect(page.getByRole("link", { name: /Ver impacto/ })).toHaveAttribute("href", "/impacto");

  for (const internalTerm of ["Media truth", "activos conciliados", "promesa agronómica universal"]) {
    await expect(main).not.toContainText(internalTerm);
  }
});

test("public HOME closes with a commercial conversation and keeps OPS explicit", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: "Convirtamos tu necesidad en un alcance concreto." })).toBeVisible();
  await expect(main.getByRole("link", { name: "Hablar con Greenatics", exact: true })).toHaveAttribute("href", "/contacto");
  await expect(main.getByRole("link", { name: "Explorar soluciones", exact: true }).last()).toHaveAttribute("href", "/soluciones");
  await expect(main.getByRole("link", { name: "Ingresar a GREENATICS OPS", exact: true })).toHaveAttribute("href", "/app");
});
