import { expect, test } from "@playwright/test";
import { getLocalToolRuntimeHref } from "../src/lib/local-tool-runtime";

test.describe("local tool runtime links", () => {
  test("only creates localhost links for the two supported local apps", () => {
    expect(getLocalToolRuntimeHref("OPS", "localhost")).toBe("http://localhost:3002/app");
    expect(getLocalToolRuntimeHref("CO₂", "127.0.0.1")).toBe("http://127.0.0.1:8765/login");
    expect(getLocalToolRuntimeHref("CO₂", "127.0.0.1", 4199)).toBe("http://127.0.0.1:4199/login");
    expect(getLocalToolRuntimeHref("OPS", "[::1]")).toBe("http://[::1]:3002/app");
    expect(getLocalToolRuntimeHref("CO₂", "preview.greenatics.co")).toBe("");
    expect(getLocalToolRuntimeHref("OPS", "192.168.23.171")).toBe("");
  });
});

for (const hub of ["/herramientas/", "/acceso/"]) {
  test(`${hub} exposes local-only app links on loopback previews`, async ({ page }) => {
    await page.goto(hub, { waitUntil: "networkidle" });

    const ops = page.getByRole("link", { name: "Abrir la demo local de GREENATICS OPS" });
    const huella = page.getByRole("link", { name: "Abrir el login local de Back 2 Green" });

    await expect(ops).toHaveAttribute("href", "http://127.0.0.1:3002/app");
    await expect(ops).toHaveAttribute("target", "_blank");
    await expect(ops).toHaveAttribute("rel", "noopener noreferrer");
    await expect(huella).toHaveAttribute("href", "http://127.0.0.1:8765/login");
    await expect(huella).toHaveAttribute("target", "_blank");
  });
}

test("local entry points open the working OPS and Huella screens", async ({ page }) => {
  await page.goto("/acceso/", { waitUntil: "networkidle" });

  const opsPagePromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Abrir la demo local de GREENATICS OPS" }).click();
  const opsPage = await opsPagePromise;
  await expect(opsPage).toHaveURL("http://127.0.0.1:3002/app");
  await expect(opsPage).toHaveTitle(/GREENATICS OPS/);

  const huellaPagePromise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Abrir el login local de Back 2 Green" }).click();
  const huellaPage = await huellaPagePromise;
  await expect(huellaPage).toHaveURL("http://127.0.0.1:8765/login");
  await expect(huellaPage).toHaveTitle(/Back 2 Green/);
});

test("Huella keeps its local platform and pricing separate from the organic-flow estimator", async ({ page }) => {
  await page.goto("/huella/", { waitUntil: "networkidle" });

  const localEntry = page.getByRole("link", { name: "Abrir el acceso local de pruebas de Back 2 Green" });
  await expect(localEntry).toHaveAttribute("href", "http://127.0.0.1:8765/login");
  await expect(localEntry).toHaveAttribute("target", "_blank");
  const primaryAction = page.getByRole("link", { name: "Ver planes anuales" });
  await expect(primaryAction).toHaveAttribute("href", "#planes-heading-start");
  await expect(page.getByText(/el acceso local es solo para pruebas y requiere que el servidor/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /probar el estimador público de materia orgánica/i })).toHaveCount(0);
  await expect(page.getByText(/Back 2 Green organiza el trabajo en etapas visibles/i)).toBeVisible();

  await page.goto("/impacto/", { waitUntil: "networkidle" });
  await expect(page.getByRole("link", { name: "Probar estimador público" })).toHaveAttribute("href", "/herramientas/estimador-organicos/");
  await page.getByRole("link", { name: "Probar estimador público" }).click();
  await expect(page).toHaveURL(/\/herramientas\/estimador-organicos\/$/);
  await expect(page.locator("#calculadora-organicos")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dimensiona el flujo. Después, evalúa su impacto." })).toBeVisible();
});

test("the Huella landing exposes its loopback-only platform entry after hydration", async ({ page }) => {
  await page.goto("/huella/", { waitUntil: "networkidle" });

  const localEntry = page.getByRole("link", { name: "Abrir el acceso local de pruebas de Back 2 Green" });
  await expect(localEntry).toHaveAttribute("href", "http://127.0.0.1:8765/login");
  await expect(localEntry).toHaveAttribute("target", "_blank");
  await expect(localEntry).toHaveAttribute("rel", "noopener noreferrer");
});

test("the Huella landing exposes local demo login only as an optional test link", async ({ page }) => {
  await page.goto("/huella/", { waitUntil: "networkidle" });

  await expect(page.getByRole("link", { name: "Ver planes anuales" })).toHaveAttribute("href", "#planes-heading-start");
  const localEntry = page.getByRole("link", { name: "Abrir el acceso local de pruebas de Back 2 Green" });
  await expect(localEntry).toHaveAttribute("href", "http://127.0.0.1:8765/login");
  await expect(page.getByText(/el acceso local es solo para pruebas/i)).toBeVisible();
});

test("the isolated local demo profile can sign in and reach its role-based dashboard", async ({ page }) => {
  await page.goto("http://127.0.0.1:8765/login", { waitUntil: "networkidle" });
  await page.locator("#demo-profile").selectOption({ label: "Responsable de información" });
  await page.getByLabel("Contraseña").fill("Demo2026!");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL(/127\.0\.0\.1:8765\/dashboard$/);
  await expect(page.getByRole("heading", { name: /^Hola,/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver recorrido" })).toBeVisible();
});
