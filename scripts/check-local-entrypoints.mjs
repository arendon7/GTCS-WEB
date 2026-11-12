import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLocalHttpChecks } from "./local-http-checks.mjs";

const checks = [
  ["/", "Greenatics"],
  ["/plataforma/", "Centro Greenatics"],
  ["/huella/", "Tu inventario GEI."],
  ["/acceso/?interes=calcula-tu-huella", "Calcula tu Huella"],
  ["/red/app/", "GREENATICS Red"],
  ["/app/", "GREENATICS OPS"],
  ["/proyectos/tamesis/", "UASB"],
];

export function getLocalEntrypointChecks(env = process.env) {
  const baseUrl = (env.GREENATICS_SITE_URL || env.BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
  return checks.map(([route, expectedText]) => ({
    label: route,
    url: `${baseUrl}${route}`,
    expected: (response, body) => response.status === 200 && body.includes(expectedText),
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runLocalHttpChecks(getLocalEntrypointChecks());
}
