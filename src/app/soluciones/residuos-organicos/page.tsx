import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getIntentLanding } from "@/data/intent-landings";

const landing = getIntentLanding("residuos-organicos");

export const metadata: Metadata = {
  title: "Gestión de residuos orgánicos | Greenatics",
  description: "Diagnóstico, separación, rutas, captura, recolección, tratamiento, trazabilidad y prefactibilidad para residuos orgánicos.",
  alternates: { canonical: "/soluciones/residuos-organicos" },
};

export default function ResiduosOrganicosPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
