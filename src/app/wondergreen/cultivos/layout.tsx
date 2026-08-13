import type { Metadata } from "next";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Cultivos | Wondergreen",
  description: "Programas orientativos Wondergreen por cultivo, etapa, condición del lote y objetivo agronómico.",
  path: "/wondergreen/cultivos",
});

export const metadata: Metadata = {
  alternates: { canonical: "/wondergreen/cultivos" },
  ...social,
};

export default function WondergreenCropsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
