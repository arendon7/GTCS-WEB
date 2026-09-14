import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Recursos | Greenatics",
  description:
    "Biblioteca técnica, proyectos documentados e impacto gobernado de Greenatics reunidos para aprender, comprobar experiencia y revisar resultados con contexto.",
  path: "/recursos",
});

export const metadata: Metadata = {
  alternates: { canonical: "/recursos" },
  ...social,
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
