#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import {
  assertNoPublicDocumentQualityHoldbacks,
  excludePublicDocumentQualityHoldbacks,
  loadDocumentQualityHoldbacks,
} from "./public-document-quality-gate.mjs";
import {
  assertNoPublicProductTruthHoldbacks,
  excludePublicProductTruthHoldbacks,
  loadPublicProductTruthHoldbacks,
} from "./public-product-truth-gate.mjs";
import {
  assertNoPublicReviewRoutes,
  excludePublicReviewRoutes,
  loadPublicReviewRouteHoldbacks,
} from "./public-review-route-gate.mjs";
import { assertPublicDownloadPdfSet, excludeUnlinkedPublicDownloadPdfs } from "./public-downloads-export-gate.mjs";
import { writeStaticExportProvenance } from "./static-export-provenance.mjs";

const root = path.resolve("out");
if (!fs.existsSync(root)) throw new Error("Static export directory /out not found after build.");
const documentHoldbacks = loadDocumentQualityHoldbacks(path.resolve("docs/knowledge/PUBLIC_DOCUMENT_QUALITY_HOLDBACKS.json"));
const excludedDocuments = excludePublicDocumentQualityHoldbacks(root, documentHoldbacks);
assertNoPublicDocumentQualityHoldbacks(root, documentHoldbacks);
const productTruthHoldbacks = loadPublicProductTruthHoldbacks(path.resolve("docs/knowledge/PUBLIC_PRODUCT_TRUTH_HOLDBACKS.json"));
const excludedProductAssets = excludePublicProductTruthHoldbacks(root, path.resolve("public"), productTruthHoldbacks);
assertNoPublicProductTruthHoldbacks(root, productTruthHoldbacks);
const reviewRouteHoldbacks = loadPublicReviewRouteHoldbacks(path.resolve("docs/knowledge/PUBLIC_REVIEW_ROUTE_HOLDBACKS.json"));
const excludedReviewContent = excludePublicReviewRoutes(root, reviewRouteHoldbacks);
assertNoPublicReviewRoutes(root, reviewRouteHoldbacks);
const excludedUnlinkedPdfs = excludeUnlinkedPublicDownloadPdfs(root);
assertPublicDownloadPdfSet(root);

let files = 0;
let directories = 0;

function normalizeDirectory(directory) {
  fs.chmodSync(directory, 0o755);
  directories += 1;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      normalizeDirectory(entryPath);
    } else if (entry.isFile()) {
      fs.chmodSync(entryPath, 0o644);
      files += 1;
    }
  }
}

normalizeDirectory(root);
const provenancePath = writeStaticExportProvenance(process.cwd(), root);
console.log(`Static export permissions normalized: ${files} files, ${directories} directories.`);
console.log(`Quality-held documents excluded from export: ${excludedDocuments.length}.`);
console.log(`Unlinked PDFs excluded from export: ${excludedUnlinkedPdfs.length}.`);
console.log(`Product-truth-held assets excluded from export: ${excludedProductAssets.length}.`);
console.log(`Internal review routes/assets excluded from export: ${excludedReviewContent.routes}/${excludedReviewContent.assets}.`);
console.log(`Static export provenance written: ${path.relative(process.cwd(), provenancePath)}.`);
