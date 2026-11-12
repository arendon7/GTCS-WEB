import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  buildToolContactHref,
  consumeToolContactDraft,
  storeToolContactDraft,
  TOOL_CONTACT_DRAFT_KEY,
} from "../src/data/tool-contact-handoff";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    has: (key: string) => values.has(key),
  };
}

test("tool contact URLs contain only routing context, never calculated details", () => {
  const href = buildToolContactHref("wondergreen", "agro", "Análisis de suelo");
  const url = new URL(href, "https://greenatics.test");

  expect(url.pathname).toBe("/contacto/");
  expect(url.searchParams.get("interes")).toBe("wondergreen");
  expect(url.searchParams.get("perfil")).toBe("agro");
  expect(url.searchParams.get("diagnostico")).toBe("Análisis de suelo");
  expect(url.searchParams.get("transferencia")).toBe("sesion");
  expect(url.searchParams.has("prioridad")).toBe(false);
  expect([...url.searchParams.keys()].sort()).toEqual(["diagnostico", "interes", "perfil", "transferencia"]);
});

test("tool draft is stored in the current session and can be consumed only once", () => {
  const storage = createMemoryStorage();
  const details = "pH de prueba: 4.8\nÁrea de prueba: 12 ha";

  expect(storeToolContactDraft(details, storage)).toBe(true);
  expect(storage.has(TOOL_CONTACT_DRAFT_KEY)).toBe(true);
  expect(consumeToolContactDraft(storage)).toBe(details);
  expect(storage.has(TOOL_CONTACT_DRAFT_KEY)).toBe(false);
  expect(consumeToolContactDraft(storage)).toBeNull();
});

test("an empty tool draft clears any earlier summary instead of reusing it", () => {
  const storage = createMemoryStorage();
  expect(storeToolContactDraft("Resumen anterior", storage)).toBe(true);
  expect(storeToolContactDraft("  ", storage)).toBe(false);
  expect(storage.has(TOOL_CONTACT_DRAFT_KEY)).toBe(false);
  expect(consumeToolContactDraft(storage)).toBeNull();
});

test("expired tool drafts are removed and not reused", () => {
  const storage = createMemoryStorage();
  const originalNow = Date.now;
  let now = 1_800_000_000_000;
  Date.now = () => now;

  try {
    storeToolContactDraft("Dato vencido", storage);
    now += 30 * 60 * 1000 + 1;
    expect(consumeToolContactDraft(storage)).toBeNull();
    expect(storage.has(TOOL_CONTACT_DRAFT_KEY)).toBe(false);
  } finally {
    Date.now = originalNow;
  }
});

test("tool draft falls back to in-memory storage when browser storage is blocked", () => {
  const blockedStorage = {
    getItem: () => { throw new Error("blocked"); },
    setItem: () => { throw new Error("blocked"); },
    removeItem: () => { throw new Error("blocked"); },
  };

  expect(storeToolContactDraft("Dato privado de prueba", blockedStorage)).toBe(true);
  expect(consumeToolContactDraft(blockedStorage)).toBe("Dato privado de prueba");
  expect(consumeToolContactDraft(blockedStorage)).toBeNull();
});

const toolRoutes = [
  ["/wondergreen/analisis-suelo/", /Llevar análisis a Contacto/, "Cultivo o sistema productivo:"],
  ["/wondergreen/analisis-agua/", /Compartir lectura con Greenatics/, "pH del agua:"],
  ["/wondergreen/balance-bases/", /Llevar lectura a Contacto/, "Calcio intercambiable:"],
  ["/wondergreen/balance-cn/", /Llevar lote a Contacto/, "Material húmedo:"],
  ["/wondergreen/calibracion-aspersores/", /Llevar calibración a Contacto/, "Agua utilizada por tanque:"],
  ["/wondergreen/logistica-flete/", /Llevar despacho a Contacto/, "Pedido considerado:"],
  ["/wondergreen/compatibilidad/", /Preparar consulta con Greenatics/, "Productos seleccionados para revisar:"],
  ["/wondergreen/costo-unidad-nutriente/", /Llevar comparación a Contacto/, "Alternativa comparada:"],
  ["/wondergreen/encalamiento/", /Llevar caso a Contacto/, "Cultivo:"],
  ["/wondergreen/calculadora/", /Solicitar orientación para el cultivo/, "Área aproximada ingresada:"],
  ["/herramientas/estimador-organicos/", /Revisar el escenario con Greenatics/, "Flujo orgánico considerado:"],
  ["/casa-jardin/", /Consultar mi caso/, "Tipo de plantas elegido:"],
] as const;

