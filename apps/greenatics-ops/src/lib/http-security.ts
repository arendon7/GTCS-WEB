import { protectedOpsRoutePrefixes } from "./ops-access-policy";

export type SecurityHeader = { key: string; value: string };

export const baselineSecurityHeaders: SecurityHeader[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

export const internalResponseHeaders: SecurityHeader[] = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "Pragma", value: "no-cache" },
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
];

export const internalHeaderRoutePrefixes = [
  ...protectedOpsRoutePrefixes,
  "/login",
  "/auth",
  "/api",
] as const;

export function deploymentHeadersConfig() {
  return [
    { source: "/:path*", headers: baselineSecurityHeaders },
    ...internalHeaderRoutePrefixes.map((prefix) => ({
      source: `${prefix}/:path*`,
      headers: internalResponseHeaders,
    })),
  ];
}
