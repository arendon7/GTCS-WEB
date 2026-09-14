const baseUrl = (process.env.BASE_URL || "http://localhost:3001").replace(/\/$/, "");

const checks = [
  ["/", "Greenatics"],
  ["/plataforma/", "Centro Greenatics"],
  ["/huella/", "Mide."],
  ["/acceso/?interes=calcula-tu-huella", "Calcula tu Huella"],
  ["/red/app/", "GREENATICS Red"],
  ["/app/", "GREENATICS OPS"],
  ["/proyectos/tamesis/", "UASB"],
];

const failures = [];

for (const [path, expectedText] of checks) {
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url);
    const body = await response.text();
    const hasExpectedText = body.includes(expectedText);
    if (!response.ok || !hasExpectedText) {
      failures.push(`${path}: HTTP ${response.status}, texto esperado ${hasExpectedText ? "encontrado" : "ausente"}`);
      continue;
    }
    console.log(`PASS ${path} · HTTP ${response.status}`);
  } catch (error) {
    failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures.length > 0) {
  console.error("\nLocal entrypoint QA FAIL:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Local entrypoint QA PASS: ${checks.length} rutas verificadas en ${baseUrl}.`);
}
