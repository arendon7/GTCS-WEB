import type { Metadata } from "next";
import { getStrategicProgram } from "@/data/strategic-programs";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const program = getStrategicProgram(slug);
  if (!program) return {};

  const title = `${program.name} | Soluciones Greenatics`;
  const description = program.summary;
  const path = `/soluciones/programas/${program.slug}` as `/${string}`;

  return publicSocialMetadata({ title, description, path });
}

export default function StrategicProgramSocialLayout({ children }: Props) {
  return children;
}
