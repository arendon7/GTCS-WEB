import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const glossaryPath = path.join(process.cwd(), "src/app/biblioteca/glosario/glosario-client.tsx");

test("glossary distinguishes verified definitions from product-specific performance claims", () => {
  const source = fs.readFileSync(glossaryPath, "utf8");

  expect(source).not.toContain("45 meq/100g");
  expect(source).not.toContain("evitando su lixiviación y volatilización");
  expect(source).not.toContain("de rápida absorción foliar o radicular");
  expect(source).toContain("la liberación gradual es un atributo de diseño");
  expect(source).toContain("la composición y las indicaciones dependen de cada ficha vigente");
});

test("glossary scopes tariff reporting and separates SAR from ISR", () => {
  const source = fs.readFileSync(glossaryPath, "utf8");

  expect(source).toContain("Resolución CRA 943 de 2021");
  expect(source).toContain("más de 5.000 suscriptores");
  expect(source).toContain("el reporte no equivale a una validación automática");
  expect(source).toContain("resistencia sistémica inducida (ISR)");
  expect(source).not.toContain("como Trichoderma y Bacillus");
});
