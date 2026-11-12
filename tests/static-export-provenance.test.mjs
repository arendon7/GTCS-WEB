import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assertStaticExportFresh, writeStaticExportProvenance } from "../scripts/static-export-provenance.mjs";

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-export-provenance-"));
  const source = path.join(root, "src", "page.tsx");
  const asset = path.join(root, "public", "mark.svg");
  const html = path.join(root, "out", "index.html");
  fs.mkdirSync(path.dirname(source), { recursive: true });
  fs.mkdirSync(path.dirname(asset), { recursive: true });
  fs.mkdirSync(path.dirname(html), { recursive: true });
  fs.writeFileSync(source, "export default function Page() { return <main />; }");
  fs.writeFileSync(asset, "<svg></svg>");
  fs.writeFileSync(html, "<!doctype html><html><body><main>Current export</main></body></html>");
  return { root, source, html };
}

test("provenance accepts an unchanged static export", (t) => {
  const fixture = createFixture();
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  writeStaticExportProvenance(fixture.root, path.join(fixture.root, "out"), { NODE_ENV: "production" });

  assert.equal(
    assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), { NODE_ENV: "production" }).htmlFileCount,
    1,
  );
});

test("provenance rejects source changes after export", (t) => {
  const fixture = createFixture();
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  writeStaticExportProvenance(fixture.root, path.join(fixture.root, "out"), {});
  fs.appendFileSync(fixture.source, "\n// changed");

  assert.throws(
    () => assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), {}),
    /Static export is stale: tracked source or public build environment changed/,
  );
});

test("provenance rejects edited HTML after recording", (t) => {
  const fixture = createFixture();
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  writeStaticExportProvenance(fixture.root, path.join(fixture.root, "out"), {});
  fs.appendFileSync(fixture.html, "<!-- modified -->");

  assert.throws(
    () => assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), {}),
    /Static export content changed after its provenance was recorded/,
  );
});

test("provenance rejects a build environment change", (t) => {
  const fixture = createFixture();
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  writeStaticExportProvenance(fixture.root, path.join(fixture.root, "out"), { NODE_ENV: "production" });

  assert.throws(
    () => assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), { NODE_ENV: "development" }),
    /Static export is stale: tracked source or public build environment changed/,
  );
});

test("provenance requires a manifest before static QA", (t) => {
  const fixture = createFixture();
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));

  assert.throws(
    () => assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), {}),
    /Static export provenance is missing/,
  );
});

test("provenance tracks the capacity dependency used by the build pipeline", (t) => {
  const fixture = createFixture();
  t.after(() => fs.rmSync(fixture.root, { recursive: true, force: true }));
  const dependency = path.join(fixture.root, "scripts/preview-build-capacity.mjs");
  fs.mkdirSync(path.dirname(dependency), { recursive: true });
  fs.writeFileSync(dependency, "export const reserve = 2;");
  writeStaticExportProvenance(fixture.root, path.join(fixture.root, "out"), {});
  assert.doesNotThrow(() => assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), {}));
  fs.appendFileSync(dependency, "\n// capacity policy changed");
  assert.throws(() => assertStaticExportFresh(fixture.root, path.join(fixture.root, "out"), {}), /Static export is stale/);
});
