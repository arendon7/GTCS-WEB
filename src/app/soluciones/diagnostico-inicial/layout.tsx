import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const title = "Diagnóstico inicial | Greenatics";
const description = "Orientador inicial para identificar contexto, necesidad y estado actual antes de elegir una solución Greenatics.";
const path = "/soluciones/diagnostico-inicial" as const;

export const metadata: Metadata = {
  ...publicSocialMetadata({ title, description, path }),
};

export default function InitialDiagnosticDiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: "Greenatics", path: "/" },
        { name: "Soluciones", path: "/soluciones" },
        { name: "Diagnóstico inicial", path },
      ]} />
      {children}
    </>
  );
}
