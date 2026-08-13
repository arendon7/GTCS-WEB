import { test, expect } from "@playwright/test";

const OPS_STORAGE_KEY = "greenatics-ops-mvp-001";

test("public routes do not mount or persist the local OPS store", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Transformar residuos en vida/i })).toBeVisible();
  await page.waitForTimeout(100);
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), OPS_STORAGE_KEY)).toBeNull();
});

test("local development keeps OPS available for isolated QA", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  await expect.poll(() => page.evaluate((key) => window.localStorage.getItem(key), OPS_STORAGE_KEY)).not.toBeNull();
});

test("login explains that local mode is a development boundary", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Acceso interno" })).toBeVisible();
  await expect(page.getByText("Modo local de desarrollo.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeDisabled();
});
