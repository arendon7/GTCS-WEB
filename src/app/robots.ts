import type { MetadataRoute } from "next";
import { internalRoutePrefixes, publicSite } from "@/data/public-site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = publicSite.publicDomainTarget.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...internalRoutePrefixes, "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
