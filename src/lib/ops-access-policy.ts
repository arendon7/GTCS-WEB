export const protectedOpsRoutePrefixes = [
  "/app",
  "/activities",
  "/calendar",
  "/cash",
  "/compost",
  "/dashboard",
  "/equipment",
  "/expenses",
  "/finance",
  "/imports",
  "/inventory",
  "/production",
  "/purchases",
  "/receptions",
  "/sales",
  "/supplies",
] as const;

type AccessEnv = Pick<
  NodeJS.ProcessEnv,
  | "NODE_ENV"
  | "VERCEL_ENV"
  | "NEXT_PUBLIC_DATA_MODE"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  | "GREENATICS_OPS_LOCAL_BYPASS"
>;

export type OpsAccessMode = "local-bypass" | "supabase-auth" | "configuration-block";

export function isProtectedOpsPath(pathname: string) {
  return protectedOpsRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isLocalOpsBypassAllowed(env: AccessEnv = process.env) {
  const localDataMode = env.NEXT_PUBLIC_DATA_MODE !== "supabase";
  if (!localDataMode) return false;

  const developmentRuntime = env.NODE_ENV !== "production";
  if (developmentRuntime) return true;

  const explicitLocalRuntime = env.GREENATICS_OPS_LOCAL_BYPASS === "true" && !env.VERCEL_ENV;
  return explicitLocalRuntime;
}

export function getOpsAccessMode(env: AccessEnv = process.env): OpsAccessMode {
  if (isLocalOpsBypassAllowed(env)) return "local-bypass";

  const remoteConfigured =
    env.NEXT_PUBLIC_DATA_MODE === "supabase" &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  return remoteConfigured ? "supabase-auth" : "configuration-block";
}
