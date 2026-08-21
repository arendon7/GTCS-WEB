import { test, expect } from "@playwright/test";

const kits = [
  "Kit Plantas Verdes",
  "Kit Plantas con Flor",
  "Kit Mi Huerta",
  "Kit Casa Completa",
  "Casa Completa XL",
] as const;

const stageVisuals = [
  ["Miniatura CRECE 2Grow dentro del kit", "/api/public-media/wondergreen-2grow"],
  ["Miniatura EQUILIBRA 2Balance dentro del kit", "/api/public-media/wondergreen-2balance"],
  ["Miniatura FLORECE 2Bloom dentro del kit", "/api/public-media/wondergreen-2bloom"],
  ["Miniatura FRUCTIFICA 2Fruit dentro del kit", "/api/public-media/wondergreen-2fruit"],
] as const;

test("Casa Jardin closes with visual kit compositions built from real Wondergreen stages", async ({ page }) => {
  await page.goto("/casa-jardin");

  await expect(page.getByRole("heading", { name: "Cada kit reúne etapas. No mezcla necesidades.", exact: true })).toBeVisible();

  for (const kit of kits) {
    const composition = page.getByLabel(`Composición visual ${kit}`, { exact: true });
    await expect(composition).toBeVisible();
    await expect(page.getByText(kit, { exact: true }).last()).toBeVisible();
  }

  for (const [alt, src] of stageVisuals) {
    await expect(page.getByRole("img", { name: alt, exact: true }).first()).toHaveAttribute("src", src);
  }

  await expect(page.getByText("Kit educativo bloqueado", { exact: true })).toBeVisible();
  await expect(page.getByText(/Trasplanta & Arranca continúa fuera del catálogo/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Descargar guía de trasplante PDF/i })).toHaveAttribute("href", "/api/public-resources/home-garden-guide-trasplante");

  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
});

test("visual kit band does not repeat inside a kit detail route", async ({ page }) => {
  await page.goto("/casa-jardin/kits/mi-huerta");
  await expect(page.getByRole("heading", { name: "Cada kit reúne etapas. No mezcla necesidades.", exact: true })).toHaveCount(0);
});
