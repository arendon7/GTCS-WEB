import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([
  ".css", ".html", ".js", ".json", ".jsx", ".mjs", ".scss", ".svg", ".ts", ".tsx", ".txt", ".webmanifest", ".xml",
]);

export function loadAssetRightsHoldbacks(manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (!Array.isArray(manifest.holdbacks)) {
    throw new Error("Asset rights manifest must contain a holdbacks array.");
  }

  for (const item of manifest.holdbacks) {
    if (!item || typeof item.asset !== "string" || !item.asset.startsWith("/") || !item.reason || !item.source) {
      throw new Error("Each asset rights holdback must define an absolute public asset path, reason, and source.");
    }
  }

  return manifest.holdbacks;
}

function decodeRepeatedly(value) {
  const variants = [value];
  let current = value;

  for (let index = 0; index < 3; index += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      variants.push(next);
      current = next;
    } catch {
      break;
    }
  }

  return variants;
}

function collectTextFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collectTextFiles(entryPath, files);
    else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(entryPath);
  }
  return files;
}

export function findPublicAssetRightsHoldbacks(staticRoot, holdbacks) {
  const root = path.resolve(staticRoot);
  if (!existsSync(root)) throw new Error(`Static export does not exist: ${root}`);

  const texts = collectTextFiles(root).map((file) => ({
    file,
    variants: decodeRepeatedly(readFileSync(file, "utf8")),
  }));
  const matches = [];

  for (const item of holdbacks) {
    const relativeAsset = item.asset.slice(1);
    const bundledPath = path.resolve(root, relativeAsset);
    if (!bundledPath.startsWith(`${root}${path.sep}`)) {
      throw new Error(`Unsafe public asset path in rights manifest: ${item.asset}`);
    }

    const bundled = existsSync(bundledPath);
    const reference = texts.find(({ variants }) => variants.some((text) => text.includes(item.asset)));
    if (bundled || reference) {
      matches.push({
        ...item,
        bundled,
        referencedIn: reference ? path.relative(root, reference.file) : null,
      });
    }
  }

  return matches;
}

export function findSourceAssetRightsHoldbacks(sourceRoot, publicRoot, holdbacks) {
  const source = path.resolve(sourceRoot);
  const publicDirectory = path.resolve(publicRoot);
  if (!existsSync(source)) throw new Error(`Source directory does not exist: ${source}`);
  if (!existsSync(publicDirectory)) throw new Error(`Public directory does not exist: ${publicDirectory}`);

  const texts = collectTextFiles(source).map((file) => ({
    file,
    variants: decodeRepeatedly(readFileSync(file, "utf8")),
  }));

  return holdbacks.flatMap((item) => {
    const relativeAsset = item.asset.slice(1);
    const publicFile = path.resolve(publicDirectory, relativeAsset);
    if (!publicFile.startsWith(`${publicDirectory}${path.sep}`)) {
      throw new Error(`Unsafe public asset path in rights manifest: ${item.asset}`);
    }

    const referencedIn = texts
      .filter(({ variants }) => variants.some((text) => text.includes(item.asset)))
      .map(({ file }) => path.relative(source, file));
    const bundled = existsSync(publicFile);
    return bundled || referencedIn.length > 0 ? [{ ...item, bundled, referencedIn }] : [];
  });
}

export function assertNoPublicAssetRightsHoldbacks(staticRoot, holdbacks) {
  const matches = findPublicAssetRightsHoldbacks(staticRoot, holdbacks);
  if (matches.length === 0) return;

  const details = matches.map(({ asset, reason, bundled, referencedIn }) => {
    const evidence = [bundled ? "bundled" : null, referencedIn ? `referenced in ${referencedIn}` : null]
      .filter(Boolean)
      .join("; ");
    return `- ${asset} (${evidence}): ${reason}`;
  });

  throw new Error(`Sites package blocked: ${matches.length} asset(s) have unresolved external-use rights.\n${details.join("\n")}`);
}

export function assertNoSourceAssetRightsHoldbacks(sourceRoot, publicRoot, holdbacks) {
  const matches = findSourceAssetRightsHoldbacks(sourceRoot, publicRoot, holdbacks);
  if (matches.length === 0) return;

  const details = matches.map(({ asset, reason, bundled, referencedIn }) => {
    const evidence = [
      bundled ? "present in public/" : null,
      referencedIn.length > 0 ? `referenced in ${referencedIn.join(", ")}` : null,
    ].filter(Boolean).join("; ");
    return `- ${asset} (${evidence}): ${reason}`;
  });

  throw new Error(`Source rights preflight blocked: ${matches.length} asset(s) have unresolved external-use rights.\n${details.join("\n")}`);
}
