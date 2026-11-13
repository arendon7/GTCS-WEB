import { expect, test } from "@playwright/test";
import { crops } from "../src/data/crops";

test("each crop guide opens the Wondergreen agronomic service with its crop context", async ({ page }) => {
  for (const crop of crops) {
    await page.goto(`/wondergreen/cultivos/${crop.slug}/`);

    const cta = page.getByRole("link", { name: `Diseñar un programa para ${crop.name}` });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/contacto\//);

    const request = new URL(page.url());
    expect(request.searchParams.get("servicio")).toBe("programas-wondergreen");
    expect(request.searchParams.get("perfil")).toBe("agro");
    expect(request.searchParams.get("diagnostico")).toBe(`Programa agronómico para ${crop.name}`);
    expect(request.searchParams.get("prioridad")).toBe(`Cultivo ${crop.name}; revisar etapa y objetivo del lote`);
    await expect(page.getByText("Ruta: Programas Wondergreen", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Productor / Finca" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contact-details")).toHaveValue(
      `Ruta sugerida: Programa agronómico para ${crop.name}\nNecesidad seleccionada: Cultivo ${crop.name}; revisar etapa y objetivo del lote`,
    );
    await expect(page.getByRole("button", { name: /Revisar resumen y abrir WhatsApp/ })).toBeVisible();
  }
});
