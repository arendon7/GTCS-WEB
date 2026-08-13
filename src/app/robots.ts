import type { MetadataRoute } from "next";
import { publicSite } from "@/data/public-site";
import { protectedOpsRoutePrefixes } from "@/lib/ops-access-policy";

const nonIndexableRoutePrefixes = [
  ...protectedOpsRoutePrefixes,
  "/login",
  "/auth/",
  "/api/",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...nonIndexableRoutePrefixes],
      },
    ],
    sitemap: `${publicSite.publicDomainTarget}/sitemap.xml`,
    host: publicSite.publicDomainTarget,
  };
}
