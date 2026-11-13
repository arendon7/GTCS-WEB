import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const pagePath = path.join(process.cwd(), "src/app/parque-ambiental/page.tsx");
const stylesPath = path.join(process.cwd(), "src/app/park-editorial.css");

test("environmental park page keeps its public concept, process truth, and client routes", () => {
  const page = fs.readFileSync(pagePath, "utf8");
  const styles = fs.readFileSync(stylesPath, "utf8");
  const imagePath = path.join(
    process.cwd(),
    "public/projects/concepts/environmental-park-modular-concept.jpg",
  );

  expect(fs.existsSync(imagePath)).toBe(true);
  expect(page).toContain("/projects/concepts/environmental-park-modular-concept.jpg");
  expect(page).toContain("alt=\"Área de compostaje cubierta y unidades de tratamiento en un paisaje de montaña\"");
  expect(page).toContain("Cinco módulos conectan el material con un uso posible.");
  expect(page).toContain("environmentalParkModules[0]");
  expect(page).toContain("environmentalParkModules[2], environmentalParkModules[1]");
  expect(page).toContain("environmentalParkModules[3], environmentalParkModules[4]");
  expect(page).toContain("se define a partir de las corrientes");
  expect(page).toContain("evaluación técnica y económica");
  expect(page).toContain("no la");
  expect(page).toContain("instalación completa ya construida");
  expect(page).toContain("GREENATICS OPS");
  expect(page).toContain("/contacto/?servicio=prefactibilidad&perfil=municipio");
  expect(page).toContain('href="#preguntas-factibilidad"');
  expect(page).toContain("Ver qué revisa la prefactibilidad");
  expect(page.split('href="/contacto/?servicio=prefactibilidad&perfil=municipio"').length - 1).toBe(1);
  expect(page).toContain('id="preguntas-factibilidad"');
  expect(page).toContain("/proyectos/yarumal/");
  expect(page).toContain("/municipios/");
  expect(page).toContain("/tecnologia/");
  expect(page).toContain("/acceso/");
  expect(page).not.toContain("render");
  expect(page).not.toContain("String(index + 1)");
  expect(page).not.toContain("escena editorial");
  expect(page).not.toContain("imagen generada con IA");
  expect(styles).toContain("@media (max-width: 960px)");
  expect(styles).toContain("@media (max-width: 700px)");
  expect(styles).toContain(".park-concept-hero__visual img");
  expect(styles).toContain(".park-concept a:focus-visible");
});
