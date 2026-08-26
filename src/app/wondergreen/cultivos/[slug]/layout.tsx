import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getWondergreenCropDocument } from "@/data/wondergreen-crop-documents";
import { getWondergreenCrop } from "@/data/wondergreen-crops";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) return {};
  const guide = getWondergreenCropDocument(slug);
  const title = `${crop.name} | Programa Wondergreen`;
  const description = guide
    ? `${crop.headline} Consulta el programa navegable y abre la guía Wondergreen completa en PDF.`
    : `${crop.headline} Programa por etapa, contexto del lote y seguimiento.`;
  const path = `/wondergreen/cultivos/${crop.slug}` as `/${string}`;
  return {
    alternates: { canonical: path },
    ...publicSocialMetadata({ title, description, path }),
  };
}

export default async function WondergreenCropLayout({ children, params }: Props) {
  const { slug } = await params;
  const crop = getWondergreenCrop(slug);
  if (!crop) return children;

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Wondergreen", path: "/wondergreen" },
        { name: "Cultivos", path: "/wondergreen/cultivos" },
        { name: crop.name, path: `/wondergreen/cultivos/${crop.slug}` as `/${string}` },
      ]} />
      {children}
    </>
  );
}
