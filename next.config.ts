import type { NextConfig } from "next";
import { deploymentHeadersConfig } from "./src/lib/http-security";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return deploymentHeadersConfig();
  },
};

export default nextConfig;
