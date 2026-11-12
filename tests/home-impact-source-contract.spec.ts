import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("homepage impact proof uses an editorial intro and an open responsive metric grid", () => {
  const source = read("src/components/home-hero.tsx");
  const styles = read("src/app/home-editorial-v2.css");
  const claims = read("src/data/claims.ts");

  expect(source).toContain('aria-labelledby="home-claims-title"');
  expect(source).toContain("Resultados de una operación en Yarumal.");
  expect(source).toContain('className="home-claims-rail__metrics"');
  expect(source).toContain('className="home-claims-rail__action"');
  expect(source).toContain("yarumalClaims.map((claim)");
  expect(styles).toContain("grid-template-columns: minmax(260px, .86fr) minmax(0, 1.4fr)");
  expect(styles).toContain("grid-template-columns: repeat(2, minmax(0, 1fr))");
  expect(styles).toContain("@media (max-width: 900px)");
  expect(styles).toContain("@media (max-width: 360px)");
  expect(styles).not.toContain(".home-claims-rail > a");
  expect(styles).not.toContain("background: #91a593");
  expect(claims).toContain("yarumalClaims");
});

test("homepage consulting visual is separate from Yarumal's proof photo", () => {
  const source = read("src/components/home-hero.tsx");
  const asset = "public/services/service-consulting-editorial.webp";
  const holdbacks = JSON.parse(read("docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"));

  expect(fs.existsSync(path.join(process.cwd(), asset))).toBe(true);
  expect(source).toContain('src="/services/service-consulting-editorial.webp"');
  expect(source).toContain('alt="Tres profesionales revisan material orgánico y una muestra en un área de compostaje."');
  expect(source).toContain("Leer materiales, proceso y contexto antes de definir cada solución");
  expect(source).not.toContain("plant-evidence-01.webp");
  expect(holdbacks.holdbacks.some((entry: { asset: string }) => entry.asset === "/services/service-consulting-editorial.webp")).toBe(false);
  expect(source).toContain("Resultados de una operación en Yarumal.");
  expect(source).toContain("Conocer resultados y método");
});
