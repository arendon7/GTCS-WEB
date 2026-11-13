import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("service editorial WebP variants replace large public JPEGs and preserve sources", () => {
  const assets = [
    {
      webp: "public/services/service-consulting-editorial.webp",
      obsolete: "public/services/service-consulting-editorial.jpg",
      source: "docs/knowledge/generated-visuals/service-consulting-editorial-source.png",
    },
    {
      webp: "public/projects/concepts/plant-engineering-concept-v1.webp",
      obsolete: "public/projects/concepts/plant-engineering-concept-v1.jpg",
      source: "docs/knowledge/generated-visuals/plant-engineering-concept-v1.png",
    },
  ];

  for (const { webp, obsolete, source } of assets) {
    assert.ok(existsSync(path.join(root, webp)), `${webp} should exist`);
    assert.ok(statSync(path.join(root, webp)).size < 500 * 1024, `${webp} should stay below 500 KB`);
    assert.ok(!existsSync(path.join(root, obsolete)), `${obsolete} should not ship`);
    assert.ok(existsSync(path.join(root, source)), `${source} should remain archived`);
  }

  const references = [
    ["src/app/servicios/page.tsx", "service-consulting-editorial.webp"],
    ["src/app/municipios/page.tsx", "service-consulting-editorial.webp"],
    ["src/app/servicios/page.tsx", "plant-engineering-concept-v1.webp"],
    ["src/data/service-visuals.ts", "plant-engineering-concept-v1.webp"],
  ];
  for (const [file, asset] of references) {
    assert.ok(readFileSync(path.join(root, file), "utf8").includes(asset), `${file} should use ${asset}`);
  }
});
