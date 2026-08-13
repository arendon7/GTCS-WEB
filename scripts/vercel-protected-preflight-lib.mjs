import { randomBytes } from "node:crypto";
import { runHostedPilotPreflight } from "./hosted-pilot-preflight-lib.mjs";

const VERCEL_API_ORIGIN = "https://api.vercel.com";
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const DEFAULT_BYPASS_RETRY_DELAYS_MS = Object.freeze([250, 500, 1000, 2000]);

export class VercelProtectedPreflightError extends Error {
  constructor(message) {
    super(message);
    this.name = "VercelProtectedPreflightError";
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requireValue(env, name, { max = 8192 } = {}) {
  const value = clean(env[name]);
  if (!value || value.length > max) {
    throw new VercelProtectedPreflightError(`${name} falta o tiene una longitud inválida.`);
  }
  return value;
}

function requireProjectId(value) {
  const id = clean(value);
  if (!/^prj_[A-Za-z0-9_-]{3,255}$/.test(id)) {
    throw new VercelProtectedPreflightError("VERCEL_PROJECT_ID no tiene un formato válido.");
  }
  return id;
}

function apiUrl(path, teamId) {
  const url = new URL(path, VERCEL_API_ORIGIN);
  url.searchParams.set("teamId", teamId);
  return url;
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeRedirectTarget(response, baseUrl) {
  const location = response.headers.get("location");
  if (!location) return null;
  try {
    const target = new URL(location, baseUrl);
    return `${target.origin}${target.pathname}`;
  } catch {
    return "<invalid>";
  }
}

function deploymentHealthUrl(value) {
  try {
    return new URL("/api/health", value).toString();
  } catch {
    throw new VercelProtectedPreflightError("DEPLOYMENT_URL no es una URL válida para readiness.");
  }
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function vercelRequest({ token, teamId }, fetchImpl, path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetchImpl(apiUrl(path, teamId), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new VercelProtectedPreflightError(`Vercel API ${method} ${path}: error de red.`);
  }

  const data = await parseResponseBody(response);
  if (!response.ok) {
    const code = clean(data?.error?.code) || `http_${response.status}`;
    throw new VercelProtectedPreflightError(`Vercel API ${method} ${path}: ${code}.`);
  }
  return data;
}

export function parseVercelProtectedPreflightConfig(env = process.env) {
  return Object.freeze({
    token: requireValue(env, "VERCEL_TOKEN"),
    teamId: requireValue(env, "VERCEL_ORG_ID", { max: 256 }),
    projectId: requireProjectId(requireValue(env, "VERCEL_PROJECT_ID", { max: 256 })),
    deploymentUrl: requireValue(env, "DEPLOYMENT_URL", { max: 2048 }),
    expectedMode: requireValue(env, "PILOT_PREVIEW_MODE", { max: 32 }),
    expectedBranch: requireValue(env, "DEPLOY_GIT_REF", { max: 255 }),
    expectedCommit: requireValue(env, "DEPLOY_GIT_SHA", { max: 64 }),
  });
}

export function createProtectionBypassSecret() {
  return randomBytes(16).toString("hex");
}

export function createProtectionBypassFetch(secret, fetchImpl = globalThis.fetch) {
  if (!/^[A-Za-z0-9]{32}$/.test(secret)) {
    throw new VercelProtectedPreflightError("Protection bypass secret inválido.");
  }
  if (typeof fetchImpl !== "function") {
    throw new VercelProtectedPreflightError("No existe una implementación fetch disponible.");
  }

  return (url, init = {}) => {
    const headers = new Headers(init.headers ?? {});
    headers.set("x-vercel-protection-bypass", secret);
    return fetchImpl(url, { ...init, headers });
  };
}

export async function generateVercelProtectionBypass(config, secret, { fetchImpl = globalThis.fetch } = {}) {
  if (!/^[A-Za-z0-9]{32}$/.test(secret)) {
    throw new VercelProtectedPreflightError("Protection bypass secret inválido.");
  }
  await vercelRequest(config, fetchImpl, `/v1/projects/${encodeURIComponent(config.projectId)}/protection-bypass`, {
    method: "PATCH",
    body: {
      generate: {
        secret,
        note: "GREENATICS hosted pilot CI",
      },
    },
  });
}

export async function revokeVercelProtectionBypass(config, secret, { fetchImpl = globalThis.fetch } = {}) {
  if (!/^[A-Za-z0-9]{32}$/.test(secret)) {
    throw new VercelProtectedPreflightError("Protection bypass secret inválido.");
  }
  await vercelRequest(config, fetchImpl, `/v1/projects/${encodeURIComponent(config.projectId)}/protection-bypass`, {
    method: "PATCH",
    body: {
      revoke: {
        secret,
        regenerate: false,
      },
    },
  });
}

export async function waitForVercelProtectionBypassReadiness(config, secret, {
  fetchImpl = globalThis.fetch,
  sleepImpl = defaultSleep,
  retryDelays = DEFAULT_BYPASS_RETRY_DELAYS_MS,
} = {}) {
  if (typeof sleepImpl !== "function") {
    throw new VercelProtectedPreflightError("No existe una implementación de espera para readiness.");
  }
  if (!Array.isArray(retryDelays) || retryDelays.length > 8) {
    throw new VercelProtectedPreflightError("La política de retry del bypass es inválida.");
  }

  const delays = retryDelays.map((value) => Number(value));
  if (delays.some((value) => !Number.isFinite(value) || value < 0 || value > 10_000)) {
    throw new VercelProtectedPreflightError("La política de retry del bypass contiene una espera inválida.");
  }

  const url = deploymentHealthUrl(config.deploymentUrl);
  const protectedFetch = createProtectionBypassFetch(secret, fetchImpl);

  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    let response;
    try {
      response = await protectedFetch(url, {
        redirect: "manual",
        headers: { "user-agent": "GREENATICS-VERCEL-BYPASS-READINESS/1.0" },
      });
    } catch {
      throw new VercelProtectedPreflightError("Bypass readiness: error de red al consultar /api/health.");
    }

    if (response.status === 200) {
      return { attempts: attempt + 1, status: response.status };
    }

    if (!REDIRECT_STATUSES.has(response.status)) {
      return { attempts: attempt + 1, status: response.status };
    }

    if (attempt === delays.length) {
      const target = safeRedirectTarget(response, config.deploymentUrl);
      throw new VercelProtectedPreflightError(
        `Bypass readiness: /api/health siguió redirigiendo tras ${attempt + 1} intentos (HTTP ${response.status})${target ? `; redirect=${target}` : ""}.`,
      );
    }

    await sleepImpl(delays[attempt]);
  }

  throw new VercelProtectedPreflightError("Bypass readiness terminó en un estado imposible.");
}

export async function runVercelProtectedPilotPreflight({
  env = process.env,
  fetchImpl = globalThis.fetch,
  preflightRunner = runHostedPilotPreflight,
  secretFactory = createProtectionBypassSecret,
  sleepImpl = defaultSleep,
  readinessRetryDelays = DEFAULT_BYPASS_RETRY_DELAYS_MS,
  onCleanupError = () => {},
} = {}) {
  const config = parseVercelProtectedPreflightConfig(env);
  const secret = secretFactory();
  if (!/^[A-Za-z0-9]{32}$/.test(secret)) {
    throw new VercelProtectedPreflightError("El generador produjo un bypass secret inválido.");
  }

  let primaryError = null;
  await generateVercelProtectionBypass(config, secret, { fetchImpl });
  try {
    await waitForVercelProtectionBypassReadiness(config, secret, {
      fetchImpl,
      sleepImpl,
      retryDelays: readinessRetryDelays,
    });

    return await preflightRunner({
      baseUrl: config.deploymentUrl,
      expectedMode: config.expectedMode,
      expectedBranch: config.expectedBranch,
      expectedCommit: config.expectedCommit,
      fetchImpl: createProtectionBypassFetch(secret, fetchImpl),
    });
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      await revokeVercelProtectionBypass(config, secret, { fetchImpl });
    } catch (cleanupError) {
      if (primaryError) {
        onCleanupError(cleanupError);
      } else {
        throw cleanupError;
      }
    }
  }
}
