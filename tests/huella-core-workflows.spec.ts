import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;

const journeys = [
  {
    role: "Cliente",
    email: "cliente@calculatuhuella.local",
    routes: [
      ["/informacion", "Datos y evidencias"],
      ["/cargas-operativas", "Importa, valida y corrige tus datos"],
      ["/calculos", "Motor de cálculo"],
      ["/control", "Control profesional"],
      ["/reportes", "Informes para revisar y explicar el inventario"],
      ["/guia", "Tu inventario, paso a paso"],
    ],
  },
  {
    role: "Consultoría",
    email: "consultor@calculatuhuella.local",
    routes: [
      ["/inventarios", "Inventarios"],
      ["/metodologia/nucleo", "Núcleo metodológico"],
      ["/calculos", "Motor de cálculo"],
      ["/control", "Control profesional"],
      ["/reportes", "Informes para revisar y explicar el inventario"],
    ],
  },
  {
    role: "Revisión",
    email: "revisor@calculatuhuella.local",
    routes: [
      ["/control", "Control profesional"],
      ["/reportes", "Informes para revisar y explicar el inventario"],
      ["/verificacion", "Portal del verificador"],
    ],
  },
  {
    role: "Verificación",
    email: "verificador@calculatuhuella.local",
    routes: [
      ["/verificacion", "Portal del verificador"],
      ["/reportes", "Informes para revisar y explicar el inventario"],
      ["/metodologia/nucleo", "Núcleo metodológico"],
    ],
  },
] as const;

test.skip(!baseUrl, "Set PLAYWRIGHT_BASE_URL to an isolated local demo runtime.");

for (const journey of journeys) {
  test(`${journey.role} can follow the core inventory screens without UX regressions`, async ({ page }) => {
    const target = new URL(baseUrl!);
    expect(["127.0.0.1", "localhost", "::1"]).toContain(target.hostname);

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto(new URL("/login", target).toString());
    await page.locator("#login-email").fill(journey.email);
    await page.locator("#login-password").fill("Demo2026!");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(
      journey.role === "Verificación" ? /\/verificacion$/ : /\/dashboard$/,
    );

    if ((page.viewportSize()?.width ?? 1440) < 700) {
      const menu = page.getByRole("button", { name: "Abrir menú" });
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
    }

    const accessibilityFindings: Array<{ path: string; id: string; impact: string | null | undefined; targets: string[] }> = [];
    for (const [path, heading] of journey.routes) {
      const response = await page.goto(new URL(path, target).toString(), { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${journey.role} ${path} HTTP status`).toBe(200);
      await expect(page.locator("main h1").first()).toHaveText(heading);
      await expect(page.locator("#sidebar")).toHaveAttribute("aria-label", "Menú de la plataforma");
      await expect(page.getByText("Entorno demostrativo · datos de ejemplo", { exact: true })).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(dimensions.document, `${path} document overflow`).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.body, `${path} body overflow`).toBeLessThanOrEqual(dimensions.viewport);

      const accessibility = await new AxeBuilder({ page }).analyze();
      for (const violation of accessibility.violations) {
        accessibilityFindings.push({
          path,
          id: violation.id,
          impact: violation.impact,
          targets: violation.nodes.flatMap((node) => node.target.map(String)).slice(0, 8),
        });
      }
    }

    if (journey.role === "Cliente" || journey.role === "Verificación") {
      await page.goto(new URL("/reportes", target).toString(), { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Documentos disponibles" })).toBeVisible();
      await expect(page.locator(".deliverable-grid button")).toHaveCount(0);
    }

    expect(accessibilityFindings, `${journey.role} accessibility findings`).toEqual([]);
    expect(errors, `${journey.role} browser errors`).toEqual([]);
  });
}
