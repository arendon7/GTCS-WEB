export async function runLocalHttpChecks(checks, {
  fetchImpl = fetch,
  timeoutMs = 4000,
  writeLine = (line) => process.stdout.write(`${line}\n`),
  writeError = (line) => process.stderr.write(`${line}\n`),
} = {}) {
  let passed = 0;
  let failures = 0;
  let blocked = 0;

  for (const check of checks) {
    let response;
    let body;
    try {
      response = await fetchImpl(check.url, {
        redirect: check.redirect ?? "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      body = await response.text();
    } catch (error) {
      blocked += 1;
      const detail = error instanceof Error ? error.message : String(error);
      writeError(`BLOCKED ${check.label} · servicio no accesible${detail ? ` (${detail})` : ""}`);
      continue;
    }

    if (!check.expected(response, body)) {
      failures += 1;
      writeError(`FAIL ${check.label} · respuesta inesperada (HTTP ${response.status})`);
      continue;
    }

    passed += 1;
    writeLine(`PASS ${check.label} · HTTP ${response.status}`);
  }

  if (failures > 0) {
    writeError(`Local HTTP QA FAIL: ${failures} defecto(s), ${blocked} bloqueo(s), ${passed} aprobado(s).`);
    return 1;
  }
  if (blocked > 0) {
    writeError(`Local HTTP QA BLOCKED: ${blocked}/${checks.length} servicios no accesibles; ${passed} aprobados.`);
    return 2;
  }

  writeLine(`Local HTTP QA PASS: ${passed} comprobaciones aprobadas.`);
  return 0;
}
