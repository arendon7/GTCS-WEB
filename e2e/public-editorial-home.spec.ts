import { test, expect } from "@playwright/test";

test("public HOME opens with the approved Greenatics hero and governed Yarumal media", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformamos residuos en vida/i })).toBeVisible();
  await expect(page.getByText(/Diseñamos sistemas que conectan residuos, tecnología, operación y datos/i)).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true }).first()).toBeVisible();
  await expect(page.getByText("Proyecto Yarumal", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Soluciones para organizaciones", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Descubrir Wondergreen", exact: true }).first()).toHaveAttribute("href", "/wondergreen");
});

test("public HOME reduces discovery to three clear Greenatics universes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Una marca. Tres formas claras de entrar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Soluciones para organizaciones", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wondergreen", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explorar soluciones/ }).first()).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: /Descubrir Wondergreen/ }).last()).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: /Explorar Casa & Jardín/ })).toHaveAttribute("href", "/casa-jardin");
});

test("public HOME explains Greenatics as an operating logic instead of stacked service taxonomies", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Conectamos la decisión técnica con la ejecución." })).toBeVisible();
  for (const step of ["Entender", "Diseñar", "Implementar", "Medir y mejorar"]) {
    await expect(page.getByText(step, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Conocer cómo trabajamos →" })).toHaveAttribute("href", "/soluciones");
});

test("public HOME elevates Wondergreen without publishing unsupported universal claims", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Nutrición que trabaja con el suelo." })).toBeVisible();
  await expect(page.getByText(/matriz organomineral, la oclusión y la lenta liberación documentada para esa versión/i)).toBeVisible();
  await expect(page.getByText(/sin convertir una característica del producto en una promesa agronómica universal/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Encontrar mi programa →" })).toHaveAttribute("href", "/wondergreen/finder");
  await expect(page.getByRole("link", { name: "Productos →" })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: "Cultivos →" })).toHaveAttribute("href", "/wondergreen/cultivos");
});

test("public HOME keeps evidence, digital tools and resources as distinct layers", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Proyecto, operación y aprendizaje en territorio." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "La operación también necesita una capa digital." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Conocimiento, experiencia e impacto en un mismo lugar." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir biblioteca/ })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: /Ver proyectos/ })).toHaveAttribute("href", "/proyectos");
  await expect(page.getByRole("link", { name: /Ver impacto/ })).toHaveAttribute("href", "/impacto");
});

test("public HOME closes with a commercial route while keeping OPS separate", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: "Empieza por el problema. Construimos la ruta contigo." })).toBeVisible();
  await expect(main.getByRole("link", { name: "Hablar con nosotros", exact: true })).toHaveAttribute("href", "/contacto");
  await expect(main.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
});
