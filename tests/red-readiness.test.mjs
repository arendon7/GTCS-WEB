import assert from "node:assert/strict";
import test from "node:test";
import { isGreenaticsRedReadyResponse, redReadinessEndpoint } from "../src/lib/red-readiness.mjs";

test("RED readiness endpoint uses only an HTTPS origin or a local development origin", () => {
  assert.equal(redReadinessEndpoint("https://red.greenatics.co"), "https://red.greenatics.co/api/ready");
  assert.equal(redReadinessEndpoint("http://127.0.0.1:8787"), "http://127.0.0.1:8787/api/ready");
  assert.equal(redReadinessEndpoint("http://red.greenatics.co"), "");
  assert.equal(redReadinessEndpoint("https://red.greenatics.co/base"), "");
  assert.equal(redReadinessEndpoint("https://user:password@red.greenatics.co"), "");
  assert.equal(redReadinessEndpoint("https://red.greenatics.co?preview=1"), "");
});

test("only the complete GREENATICS RED readiness contract exposes the runtime link", () => {
  const ready = {
    status: "ready",
    application: "GREENATICS RED",
    version: "test",
    project_workspaces: 4,
    drive_backup_verified: true,
  };
  assert.equal(isGreenaticsRedReadyResponse(true, ready), true);
  assert.equal(isGreenaticsRedReadyResponse(false, ready), false);
  assert.equal(isGreenaticsRedReadyResponse(true, { ...ready, status: "not-ready" }), false);
  assert.equal(isGreenaticsRedReadyResponse(true, { ...ready, application: "Other app" }), false);
  assert.equal(isGreenaticsRedReadyResponse(true, { ...ready, project_workspaces: 3 }), false);
  assert.equal(isGreenaticsRedReadyResponse(true, { ...ready, drive_backup_verified: false }), false);
  assert.equal(isGreenaticsRedReadyResponse(true, null), false);
});
