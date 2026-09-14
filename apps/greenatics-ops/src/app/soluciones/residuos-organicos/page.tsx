import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getIntentLanding } from "@/data/intent-landings";
import { publicPageMetadata } from "@/lib/public-page-metadata";

const landing = getIntentLanding("residuos-organicos");

export const metadata: Metadata = publicPageMetadata({
  title: "Gestión de residuos orgánicos | Greenatics",
  description: "Diagnóstico, separación, rutas, captura, recolección, tratamiento, trazabilidad y prefactibilidad para residuos orgánicos.",
  path: "/soluciones/residuos-organicos",
});

export default function ResiduosOrganicosPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
