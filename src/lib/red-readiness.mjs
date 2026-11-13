const isPrivateOrLocalHost = (hostname) => {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (normalized === "localhost" || normalized === "::1" || normalized.startsWith("127.")) return true;
  const ipv4 = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return normalized.endsWith(".local") || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd");
  const [first, second] = ipv4.slice(1).map(Number);
  return first === 0 || first === 10 || first === 127 || (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) || (first === 100 && second >= 64 && second <= 127);
};

/** @param {string} runtimeHref */
export function redReadinessEndpoint(runtimeHref) {
  try {
    const runtime = new URL(runtimeHref);
    if (
      runtime.username || runtime.password || runtime.search || runtime.hash || runtime.pathname !== "/" ||
      (runtime.protocol !== "https:" && !(runtime.protocol === "http:" && isPrivateOrLocalHost(runtime.hostname)))
    ) return "";
    return new URL("/api/ready", runtime.origin).toString();
  } catch {
    return "";
  }
}

/** @param {boolean} responseOk @param {unknown} payload */
export function isGreenaticsRedReadyResponse(responseOk, payload) {
  if (!responseOk || typeof payload !== "object" || payload === null) return false;
  return "status" in payload && payload.status === "ready" &&
    "application" in payload && payload.application === "GREENATICS RED" &&
    "project_workspaces" in payload && payload.project_workspaces === 4 &&
    "drive_backup_verified" in payload && payload.drive_backup_verified === true;
}
