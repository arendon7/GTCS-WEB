import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";

const landing = getAudienceLanding("empresas");

export const metadata: Metadata = {
  title: "Soluciones para empresas y grandes generadores | Greenatics",
  description: "Diagnóstico, PMIRS, separación, logística, tratamiento, infraestructura y trazabilidad para empresas y grandes generadores.",
  alternates: { canonical: "/soluciones/empresas" },
};

export default function EmpresasPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
