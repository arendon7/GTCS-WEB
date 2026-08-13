import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Wondergreen | Suelo, nutrición y biología",
  description: "Wondergreen integra fertilizantes sólidos y líquidos, compost, bioinsumos, guías por cultivo y acompañamiento técnico.",
  path: "/wondergreen",
});

export const metadata: Metadata = {
  ...social,
};

export default function WondergreenLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
