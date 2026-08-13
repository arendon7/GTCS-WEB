import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Biblioteca | Greenatics",
  description: "Guías, programas por cultivo y herramientas técnicas de Greenatics y Wondergreen convertidas en conocimiento navegable.",
  path: "/biblioteca",
});

export const metadata: Metadata = {
  alternates: { canonical: "/biblioteca" },
  ...social,
};

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
