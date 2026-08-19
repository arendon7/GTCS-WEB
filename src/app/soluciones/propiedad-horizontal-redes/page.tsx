import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getIntentLanding } from "@/data/intent-landings";

const landing = getIntentLanding("propiedad-horizontal-redes");

export const metadata: Metadata = {
  title: "Residuos para propiedad horizontal y redes | Greenatics",
  description: "Línea base, planes internos, PMIRS RED, rutas, orgánicos y trazabilidad para propiedad horizontal, constructoras y redes multiunidad.",
  alternates: { canonical: "/soluciones/propiedad-horizontal-redes" },
};

export default function PropiedadHorizontalRedesPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
