import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  assertNoPublicDocumentQualityHoldbacks,
  excludePublicDocumentQualityHoldbacks,
  loadDocumentQualityHoldbacks,
} from "../scripts/public-document-quality-gate.mjs";
import { assertPublicDownloadPdfSet, excludeUnlinkedPublicDownloadPdfs } from "../scripts/public-downloads-export-gate.mjs";
import { writeStaticExportProvenance } from "../scripts/static-export-provenance.mjs";

const held = [{ asset: "/downloads/held.pdf", reason: "Unreconciled formula", observedSha256: "0".repeat(64) }];
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-document-quality-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const out = path.join(root, "out");
  fs.mkdirSync(path.join(out, "downloads"), { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), "<html>Safe document links</html>");
  return { root, out };
}

test("quality hold blocks a file even when there is no download link", (t) => {
  const { out } = fixture(t);
  fs.writeFileSync(path.join(out, "downloads/held.pdf"), "%PDF-held");
  assert.throws(() => assertNoPublicDocumentQualityHoldbacks(out, held), /file is still included/);
});

test("changing a held document does not automatically approve it", (t) => {
  const { out } = fixture(t);
  fs.writeFileSync(path.join(out, "downloads/held.pdf"), "%PDF-different-content");
  assert.throws(() => assertNoPublicDocumentQualityHoldbacks(out, held), /release BLOCKED/);
});

test("quality hold blocks links even if the document is absent", (t) => {
  const { out } = fixture(t);
  fs.writeFileSync(path.join(out, "index.html"), '<a href="/downloads/held.pdf">Download</a>');
  assert.throws(() => assertNoPublicDocumentQualityHoldbacks(out, held), /referenced in index.html/);
});

test("unheld documents remain permitted", (t) => {
  const { out } = fixture(t);
  fs.writeFileSync(path.join(out, "downloads/approved.pdf"), "%PDF-approved");
  assert.doesNotThrow(() => assertNoPublicDocumentQualityHoldbacks(out, held));
});

test("static export excludes held files while preserving their public source copies", (t) => {
  const { root, out } = fixture(t);
  const sourceFile = path.join(root, "public/downloads/held.pdf");
  const exportedFile = path.join(out, "downloads/held.pdf");
  fs.mkdirSync(path.dirname(sourceFile), { recursive: true });
  fs.writeFileSync(sourceFile, "%PDF-original-source");
  fs.writeFileSync(exportedFile, "%PDF-copy-in-export");

  assert.deepEqual(excludePublicDocumentQualityHoldbacks(out, held), ["/downloads/held.pdf"]);
  assert.equal(fs.existsSync(exportedFile), false);
  assert.equal(fs.readFileSync(sourceFile, "utf8"), "%PDF-original-source");
  assert.doesNotThrow(() => assertNoPublicDocumentQualityHoldbacks(out, held));
});

test("static export exclusion refuses a downloads directory outside the export", (t) => {
  const { root, out } = fixture(t);
  const outside = path.join(root, "outside-downloads");
  fs.mkdirSync(outside);
  const outsideFile = path.join(outside, "held.pdf");
  fs.writeFileSync(outsideFile, "%PDF-outside");
  fs.rmSync(path.join(out, "downloads"), { recursive: true });
  fs.symlinkSync(outside, path.join(out, "downloads"), "dir");

  assert.throws(() => excludePublicDocumentQualityHoldbacks(out, held), /parent escapes the static export/);
  assert.equal(fs.readFileSync(outsideFile, "utf8"), "%PDF-outside");
});

test("static export keeps only PDFs linked from public HTML", (t) => {
  const { out } = fixture(t);
  const linked = path.join(out, "downloads", "public.pdf");
  const unused = path.join(out, "downloads", "internal", "source.pdf");
  fs.mkdirSync(path.dirname(unused), { recursive: true });
  fs.writeFileSync(path.join(out, "index.html"), '<a href="/downloads/public.pdf?download=1">Public guide</a>');
  fs.writeFileSync(linked, "%PDF-public");
  fs.writeFileSync(unused, "%PDF-source");

  assert.deepEqual(excludeUnlinkedPublicDownloadPdfs(out), ["/downloads/internal/source.pdf"]);
  assert.equal(fs.existsSync(linked), true);
  assert.equal(fs.existsSync(unused), false);
  assert.doesNotThrow(() => assertPublicDownloadPdfSet(out));
});

