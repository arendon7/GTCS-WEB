import { test, expect } from "@playwright/test";

test("company page explains Greenatics as a connected system", async ({ page }) => {
  await page.goto("/nosotros");

  await expect(page.getByRole("heading", { name: /No somos solo una planta/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "La ventaja está en trabajar la cadena completa." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transformar residuos en vida." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Wondergreen" }).last()).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: "Impacto" }).last()).toHaveAttribute("href", "/impacto");
});

test("contact page routes the first conversation by problem", async ({ page }) => {
  await page.goto("/contacto");

  await expect(page.getByRole("heading", { name: "Cuéntanos qué quieres transformar." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cuatro datos pueden ahorrar mucho tiempo." })).toBeVisible();
  await expect(page.getByText("Agro / Wondergreen", { exact: false })).toBeVisible();
  await expect(page.getByText(/Empresas/).first()).toBeVisible();
  await expect(page.getByText("Municipios / ESP", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "Tengo residuos" })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");
  await expect(page.getByRole("link", { name: "Tengo un cultivo" })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: "Tengo un proyecto" })).toHaveAttribute("href", "/soluciones/prefactibilidad");
});

test("contact page exposes the configured technical booking link", async ({ page }) => {
  await page.goto("/contacto");
  const booking = page.getByRole("link", { name: "Agendar reunión" });
  await expect(booking).toHaveAttribute("href", /^https:\/\/outlook\.office\.com\//);
  await expect(booking).toHaveAttribute("target", "_blank");
});
