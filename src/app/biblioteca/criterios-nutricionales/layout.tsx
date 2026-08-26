import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const title = "Criterios de revisión nutricional | Greenatics";
const description = "Criterios técnicos para revisar suelo, etapa, densidad, historial de fertilización y objetivo productivo antes de orientar un programa Wondergreen.";
const path = "/biblioteca/criterios-nutricionales" as const;

export const metadata: Metadata = {
  ...publicSocialMetadata({ title, description, path }),
};

export default function NutritionalCriteriaDiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Biblioteca", path: "/biblioteca" },
        { name: "Criterios nutricionales", path },
      ]} />
      {children}
    </>
  );
}
