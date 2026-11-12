import fs from "node:fs";
import { expect, test } from "@playwright/test";

test("access directory prioritizes the public Huella journey over a local login", () => {
  const source = fs.readFileSync("src/app/acceso/page.tsx", "utf8");

  expect(source).toContain('const localDevelopmentRuntime = tool.code === "CO₂" && hasRuntime && isLocalRuntime(runtimeHref);');
  expect(source).toContain("hasRuntime && runtimeHref && !localDevelopmentRuntime");
  expect(source).toContain('href={tool.publicHref}');
  expect(source).toContain("Ver recorrido y planes");
  expect(source).toContain("Acceso de pruebas; requiere que el servidor local esté iniciado.");
  expect(source).toContain("Abrir acceso local de pruebas");
  expect(source).toContain("target={isExternal ? \"_blank\" : undefined}");
});
