import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { publicSocialMetadata } from "@/lib/public-social-metadata";

const social = publicSocialMetadata({
  title: "Nosotros | Greenatics",
  description: "Greenatics conecta gestión de residuos orgánicos, ingeniería, operación, Wondergreen y datos para construir sistemas de economía circular aplicados.",
  path: "/nosotros",
});

export const metadata: Metadata = {
  alternates: { canonical: "/nosotros" },
  ...social,
};

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
