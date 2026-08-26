import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { getWondergreenReference } from "@/data/wondergreen-public";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const reference = getWondergreenReference(slug);
  if (!reference) return {};

  const title = `${reference.name}${reference.formula ? ` ${reference.formula}` : ""} | Wondergreen`;
  const description = `${reference.role} Consulta formulación, presentaciones, estado público y documentación Wondergreen vinculada.`;
  const path = `/wondergreen/productos/${reference.slug}` as `/${string}`;

  return publicSocialMetadata({ title, description, path });
}

export default async function WondergreenProductLayout({ children, params }: Props) {
  const { slug } = await params;
  const reference = getWondergreenReference(slug);
  if (!reference) return children;

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Wondergreen", path: "/wondergreen" },
        { name: "Productos", path: "/wondergreen/productos" },
        { name: reference.name, path: `/wondergreen/productos/${reference.slug}` as `/${string}` },
      ]} />
      {children}
    </>
  );
}
