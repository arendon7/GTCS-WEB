import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Impacto | Greenatics",
  description: "Indicadores públicos Greenatics gobernados por fuente, periodo, validación y metodología antes de publicación.",
  path: "/impacto",
});

export const metadata: Metadata = {
  alternates: { canonical: "/impacto" },
  ...social,
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
