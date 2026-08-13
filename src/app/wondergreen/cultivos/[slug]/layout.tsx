import type { Metadata } from "next";
import { getWondergreenCrop } from "@/data/wondergreen-crops";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) return {};
  return {
    alternates: { canonical: `/wondergreen/cultivos/${crop.slug}` },
  };
}

export default function WondergreenCropLayout({ children }: Props) {
  return children;
}
