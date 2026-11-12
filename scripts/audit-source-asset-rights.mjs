import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertNoSourceAssetRightsHoldbacks,
  loadAssetRightsHoldbacks,
} from "./public-asset-rights-gate.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const holdbacks = loadAssetRightsHoldbacks(
  path.join(projectRoot, "docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json"),
);

try {
  assertNoSourceAssetRightsHoldbacks(
    path.join(projectRoot, "src"),
    path.join(projectRoot, "public"),
    holdbacks,
  );
  process.stdout.write("Source rights preflight passed: no held assets in source references or public/.\n");
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
