import assert from "node:assert/strict";
import test from "node:test";
import { runLocalHttpChecks } from "../scripts/local-http-checks.mjs";
import { getLocalEcosystemChecks } from "../scripts/check-local-ecosystem.mjs";
import { getLocalEntrypointChecks } from "../scripts/check-local-entrypoints.mjs";

function captureOutput() {
  const lines = [];
  return { lines, writeLine: (line) => lines.push(line), writeError: (line) => lines.push(line) };
}

function makeChecks() {
  return [
    { label: "web", url: "http://127.0.0.1:4173/", expected: (response, body) => response.status === 200 && body.includes("Greenatics") },
    { label: "acceso", url: "http://127.0.0.1:4173/acceso/", expected: (response, body) => response.status === 200 && body.includes("Back 2 Green") },
  ];
}

test("both local journey checkers target the agreed preview by default", () => {
  const entrypoints = getLocalEntrypointChecks({});
  const ecosystem = getLocalEcosystemChecks({});

  assert.ok(entrypoints.every(({ url }) => url.startsWith("http://127.0.0.1:4173/")));
  assert.equal(entrypoints[2].expected({ status: 200 }, "Tu inventario GEI. Claro y explicable."), true);
  assert.equal(entrypoints[2].expected({ status: 200 }, "Mensaje anterior ya retirado."), false);
  assert.equal(ecosystem[0].url, "http://127.0.0.1:4173/");
  assert.equal(ecosystem[1].url, "http://127.0.0.1:4173/plataforma/");
});

test("local journey checkers accept explicit site and tool destinations", () => {
  const entrypoints = getLocalEntrypointChecks({ GREENATICS_SITE_URL: "https://preview.example.test/" });
  const ecosystem = getLocalEcosystemChecks({
    GREENATICS_SITE_URL: "https://preview.example.test/",
    GREENATICS_RED_URL: "https://red.example.test/app",
    GREENATICS_HUELLA_URL: "https://huella.example.test",
    GREENATICS_OPS_URL: "https://ops.example.test",
  });

  assert.equal(entrypoints[0].url, "https://preview.example.test/");
  assert.equal(ecosystem[2].url, "https://red.example.test/app/");
  assert.equal(ecosystem[3].url, "https://huella.example.test/api/health");
  assert.equal(ecosystem[5].url, "https://ops.example.test/api/health");
});

test("unreachable services are blocked, not misreported as defects", async () => {
  const output = captureOutput();
  const exitCode = await runLocalHttpChecks(makeChecks(), {
    fetchImpl: async () => { throw new TypeError("fetch failed"); },
    ...output,
  });

  assert.equal(exitCode, 2);
  assert.equal(output.lines.filter((line) => line.startsWith("BLOCKED ")).length, 2);
  assert.ok(!output.lines.some((line) => line.startsWith("FAIL ")));
});

test("a responding route with a broken contract is a failure", async () => {
  const output = captureOutput();
  const exitCode = await runLocalHttpChecks(makeChecks(), {
    fetchImpl: async (url) => ({
      status: 200,
      text: async () => url.endsWith("/acceso/") ? "Internal Server Error" : "Greenatics",
    }),
    ...output,
  });

  assert.equal(exitCode, 1);
  assert.ok(output.lines.some((line) => line.startsWith("FAIL acceso")));
});

test("passes intact routes and preserves manual redirects where requested", async () => {
  const output = captureOutput();
  const requests = [];
  const exitCode = await runLocalHttpChecks([
    { label: "web", url: "http://127.0.0.1:4173/", expected: (response, body) => response.status === 200 && body === "Greenatics" },
    { label: "OPS", url: "http://127.0.0.1:3002/app", redirect: "manual", expected: (response) => response.status === 307 },
  ], {
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { status: url.endsWith("/app") ? 307 : 200, text: async () => "Greenatics" };
    },
    ...output,
  });

  assert.equal(exitCode, 0);
  assert.equal(requests[1].options.redirect, "manual");
  assert.ok(requests.every(({ options }) => options.signal instanceof AbortSignal));
  assert.ok(output.lines.some((line) => line.includes("QA PASS: 2 comprobaciones")));
});

test("a mixed result keeps the real defect visible while reporting blocked dependencies", async () => {
  const output = captureOutput();
  let index = 0;
  const exitCode = await runLocalHttpChecks(makeChecks(), {
    fetchImpl: async () => {
      index += 1;
      if (index === 1) return { status: 500, text: async () => "Internal Server Error" };
      throw new TypeError("fetch failed");
    },
    ...output,
  });

  assert.equal(exitCode, 1);
  assert.ok(output.lines.some((line) => line.startsWith("FAIL web")));
  assert.ok(output.lines.some((line) => line.startsWith("BLOCKED acceso")));
  assert.ok(output.lines.some((line) => line.includes("1 defecto(s), 1 bloqueo(s)")));
});
