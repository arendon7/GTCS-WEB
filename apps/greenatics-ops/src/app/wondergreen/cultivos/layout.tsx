import type { Metadata } from "next";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const description = "Programas Wondergreen por cultivo con guías PDF publicadas, lectura por etapa, contexto agronómico y referencias relacionadas.";

const social = publicSocialMetadata({
  title: "Cultivos | Wondergreen",
  description,
  path: "/wondergreen/cultivos",
});

export const metadata: Metadata = {
  alternates: { canonical: "/wondergreen/cultivos" },
  ...social,
};

export default function WondergreenCropsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
