import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Biblioteca técnica | Greenatics",
  description: "Guías, manuales, criterios, programas por cultivo, Product Master y materiales descargables de Greenatics y Wondergreen con contexto técnico gobernado.",
  path: "/biblioteca",
});

export const metadata: Metadata = {
  alternates: { canonical: "/biblioteca" },
  ...social,
};

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
