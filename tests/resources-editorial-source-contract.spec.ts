import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("resource routes use compact editorial imagery and client-facing paths", () => {
  const page = read("src/app/recursos/page.tsx");
  const styles = read("src/app/routes-v3.css");
  const routeBlock = page.match(/const entryRoutes = \[([\s\S]*?)\n\];/)?.[1] ?? "";
  const imagePaths = [...routeBlock.matchAll(/image: "([^"]+)"/g)].map((match) => match[1]);

  expect(imagePaths).toHaveLength(5);
  expect(page).toContain("index >= entryRoutes.length - 2");
  expect(page).toContain('"(max-width: 600px) 100vw, (max-width: 1050px) 50vw, 22vw"');
  const desktopRouteLayout = styles.slice(
    styles.indexOf("@media (min-width: 1051px)"),
    styles.indexOf("@media (max-width: 1050px)"),
  );
  expect(desktopRouteLayout).toContain(".gt-resource-route-grid article.gt-resource-route--wide");
  expect(desktopRouteLayout).toContain("grid-column: span 3;");
  expect(desktopRouteLayout).toContain("grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);");
  expect(desktopRouteLayout).toContain(".gt-resource-route--wide .gt-resource-route__copy");
  for (const imagePath of imagePaths) {
    expect(fs.existsSync(path.join(process.cwd(), "public", imagePath.replace(/^\//, ""))), imagePath).toBe(true);
  }
  expect(page).toContain("¿Qué necesitas resolver hoy?");
  expect(page).toContain("Encuentra casos de trabajo en territorio, herramientas, métodos y guías para");
  expect(page).not.toContain("No es un repositorio de archivos sueltos.");
  expect(page).toContain("/services/organic-valorization-concept-v1.jpg");
  expect(page).toContain("Compost en primer plano, con cultivos y una instalación de aprovechamiento al fondo.");
  expect(page).toContain("Explorar por necesidad");
  expect(page).toContain("id=\"rutas\"");
  expect(routeBlock).toContain('href: "/empresas/"');
  expect(routeBlock).toContain("Empresas y grandes generadores");
  expect(routeBlock).not.toContain('href: "/app/"');
  expect(page.match(/href=\"\/app\/\"/g) ?? []).toHaveLength(1);
  expect(page).toContain("Muestra pública interactiva");
  expect(page).not.toContain("greenatics-ecosystem-map.svg");
  expect(page).not.toContain("gt-resources-hero__facts");
  expect(page).not.toContain("recursos web publicados");
  expect(page).not.toMatch(/\[\"0[1-5]\"/);
  expect(page).not.toContain("Registros ficticios, identificados como demostración");
  expect(page).toContain("no está conectada a una planta real");
  expect(page).toContain("gt-resource-tool__links");
  for (const [section, heading] of [
    ["gt-resources-hero", "resources-hero-title"],
    ["gt-resource-routes", "resource-routes-title"],
    ["gt-resource-featured", "resource-featured-title"],
    ["gt-resource-standards", "resource-standards-title"],
  ]) {
    expect(page).toContain(`className="${section}"`);
    expect(page).toContain(`aria-labelledby="${heading}"`);
    expect(page).toContain(`id="${heading}"`);
  }
  expect(styles).toContain(".gt-resource-route__image");
  expect(styles).toContain(".gt-resource-route-grid article.gt-resource-route--home");
  expect(styles).not.toContain(".gt-resource-tool li {");
  expect(styles).toContain(".gt-resource-tool--paper h3 { color: #fff; }");
  expect(read("src/app/a11y-final.css")).toContain(".gt-resource-tool--paper p { color: #c3d4cb !important; }");
  const routeArticleStyles = styles.match(/\.gt-resource-route-grid article \{([^}]+)\}/)?.[1] ?? "";
  expect(routeArticleStyles).not.toContain("min-height");
});
