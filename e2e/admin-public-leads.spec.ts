import { test, expect } from "@playwright/test";

const lead = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  status: "new",
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+57 300 555 1212",
  organization: "ESP Ejemplo",
  role_title: "Directora técnica",
  audience: "planta",
  need: "operacion",
  location: "Antioquia",
  service: "Dirección técnica y coordinación de operación",
  product: null,
  crop: null,
  context: "Interés en fortalecer una planta existente.",
  details: "Queremos mejorar la operación sin reemplazar infraestructura útil.",
  consent_at: "2026-08-26T20:00:00.000Z",
  created_at: "2026-08-26T20:00:00.000Z",
  updated_at: "2026-08-26T20:00:00.000Z",
  retention_expires_at: "2027-02-22T20:00:00.000Z",
};

test("OPS exposes a dedicated commercial inquiry inbox without mixing it into sales", async ({ page }) => {
  await page.route("**/api/admin/public-leads", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ leads: [lead] }) });
  });

  await page.goto("/admin/leads");
  await expect(page.getByRole("heading", { name: "Consultas comerciales", exact: true })).toBeVisible();
  await expect(page.getByText("Ana Pérez", { exact: true })).toBeVisible();
  await expect(page.getByText("ESP Ejemplo", { exact: true })).toBeVisible();
  await expect(page.getByText("Dirección técnica y coordinación de operación", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ventas", exact: true })).toBeVisible();
  expect(page.url()).not.toContain("ana@example.com");
});

test("OPS lead inbox filters by governed status and audience", async ({ page }) => {
  const second = { ...lead, id: "550e8400-e29b-41d4-a716-446655440001", status: "contacted", name: "Carlos Ruiz", email: "carlos@example.com", audience: "wondergreen", need: "nutricion" };
  await page.route("**/api/admin/public-leads", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ leads: [lead, second] }) });
  });

  await page.goto("/admin/leads");
  await page.getByLabel("Filtrar por estado").selectOption("contacted");
  await expect(page.getByText("Carlos Ruiz", { exact: true })).toBeVisible();
  await expect(page.getByText("Ana Pérez", { exact: true })).toHaveCount(0);
  await page.getByLabel("Filtrar por audiencia").selectOption("wondergreen");
  await expect(page.getByText("Carlos Ruiz", { exact: true })).toBeVisible();
});

test("OPS lead lifecycle changes use the protected admin body without putting PII in URLs", async ({ page }) => {
  const captured: Array<{ method: string; url: string; body: Record<string, unknown> }> = [];
  await page.route("**/api/admin/public-leads", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ leads: [lead] }) });
      return;
    }
    captured.push({ method: request.method(), url: request.url(), body: request.postDataJSON() as Record<string, unknown> });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ lead: { id: lead.id, status: "contacted", updated_at: "2026-08-26T21:00:00.000Z" } }) });
  });

  await page.goto("/admin/leads");
  await page.getByLabel("Estado de Ana Pérez").selectOption("contacted");
  await expect(page.getByText(/Estado actualizado/i)).toBeVisible();
  expect(captured).toHaveLength(1);
  expect(captured[0]).toMatchObject({ method: "PATCH", body: { id: lead.id, status: "contacted" } });
  expect(captured[0]!.url).not.toContain("ana@example.com");
  expect(captured[0]!.url).not.toContain("Ana%20P");
});

test("OPS lead deletion requires a deliberate second action and removes the row", async ({ page }) => {
  await page.route("**/api/admin/public-leads", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ leads: [lead] }) });
      return;
    }
    expect(request.method()).toBe("DELETE");
    expect(request.postDataJSON()).toEqual({ id: lead.id });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });

  await page.goto("/admin/leads");
  await page.getByRole("button", { name: "Eliminar consulta de Ana Pérez" }).click();
  await expect(page.getByRole("button", { name: "Confirmar eliminación de Ana Pérez" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar eliminación de Ana Pérez" }).click();
  await expect(page.getByText("Ana Pérez", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Consulta eliminada/i)).toBeVisible();
});
