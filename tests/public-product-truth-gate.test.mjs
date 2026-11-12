import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertNoPublicProductTruthHoldbacks,
  excludePublicProductTruthHoldbacks,
  loadPublicProductTruthHoldbacks,
} from "../scripts/public-product-truth-gate.mjs";

const publicPath = "/products/wondergreen-cropper-ref-bioinput-trichoderma.jpg";
const holdback = {
  publicPath,
  sourcePath: publicPath.slice(1),
  sourceSha256: createHash("sha256").update("preserved source image").digest("hex"),
  sku: "bioinsumo-trichoderma",
  reason: "Visible label is not reconciled with current Product Truth.",
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "product-truth-holdback-"));
  const output = path.join(root, "out");
  const publicDirectory = path.join(root, "public");
  fs.mkdirSync(path.join(output, "products"), { recursive: true });
  fs.mkdirSync(path.join(publicDirectory, "products"), { recursive: true });
  fs.writeFileSync(path.join(output, publicPath.slice(1)), "held output image");
  fs.writeFileSync(path.join(publicDirectory, holdback.sourcePath), "preserved source image");
  return { root, output, publicDirectory };
}

test("static export holdback removes only the output copy and preserves the original", () => {
  const paths = fixture();
  try {
    const excluded = excludePublicProductTruthHoldbacks(paths.output, paths.publicDirectory, [holdback]);
    assert.deepEqual(excluded, [publicPath]);
    assert.equal(fs.existsSync(path.join(paths.output, publicPath.slice(1))), false);
    assert.equal(fs.readFileSync(path.join(paths.publicDirectory, holdback.sourcePath), "utf8"), "preserved source image");
    assertNoPublicProductTruthHoldbacks(paths.output, [holdback]);
  } finally {
    fs.rmSync(paths.root, { recursive: true, force: true });
  }
});

test("static export gate rejects a retained encoded reference", () => {
  const paths = fixture();
  try {
    fs.writeFileSync(path.join(paths.output, "index.html"), `<img src="%2F${publicPath.slice(1)}">`);
    assert.throws(
      () => excludePublicProductTruthHoldbacks(paths.output, paths.publicDirectory, [holdback]),
      /referenced in index\.html/,
    );
  } finally {
    fs.rmSync(paths.root, { recursive: true, force: true });
  }
});

test("static export gate refuses to proceed if the preserved source asset changes", () => {
  const paths = fixture();
  try {
    fs.writeFileSync(path.join(paths.publicDirectory, holdback.sourcePath), "changed source image");
    assert.throws(
      () => excludePublicProductTruthHoldbacks(paths.output, paths.publicDirectory, [holdback]),
      /changed from its holdback checksum/,
    );
    assert.equal(fs.existsSync(path.join(paths.output, publicPath.slice(1))), true);
  } finally {
    fs.rmSync(paths.root, { recursive: true, force: true });
  }
});

test("manifest loader rejects traversal and incomplete holdback records", () => {
  const paths = fixture();
  const manifest = path.join(paths.root, "manifest.json");
  try {
    fs.writeFileSync(manifest, JSON.stringify({ version: 1, holdbacks: [holdback] }));
    assert.deepEqual(loadPublicProductTruthHoldbacks(manifest), [holdback]);
    fs.writeFileSync(manifest, JSON.stringify({ version: 1, holdbacks: [{ ...holdback, sourcePath: "../outside.jpg" }] }));
    assert.throws(() => loadPublicProductTruthHoldbacks(manifest), /Invalid public source asset path/);
  } finally {
    fs.rmSync(paths.root, { recursive: true, force: true });
  }
});