test("static export blocks missing public PDF targets", (t) => {
  const { out } = fixture(t);
  fs.writeFileSync(path.join(out, "index.html"), '<a href="/downloads/missing.pdf">Missing guide</a>');
  assert.throws(() => assertPublicDownloadPdfSet(out), /linked PDF is missing from export/);
});

test("manifest loader fails closed for missing and malformed manifests", (t) => {
  const { root } = fixture(t);
  const file = path.join(root, "quality.json");
  assert.throws(() => loadDocumentQualityHoldbacks(file));
  fs.writeFileSync(file, JSON.stringify({ version: 2, holdbacks: [] }));
  assert.throws(() => loadDocumentQualityHoldbacks(file), /Invalid document quality manifest/);
  for (const asset of ["/downloads/../outside.pdf", "/downloads/%2e%2e/outside.pdf", "/downloads/a.pdf?b", "/downloads/a\\b.pdf", "outside.pdf"]) {
    fs.writeFileSync(file, JSON.stringify({ version: 1, holdbacks: [{ asset, reason: "Held" }] }));
    assert.throws(() => loadDocumentQualityHoldbacks(file), /asset path/);
  }
});

test("manifest loader requires complete unique entries", (t) => {
  const { root } = fixture(t);
  const file = path.join(root, "quality.json");
  for (const entries of [[...held, ...held], [{ ...held[0], reason: "" }], [{ ...held[0], observedSha256: "bad" }]]) {
    fs.writeFileSync(file, JSON.stringify({ version: 1, holdbacks: entries }));
    assert.throws(() => loadDocumentQualityHoldbacks(file));
  }
  fs.writeFileSync(file, JSON.stringify({ version: 1, holdbacks: held }));
  assert.deepEqual(loadDocumentQualityHoldbacks(file), held);
});

test("Sites packaging rejects a held document before creating an archive", (t) => {
  const { root, out } = fixture(t);
  fs.mkdirSync(path.join(root, "scripts"));
  fs.mkdirSync(path.join(root, ".openai"));
  fs.mkdirSync(path.join(root, "docs/knowledge"), { recursive: true });
  for (const name of ["package-sites-export.mjs", "static-export-provenance.mjs", "public-asset-rights-gate.mjs", "public-document-quality-gate.mjs", "public-review-route-gate.mjs"]) {
    fs.copyFileSync(path.join(process.cwd(), "scripts", name), path.join(root, "scripts", name));
  }
  fs.writeFileSync(path.join(root, ".openai/hosting.json"), JSON.stringify({ project_id: "local-test", static: { directory: "out" } }));
  fs.writeFileSync(path.join(root, "docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"), JSON.stringify({ version: 1, holdbacks: [] }));
  fs.writeFileSync(path.join(root, "docs/knowledge/PUBLIC_DOCUMENT_QUALITY_HOLDBACKS.json"), JSON.stringify({ version: 1, holdbacks: held }));
  fs.writeFileSync(path.join(out, "downloads/held.pdf"), "%PDF-held");
  writeStaticExportProvenance(root, out, process.env);
  const archive = path.join(root, "must-not-exist.tar.gz");
  const result = spawnSync(process.execPath, [path.join(root, "scripts/package-sites-export.mjs")], { cwd: root, env: { ...process.env, SITES_ARCHIVE_PATH: archive }, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Document quality release BLOCKED/);
  assert.equal(fs.existsSync(archive), false);
  fs.writeFileSync(archive, "preserved previous archive");
  const retry = spawnSync(process.execPath, [path.join(root, "scripts/package-sites-export.mjs")], { cwd: root, env: { ...process.env, SITES_ARCHIVE_PATH: archive }, encoding: "utf8" });
  assert.notEqual(retry.status, 0);
  assert.match(retry.stderr, /Document quality release BLOCKED/);
  assert.equal(fs.readFileSync(archive, "utf8"), "preserved previous archive");
});
