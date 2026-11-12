import fs from "node:fs";
import path from "node:path";

const GiB = 1024 ** 3;
export const PREVIEW_BUILD_RESERVE_BYTES = 2 * GiB;

export function previewCapacityRequirement(publicBytes) {
  if (!Number.isSafeInteger(publicBytes) || publicBytes < 0) throw new Error("Invalid public asset size.");
  const required = PREVIEW_BUILD_RESERVE_BYTES + 2 * publicBytes;
  if (!Number.isSafeInteger(required)) throw new Error("Public asset size exceeds safe capacity accounting.");
  return required;
}

export function measurePublicBytes(directory) {
  if (!fs.existsSync(directory)) return 0;
  if (!fs.statSync(directory).isDirectory()) throw new Error("Public assets must be a directory.");
  let total = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    const stat = fs.statSync(file);
    // The public root may be linked in an isolated build; nested directory links are ambiguous.
    if (stat.isDirectory()) {
      if (entry.isSymbolicLink()) throw new Error("Nested public directory links require explicit capacity accounting.");
      total += measurePublicBytes(file);
    } else if (stat.isFile()) total += stat.size;
    else throw new Error("Unsupported public asset type.");
  }
  if (!Number.isSafeInteger(total)) throw new Error("Invalid measured public asset size.");
  return total;
}

export function evaluatePreviewCapacity(availableBytes, publicBytes) {
  if (!Number.isSafeInteger(availableBytes) || availableBytes < 0) throw new Error("Available disk capacity could not be verified.");
  const requiredBytes = previewCapacityRequirement(publicBytes);
  return { availableBytes, publicBytes, requiredBytes, sufficient: availableBytes >= requiredBytes };
}

export function assertPreviewBuildCapacity(root) {
  const stats = fs.statfsSync(root);
  const availableBytes = stats.bavail * stats.bsize;
  const result = evaluatePreviewCapacity(availableBytes, measurePublicBytes(path.join(root, "public")));
  const gib = (bytes) => (bytes / GiB).toFixed(2);
  if (!result.sufficient) {
    throw new Error("Preview build capacity BLOCKED: " + gib(result.availableBytes) + " GiB available; at least " + gib(result.requiredBytes) + " GiB required (public assets plus safety reserve). No build started, outputs moved or backups removed.");
  }
  return result;
}
