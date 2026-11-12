import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { evaluatePreviewCapacity, measurePublicBytes, previewCapacityRequirement, PREVIEW_BUILD_RESERVE_BYTES } from "../scripts/preview-build-capacity.mjs";

test("capacity covers two asset copies and a fixed reserve without counting a build as passed", () => {
  assert.equal(previewCapacityRequirement(500), PREVIEW_BUILD_RESERVE_BYTES + 1000);
  assert.equal(evaluatePreviewCapacity(PREVIEW_BUILD_RESERVE_BYTES + 999, 500).sufficient, false);
  assert.equal(evaluatePreviewCapacity(PREVIEW_BUILD_RESERVE_BYTES + 1000, 500).sufficient, true);
});
test("invalid and unknown capacity fails closed", () => {
  for (const value of [-1, NaN, Infinity, undefined, 0.5]) {
    assert.throws(() => evaluatePreviewCapacity(value, 0));
    assert.throws(() => previewCapacityRequirement(value));
  }
  assert.throws(() => previewCapacityRequirement(Number.MAX_SAFE_INTEGER));
});
test("linked public roots and nested files are measured without writing or removing them", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-capacity-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = path.join(root, "source");
  fs.mkdirSync(path.join(source, "nested"), { recursive: true });
  fs.writeFileSync(path.join(source, "one"), "123");
  fs.writeFileSync(path.join(source, "nested/two"), "12345");
  const linked = path.join(root, "public");
  fs.symlinkSync(source, linked, "dir");
  assert.equal(measurePublicBytes(linked), 8);
  assert.equal(fs.readFileSync(path.join(source, "one"), "utf8"), "123");
  fs.symlinkSync(source, path.join(source, "nested/cycle"), "dir");
  assert.throws(() => measurePublicBytes(linked), /Nested public directory links/);
});
test("missing public folder has no asset allocation but still requires the reserve", () => {
  assert.equal(measurePublicBytes(path.join(os.tmpdir(), "greenatics-not-a-real-public-folder")), 0);
  assert.equal(evaluatePreviewCapacity(0, 0).sufficient, false);
});
test("pipeline runs capacity protection before moving out or starting Next", () => {
  const script = fs.readFileSync(new URL("../scripts/build-sites-preview.mjs", import.meta.url), "utf8");
  const call = script.indexOf("assertPreviewBuildCapacity(root);");
  assert.ok(call > script.indexOf('import { assertPreviewBuildCapacity }'));
  assert.ok(call < script.indexOf("renameSync(outputDir, backupDir)"));
  assert.ok(call < script.indexOf('runNodeScript(nextCli, ["build", "--webpack"])'));
  assert.ok(call < script.indexOf("rmSync(backupDir"));
});

test("a simulated full disk stops the real pipeline without moving existing output or running Next", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-capacity-pipeline-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, "node_modules/next/dist/bin"), { recursive: true });
  fs.mkdirSync(path.join(root, "out"));
  fs.writeFileSync(path.join(root, "out/keep.html"), "existing approved output");
  for (const file of ["build-sites-preview.mjs", "preview-build-capacity.mjs"]) {
    fs.copyFileSync(new URL("../scripts/" + file, import.meta.url), path.join(root, "scripts", file));
  }
  for (const file of ["normalize-static-export.mjs", "check-tool-contracts.mjs", "audit-static.mjs", "check-public-output.mjs"]) {
    fs.writeFileSync(path.join(root, "scripts", file), "throw new Error('must not run');");
  }
  fs.writeFileSync(path.join(root, "node_modules/next/dist/bin/next"), "require('node:fs').writeFileSync('next-started', 'unexpected');");
  const injection = "import fs from 'node:fs';fs.statfsSync=()=>({bavail:0,bsize:4096});";
  const result = spawnSync(process.execPath, ["--import", "data:text/javascript," + encodeURIComponent(injection), path.join(root, "scripts/build-sites-preview.mjs")], { cwd: root, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Preview build capacity BLOCKED/);
  assert.equal(fs.readFileSync(path.join(root, "out/keep.html"), "utf8"), "existing approved output");
  assert.equal(fs.existsSync(path.join(root, "next-started")), false);
  assert.equal(fs.readdirSync(root).some((file) => file.startsWith(".out-backup-")), false);
});
