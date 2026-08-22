import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Recursos | Greenatics",
  description: "Biblioteca técnica, proyectos documentados, impacto, guías y herramientas de Greenatics y Wondergreen reunidas para tomar mejores decisiones.",
  path: "/biblioteca",
});

export const metadata: Metadata = {
  alternates: { canonical: "/biblioteca" },
  ...social,
};

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
