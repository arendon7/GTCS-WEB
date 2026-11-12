import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const TEXT_EXTENSIONS = /\.(?:html?|js|css|txt|xml|json|svg|webmanifest|map)$/i;

export function loadPublicProductTruthHoldbacks(manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.holdbacks)) throw new Error("Invalid public product truth manifest.");

  const seen = new Set();
  for (const item of manifest.holdbacks) {
    const { publicPath, sourcePath, sourceSha256, sku, reason } = item ?? {};
    if (typeof publicPath !== "string" || !publicPath.startsWith("/products/") || /[\\%?#]/.test(publicPath) || path.posix.normalize(publicPath) !== publicPath || publicPath.endsWith("/")) {
      throw new Error("Invalid public product asset path.");
    }
    if (typeof sourcePath !== "string" || sourcePath.startsWith("/") || /[\\%?#]/.test(sourcePath) || path.posix.normalize(sourcePath) !== sourcePath || sourcePath.startsWith("../")) {
      throw new Error("Invalid public source asset path.");
    }
    if (typeof sourceSha256 !== "string" || !/^[a-f0-9]{64}$/.test(sourceSha256)) throw new Error("Invalid public source checksum.");
    if (seen.has(publicPath) || typeof sku !== "string" || !sku.trim() || typeof reason !== "string" || !reason.trim()) {
      throw new Error("Duplicate or incomplete public product truth holdback.");
    }
    seen.add(publicPath);
  }
  return manifest.holdbacks;
}

function resolveContainedFile(root, relativePath, label) {
  const realRoot = fs.realpathSync(root);
  const target = path.resolve(realRoot, relativePath);
  const relativeTarget = path.relative(realRoot, target);
  if (!relativeTarget || relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
    throw new Error(`${label} escapes its root: ${relativePath}`);
  }
  return target;
}

function normalizeForReferenceSearch(text) {
  let normalized = text.replace(/\\\//g, "/");
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Malformed URL escapes remain searchable in their original form.
  }
  return normalized;
}

export function excludePublicProductTruthHoldbacks(outputDirectory, publicDirectory, holdbacks) {
  const outputInfo = fs.lstatSync(outputDirectory);
  if (!outputInfo.isDirectory() || outputInfo.isSymbolicLink()) throw new Error("Product truth exclusion requires a real static export directory.");
  const outputRoot = fs.realpathSync(outputDirectory);
  const publicRoot = fs.realpathSync(publicDirectory);
  const excluded = [];

  for (const item of holdbacks) {
    const sourcePath = resolveContainedFile(publicRoot, item.sourcePath, "Public source asset");
    if (!fs.statSync(sourcePath).isFile()) throw new Error(`Public source asset is missing: ${item.sourcePath}`);
    const sourceSha256 = createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex");
    if (sourceSha256 !== item.sourceSha256) throw new Error(`Public source asset changed from its holdback checksum: ${item.sourcePath}`);

    const targetPath = resolveContainedFile(outputRoot, item.publicPath.slice(1), "Static export asset");
    let targetInfo;
    try {
      targetInfo = fs.lstatSync(targetPath);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    if (!targetInfo.isFile()) throw new Error(`Product truth holdback is not a regular export file: ${item.publicPath}`);
    fs.unlinkSync(targetPath);
    excluded.push(item.publicPath);
  }

  assertNoPublicProductTruthHoldbacks(outputRoot, holdbacks);
  return excluded;
}

export function assertNoPublicProductTruthHoldbacks(outputDirectory, holdbacks) {
  const outputInfo = fs.lstatSync(outputDirectory);
  if (!outputInfo.isDirectory() || outputInfo.isSymbolicLink()) throw new Error("Product truth gate requires a real static export directory.");
  const outputRoot = fs.realpathSync(outputDirectory);
  const violations = new Set();

  for (const item of holdbacks) {
    const targetPath = resolveContainedFile(outputRoot, item.publicPath.slice(1), "Static export asset");
    if (fs.existsSync(targetPath)) violations.add(`${item.publicPath}: file is still included`);
  }

  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (entry.isFile() && TEXT_EXTENSIONS.test(entry.name)) {
        const content = normalizeForReferenceSearch(fs.readFileSync(file, "utf8"));
        for (const item of holdbacks) {
          if (content.includes(item.publicPath)) violations.add(`${item.publicPath}: referenced in ${path.relative(outputRoot, file)}`);
        }
      }
    }
  }

  inspect(outputRoot);
  if (violations.size) throw new Error(`Public product truth release BLOCKED:\n${[...violations].join("\n")}`);
}
