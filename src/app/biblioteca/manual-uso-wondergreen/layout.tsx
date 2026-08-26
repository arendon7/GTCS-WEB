import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const title = "Manual de uso Wondergreen | Greenatics";
const description = "Ruta práctica para preparar, aplicar, registrar y hacer seguimiento al uso de Wondergreen sin convertir una guía general en una receta universal.";
const path = "/biblioteca/manual-uso-wondergreen" as const;

export const metadata: Metadata = {
  ...publicSocialMetadata({ title, description, path }),
};

export default function WondergreenUseManualDiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Biblioteca", path: "/biblioteca" },
        { name: "Manual de uso Wondergreen", path },
      ]} />
      {children}
    </>
  );
}
