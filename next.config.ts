import type { NextConfig } from "next";
import { legacyPublicRedirects } from "./src/data/legacy-public-migration";
import { deploymentHeadersConfig } from "./src/lib/http-security";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return deploymentHeadersConfig();
  },
  async redirects() {
    return [...legacyPublicRedirects];
  },
};

export default nextConfig;
