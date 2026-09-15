const allowLocalRuntimeLinks = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ALLOW_LOCAL_RUNTIME_LINKS === "true";

const cleanRuntimeUrl = (value: string | undefined) => {
  const url = value?.trim().replace(/\/$/, "") || "";
  if (!allowLocalRuntimeLinks && /localhost|127\.0\.0\.1/.test(url)) return "";
  return url;
};

export const runtimeLinks = {
  huella: cleanRuntimeUrl(process.env.NEXT_PUBLIC_HUELLA_APP_URL),
  ops: cleanRuntimeUrl(process.env.NEXT_PUBLIC_OPS_APP_URL),
  red: cleanRuntimeUrl(process.env.NEXT_PUBLIC_RED_APP_URL),
};

export const runtimeLink = (configuredUrl: string, fallback: string) => configuredUrl || fallback;
