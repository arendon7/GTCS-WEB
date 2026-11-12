import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("Nosotros explains Greenatics as an interdisciplinary consulting team without ledger layouts", () => {
  const root = process.cwd();
  const page = fs.readFileSync(path.join(root, "src/app/nosotros/page.tsx"), "utf8");
  const styles = fs.readFileSync(path.join(root, "src/app/nosotros/nosotros.module.css"), "utf8");
  const imagePaths = [...page.matchAll(/(?:src: "|src=")(\/(?:projects|products|services|technology)\/[^\"]+)/g)].map((match) => match[1]);
  const holdbacks = JSON.parse(fs.readFileSync(path.join(root, "docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"), "utf8")).holdbacks as { asset: string }[];

  expect(imagePaths).toHaveLength(3);
  for (const imagePath of imagePaths) {
    expect(fs.existsSync(path.join(root, "public", imagePath.slice(1))), imagePath).toBe(true);
    expect(holdbacks.some(({ asset }) => asset === imagePath), `${imagePath} must not appear on Nosotros`).toBe(false);
  }

  expect(page).toContain("/services/nosotros-consulting-field-v1.jpg");
  expect(page).toContain("/technology/organic-treatment-routes-concept.jpg");
  expect(page).toContain("/proyectos/tamesis/");

  expect(page).toContain("Consultoría e ingeniería para llevar la economía circular a la operación.");
  expect(page).toContain("Ingeniería ambiental y bioprocesos");
  expect(page).toContain("Operación, logística y datos");
  expect(page).toContain("Agronomía, suelo y producto");
  expect(page).toContain("GIEM) de la Universidad de Antioquia");
  expect(page).toContain("conservan su titularidad y se rigen por los acuerdos específicos de cada proyecto");
  expect(page).toContain("/servicios/");
  expect(page).toContain("/proyectos/");
  expect(page).toContain("/tecnologia/");
  expect(page).toContain("/diagnostico/");
  expect(page).toContain("yarumalClaims.map");

  expect(page).not.toContain("gt-decision-grid");
  expect(page).not.toContain("gt-discipline-ledger");
  expect(page).not.toContain("gt-operating-model");
  expect(page).not.toMatch(/\["0[1-5]"/);
  expect(page).not.toMatch(/padStart\(2, "0"\)/);
  expect(styles).toContain(".proofGrid");
  expect(styles).toContain(".capabilityGrid");
  expect(styles).toContain("@media (max-width: 620px)");
});
