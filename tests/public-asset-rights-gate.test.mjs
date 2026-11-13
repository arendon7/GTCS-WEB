import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertNoPublicAssetRightsHoldbacks,
  assertNoSourceAssetRightsHoldbacks,
  findPublicAssetRightsHoldbacks,
  findSourceAssetRightsHoldbacks,
  loadAssetRightsHoldbacks,
} from "../scripts/public-asset-rights-gate.mjs";

const heldAsset = {
  asset: "/projects/plant/archive.webp",
  reason: "External reproduction permission is unresolved.",
  source: "docs/knowledge/VISUAL_ASSET_SOURCES.md",
};

function withFixture(run) {
  const root = mkdtempSync(path.join(os.tmpdir(), "greenatics-asset-rights-"));
  try {
    run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("blocks packaging when an unresolved asset is bundled, even if unused", () => {
  withFixture((root) => {
    const assetPath = path.join(root, heldAsset.asset.slice(1));
    mkdirSync(path.dirname(assetPath), { recursive: true });
    writeFileSync(assetPath, "fixture image");

    const matches = findPublicAssetRightsHoldbacks(root, [heldAsset]);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].bundled, true);
    assert.throws(() => assertNoPublicAssetRightsHoldbacks(root, [heldAsset]), /Sites package blocked/);
  });
});

test("blocks encoded references even if the held asset file is absent", () => {
  withFixture((root) => {
    mkdirSync(path.join(root, "assets"), { recursive: true });
    writeFileSync(path.join(root, "assets/page.html"), "<img src=\"%2Fprojects%2Fplant%2Farchive.webp\">");

    const matches = findPublicAssetRightsHoldbacks(root, [heldAsset]);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].bundled, false);
    assert.equal(matches[0].referencedIn, "assets/page.html");
  });
});

test("allows clean exports and validates the manifest", () => {
  withFixture((root) => {
    writeFileSync(path.join(root, "index.html"), "<main>Public page</main>");
    assert.doesNotThrow(() => assertNoPublicAssetRightsHoldbacks(root, [heldAsset]));
  });

  withFixture((root) => {
    const manifestPath = path.join(root, "manifest.json");
    writeFileSync(manifestPath, JSON.stringify({ holdbacks: [heldAsset] }));
    assert.deepEqual(loadAssetRightsHoldbacks(manifestPath), [heldAsset]);
    writeFileSync(manifestPath, JSON.stringify({ holdbacks: [{ asset: "../outside.webp", reason: "x", source: "y" }] }));
    assert.throws(() => loadAssetRightsHoldbacks(manifestPath), /absolute public asset path/);
  });
});

test("source preflight reports every held-asset reference and bundled source file", () => {
  withFixture((root) => {
    const sourceRoot = path.join(root, "src");
    const publicRoot = path.join(root, "public");
    mkdirSync(path.join(sourceRoot, "app"), { recursive: true });
    mkdirSync(path.dirname(path.join(publicRoot, heldAsset.asset.slice(1))), { recursive: true });
    writeFileSync(path.join(sourceRoot, "app/page.tsx"), `<Image src="${heldAsset.asset}" />`);
    writeFileSync(path.join(sourceRoot, "app/other.tsx"), `<img src="%2Fprojects%2Fplant%2Farchive.webp" />`);
    writeFileSync(path.join(publicRoot, heldAsset.asset.slice(1)), "fixture image");

    const matches = findSourceAssetRightsHoldbacks(sourceRoot, publicRoot, [heldAsset]);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].bundled, true);
    assert.deepEqual(matches[0].referencedIn.sort(), ["app/other.tsx", "app/page.tsx"]);
    assert.throws(
      () => assertNoSourceAssetRightsHoldbacks(sourceRoot, publicRoot, [heldAsset]),
      /Source rights preflight blocked: 1 asset/,
    );
  });
});

test("source preflight passes when held assets are absent and unreferenced", () => {
  withFixture((root) => {
    const sourceRoot = path.join(root, "src");
    const publicRoot = path.join(root, "public");
    mkdirSync(sourceRoot, { recursive: true });
    mkdirSync(publicRoot, { recursive: true });
    writeFileSync(path.join(sourceRoot, "page.tsx"), "<main>Clean source</main>");

    assert.deepEqual(findSourceAssetRightsHoldbacks(sourceRoot, publicRoot, [heldAsset]), []);
    assert.doesNotThrow(() => assertNoSourceAssetRightsHoldbacks(sourceRoot, publicRoot, [heldAsset]));
  });
});
