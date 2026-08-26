import type { Metadata } from "next";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

type PublicPageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
};

export function publicPageMetadata({ title, description, path }: PublicPageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...publicSocialMetadata({ title, description, path }),
  };
}
