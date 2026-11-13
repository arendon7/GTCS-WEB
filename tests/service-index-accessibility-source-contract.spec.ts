import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

test("related service paths are named contextually without a generic table-row label", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/app/servicios/page.tsx"), "utf8");

  expect(source).toContain("aria-labelledby={`service-category-${categoryAnchors[category]}-heading`}");
  expect(source).toContain('id={`service-category-${categoryAnchors[category]}-heading`}>{content.title}</h2>');
  expect(source).toContain('<aside\n                className="gt-service-category__related"\n                aria-label={`Rutas que complementan: ${content.title}`}');
  expect(source).toContain('<p className="gt-service-category__related-entry" id={service.id} key={service.href}>');
  expect(source).not.toContain(">Servicio relacionado</span>");
  expect(source).not.toContain("gt-service-category__related-entry small");
});
