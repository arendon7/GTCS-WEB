const protectedPrefixes = [
  "/app",
  "/activities",
  "/calendar",
  "/receptions",
  "/compost",
  "/production",
  "/inventory",
  "/supplies",
  "/sales",
  "/purchases",
  "/expenses",
  "/cash",
  "/finance",
  "/equipment",
  "/dashboard",
  "/imports",
  "/admin",
  "/account",
] as const;

export function isProtectedOpsPath(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function safeOpsNext(value: string | null | undefined, fallback = "/app") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  const pathname = value.split(/[?#]/, 1)[0] || "/";
  return isProtectedOpsPath(pathname) ? value : fallback;
}
