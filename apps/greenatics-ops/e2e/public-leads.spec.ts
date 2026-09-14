import { test, expect } from "@playwright/test";

test("contact keeps preparation and booking while adding a real governed consultation path", async ({ page }) => {
  await page.goto("/contacto?audience=planta&need=operacion");

  await expect(page.getByLabel("Nombre")).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Teléfono")).toBeVisible();
  await expect(page.getByLabel("Organización")).toBeVisible();
  await expect(page.getByLabel(/Autorizo a Greenatics/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar consulta", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Preparar contexto", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Agendar reunión", exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Este paso no envía información a Greenatics/i)).toHaveCount(0);
  await expect(page.getByText(/No incluyas secretos industriales, datos personales sensibles ni documentación confidencial/i)).toBeVisible();
});

test("public consultation posts PII only in the request body and preserves inherited commercial context", async ({ page }) => {
  const service = "Dirección técnica y coordinación de operación";
  const captured: Array<{ url: string; body: Record<string, unknown> }> = [];

  await page.route("**/api/public-leads", async (route) => {
    const request = route.request();
    captured.push({ url: request.url(), body: request.postDataJSON() as Record<string, unknown> });
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto(`/contacto?audience=planta&need=operacion&service=${encodeURIComponent(service)}&contexto=${encodeURIComponent("Interés en fortalecer una planta existente.")}`);
  await page.getByLabel("Nombre").fill("Ana Pérez");
  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByLabel("Teléfono").fill("+57 300 555 1212");
  await page.getByLabel("Organización").fill("ESP Ejemplo");
  await page.getByLabel("Ubicación").fill("Antioquia");
  await page.getByLabel("Describe brevemente la situación").fill("Queremos fortalecer la operación sin reemplazar infraestructura útil.");
  await page.getByLabel(/Autorizo a Greenatics/i).check();
  await page.getByRole("button", { name: "Enviar consulta", exact: true }).click();

  await expect(page.getByText(/Consulta enviada/i)).toBeVisible();
  expect(captured).toHaveLength(1);
  const submission = captured[0]!;
  expect(submission.url).toMatch(/\/api\/public-leads$/);
  expect(submission.url).not.toContain("ana@example.com");
  expect(submission.url).not.toContain("Ana%20P");
  expect(submission.body).toMatchObject({
    name: "Ana Pérez",
    email: "ana@example.com",
    phone: "+57 300 555 1212",
    organization: "ESP Ejemplo",
    audience: "planta",
    need: "operacion",
    location: "Antioquia",
    service,
    context: "Interés en fortalecer una planta existente.",
    details: "Queremos fortalecer la operación sin reemplazar infraestructura útil.",
    consent: true,
  });
  expect(submission.body.requestId).toEqual(expect.any(String));
});

test("public consultation requires a contact channel before it sends", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/public-leads", async (route) => {
    requests += 1;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto("/contacto?audience=empresa&need=diagnostico");
  await page.getByLabel("Nombre").fill("Laura Gómez");
  await page.getByLabel(/Autorizo a Greenatics/i).check();
  await page.getByRole("button", { name: "Enviar consulta", exact: true }).click();

  await expect(page.getByText(/correo o teléfono/i)).toBeVisible();
  expect(requests).toBe(0);
});

test("public consultation handles server rate limiting without losing the booking route", async ({ page }) => {
  await page.route("**/api/public-leads", async (route) => {
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, code: "rate_limited" }) });
  });

  await page.goto("/contacto?audience=wondergreen&need=nutricion");
  await page.getByLabel("Nombre").fill("Carlos Ruiz");
  await page.getByLabel("Correo electrónico").fill("carlos@example.com");
  await page.getByLabel(/Autorizo a Greenatics/i).check();
  await page.getByRole("button", { name: "Enviar consulta", exact: true }).click();

  await expect(page.getByText(/demasiados intentos|intenta más tarde/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Agendar reunión", exact: true }).first()).toBeVisible();
});
