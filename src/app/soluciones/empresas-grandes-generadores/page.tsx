import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";

const landing = getAudienceLanding("empresas-grandes-generadores");

export const metadata: Metadata = {
  title: "Soluciones para empresas y grandes generadores | Greenatics",
  description: "Línea base, PMIRS, redes multiunidad, separación, recolección, tratamiento, trazabilidad e infraestructura para empresas y grandes generadores.",
  alternates: { canonical: "/soluciones/empresas-grandes-generadores" },
};

export default function EmpresasGrandesGeneradoresPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
