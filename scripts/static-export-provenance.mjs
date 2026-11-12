#!/usr/bin/env node

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const provenanceRelativePath = "artifacts/greenatics-static-export-provenance.json";
const sourceDirectories = ["src", "public"];
const sourceFiles = [
  ".openai/hosting.json",
  "next.config.ts",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "scripts/build-sites-preview.mjs",
  "scripts/preview-build-capacity.mjs",
  "scripts/normalize-static-export.mjs",
  "scripts/static-export-provenance.mjs",
];

function hashFiles(root, files, label) {
  const hash = createHash("sha256");
  for (const relativePath of files.sort()) {
    hash.update(`${relativePath}\0`);
    hash.update(fs.readFileSync(path.join(root, relativePath)));
    hash.update("\0");
  }
  return { digest: hash.digest("hex"), count: files.length, label };
}

function collectFiles(root, directories) {
  const files = [];
  const visit = (relativeDirectory) => {
    const absoluteDirectory = path.join(root, relativeDirectory);
    if (!fs.existsSync(absoluteDirectory)) return;
    for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
      const relativePath = path.posix.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) visit(relativePath);
      else if (entry.isFile()) files.push(relativePath);
      else if (entry.isSymbolicLink()) {
        files.push(relativePath);
      }
    }
  };
  for (const directory of directories) visit(directory);
  return files;
}

function collectEnvironmentFiles(root) {
  return fs.readdirSync(root)
    .filter((name) => /^\.env(?:\..+)?$/.test(name) && fs.statSync(path.join(root, name)).isFile())
    .sort();
}

function collectPublicBuildEnvironment(environment) {
  return Object.fromEntries(
    Object.entries(environment)
      .filter(([key]) => key === "NODE_ENV" || key.startsWith("NEXT_PUBLIC_"))
      .sort(([left], [right]) => left.localeCompare(right)),
  );
}

function fingerprintHtml(outputDirectory) {
  if (!fs.existsSync(outputDirectory)) throw new Error(`Static export not found: ${outputDirectory}`);
  const files = [];
  const visit = (directory, relativeDirectory = "") => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.posix.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) visit(absolutePath, relativePath);
      else if (entry.isFile() && entry.name.endsWith(".html")) files.push(relativePath);
    }
  };
  visit(outputDirectory);
  if (files.length === 0) throw new Error(`Static export contains no HTML pages: ${outputDirectory}`);
  const hash = createHash("sha256");
  for (const relativePath of files.sort()) {
    hash.update(`${relativePath}\0`);
    hash.update(fs.readFileSync(path.join(outputDirectory, relativePath)));
    hash.update("\0");
  }
  return { digest: hash.digest("hex"), count: files.length };
}

export function createStaticExportProvenance(root = process.cwd(), outputDirectory = path.join(root, "out"), environment = process.env) {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.resolve(outputDirectory);
  const trackedFiles = [
    ...collectFiles(resolvedRoot, sourceDirectories),
    ...sourceFiles.filter((file) => fs.existsSync(path.join(resolvedRoot, file))),
    ...collectEnvironmentFiles(resolvedRoot),
  ];
  const uniqueTrackedFiles = [...new Set(trackedFiles)].sort();
  const sourceHash = hashFiles(resolvedRoot, uniqueTrackedFiles, "sources");
  const environmentHash = createHash("sha256")
    .update(JSON.stringify(collectPublicBuildEnvironment(environment)))
    .digest("hex");
  const html = fingerprintHtml(resolvedOutput);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceSha256: sourceHash.digest,
    sourceFileCount: sourceHash.count,
    publicEnvironmentSha256: environmentHash,
    htmlSha256: html.digest,
    htmlFileCount: html.count,
  };
}

export function writeStaticExportProvenance(root = process.cwd(), outputDirectory = path.join(root, "out"), environment = process.env) {
  const resolvedRoot = path.resolve(root);
  const manifestPath = path.join(resolvedRoot, provenanceRelativePath);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(createStaticExportProvenance(resolvedRoot, outputDirectory, environment), null, 2)}\n`, { mode: 0o600 });
  return manifestPath;
}

export function assertStaticExportFresh(root = process.cwd(), outputDirectory = path.join(root, "out"), environment = process.env) {
  const resolvedRoot = path.resolve(root);
  const manifestPath = path.join(resolvedRoot, provenanceRelativePath);
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Static export provenance is missing; regenerate the export before auditing or packaging (${provenanceRelativePath}).`);
  }

  let saved;
  try {
    saved = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    throw new Error(`Static export provenance is unreadable: ${provenanceRelativePath}.`);
  }
  if (saved.schemaVersion !== 1) throw new Error(`Unsupported static export provenance schema: ${saved.schemaVersion}.`);

  const current = createStaticExportProvenance(resolvedRoot, outputDirectory, environment);
  if (saved.sourceSha256 !== current.sourceSha256) {
    throw new Error("Static export is stale: tracked source or public build environment changed after generation.");
  }
  if (saved.publicEnvironmentSha256 !== current.publicEnvironmentSha256) {
    throw new Error("Static export is stale: tracked source or public build environment changed after generation.");
  }
  if (saved.htmlSha256 !== current.htmlSha256 || saved.htmlFileCount !== current.htmlFileCount) {
    throw new Error("Static export content changed after its provenance was recorded; regenerate before auditing or packaging.");
  }
  return current;
}
