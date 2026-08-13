import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";

export const metadata: Metadata = {
  alternates: { canonical: "/biblioteca/guia-deficiencias" },
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
