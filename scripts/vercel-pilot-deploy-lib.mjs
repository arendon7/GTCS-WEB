const VERCEL_API_ORIGIN = "https://api.vercel.com";
const DEFAULT_PROJECT_NAME = "greenatics-ops";
const TERMINAL_FAILURE_STATES = new Set(["BLOCKED", "CANCELED", "ERROR"]);

export class VercelPilotError extends Error {
  constructor(message) {
    super(message);
    this.name = "VercelPilotError";
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requireValue(env, name, { max = 8192 } = {}) {
  const value = clean(env[name]);
  if (!value || value.length > max) {
    throw new VercelPilotError(`${name} falta o tiene una longitud inválida.`);
  }
  return value;
}

function parseRepository(value) {
  const repository = clean(value);
  const match = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/.exec(repository);
  if (!match) throw new VercelPilotError("GITHUB_REPOSITORY debe tener formato owner/repo.");
  return Object.freeze({ fullName: repository, owner: match[1], repo: match[2] });
}

function parseCommitSha(value) {
  const sha = clean(value).toLowerCase();
  if (!/^[0-9a-f]{40}$/.test(sha)) {
    throw new VercelPilotError("DEPLOY_GIT_SHA debe ser un SHA Git completo de 40 caracteres.");
  }
  return sha;
}

function parseGitRef(value) {
  const ref = clean(value);
  if (!ref || ref.length > 255 || /[\s~^:?*[\\]/.test(ref) || ref.includes("..") || ref.endsWith(".")) {
    throw new VercelPilotError("DEPLOY_GIT_REF no es una referencia Git segura.");
  }
  return ref;
}

export function parseVercelPilotConfig(env = process.env) {
  const projectName = clean(env.VERCEL_PROJECT_NAME) || DEFAULT_PROJECT_NAME;
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(projectName)) {
    throw new VercelPilotError("VERCEL_PROJECT_NAME debe ser un slug seguro en minúsculas.");
  }

  return Object.freeze({
    token: requireValue(env, "VERCEL_TOKEN"),
    teamId: requireValue(env, "VERCEL_ORG_ID", { max: 256 }),
    projectName,
    repository: parseRepository(requireValue(env, "GITHUB_REPOSITORY", { max: 256 })),
    gitRef: parseGitRef(requireValue(env, "DEPLOY_GIT_REF", { max: 255 })),
    gitSha: parseCommitSha(requireValue(env, "DEPLOY_GIT_SHA", { max: 40 })),
    supabaseUrl: requireValue(env, "NEXT_PUBLIC_SUPABASE_URL", { max: 2048 }),
    supabasePublishableKey: requireValue(env, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", { max: 4096 }),
    supabaseSecretKey: requireValue(env, "SUPABASE_SECRET_KEY", { max: 4096 }),
  });
}

function apiUrl(path, teamId, query = {}) {
  const url = new URL(path, VERCEL_API_ORIGIN);
  url.searchParams.set("teamId", teamId);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && String(value) !== "") {
      url.searchParams.set(key, String(value));
    }
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

async function vercelRequest(config, fetchImpl, path, {
  method = "GET",
  query,
  body,
  allowNotFound = false,
} = {}) {
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
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    const code = clean(data?.error?.code) || `http_${response.status}`;
    throw new VercelPilotError(`Vercel API ${method} ${path}: ${code}.`);
  }
  return data;
}

function validateProject(project, expectedName) {
  const id = clean(project?.id);
  const name = clean(project?.name);
  if (!id.startsWith("prj_") || name !== expectedName) {
    throw new VercelPilotError("Vercel devolvió un proyecto con identidad inválida.");
  }
  return Object.freeze({ id, name });
}

export async function ensureVercelPilotProject(config, { fetchImpl = fetch } = {}) {
  const encodedName = encodeURIComponent(config.projectName);
  const existing = await vercelRequest(config, fetchImpl, `/v9/projects/${encodedName}`, {
    allowNotFound: true,
  });
  if (existing) return Object.freeze({ ...validateProject(existing, config.projectName), created: false });

  const created = await vercelRequest(config, fetchImpl, "/v11/projects", {
    method: "POST",
    body: {
      name: config.projectName,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: config.repository.fullName,
      },
    },
  });
  return Object.freeze({ ...validateProject(created, config.projectName), created: true });
}

function previewEnvironmentVariables(config) {
  return [
    {
      key: "NEXT_PUBLIC_DATA_MODE",
      value: "supabase",
      type: "plain",
      target: ["preview"],
      comment: "GREENATICS hosted pilot preview data mode",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: config.supabaseUrl,
      type: "plain",
      target: ["preview"],
      comment: "GREENATICS hosted pilot preview backend origin",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      value: config.supabasePublishableKey,
      type: "plain",
      target: ["preview"],
      comment: "GREENATICS hosted pilot preview publishable key",
    },
    {
      key: "SUPABASE_SECRET_KEY",
      value: config.supabaseSecretKey,
      type: "sensitive",
      target: ["preview"],
      comment: "GREENATICS hosted pilot preview server-only key",
    },
  ];
}

export async function upsertVercelPilotPreviewEnvironment(config, project, { fetchImpl = fetch } = {}) {
  await vercelRequest(config, fetchImpl, `/v10/projects/${encodeURIComponent(project.id)}/env`, {
    method: "POST",
    query: { upsert: "true" },
    body: previewEnvironmentVariables(config),
  });
  return Object.freeze({ target: "preview", keys: Object.freeze(previewEnvironmentVariables(config).map((item) => item.key)) });
}

function deploymentState(deployment) {
  return clean(deployment?.status || deployment?.readyState).toUpperCase();
}

function validateDeployment(deployment) {
  const id = clean(deployment?.id);
  const url = clean(deployment?.url);
  if (!id.startsWith("dpl_") || !url || /[\s/]/.test(url)) {
    throw new VercelPilotError("Vercel devolvió un deployment con identidad inválida.");
  }
  return { id, url, state: deploymentState(deployment) };
}

export async function createVercelPilotPreviewDeployment(config, project, { fetchImpl = fetch } = {}) {
  const deployment = await vercelRequest(config, fetchImpl, "/v13/deployments", {
    method: "POST",
    query: { forceNew: "1" },
    body: {
      name: project.name,
      project: project.id,
      gitSource: {
        type: "github",
        org: config.repository.owner,
        repo: config.repository.repo,
        ref: config.gitRef,
        sha: config.gitSha,
      },
      gitMetadata: {
        remoteUrl: `https://github.com/${config.repository.fullName}`,
        commitRef: config.gitRef,
        commitSha: config.gitSha,
        dirty: false,
        ci: true,
        ciType: "github-actions",
      },
      meta: {
        greenaticsHostedPilot: "true",
        greenaticsGitSha: config.gitSha,
      },
    },
  });
  return Object.freeze(validateDeployment(deployment));
}

export async function waitForVercelPilotDeployment(config, deployment, {
  fetchImpl = fetch,
  sleepImpl = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  maxAttempts = 120,
  pollIntervalMs = 3000,
} = {}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 600) {
    throw new VercelPilotError("maxAttempts fuera de rango.");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const current = await vercelRequest(config, fetchImpl, `/v13/deployments/${encodeURIComponent(deployment.id)}`);
    const validated = validateDeployment(current);
    if (validated.state === "READY") {
      return Object.freeze({
        ...validated,
        origin: `https://${validated.url}`,
      });
    }
    if (TERMINAL_FAILURE_STATES.has(validated.state)) {
      throw new VercelPilotError(`Vercel deployment terminó en estado ${validated.state}.`);
    }
    if (attempt + 1 < maxAttempts) await sleepImpl(pollIntervalMs);
  }

  throw new VercelPilotError("Vercel deployment no alcanzó READY dentro del límite del gate.");
}

export async function runVercelPilotPreviewDeployment({
  env = process.env,
  fetchImpl = fetch,
  sleepImpl,
  maxAttempts,
  pollIntervalMs,
} = {}) {
  const config = parseVercelPilotConfig(env);
  const project = await ensureVercelPilotProject(config, { fetchImpl });
  const environment = await upsertVercelPilotPreviewEnvironment(config, project, { fetchImpl });
  const createdDeployment = await createVercelPilotPreviewDeployment(config, project, { fetchImpl });
  const deployment = await waitForVercelPilotDeployment(config, createdDeployment, {
    fetchImpl,
    sleepImpl,
    maxAttempts,
    pollIntervalMs,
  });

  return Object.freeze({
    project,
    environment,
    deployment,
    gitRef: config.gitRef,
    gitSha: config.gitSha,
  });
}
