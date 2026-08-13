const BASELINE_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
};

const PRIVATE_HEADERS = {
  pragma: "no-cache",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

const PILOT_MODES = new Set(["public-only", "full-ops"]);

export class PreflightError extends Error {
  constructor(message) {
    super(message);
    this.name = "PreflightError";
  }
}

function fail(message) {
  throw new PreflightError(message);
}

export function normalizeHostedBaseUrl(value) {
  if (!value) fail("Falta --base-url o APP_BASE_URL.");

  let url;
  try {
    url = new URL(value);
  } catch {
    fail("El origen del piloto no es una URL válida.");
  }

  if (url.protocol !== "https:") fail("El piloto hospedado debe usar HTTPS.");
  if (url.username || url.password) fail("El origen del piloto no puede incluir credenciales.");
  if (url.pathname !== "/" || url.search || url.hash) fail("Usa únicamente el origen del deployment, sin ruta, query ni fragmento.");

  return url.origin;
}

export function normalizePilotMode(value) {
  const mode = typeof value === "string" && value.trim() ? value.trim() : "full-ops";
  if (!PILOT_MODES.has(mode)) fail("El modo esperado debe ser public-only o full-ops.");
  return mode;
}

function requireStatus(response, expected, label) {
  if (response.status !== expected) fail(`${label}: HTTP ${response.status}; se esperaba ${expected}.`);
}

function requireHeader(response, name, expected, label) {
  const actual = response.headers.get(name);
  if (actual !== expected) fail(`${label}: header ${name} inválido o ausente.`);
}

function requireHeaderIncludes(response, name, expected, label) {
  const actual = response.headers.get(name) ?? "";
  if (!actual.toLowerCase().includes(expected.toLowerCase())) fail(`${label}: header ${name} no contiene ${expected}.`);
}

function assertBaselineHeaders(response, label) {
  for (const [name, value] of Object.entries(BASELINE_HEADERS)) requireHeader(response, name, value, label);
  const permissions = response.headers.get("permissions-policy") ?? "";
  for (const token of ["camera=()", "microphone=()", "geolocation=()"] ) {
    if (!permissions.includes(token)) fail(`${label}: Permissions-Policy no contiene ${token}.`);
  }
}

function assertPrivateHeaders(response, label) {
  requireHeaderIncludes(response, "cache-control", "no-store", label);
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) requireHeader(response, name, value, label);
}

function assertPublicIndexingHeaders(response, deployment, label) {
  const actual = response.headers.get("x-robots-tag");
  if (!actual) return;

  const normalized = actual.trim().toLowerCase();
  const vercelPreviewNoindex =
    deployment?.platform === "vercel" &&
    deployment?.environment === "preview" &&
    normalized === "noindex";

  if (vercelPreviewNoindex) return;
  fail(`${label}: X-Robots-Tag privado o inesperado en superficie pública.`);
}

function normalizeCommit(value) {
  if (!value || !/^[0-9a-f]{7,64}$/i.test(value)) return null;
  return value.toLowerCase();
}

export function assertHostedHealth(payload, {
  expectedBranch,
  expectedCommit,
  expectedMode = "full-ops",
} = {}) {
  const pilotMode = normalizePilotMode(expectedMode);
  if (!payload || typeof payload !== "object") fail("health: respuesta JSON inválida.");
  if (payload.status !== "ready") fail(`health: status=${String(payload.status)}; se esperaba ready.`);

  const checks = payload.checks ?? {};
  if (pilotMode === "public-only") {
    if (payload.mode !== "local") fail(`health: mode=${String(payload.mode)}; se esperaba local para public-only.`);
    if (payload.opsAccess !== "configuration-block") {
      fail(`health: opsAccess=${String(payload.opsAccess)}; se esperaba configuration-block para public-only.`);
    }
    for (const key of ["backend", "admin"]) {
      if (checks[key] !== "missing") {
        fail(`health: check ${key}=${String(checks[key])}; public-only no debe recibir credenciales Supabase.`);
      }
    }
    if (!["ok", "missing"].includes(checks.appOrigin)) {
      fail(`health: check appOrigin=${String(checks.appOrigin)}; se esperaba ok o missing.`);
    }
  } else {
    if (payload.mode !== "supabase") fail(`health: mode=${String(payload.mode)}; se esperaba supabase.`);
    if (payload.opsAccess !== "supabase-auth") fail(`health: opsAccess=${String(payload.opsAccess)}; se esperaba supabase-auth.`);
    for (const key of ["backend", "admin", "appOrigin"]) {
      if (checks[key] !== "ok") fail(`health: check ${key}=${String(checks[key])}; se esperaba ok.`);
    }
  }

  const deployment = payload.deployment ?? {};
  if (deployment.platform !== "vercel") fail(`health: platform=${String(deployment.platform)}; se esperaba vercel.`);
  if (!new Set(["preview", "production"]).has(deployment.environment)) {
    fail(`health: environment=${String(deployment.environment)}; se esperaba preview o production.`);
  }

  if (expectedBranch && deployment.branch !== expectedBranch) {
    fail(`health: branch=${String(deployment.branch)}; se esperaba ${expectedBranch}.`);
  }

  if (expectedCommit) {
    const expected = normalizeCommit(expectedCommit);
    const actual = normalizeCommit(deployment.commit);
    if (!expected) fail("--expected-commit no parece un SHA de Git válido.");
    if (!actual || expected.slice(0, 12) !== actual.slice(0, 12)) {
      fail(`health: commit=${String(deployment.commit)}; no coincide con el commit esperado.`);
    }
  }

  return deployment;
}

