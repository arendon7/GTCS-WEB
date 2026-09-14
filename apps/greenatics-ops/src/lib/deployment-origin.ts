type OriginEnv = Record<string, string | undefined>;

function explicitOrigin(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function vercelSystemOrigin(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return null;

  try {
    const url = new URL(`https://${value}`);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function vercelPreviewOrigin(env: OriginEnv) {
  if (env.VERCEL_ENV !== "preview") return null;
  return vercelSystemOrigin(env.VERCEL_BRANCH_URL);
}

function vercelProductionOrigin(env: OriginEnv) {
  if (env.VERCEL_ENV !== "production") return null;
  return vercelSystemOrigin(env.VERCEL_PROJECT_PRODUCTION_URL);
}

export function resolveTrustedAppBaseUrl(env: OriginEnv = process.env) {
  return explicitOrigin(env.APP_BASE_URL) ?? vercelPreviewOrigin(env) ?? vercelProductionOrigin(env);
}
