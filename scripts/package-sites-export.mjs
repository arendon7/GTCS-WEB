#!/usr/bin/env node

import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { pipeline } from "node:stream/promises";
import { assertNoPublicAssetRightsHoldbacks, loadAssetRightsHoldbacks } from "./public-asset-rights-gate.mjs";
import { assertStaticExportFresh } from "./static-export-provenance.mjs";
import { loadDocumentQualityHoldbacks, assertNoPublicDocumentQualityHoldbacks } from "./public-document-quality-gate.mjs";
import { assertNoPublicReviewRoutes, loadPublicReviewRouteHoldbacks } from "./public-review-route-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(root, ".openai", "hosting.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));
const staticDirectory = config.static?.directory;
const staticRoot = path.resolve(root, staticDirectory ?? "");
const archivePath = path.resolve(process.env.SITES_ARCHIVE_PATH ?? path.join(root, "artifacts/sites/greenatics-static-site.tar.gz"));
const temporaryArchivePath = `${archivePath}.${process.pid}.tmp`;
const rightsManifestPath = path.join(root, "docs", "knowledge", "PUBLIC_ASSET_RIGHTS_HOLDBACKS.json");
const localUrl = /https?:\/\/(?:(?:localhost|(?:127|10)\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?(?:[/?#][^\s"'<>]*)?)/i;

if (!config.project_id || !staticDirectory || staticRoot === root || !staticRoot.startsWith(`${root}${path.sep}`)) {
  throw new Error(".openai/hosting.json must define a project_id and a safe static.directory.");
}
if (!existsSync(path.join(staticRoot, "index.html"))) {
  throw new Error(`Static export is missing ${path.relative(root, path.join(staticRoot, "index.html"))}; run npm run build first.`);
}

assertStaticExportFresh(root, staticRoot);

assertNoPublicAssetRightsHoldbacks(staticRoot, loadAssetRightsHoldbacks(rightsManifestPath));
assertNoPublicDocumentQualityHoldbacks(staticRoot, loadDocumentQualityHoldbacks(path.join(root, "docs/knowledge/PUBLIC_DOCUMENT_QUALITY_HOLDBACKS.json")));
assertNoPublicReviewRoutes(staticRoot, loadPublicReviewRouteHoldbacks(path.join(root, "docs/knowledge/PUBLIC_REVIEW_ROUTE_HOLDBACKS.json")));

function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) inspect(entryPath);
    else if (/\.(?:html?|txt|json|xml|webmanifest)$/i.test(entry.name) && localUrl.test(readFileSync(entryPath, "utf8"))) {
      throw new Error(`Publishable export contains a private/local runtime URL: ${path.relative(root, entryPath)}`);
    }
  }
}
inspect(staticRoot);
mkdirSync(path.dirname(archivePath), { recursive: true });

const tarProcess = spawn("tar", ["-cf", "-", ".openai/hosting.json", staticDirectory], {
  cwd: root,
  stdio: ["ignore", "pipe", "pipe"],
});
const gzipProcess = spawn("gzip", ["-n", "-c"], { stdio: ["pipe", "pipe", "pipe"] });
const tarErrors = [];
const gzipErrors = [];
tarProcess.stderr.setEncoding("utf8").on("data", (chunk) => tarErrors.push(chunk));
gzipProcess.stderr.setEncoding("utf8").on("data", (chunk) => gzipErrors.push(chunk));

function waitForProcess(child, name, errors) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${name} exited with ${signal || code}: ${errors.join("")}`));
    });
  });
}

let archiveReplaced = false;
try {
  const packResults = await Promise.allSettled([
    pipeline(tarProcess.stdout, gzipProcess.stdin),
    pipeline(gzipProcess.stdout, createWriteStream(temporaryArchivePath)),
    waitForProcess(tarProcess, "tar", tarErrors),
    waitForProcess(gzipProcess, "gzip", gzipErrors),
  ]);
  const packingFailure = packResults.find((result) => result.status === "rejected");
  if (packingFailure?.status === "rejected") throw packingFailure.reason;

  const listing = spawnSync("tar", ["-tzf", temporaryArchivePath], { encoding: "utf8" });
  if (listing.status !== 0) throw new Error(listing.stderr || "Could not inspect generated archive.");
  const entries = listing.stdout.split(/\r?\n/);
  if (!entries.includes(".openai/hosting.json") || !entries.includes(`${staticDirectory}/index.html`)) {
    throw new Error("Generated archive does not contain the Sites config and static index at their configured paths.");
  }

  const digest = createHash("sha256");
  await new Promise((resolve, reject) => {
    const stream = createReadStream(temporaryArchivePath);
    stream.on("data", (chunk) => digest.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  renameSync(temporaryArchivePath, archivePath);
  archiveReplaced = true;

  console.log(`Static Sites archive ready: ${path.relative(root, archivePath)}`);
  console.log(`Configured project: ${config.project_id}`);
  console.log(`Static entrypoint: ${staticDirectory}/index.html`);
  console.log(`Archive size: ${(statSync(archivePath).size / 1024 / 1024).toFixed(1)} MiB`);
  console.log(`SHA-256: ${digest.digest("hex")}`);
  console.log("This packages static files only. Saving a Sites version still requires the matching pushed source commit and the correct account/site.");
} finally {
  if (!archiveReplaced && existsSync(temporaryArchivePath)) unlinkSync(temporaryArchivePath);
}
