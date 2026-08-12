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

function vercelPreviewOrigin(env: OriginEnv) {
  if (env.VERCEL_ENV !== "preview") return null;
  const branchUrl = env.VERCEL_BRANCH_URL?.trim();
  if (!branchUrl) return null;

  try {
    const url = new URL(`https://${branchUrl}`);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function resolveTrustedAppBaseUrl(env: OriginEnv = process.env) {
  return explicitOrigin(env.APP_BASE_URL) ?? vercelPreviewOrigin(env);
}
