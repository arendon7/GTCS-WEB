import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";

const landing = getAudienceLanding("propiedad-horizontal");

export const metadata: Metadata = {
  title: "Soluciones para propiedad horizontal e instituciones | Greenatics",
  description: "Diagnóstico, PMIRS, redes multiunidad, rutas, orgánicos, indicadores y seguimiento para propiedad horizontal, instituciones y redes de sedes.",
  alternates: { canonical: "/soluciones/propiedad-horizontal" },
};

export default function PropiedadHorizontalPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
