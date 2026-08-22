import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { HomeGardenGuideVisualBand } from "@/components/home-garden-guide-visual-band";
import { HomeGardenKitVisualBand } from "@/components/home-garden-kit-visual-band";

export const metadata: Metadata = {
  title: "Casa y Jardín | Wondergreen · Greenatics",
  description: "Sistema Wondergreen para plantas, jardín, huerta y vivero: diagnóstico orientativo, nutrición por etapas, productos, kits en pre-lanzamiento y guías prácticas.",
  alternates: { canonical: "/casa-jardin" },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CasaJardinLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell ownsMain={false}>
      {children}
      <HomeGardenGuideVisualBand />
      <HomeGardenKitVisualBand />
    </PublicShell>
  );
}