function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => match[1].trim());
}

function assertPublicSitemap(xml, origin) {
  const locations = sitemapLocations(xml);
  if (locations.length === 0) fail("sitemap: no contiene URLs públicas.");

  const forbiddenPrefixes = ["/app", "/login", "/admin", "/api", "/account", "/dashboard", "/imports"];
  for (const location of locations) {
    let url;
    try {
      url = new URL(location);
    } catch {
      fail(`sitemap: URL inválida: ${location}`);
    }
    if (url.origin !== origin) fail(`sitemap: URL fuera del origen del piloto: ${location}`);
    if (forbiddenPrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) {
      fail(`sitemap: expone una ruta interna: ${url.pathname}`);
    }
  }
}

function assertRobots(text) {
  for (const rule of ["Disallow: /app", "Disallow: /login", "Disallow: /api/"]) {
    if (!text.includes(rule)) fail(`robots: falta ${rule}.`);
  }
}

async function get(fetchImpl, url) {
  return fetchImpl(url, {
    redirect: "manual",
    headers: { "user-agent": "GREENATICS-HOSTED-PILOT-PREFLIGHT/1.0" },
  });
}

export async function runHostedPilotPreflight({
  baseUrl,
  expectedBranch,
  expectedCommit,
  expectedMode = "full-ops",
  fetchImpl = globalThis.fetch,
}) {
  if (typeof fetchImpl !== "function") fail("No existe una implementación fetch disponible.");
  const origin = normalizeHostedBaseUrl(baseUrl);
  const pilotMode = normalizePilotMode(expectedMode);

  const healthResponse = await get(fetchImpl, `${origin}/api/health`);
  requireStatus(healthResponse, 200, "health");
  assertBaselineHeaders(healthResponse, "health");
  assertPrivateHeaders(healthResponse, "health");
  let health;
  try {
    health = await healthResponse.json();
  } catch {
    fail("health: el endpoint no devolvió JSON válido.");
  }
  const deployment = assertHostedHealth(health, { expectedBranch, expectedCommit, expectedMode: pilotMode });

  const publicResponse = await get(fetchImpl, `${origin}/`);
  requireStatus(publicResponse, 200, "home pública");
  assertBaselineHeaders(publicResponse, "home pública");
  assertPublicIndexingHeaders(publicResponse, deployment, "home pública");

  const loginResponse = await get(fetchImpl, `${origin}/login`);
  requireStatus(loginResponse, 200, "login");
  assertBaselineHeaders(loginResponse, "login");
  assertPrivateHeaders(loginResponse, "login");

  const appResponse = await get(fetchImpl, `${origin}/app`);
  if (![301, 302, 303, 307, 308].includes(appResponse.status)) {
    fail(`OPS anónimo: HTTP ${appResponse.status}; se esperaba redirect a login.`);
  }
  assertBaselineHeaders(appResponse, "OPS anónimo");
  assertPrivateHeaders(appResponse, "OPS anónimo");
  const location = appResponse.headers.get("location");
  if (!location) fail("OPS anónimo: falta header Location.");
  const loginTarget = new URL(location, origin);
  if (loginTarget.origin !== origin || loginTarget.pathname !== "/login") fail("OPS anónimo: redirect fuera del login canónico.");
  if (loginTarget.searchParams.get("next") !== "/app") fail("OPS anónimo: redirect no conserva next=/app.");
  if (pilotMode === "public-only") {
    if (loginTarget.searchParams.get("reason") !== "configuration") {
      fail("OPS public-only: falta reason=configuration en el bloqueo esperado.");
    }
  } else if (loginTarget.searchParams.has("reason")) {
    fail("OPS full-ops: el deployment sigue en bloqueo de configuración.");
  }

  const sitemapResponse = await get(fetchImpl, `${origin}/sitemap.xml`);
  requireStatus(sitemapResponse, 200, "sitemap");
  assertPublicSitemap(await sitemapResponse.text(), origin);

  const robotsResponse = await get(fetchImpl, `${origin}/robots.txt`);
  requireStatus(robotsResponse, 200, "robots");
  assertRobots(await robotsResponse.text());

  return {
    origin,
    mode: pilotMode,
    deployment,
    checks: [
      "health",
      "public-boundary",
      "login-private",
      pilotMode === "public-only" ? "ops-configuration-block" : "ops-anonymous",
      "sitemap",
      "robots",
    ],
  };
}
