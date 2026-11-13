export type LocalToolCode = "OPS" | "CO₂";

const localToolEndpoints: Record<LocalToolCode, { port: number; path: string }> = {
  OPS: { port: 3002, path: "/app" },
  "CO₂": { port: 8765, path: "/login" },
};

export function getLocalToolRuntimeHref(code: LocalToolCode, hostname: string, huellaPort = 8765) {
  const normalizedHost = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!["localhost", "127.0.0.1", "::1"].includes(normalizedHost)) return "";

  const endpoint = localToolEndpoints[code];
  const port = code === "CO₂" ? huellaPort : endpoint.port;
  const authorityHost = normalizedHost.includes(":") ? `[${normalizedHost}]` : normalizedHost;
  return `http://${authorityHost}:${port}${endpoint.path}`;
}
