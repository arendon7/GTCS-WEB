const cleanRuntimeUrl = (value: string | undefined) => value?.trim().replace(/\/$/, "") || "";

export const runtimeLinks = {
  huella: cleanRuntimeUrl(process.env.NEXT_PUBLIC_HUELLA_APP_URL),
  ops: cleanRuntimeUrl(process.env.NEXT_PUBLIC_OPS_APP_URL),
  red: cleanRuntimeUrl(process.env.NEXT_PUBLIC_RED_APP_URL),
};

export const runtimeLink = (configuredUrl: string, fallback: string) => configuredUrl || fallback;
