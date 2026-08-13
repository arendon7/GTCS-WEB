import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Soluciones | Greenatics",
  description: "Diagnóstico, planeación, rutas selectivas, plantas, operación y trazabilidad para municipios, ESP, empresas y grandes generadores.",
  path: "/soluciones",
});

export const metadata: Metadata = { ...social };

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
