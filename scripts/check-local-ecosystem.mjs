#!/usr/bin/env node

const checks = [
  {
    label: "web pública",
    url: "http://localhost:3001/",
    expected: (response, body) => response.status === 200 && body.includes("Greenatics"),
  },
  {
    label: "Centro Greenatics",
    url: "http://localhost:3001/plataforma/",
    expected: (response, body) => response.status === 200 && body.includes("Centro Greenatics"),
  },
  {
    label: "GREENATICS Red",
    url: "http://localhost:3001/red/app/",
    expected: (response, body) => response.status === 200 && body.includes("GREENATICS Red"),
  },
  {
    label: "Huella health",
    url: "http://127.0.0.1:8765/api/health",
    expected: (response, body) => response.status === 200 && body.includes('"app":"Calcula tu Huella"'),
  },
  {
    label: "Huella login",
    url: "http://127.0.0.1:8765/login",
    expected: (response) => response.status === 200,
  },
  {
    label: "OPS health",
    url: "http://localhost:3002/api/health",
    expected: (response, body) => response.status === 200 && body.includes('"mode":"local"'),
  },
  {
    label: "OPS login",
    url: "http://localhost:3002/login",
    expected: (response) => response.status === 200,
  },
  {
    label: "OPS bloqueo anónimo",
    url: "http://localhost:3002/app",
    expected: (response) => [302, 307].includes(response.status) && response.headers.get("location")?.includes("reason=configuration"),
  },
];

let failures = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: "manual" });
    const body = await response.text();
    if (!check.expected(response, body)) throw new Error(`respuesta inesperada (${response.status})`);
    console.log(`PASS ${check.label} · ${response.status}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${check.label} · ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  console.error(`Local ecosystem QA FAIL: ${failures}/${checks.length} comprobaciones fallaron.`);
  process.exitCode = 1;
} else {
  console.log(`Local ecosystem QA PASS: ${checks.length} superficies verificadas.`);
}
