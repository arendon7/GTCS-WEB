import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { HomeGardenGuideVisualBand } from "@/components/home-garden-guide-visual-band";
import { HomeGardenKitVisualBand } from "@/components/home-garden-kit-visual-band";

export const metadata: Metadata = {
  title: "Casa y Jardín | Wondergreen · Greenatics",
  description: "Productos Wondergreen por etapa y kits Casa & Jardín para plantas, huerta y vivero, con guías prácticas y orientación segura cuando la etapa o condición no están claras.",
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
