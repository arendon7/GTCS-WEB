import { expect, test } from "@playwright/test";

const publicLanguageContracts = [
  {
    path: "/soluciones",
    forbidden: [
      /Principio comercial/i,
      /servicios concretos que puedes abrir/i,
      /la familia ayuda a ubicar la necesidad/i,
    ],
    required: [
      /Qué puedes contratar/i,
      /diagnóstico/i,
      /entregables/i,
    ],
  },
  {
    path: "/wondergreen",
    forbidden: [
      /Product Master/i,
      /Product Truth/i,
      /Truth lock/i,
      /la web separa dos recorridos/i,
      /Finder V1/i,
      /arquitectura de producto y decisión/i,
      /reconciliad[ao]s?/i,
      /gobernad[ao]s?/i,
    ],
    required: [
      /Nutrición que trabaja con el suelo/i,
      /Lenta liberación/i,
      /documentación técnica/i,
    ],
  },
  {
    path: "/casa-jardin",
    forbidden: [
      /Product Truth/i,
      /\bV1\b/i,
      /\bhandoff\b/i,
      /\bSKUs?\b/i,
      /\bguardrails?\b/i,
      /dependencias/i,
      /formatos propuestos/i,
      /reconciliad[ao]s?/i,
      /gobernad[ao]s?/i,
      /arquitectura navegable/i,
    ],
    required: [
      /Pre-lanzamiento/i,
      /compra deshabilitada/i,
      /checkout/i,
      /PVP/i,
      /dosis universales/i,
    ],
  },
] as const;

for (const contract of publicLanguageContracts) {
  test(`${contract.path} keeps internal governance vocabulary out of client-visible copy`, async ({ page }) => {
    await page.goto(contract.path);
    const visibleCopy = await page.locator("main").innerText();

    for (const pattern of contract.forbidden) {
      expect(visibleCopy, `${contract.path} still exposes internal vocabulary: ${pattern}`).not.toMatch(pattern);
    }

    for (const pattern of contract.required) {
      expect(visibleCopy, `${contract.path} lost a required public guardrail: ${pattern}`).toMatch(pattern);
    }
  });
}
