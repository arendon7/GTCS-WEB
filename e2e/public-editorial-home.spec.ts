import { test, expect } from "@playwright/test";

test("public HOME opens with the approved Greenatics hero and governed Yarumal media", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Transformamos residuos en vida/i })).toBeVisible();
  await expect(page.getByText(/Diseñamos sistemas que conectan residuos, tecnología, operación y datos/i)).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true }).first()).toBeVisible();
  await expect(page.getByText("Proyecto Yarumal", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Soluciones para organizaciones", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Descubrir Wondergreen", exact: true }).first()).toHaveAttribute("href", "/wondergreen");
  for (const capability of ["Planeación", "Infraestructura", "Operación", "Valorización"]) {
    await expect(page.getByLabel("Capacidades Greenatics").getByText(capability, { exact: true })).toBeVisible();
  }
});

test("public HOME reduces discovery to three commercial Greenatics universes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Una marca. Tres formas claras de entrar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Soluciones para organizaciones", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wondergreen", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(page.getByText(/Planeación, regulación, rutas, plantas, dirección técnica, operación, datos y valorización/i)).toBeVisible();
  await expect(page.getByText(/Productos por etapa, kits y guías/i)).toBeVisible();
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
  await expect(page.getByText(/Objetivo, contexto, restricciones, operación existente e información disponible/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Conocer cómo trabajamos →" })).toHaveAttribute("href", "/soluciones");
});

test("public HOME elevates Wondergreen products before orientation without publishing unsupported universal claims", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Nutrición que trabaja con el suelo." })).toBeVisible();
  await expect(page.getByText(/matriz organomineral, la oclusión y la lenta liberación documentada para esa versión/i)).toBeVisible();
  await expect(page.getByText(/sin convertir una característica del producto en una promesa agronómica universal/i)).toBeVisible();

  const links = page.getByLabel("Profundizar en Wondergreen").getByRole("link");
  await expect(links).toHaveCount(4);
  await expect(links.nth(0)).toHaveText("Productos →");
  await expect(links.nth(0)).toHaveAttribute("href", "/wondergreen/productos");
  await expect(links.nth(1)).toHaveText("Cultivos →");
  await expect(links.nth(1)).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(links.nth(2)).toHaveText("Guías →");
  await expect(links.nth(2)).toHaveAttribute("href", "/biblioteca");
  await expect(links.nth(3)).toHaveText("Encontrar mi programa →");
  await expect(links.nth(3)).toHaveAttribute("href", "/wondergreen/finder");
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

test("public HOME closes with direct offers while keeping orientation optional and OPS separate", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");

  await expect(main.getByRole("heading", { name: "Elige una solución y profundiza hasta el alcance que necesitas." })).toBeVisible();
  await expect(main.getByText(/Puedes entrar directamente por servicios para organizaciones, productos Wondergreen o Casa & Jardín/i)).toBeVisible();
  await expect(main.getByRole("link", { name: "Explorar soluciones", exact: true }).last()).toHaveAttribute("href", "/soluciones");
  await expect(main.getByRole("link", { name: "Hablar con nosotros", exact: true })).toHaveAttribute("href", "/contacto");
  await expect(main.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
});
