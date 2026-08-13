import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Guía de deficiencias nutricionales | Wondergreen",
  description: "Lectura visual orientativa de deficiencias nutricionales por cultivo, con reglas de campo y advertencias para evitar diagnósticos automáticos.",
  path: "/biblioteca/guia-deficiencias",
});

export const metadata: Metadata = {
  alternates: { canonical: "/biblioteca/guia-deficiencias" },
  ...social,
};

export default function DeficiencyGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Biblioteca", path: "/biblioteca" },
        { name: "Guía práctica de deficiencias", path: "/biblioteca/guia-deficiencias" },
      ]} />
      {children}
    </>
  );
}
