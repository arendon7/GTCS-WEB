import { test, expect } from "@playwright/test";

test("company page explains Greenatics through capability, commercial method and evidence", async ({ page }) => {
  await page.goto("/nosotros");

  await expect(page.getByRole("heading", { name: /Diseñamos sistemas que tienen que funcionar en la vida real/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /La capacidad está en conectar disciplinas/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Primero el resultado que necesitas\. Después definimos la ruta para alcanzarlo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Un caso sirve cuando deja aprendizaje transferible/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Si ya sabes qué necesitas, entra directo al servicio/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar servicios", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Usar orientador inicial", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");
  await expect(page.getByRole("link", { name: /Wondergreen/i }).last()).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: /Recursos/i }).last()).toHaveAttribute("href", "/recursos");
});

test("contact page starts with context without forcing diagnosis or a service name", async ({ page }) => {
  await page.goto("/contacto");

  await expect(page.getByRole("heading", { name: "Cuéntanos qué quieres resolver." })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Cuatro datos pueden llevar la conversación mucho más rápido/i })).toBeVisible();
  await expect(page.getByLabel("¿Desde qué contexto nos escribes?")).toBeVisible();
  await expect(page.getByLabel("¿Qué necesitas resolver primero?")).toBeVisible();
  await expect(page.getByText(/Puedes preparar y copiar el contexto sin enviarlo/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Preparar conversación/i }).first()).toHaveAttribute("href", /\/contacto\?audience=/);
  await expect(page.getByRole("heading", { name: "Si ya sabes qué necesitas, podemos empezar por ahí." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explorar servicios", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "Usar orientador inicial", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");
  await expect(page.getByRole("link", { name: "Empezar por diagnóstico", exact: true })).toHaveCount(0);
});

test("contact page inherits audience and need context without exposing internal source metadata", async ({ page }) => {
  await page.goto("/contacto?audience=planta&need=planta&source=soluciones");

  await expect(page.getByRole("heading", { name: /Cuéntanos sobre la planta que quieres recuperar o mejorar/i })).toBeVisible();
  await expect(page.getByLabel("Contexto heredado de navegación")).toHaveCount(0);
  await expect(page.getByText(/Origen:/)).toHaveCount(0);
  await expect(page.getByLabel("¿Desde qué contexto nos escribes?")).toHaveValue("planta");
  await expect(page.getByLabel("¿Qué necesitas resolver primero?")).toHaveValue("planta");

  await page.getByLabel("Ubicación").fill("Antioquia");
  await page.getByLabel("Describe brevemente la situación").fill("La infraestructura existe y queremos entender su estado antes de invertir.");
  await page.getByRole("button", { name: "Preparar contexto" }).click();

  await expect(page.getByRole("heading", { name: "Contexto preparado." })).toBeVisible();
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Planta / Operador");
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Antioquia");
  await expect(page.getByText("Nada se ha enviado todavía.", { exact: false })).toBeVisible();
});

test("contact page preserves an exact service from a commercial solution route", async ({ page }) => {
  const service = "Dirección técnica y coordinación de operación";
  await page.goto(`/contacto?service=${encodeURIComponent(service)}&source=solucion&contexto=${encodeURIComponent("Interés en fortalecer la operación de una planta.")}`);

  const inherited = page.getByLabel("Contexto heredado de navegación");
  await expect(inherited.locator("span").filter({ hasText: "Servicio:" })).toContainText(service);
  await expect(page.getByText(/Origen:/)).toHaveCount(0);
  await expect(page.getByLabel("Servicio recibido de la navegación")).toContainText(service);

  await page.getByLabel("¿Desde qué contexto nos escribes?").selectOption("planta");
  await page.getByLabel("¿Qué necesitas resolver primero?").selectOption("operacion");
  await page.getByRole("button", { name: "Preparar contexto" }).click();

  const summary = page.getByLabel("Resumen preparado para la conversación");
  await expect(summary).toContainText(`Servicio de interés: ${service}`);
  await expect(summary).toContainText("Interés en fortalecer la operación de una planta.");
});

test("contact page preserves an exact Wondergreen product context", async ({ page }) => {
  await page.goto("/contacto?audience=wondergreen&producto=2grow-solido-15-3-3");

  await expect(page.getByRole("heading", { name: /Cuéntanos sobre tu cultivo o tu interés en Wondergreen/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /2Grow Sólido/i })).toBeVisible();
  const inherited = page.getByLabel("Contexto heredado de navegación");
  await expect(inherited.locator("span").filter({ hasText: "Producto:" })).toContainText("2Grow Sólido");
  await expect(page.getByText("Estado comercial confirmado").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Volver a la ficha/i })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
});

test("contact page exposes the configured technical booking link as a direct route", async ({ page }) => {
  await page.goto("/contacto");
  const booking = page.getByRole("link", { name: "Agendar reunión", exact: true }).first();
  await expect(booking).toHaveAttribute("href", /^https:\/\/outlook\.office\.com\//);
  await expect(booking).toHaveAttribute("target", "_blank");
});