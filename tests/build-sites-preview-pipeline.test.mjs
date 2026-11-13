import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const buildScript = fs.readFileSync(new URL("../scripts/build-sites-preview.mjs", import.meta.url), "utf8");

test("static preview build validates each generated artifact before reporting success", () => {
  const stages = [
    "runNodeScript(normalizeScript);",
    'runNodeScript(toolContractsScript, ["--static"]);',
    "runNodeScript(staticAuditScript);",
    "runNodeScript(publicOutputScript);",
  ];
  const positions = stages.map((stage) => buildScript.indexOf(stage));

  assert.ok(positions.every((position) => position >= 0), "the build must include each static QA stage");
  assert.deepEqual([...positions].sort((left, right) => left - right), positions);
  assert.ok(buildScript.includes("staticAuditScript, publicOutputScript"));
});