test("Wondergreen stage choices expose their selected state", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/wondergreen/calculadora/page.tsx"), "utf8");
  expect(source).toContain("aria-pressed={selectedStage === item.id}");
});

for (const [path, linkName, detailLabel] of toolRoutes) {
  test(`${path} transfers its live summary to Contacto without serializing it in the URL`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);

    const handoff = page.getByRole("link", { name: linkName }).first();
    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(pageWidth.content, `${path} should fit its viewport`).toBeLessThanOrEqual(pageWidth.client + 1);
    const href = await handoff.getAttribute("href");
    expect(href).toBeTruthy();

    const handoffUrl = new URL(href!, page.url());
    expect(handoffUrl.pathname).toBe("/contacto/");
    expect(handoffUrl.searchParams.get("transferencia")).toBe("sesion");
    expect(handoffUrl.searchParams.has("prioridad")).toBe(false);
    if (path === "/herramientas/estimador-organicos/") {
      expect(handoffUrl.searchParams.get("interes")).toBe("estimador-organicos");
      expect(handoffUrl.searchParams.get("perfil")).toBe("territorio");
    }
    if (path === "/wondergreen/calculadora/") {
      const flowering = page.getByRole("button", { name: "Transición reproductiva" });
      const fruitFill = page.getByRole("button", { name: "Desarrollo y llenado" });
      await expect(flowering).toHaveAttribute("aria-pressed", "true");
      await fruitFill.click();
      await expect(flowering).toHaveAttribute("aria-pressed", "false");
      await expect(fruitFill).toHaveAttribute("aria-pressed", "true");
    }

    await handoff.click();
    await expect.poll(() => new URL(page.url()).pathname).toBe("/contacto/");
    const details = page.locator("#contact-details");
    await expect(details).toBeVisible();
    expect(await details.inputValue()).toContain(detailLabel);
    if (path === "/herramientas/estimador-organicos/") {
      await expect(page.getByRole("status").filter({ hasText: "Revisar el flujo y la meta de desvío" })).toBeVisible();
    }
    if (path === "/wondergreen/calculadora/") {
      await expect(details).toContainText("Etapa principal: Desarrollo y llenado");
      await expect(details).toContainText("Referencia orientativa: Wondergreen 2FRUIT (3-3-8)");
      await expect(details).toContainText("El área no prescribe una cantidad.");
    }
    await expect(page.getByText(/Los datos de la herramienta o evaluación se conservan temporalmente/)).toBeVisible();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("greenatics:tool-contact-draft:v1"))).toBeNull();
    expect(new URL(page.url()).searchParams.has("prioridad")).toBe(false);
  });
}

test("SUI support checklist works by keyboard and reports selections without a readiness score", async ({ page }) => {
  await page.goto("/soluciones/auditoria-sui/");

  const checkboxes = page.getByRole("checkbox");
  await expect(checkboxes).toHaveCount(6);
  await checkboxes.nth(2).focus();
  await page.keyboard.press("Space");
  await expect(checkboxes.nth(2)).toBeChecked();
  await expect(page.getByRole("status")).toContainText("3 de 6");
  await expect(page.getByText(/puntaje de preparación/i)).toBeVisible();
  await expect(page.getByText(/índice preliminar de preparación/i)).toHaveCount(0);

  await page.getByRole("button", { name: /Conversar sobre estos soportes/ }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe("/contacto/");
  expect(new URL(page.url()).searchParams.get("interes")).toBe("preparacion-sui");
  expect(new URL(page.url()).searchParams.get("perfil")).toBe("esp");
  const details = page.getByLabel("Qué quieres resolver o decidir");
  await expect(details).toHaveValue(/Elementos que indicaste como disponibles: 3 de 6/);
  await expect(details).toHaveValue(/Balance de materiales/);
  await expect(page.getByText(/la sesión del navegador no lo conservó/)).toHaveCount(0);
});
