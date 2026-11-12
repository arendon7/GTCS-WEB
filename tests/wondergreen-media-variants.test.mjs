import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const publicProducts = path.join(root, "public/products");

test("Wondergreen editorial variants stay lightweight and preserve their sources", () => {
  const assets = [
    ["wondergreen-catalog-editorial-v1.webp", "wondergreen-catalog-editorial-v1-og.jpg"],
    ["wondergreen-program-coffee-editorial-v1.webp", "wondergreen-program-coffee-editorial-v1-og.jpg"],
    ["wondergreen-soil-roots-editorial.webp", "wondergreen-soil-roots-editorial-og.jpg"],
  ];

  for (const pair of assets) {
    for (const asset of pair) {
      const assetPath = path.join(publicProducts, asset);
      assert.ok(existsSync(assetPath), `${asset} should exist in public/products`);
      assert.ok(statSync(assetPath).size < 600 * 1024, `${asset} should stay below 600 KB`);
    }
  }

  for (const source of [
    "wondergreen-catalog-editorial-v1-source.png",
    "wondergreen-program-coffee-editorial-v1.png",
    "wondergreen-soil-roots-editorial-source.png",
  ]) {
    assert.ok(
      existsSync(path.join(root, "docs/knowledge/generated-visuals", source)),
      `${source} should remain archived`,
    );
  }

  for (const obsolete of [
    "wondergreen-catalog-editorial-v1.png",
    "wondergreen-program-coffee-editorial-v1.jpg",
    "wondergreen-soil-roots-editorial.jpg",
  ]) {
    assert.ok(!existsSync(path.join(publicProducts, obsolete)), `${obsolete} should not ship from public/`);
  }
});

test("public Wondergreen views use WebP while social previews use JPEG", () => {
  const expectations = [
    ["src/app/servicios/[slug]/page.tsx", "wondergreen-catalog-editorial-v1.webp"],
    ["src/app/biblioteca/catalogo-wondergreen/page.tsx", "wondergreen-catalog-editorial-v1.webp"],
    ["src/app/recursos/page.tsx", "wondergreen-program-coffee-editorial-v1.webp"],
    ["src/data/portfolio.ts", "wondergreen-soil-roots-editorial.webp"],
    ["src/app/nosotros/page.tsx", "wondergreen-soil-roots-editorial.webp"],
    ["src/app/casa-jardin/page.tsx", "wondergreen-soil-roots-editorial.webp"],
    ["src/app/wondergreen/page.tsx", "wondergreen-soil-roots-editorial.webp"],
    ["src/app/biblioteca/catalogo-wondergreen/page.tsx", "wondergreen-catalog-editorial-v1-og.jpg"],
    ["src/app/casa-jardin/page.tsx", "wondergreen-soil-roots-editorial-og.jpg"],
    ["src/app/wondergreen/page.tsx", "wondergreen-soil-roots-editorial-og.jpg"],
  ];

  for (const [file, asset] of expectations) {
    assert.ok(readFileSync(path.join(root, file), "utf8").includes(asset), `${file} should reference ${asset}`);
  }
});
