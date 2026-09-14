import type { Metadata } from "next";
import { getService } from "@/data/services";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<unknown>;
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params as { slug: string };
  const service = getService(slug);
  if (!service) return {};

  const title = `${service.name} | Greenatics`;
  const description = service.summary;
  const path = `/soluciones/${service.slug}` as `/${string}`;

  return publicSocialMetadata({ title, description, path });
}

export default function ServiceSocialMetadataLayout({ children }: Props) {
  return children;
}
