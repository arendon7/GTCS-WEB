import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";
import { HomeGardenKitVisualBand } from "@/components/home-garden-kit-visual-band";

export const metadata: Metadata = {
  title: "Casa y Jardín | Greenatics",
  description: "Espacio reservado para la futura línea Greenatics de soluciones para casa, jardín y autocultivo.",
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
      <HomeGardenKitVisualBand />
    </PublicShell>
  );
}
