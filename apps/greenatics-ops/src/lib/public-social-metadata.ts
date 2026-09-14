import type { Metadata } from "next";
import { publicSite } from "@/data/public-site";

type PublicSocialMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
};

export function publicSocialMetadata({ title, description, path }: PublicSocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const url = new URL(path, `${publicSite.publicDomainTarget}/`).toString();

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: publicSite.name,
      locale: "es_CO",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
