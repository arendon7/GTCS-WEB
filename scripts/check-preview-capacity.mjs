#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertPreviewBuildCapacity } from "./preview-build-capacity.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  const result = assertPreviewBuildCapacity(root);
  console.log("Preview capacity PASS: " + result.availableBytes + " bytes available; " + result.requiredBytes + " bytes required. This is a preflight, not a successful build.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
