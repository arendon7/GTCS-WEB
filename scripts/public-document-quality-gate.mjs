import fs from "node:fs";
import path from "node:path";

export function loadDocumentQualityHoldbacks(manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.holdbacks)) throw new Error("Invalid document quality manifest.");
  const seen = new Set();
  for (const item of manifest.holdbacks) {
    const asset = item?.asset;
    if (typeof asset !== "string" || !asset.startsWith("/downloads/") || /[\\%?#]/.test(asset) || path.posix.normalize(asset) !== asset || asset.endsWith("/")) {
      throw new Error("Invalid document quality asset path.");
    }
    if (seen.has(asset) || typeof item.reason !== "string" || !item.reason.trim()) throw new Error("Duplicate or incomplete document quality holdback.");
    if (item.observedSha256 !== undefined && !/^[a-f0-9]{64}$/.test(item.observedSha256)) throw new Error("Invalid observed document checksum.");
    seen.add(asset);
  }
  return manifest.holdbacks;
}

export function excludePublicDocumentQualityHoldbacks(outputDirectory, holdbacks) {
  const outputInfo = fs.lstatSync(outputDirectory);
  if (!outputInfo.isDirectory() || outputInfo.isSymbolicLink()) throw new Error("Document quality exclusion requires a real static export directory.");
  const outputRoot = fs.realpathSync(outputDirectory);
  const excluded = [];

  for (const item of holdbacks) {
    const targetPath = path.resolve(outputRoot, item.asset.slice(1));
    const relativeTarget = path.relative(outputRoot, targetPath);
    if (!relativeTarget || relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
      throw new Error(`Document quality asset escapes the static export: ${item.asset}`);
    }

    let parentRealPath;
    try {
      parentRealPath = fs.realpathSync(path.dirname(targetPath));
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    const relativeParent = path.relative(outputRoot, parentRealPath);
    if (relativeParent.startsWith("..") || path.isAbsolute(relativeParent)) {
      throw new Error(`Document quality asset parent escapes the static export: ${item.asset}`);
    }

    let targetInfo;
    try {
      targetInfo = fs.lstatSync(targetPath);
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    if (targetInfo.isDirectory() || (!targetInfo.isFile() && !targetInfo.isSymbolicLink())) {
      throw new Error(`Document quality holdback is not a removable file: ${item.asset}`);
    }

    fs.unlinkSync(targetPath);
    excluded.push(item.asset);
  }

  return excluded;
}

export function assertNoPublicDocumentQualityHoldbacks(outputDirectory, holdbacks) {
  if (!fs.statSync(outputDirectory).isDirectory()) throw new Error("Document quality gate requires a static export directory.");
  const violations = new Set();
  for (const item of holdbacks) {
    if (fs.existsSync(path.join(outputDirectory, item.asset.slice(1)))) violations.add(`${item.asset}: file is still included`);
  }
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else if (entry.isFile() && /\.(?:html?|txt|xml|json)$/i.test(entry.name)) {
        const text = fs.readFileSync(file, "utf8");
        for (const item of holdbacks) if (text.includes(item.asset)) violations.add(`${item.asset}: referenced in ${path.relative(outputDirectory, file)}`);
      }
    }
  }
  inspect(outputDirectory);
  if (violations.size) throw new Error(`Document quality release BLOCKED:\n${[...violations].join("\n")}`);
}
