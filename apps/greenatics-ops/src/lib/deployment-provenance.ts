export type DeploymentProvenance = {
  platform: "vercel" | "generic";
  environment: string;
  branch: string | null;
  commit: string | null;
};

type DeploymentEnv = Record<string, string | undefined>;

function safeBranch(value: string | undefined) {
  if (!value || value.length > 120) return null;
  return /^[A-Za-z0-9._/-]+$/.test(value) ? value : null;
}

function shortCommit(value: string | undefined) {
  if (!value || !/^[0-9a-f]{7,64}$/i.test(value)) return null;
  return value.slice(0, 12).toLowerCase();
}

function safeEnvironment(value: string | undefined) {
  if (!value || value.length > 40) return "unknown";
  return /^[A-Za-z0-9._-]+$/.test(value) ? value : "unknown";
}

export function getDeploymentProvenance(env: DeploymentEnv = process.env): DeploymentProvenance {
  const vercel = env.VERCEL === "1" || Boolean(env.VERCEL_ENV);

  return {
    platform: vercel ? "vercel" : "generic",
    environment: safeEnvironment(env.VERCEL_ENV || env.NODE_ENV),
    branch: vercel ? safeBranch(env.VERCEL_GIT_COMMIT_REF) : null,
    commit: vercel ? shortCommit(env.VERCEL_GIT_COMMIT_SHA) : null,
  };
}
