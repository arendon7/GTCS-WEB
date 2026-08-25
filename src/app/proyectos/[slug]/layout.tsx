import type { Metadata } from "next";
import { getPublicProject } from "@/data/projects-public";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { slug } = await params;
  const project = getPublicProject(slug);
  if (!project) return {};

  const title = `${project.name} | Proyectos Greenatics`;
  const description = project.summary;
  const path = `/proyectos/${project.slug}` as `/${string}`;

  return publicSocialMetadata({ title, description, path });
}

export default function ProjectSocialMetadataLayout({ children }: Props) {
  return children;
}
