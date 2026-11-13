import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("S20 explains active compost optimization and separates it from rehabilitation and daily operation", () => {
  const page = fs.readFileSync(path.join(process.cwd(), "src/app/servicios/optimizacion-composteras/page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(process.cwd(), "src/app/servicios/optimizacion-composteras/optimizacion-composteras.module.css"), "utf8");
  const image = path.join(process.cwd(), "public/services/compost-optimization-concept-v1.jpg");

  expect(fs.existsSync(image)).toBe(true);
  expect(page).toContain('src="/services/compost-optimization-concept-v1.jpg"');
  expect(page).toContain('alt="Compost en proceso dentro de un área de trabajo cubierta."');
  expect(page).not.toContain("/projects/plant/plant-evidence-04.webp");
  expect(page).toContain("Ajustar el compostaje a los materiales y a las condiciones reales del proceso.");
  expect(page).toMatch(/mezcla,\s+la humedad,\s+la aireación,\s+el volteo y la maduración/);
  expect(page).toContain("/contacto/?servicio=optimizacion-composteras");
  expect(page).toContain("/servicios/rehabilitacion-infraestructura/");
  expect(page).toContain("/servicios/operacion-delegada/");
  expect(page).toContain("No incluye automáticamente obras");
  expect(page).not.toMatch(/escena editorial|no documenta|imagen generada con IA|\b0[1-3]\b/i);
  expect(styles).toMatch(/@media \(max-width: 1100px\)[\s\S]*?\.hero h1\s*\{[^}]*font-size:\s*clamp\(2\.5rem, 4\.45vw, 3\.6rem\)/);
  expect(styles).toContain("@media (max-width: 680px)");
  expect(styles).toMatch(/\.alternatives\s*\{\s*grid-template-columns:\s*1fr;/);
  expect(styles).toContain("grid-template-columns: minmax(0, 1fr)");
  expect(styles).toMatch(/\.closingInner > a\s*\{[^}]*max-width: 100%;[^}]*white-space: normal;/);
});

test("Valorización portfolio uses the S20 visual instead of a held case photograph", () => {
  const portfolio = fs.readFileSync(path.join(process.cwd(), "src/data/portfolio.ts"), "utf8");
  const image = path.join(process.cwd(), "public/services/compost-optimization-concept-v1.jpg");
  const compostEntry = portfolio.match(/\{ slug: "compostaje"[^\n]+/);

  expect(fs.existsSync(image)).toBe(true);
  expect(compostEntry?.[0]).toContain('image: "/services/compost-optimization-concept-v1.jpg"');
  expect(compostEntry?.[0]).toContain('imageAlt: "Material de compost en proceso bajo una cubierta."');
  expect(compostEntry?.[0]).toContain('imageCaption: "El acompañamiento revisa las condiciones del material y las etapas del proceso."');
  expect(compostEntry?.[0]).not.toContain("plant-evidence-04.webp");
  expect(compostEntry?.[0]).not.toContain("Yarumal");
});
