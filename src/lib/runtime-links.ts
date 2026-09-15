const allowLocalRuntimeLinks = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ALLOW_LOCAL_RUNTIME_LINKS === "true";

const isPrivateOrLocalHost = (hostname: string) => {
  const normalized = hostname.toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".local") || normalized === "::1") return true;

  const ipv4 = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const octets = ipv4.slice(1).map(Number);
    if (octets.some((octet) => octet > 255)) return true;
    const [first, second] = octets;
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first === 169 && second === 254 ||
      first === 172 && second >= 16 && second <= 31 ||
      first === 192 && second === 168 ||
      first === 100 && second >= 64 && second <= 127
    );
  }

  return normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd");
};

const cleanRuntimeUrl = (value: string | undefined) => {
  const url = value?.trim().replace(/\/$/, "") || "";
  if (!url || allowLocalRuntimeLinks) return url;

  try {
    const parsed = new URL(url);
    // Public builds may only link to externally reachable HTTPS runtimes.
    return parsed.protocol === "https:" && !isPrivateOrLocalHost(parsed.hostname) ? url : "";
  } catch {
    return "";
  }
};

const configuredOpsRuntime = cleanRuntimeUrl(process.env.NEXT_PUBLIC_OPS_APP_URL);

export const runtimeLinks = {
  huella: cleanRuntimeUrl(process.env.NEXT_PUBLIC_HUELLA_APP_URL),
  // Local development can override this with a LAN runtime; public builds always keep OPS reachable.
  ops: configuredOpsRuntime || "https://greenatics-ops.vercel.app",
  red: cleanRuntimeUrl(process.env.NEXT_PUBLIC_RED_APP_URL),
};

export const runtimeLink = (configuredUrl: string, fallback: string) => configuredUrl || fallback;
