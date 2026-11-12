import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertNoPublicReviewRoutes,
  excludePublicReviewRoutes,
  loadPublicReviewRouteHoldbacks,
} from "../scripts/public-review-route-gate.mjs";

const route = "/review/draft/";
const asset = "/guides/review/draft.webp";

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-review-route-"));
  fs.mkdirSync(path.join(root, "review/draft"), { recursive: true });
  fs.mkdirSync(path.join(root, "guides/review"), { recursive: true });
  fs.writeFileSync(path.join(root, "review/draft/index.html"), `<img src="${asset}">`);
  fs.writeFileSync(path.join(root, "guides/review/draft.webp"), "review-only");
  return root;
}

test("public review route gate removes and verifies the held route and assets", () => {
  const root = makeFixture();
  try {
    const holdbacks = [{ route, assets: [asset], reason: "Internal review", source: "test fixture" }];
    assert.deepEqual(excludePublicReviewRoutes(root, holdbacks), { routes: 1, assets: 1 });
    assertNoPublicReviewRoutes(root, holdbacks);
    assert.equal(fs.existsSync(path.join(root, "review/draft")), false);
    assert.equal(fs.existsSync(path.join(root, "guides/review/draft.webp")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("public review route gate detects a direct reference that survives exclusion", () => {
  const root = makeFixture();
  try {
    const holdbacks = [{ route, assets: [asset], reason: "Internal review", source: "test fixture" }];
    fs.rmSync(path.join(root, "review/draft"), { recursive: true });
    fs.unlinkSync(path.join(root, "guides/review/draft.webp"));
    fs.writeFileSync(path.join(root, "index.html"), `<a href="${route}">Review</a>`);
    assert.throws(() => assertNoPublicReviewRoutes(root, holdbacks), /referenced in index.html/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("public review route manifest rejects unsafe paths", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "greenatics-review-manifest-"));
  const manifestPath = path.join(root, "manifest.json");
  try {
    fs.writeFileSync(manifestPath, JSON.stringify({ version: 1, holdbacks: [{
      route: "/../private/",
      assets: [asset],
      reason: "Internal review",
      source: "test fixture",
    }] }));
    assert.throws(() => loadPublicReviewRouteHoldbacks(manifestPath), /Invalid or duplicate public review route/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
