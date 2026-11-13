import assert from "node:assert/strict";
import test from "node:test";
import { runToolContractChecks } from "../scripts/check-tool-contracts.mjs";

const validLandingMarkup = `
  <a href="/">Inicio</a>
  <a href="/herramientas/">Herramientas</a>
  <a href="https://huella.example.test/login">Entrar a la plataforma</a>
  <a href="https://huella.example.test/login">Entrar a Back 2 Green</a>
  <article id="calcula-tu-huella"><a href="/huella/">Ver recorrido y planes</a></article>
  <a href="#planes">Planes y precios</a>
  <a href="/acceso/#calcula-tu-huella">Consultar acceso</a>
  <a href="#plataforma">Ver cómo funciona</a>
  El acceso local es solo para pruebas y requiere que el servidor de Back 2 Green esté iniciado en este equipo.
  Explorar la muestra pública #estacion
  Abrir la estación con datos ficticios /red/app/
  Abrir la demo navegable /agroway/app/
  Recorrer la muestra /sana/app/#overview
`;

function captureOutput() {
  const lines = [];
  return { lines, writeLine: (line) => lines.push(line), writeError: (line) => lines.push(line) };
}

test("reports unavailable site routes as blocked, not product failures", async () => {
  const output = captureOutput();
  const exitCode = await runToolContractChecks({
    baseUrl: "http://127.0.0.1:4173",
    fetchImpl: async () => { throw new TypeError("fetch failed"); },
    ...output,
  });

  assert.equal(exitCode, 2);
  assert.equal(output.lines.filter((line) => line.startsWith("BLOCKED ")).length, 6);
  assert.ok(output.lines.some((line) => line.startsWith("Tool contract QA BLOCKED:")));
  assert.ok(!output.lines.some((line) => line.startsWith("FAIL ")));
});

test("reports a responding page with a missing route contract as a failure", async () => {
  const output = captureOutput();
  const exitCode = await runToolContractChecks({
    fetchImpl: async (url) => ({
      status: 200,
      text: async () => url.endsWith("/acceso/") ? "<main>Missing access link</main>" : validLandingMarkup,
    }),
    ...output,
  });

  assert.equal(exitCode, 1);
  assert.ok(output.lines.some((line) => line.startsWith("FAIL /acceso/")));
  assert.ok(output.lines.some((line) => line.startsWith("Tool contract QA FAIL:")));
});

test("passes the complete set when all six entry contracts are present", async () => {
  const output = captureOutput();
  const exitCode = await runToolContractChecks({
    fetchImpl: async () => ({ status: 200, text: async () => validLandingMarkup }),
    ...output,
  });

  assert.equal(exitCode, 0);
  assert.equal(output.lines.filter((line) => line.startsWith("PASS ")).length, 6);
  assert.ok(output.lines.some((line) => line.includes("QA PASS: 6 landings")));
});

test("marks a missing static export as blocked", async () => {
  const output = captureOutput();
  const exitCode = await runToolContractChecks({
    staticOutput: true,
    projectRoot: "/path/that/does/not/exist",
    ...output,
  });

  assert.equal(exitCode, 2);
  assert.equal(output.lines.filter((line) => line.startsWith("BLOCKED ")).length, 6);
});
