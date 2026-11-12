#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadDocumentQualityHoldbacks, assertNoPublicDocumentQualityHoldbacks } from "./public-document-quality-gate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const flag = process.argv.indexOf("--directory");
const output = flag < 0 ? path.join(root, "out") : process.argv[flag + 1];
if (!output) throw new Error("--directory requires a static export path.");
try {
  assertNoPublicDocumentQualityHoldbacks(path.resolve(output), loadDocumentQualityHoldbacks(path.join(root, "docs/knowledge/PUBLIC_DOCUMENT_QUALITY_HOLDBACKS.json")));
  console.log("Document quality release preflight PASS: held documents absent and unreferenced.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
