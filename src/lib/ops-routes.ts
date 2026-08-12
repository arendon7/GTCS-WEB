import { isProtectedOpsPath } from "@/lib/ops-access-policy";

export { isProtectedOpsPath };

export function safeOpsNext(value: string | null | undefined, fallback = "/app") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  const pathname = value.split(/[?#]/, 1)[0] || "/";
  return isProtectedOpsPath(pathname) ? value : fallback;
}
