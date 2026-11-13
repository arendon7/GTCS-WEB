import { expect, test } from "@playwright/test";

test("Proyectos explica el valor de las experiencias sin notas editoriales internas", async ({ page }) => {
  await page.goto("/proyectos/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "La evidencia empieza donde el sistema realmente opera." })).toBeVisible();
  await expect(page.getByText(/No presentamos proyectos como fotografías aisladas|La web diferencia infraestructura observada|Gobernanza de evidencia|Memoria operacional|Lecturas transversales/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "El siguiente proyecto empieza por entender sus condiciones." })).toBeVisible();
  await expect(page.getByText(/separación, la ruta, la capacidad de recepción, la infraestructura/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Leer el caso Yarumal" })).toHaveAttribute("href", "/proyectos/yarumal/");
  await expect(page.getByRole("link", { name: "Leer el caso Támesis" })).toHaveAttribute("href", "/proyectos/tamesis/");
  await expect(page.getByRole("link", { name: "Conocer OPS →" })).toHaveAttribute("href", "/app/");
});
