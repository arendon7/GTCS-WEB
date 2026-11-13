import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { writeStaticExportProvenance } from "../scripts/static-export-provenance.mjs";

const projectRoot = process.cwd();
const auditScript = path.join(projectRoot, "scripts", "audit-static.mjs");
const serviceRoutes = [
  "diagnostico-residuos",
  "pgirs-pmirs",
  "microrrutas-motocarguero",
  "plantas-modulares",
  "operacion-delegada",
  "greenatics-ops",
  "aprovechamiento-productivo",
  "programas-wondergreen",
  "recoleccion-tratamiento",
  "rehabilitacion-infraestructura",
  "optimizacion-composteras",
];

function writePage(outputRoot, route, { imageAttributes = 'alt="Imagen del servicio"', extraMarkup = "" } = {}) {
  const segments = route.split("/").filter(Boolean);
  const directory = path.join(outputRoot, ...segments);
  fs.mkdirSync(directory, { recursive: true });
  const html = `<!doctype html><html lang="es"><head><meta name="description" content="Página de prueba"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://greenatics.example${route}"></head><body><main><h1>Servicio</h1><figure><img ${imageAttributes}></figure>${extraMarkup}</main></body></html>`;
  fs.writeFileSync(path.join(directory, "index.html"), html);
}

function createAuditFixture(directory) {
  const outputRoot = path.join(directory, "out");
  fs.mkdirSync(outputRoot, { recursive: true });

  writePage(outputRoot, "/");
  for (const slug of serviceRoutes) writePage(outputRoot, `/servicios/${slug}/`);

  fs.writeFileSync(path.join(outputRoot, "robots.txt"), "User-agent: *\nAllow: /\n");
  fs.writeFileSync(path.join(outputRoot, "manifest.webmanifest"), "{}");
  fs.writeFileSync(
    path.join(outputRoot, "sitemap.xml"),
    "<urlset><url><loc>https://greenatics.example/</loc></url></urlset>",
  );

  const contactSource = path.join(directory, "src", "components", "interactive-contact-form.tsx");
  fs.mkdirSync(path.dirname(contactSource), { recursive: true });
  fs.writeFileSync(contactSource, "const contactContexts = {} as const satisfies Record<string, ContactContext>;");

  return outputRoot;
}

function runAudit(cwd, { refreshProvenance = true } = {}) {
  if (refreshProvenance) writeStaticExportProvenance(cwd, path.join(cwd, "out"));
  return spawnSync(process.execPath, [auditScript], { cwd, encoding: "utf8" });
}

test("static audit rejects internal visual notes in rendered markup and visible copy", (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-audit-copy-"));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  const outputRoot = createAuditFixture(fixture);

  const baseline = runAudit(fixture);
  assert.equal(baseline.status, 0, baseline.stderr);

  const internalNote = "Escena editorial ilustrativa que no documenta un caso";
  for (const attribute of ["alt", "title", "aria-label"]) {
    writePage(outputRoot, "/", { imageAttributes: `${attribute}="${internalNote}"` });
    const leakedNote = runAudit(fixture);
    assert.equal(leakedNote.status, 1, `${attribute} should fail the audit`);
    assert.match(leakedNote.stderr, /internal or provisional copy detected \(visual production note\)/);
  }

  const compositionNote = "composición editorial de productos Wondergreen y su contexto de uso";
  writePage(outputRoot, "/", { imageAttributes: `alt="${compositionNote}"` });
  const leakedCompositionNote = runAudit(fixture);
  assert.equal(leakedCompositionNote.status, 1, "image composition notes should fail the audit");
  assert.match(leakedCompositionNote.stderr, /internal or provisional copy detected \(visual production note\)/);

  writePage(outputRoot, "/", { extraMarkup: `<p>${compositionNote}</p>` });
  const leakedCompositionCopy = runAudit(fixture);
  assert.equal(leakedCompositionCopy.status, 1, "visible composition notes should fail the audit");
  assert.match(leakedCompositionCopy.stderr, /internal or provisional copy detected \(visual production note\)/);

  writePage(outputRoot, "/", { extraMarkup: "<figcaption>2FRUIT · etapa productiva · Escena de cultivo</figcaption>" });
  const leakedSceneLabel = runAudit(fixture);
  assert.equal(leakedSceneLabel.status, 1, "generic production labels should fail the audit");
  assert.match(leakedSceneLabel.stderr, /internal or provisional copy detected \(visual production note\)/);

  writePage(outputRoot, "/", { extraMarkup: `<p>${internalNote}</p>` });
  const leakedVisibleCopy = runAudit(fixture);
  assert.equal(leakedVisibleCopy.status, 1, "visible body copy should fail the audit");
  assert.match(leakedVisibleCopy.stderr, /internal or provisional copy detected \(visual production note\)/);

  for (const productionNote of [
    "Registro fotográfico · Támesis",
    "Registro fotográfico del proceso de Támesis",
    "Registro fotográfico de la ruta selectiva en Támesis",
    "Vista aérea de infraestructura documentada en el proyecto Támesis",
    "Reactor UASB de la infraestructura de tratamiento anaerobio documentada en Támesis",
  ]) {
    writePage(outputRoot, "/", { extraMarkup: `<figcaption>${productionNote}</figcaption>` });
    const leakedProductionNote = runAudit(fixture);
    assert.equal(leakedProductionNote.status, 1, `${productionNote} should fail the audit`);
    assert.match(leakedProductionNote.stderr, /internal or provisional copy detected \(visual production note\)/);
  }

  writePage(outputRoot, "/", { extraMarkup: "<p>Registro fotográfico de aplicación</p>" });
  const productFeature = runAudit(fixture);
  assert.equal(productFeature.status, 0, productFeature.stderr);

  writePage(outputRoot, "/", {
    extraMarkup: '<script>"escena editorial ilustrativa"</script><!-- nota interna: escena editorial --><style>.note{content:"imagen generada con IA"}</style>',
  });
  const nonRenderedNotes = runAudit(fixture);
  assert.equal(nonRenderedNotes.status, 0, nonRenderedNotes.stderr);
});

test("static audit blocks stale exports before reporting content findings", (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-audit-stale-"));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  const outputRoot = createAuditFixture(fixture);
  writeStaticExportProvenance(fixture, outputRoot);

  writePage(outputRoot, "/", { extraMarkup: "<p>New source render that was not in the recorded export</p>" });
  const staleOutput = runAudit(fixture, { refreshProvenance: false });

  assert.equal(staleOutput.status, 1);
  assert.match(staleOutput.stderr, /Static QA BLOCKED: Static export content changed after its provenance was recorded/);
  assert.doesNotMatch(staleOutput.stderr, /internal or provisional copy detected/);
});
