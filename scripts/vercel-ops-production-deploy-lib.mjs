import {
  VercelPilotError,
  ensureVercelPilotProject,
  parseVercelPilotConfig,
  waitForVercelPilotDeployment,
} from "./vercel-pilot-deploy-lib.mjs";

const VERCEL_API_ORIGIN = "https://api.vercel.com";
const PRODUCTION_TARGET = "production";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function apiUrl(path, teamId, query = {}) {
  const url = new URL(path, VERCEL_API_ORIGIN);
  url.searchParams.set("teamId", teamId);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && String(value) !== "") url.searchParams.set(key, String(value));
  }
  return url;
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

async function vercelRequest(config, fetchImpl, path, { method = "GET", query, body } = {}) {
  let response;
  try {
    response = await fetchImpl(apiUrl(path, config.teamId, query), {
      method,
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new VercelPilotError(`Vercel API ${method} ${path}: error de red.`);
  }

  const data = await parseResponseBody(response);
  if (!response.ok) {
    const code = clean(data?.error?.code) || `http_${response.status}`;
    throw new VercelPilotError(`Vercel API ${method} ${path}: ${code}.`);
  }
  return data;
}

function productionEnvironmentVariables(config) {
  return [
    {
      key: "NEXT_PUBLIC_DATA_MODE",
      value: "supabase",
      type: "plain",
      target: [PRODUCTION_TARGET],
      comment: "GREENATICS stable OPS production data mode",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: config.supabaseUrl,
      type: "plain",
      target: [PRODUCTION_TARGET],
      comment: "GREENATICS stable OPS production backend origin",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      value: config.supabasePublishableKey,
      type: "plain",
      target: [PRODUCTION_TARGET],
      comment: "GREENATICS stable OPS production publishable key",
    },
    {
      key: "SUPABASE_SECRET_KEY",
      value: config.supabaseSecretKey,
      type: "sensitive",
      target: [PRODUCTION_TARGET],
      comment: "GREENATICS stable OPS production server-only key",
    },
  ];
}

export async function upsertVercelOpsProductionEnvironment(config, project, { fetchImpl = fetch } = {}) {
  const variables = productionEnvironmentVariables(config);
  await vercelRequest(config, fetchImpl, `/v10/projects/${encodeURIComponent(project.id)}/env`, {
    method: "POST",
    query: { upsert: "true" },
    body: variables,
  });
  return Object.freeze({
    target: PRODUCTION_TARGET,
    mode: config.mode,
    keys: Object.freeze(variables.map((item) => item.key)),
  });
}

function parseRepository(fullName) {
  const [owner, repo, ...extra] = String(fullName ?? "").split("/");
  if (!owner || !repo || extra.length) throw new VercelPilotError("Repositorio GitHub inválido para producción OPS.");
  return { owner, repo, fullName: `${owner}/${repo}` };
}

export async function createVercelOpsProductionDeployment(config, project, { fetchImpl = fetch } = {}) {
  const repository = parseRepository(config.repository.fullName);
  const deployment = await vercelRequest(config, fetchImpl, "/v13/deployments", {
    method: "POST",
    query: { forceNew: "1" },
    body: {
      name: project.name,
      project: project.id,
      target: PRODUCTION_TARGET,
      gitSource: {
        type: "github",
        org: repository.owner,
        repo: repository.repo,
        ref: config.gitRef,
        sha: config.gitSha,
      },
      gitMetadata: {
        remoteUrl: `https://github.com/${repository.fullName}`,
        commitRef: config.gitRef,
        commitSha: config.gitSha,
        dirty: false,
        ci: true,
        ciType: "github-actions",
      },
      meta: {
        greenaticsHostedPilot: "true",
        greenaticsPilotMode: config.mode,
        greenaticsStableOps: "true",
        greenaticsGitSha: config.gitSha,
      },
    },
  });

  const id = clean(deployment?.id);
  const url = clean(deployment?.url);
  if (!id.startsWith("dpl_") || !url) throw new VercelPilotError("Vercel devolvió una identidad de deployment de producción inválida.");
  return Object.freeze({ id, url });
}

export async function ensureVercelOpsStableAlias(config, project, deployment, { fetchImpl = fetch } = {}) {
  const expectedAlias = `${project.name}.vercel.app`;
  const current = await vercelRequest(config, fetchImpl, `/v2/deployments/${encodeURIComponent(deployment.id)}/aliases`);
  const aliases = Array.isArray(current?.aliases) ? current.aliases : [];
  if (aliases.some((item) => clean(item?.alias) === expectedAlias)) {
    return Object.freeze({ alias: expectedAlias, assigned: false });
  }

  const assigned = await vercelRequest(config, fetchImpl, `/v2/deployments/${encodeURIComponent(deployment.id)}/aliases`, {
    method: "POST",
    body: { alias: expectedAlias },
  });
  if (clean(assigned?.alias) !== expectedAlias) throw new VercelPilotError("Vercel no confirmó el alias estable de OPS.");
  return Object.freeze({ alias: expectedAlias, assigned: true });
}

export async function runVercelOpsProductionDeployment({
  env = process.env,
  fetchImpl = fetch,
  sleepImpl,
  maxAttempts,
  pollIntervalMs,
} = {}) {
  const config = parseVercelPilotConfig(env);
  if (config.mode !== "full-ops") throw new VercelPilotError("El deployment estable de producción solo admite PILOT_PREVIEW_MODE=full-ops.");

  const project = await ensureVercelPilotProject(config, { fetchImpl });
  const environment = await upsertVercelOpsProductionEnvironment(config, project, { fetchImpl });
  const createdDeployment = await createVercelOpsProductionDeployment(config, project, { fetchImpl });
  const readyDeployment = await waitForVercelPilotDeployment(config, createdDeployment, {
    fetchImpl,
    sleepImpl,
    maxAttempts,
    pollIntervalMs,
  });
  const stableAlias = await ensureVercelOpsStableAlias(config, project, readyDeployment, { fetchImpl });

  return Object.freeze({
    mode: config.mode,
    project,
    environment,
    deployment: Object.freeze({
      ...readyDeployment,
      origin: `https://${stableAlias.alias}`,
      uniqueOrigin: readyDeployment.origin,
    }),
    alias: stableAlias,
    gitRef: config.gitRef,
    gitSha: config.gitSha,
  });
}
