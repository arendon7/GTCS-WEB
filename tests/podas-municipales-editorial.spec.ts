import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const routeDirectory = path.join(process.cwd(), "src/app/soluciones/podas-municipales");
const routeSource = fs.readFileSync(path.join(routeDirectory, "page.tsx"), "utf8");
const intakeSource = fs.readFileSync(path.join(process.cwd(), "src/components/municipal-pruning-intake.tsx"), "utf8");
const styles = fs.readFileSync(path.join(routeDirectory, "podas-municipales.module.css"), "utf8");

test("municipal pruning page presents destinations before equipment and retains its client journey", () => {
  expect(fs.existsSync(path.join(process.cwd(), "public/services/municipal-pruning-material-concept.jpg"))).toBe(true);
  expect(routeSource).toContain("Cada poda necesita una ruta pensada para su material y su destino.");
  expect(routeSource).toContain("Primero se valida el destino; después, el equipo.");
  expect(routeSource).toContain("/services/municipal-pruning-material-concept.jpg");
  expect(routeSource).toContain("alt=\"Ramas, trozas y astillas de madera agrupadas por tipo junto a una zona verde.\"");
  expect(routeSource).toContain("id=\"organizar-caso\"");
  expect(routeSource).toContain("<MunicipalPruningIntake />");
  expect(routeSource).not.toContain("SolutionAssessment");
  expect(routeSource).not.toContain("escena editorial");
  expect(routeSource).not.toContain("imagen generada con IA");

  expect(intakeSource).toContain("buildSolutionAssessmentContactHref");
  expect(intakeSource).toContain("storeSolutionAssessmentDraft(details.join(\"\\n\"))");
  expect(intakeSource).toContain('resolveProfile(searchParams.get("perfil"))');
  expect(intakeSource).toContain("router.push(contactHref)");
  expect(intakeSource).toContain("no se incluyen en la dirección web");
  expect(intakeSource).toContain("Destino que quieres evaluar");

  expect(styles).toContain("@media (max-width: 700px)");
  expect(styles).toContain("@media (max-width: 390px)");
  expect(styles).toContain(".field input:focus-visible");
});
