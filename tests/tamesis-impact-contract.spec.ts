import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { tamesisImpactScenario } from "../src/data/tamesis-impact";

test("Támesis distinguishes installed infrastructure, design ranges, and preliminary CO2e scenario", async () => {
  const homePath = path.join(process.cwd(), "out", "index.html");
  const casePath = path.join(process.cwd(), "out", "proyectos", "tamesis", "index.html");
  expect(fs.existsSync(homePath)).toBe(true);
  expect(fs.existsSync(casePath)).toBe(true);

  const home = fs.readFileSync(homePath, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").toLowerCase();
  const casePage = fs.readFileSync(casePath, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").toLowerCase();
  expect(home).toContain("8–14 t co₂e/mes");
  expect(home).toContain("escenario preliminar de co₂e:");
  expect(home).toContain("no una reducción medida ni verificada");
  expect(home).not.toContain("60–90 t/mes");
  expect(home).not.toContain("1.800–3.000 m³/mes");
  expect(home).not.toContain("co₂e potencial · escenario inicial");

  expect(casePage).toContain("8–14 t co₂e/mes");
  expect(casePage).toContain("co₂e potencial · escenario inicial");
  expect(casePage).toContain("escenario preliminar de co₂e");
  expect(casePage).not.toContain("por validar");
  expect(casePage).not.toContain("reducción potencial");
  expect(home).toContain("no una reducción medida ni verificada");
  expect(casePage).toContain("no es una medición, verificación ni reducción acreditada");
  expect(casePage).toContain("dar continuidad a los acuerdos operativos");
  expect(casePage).not.toContain("avanzar en nuit");
  expect(casePage).toContain("30 m³");
  const mainStart = casePage.indexOf("<main");
  const mainEnd = casePage.indexOf("</main>", mainStart);
  const main = casePage.slice(mainStart, mainEnd);
  expect(main.split("30 m³")).toHaveLength(2);
  expect(main).toContain("la fracción líquida alimenta la digestión anaerobia");
  expect(main).toContain("el biogás capturado se mide y se evalúa para su aprovechamiento energético");
  expect(casePage).toContain("rango de referencia de diseño");
  expect(casePage).toContain("reactor-uasb.jpeg");
  expect(main).toContain("la infraestructura toma sentido cuando se conecta con la operación");
  expect(main).toContain("el reactor uasb forma parte de la ruta líquida");
  expect(main).toContain("la biomasa acondicionada se separa en una ruta líquida para digestión anaerobia y otra sólida para estabilización y compostaje");
  expect(main).not.toContain("no es un plano, una imagen a escala");
  expect(casePage).not.toContain("conversión anaerobia estable y controlable");
  expect(casePage).not.toContain("rangos de toneladas, biogás, energía y co₂e");

  const caseImpactMetrics = tamesisImpactScenario.metrics.filter((metric) => metric.basis !== "Infraestructura existente");
  expect(caseImpactMetrics).toHaveLength(3);
  expect(caseImpactMetrics.map((metric) => metric.value)).not.toContain("30 m³");
});

test("Yarumal case and impact methodology show each validated metric once before explaining its method", async () => {
  for (const route of ["proyectos/yarumal", "impacto"]) {
    const file = path.join(process.cwd(), "out", route, "index.html");
    const html = fs.readFileSync(file, "utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
    const mainStart = html.indexOf("<main");
    const mainEnd = html.indexOf("</main>", mainStart);
    const main = html.slice(mainStart, mainEnd);
    for (const value of ["+120 t/mes", "96,4 %", "140 km", "$180 M COP/año"]) {
      expect(main.split(value)).toHaveLength(2);
    }
    expect(main).toContain("gt-case-method-grid--method-only");
    if (route === "impacto") {
      expect(main).toContain("La distancia comparada describe un cambio de recorrido");
      expect(main).toContain("no una reducción de gases de efecto invernadero");
      expect(main).toContain("href=\"/contacto/?servicio=clima-carbono");
      expect(main).toContain('id="siguiente-paso"');
      expect(main).not.toContain("Escenario ESG");
      expect(main).not.toContain("SIMULADOR DE APROVECHAMIENTO");
      expect(main).not.toContain("SIMULADOR OPERATIVO");
    }
  }
});
