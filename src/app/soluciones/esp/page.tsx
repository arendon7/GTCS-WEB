import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";

const landing = getAudienceLanding("esp");

export const metadata: Metadata = {
  title: "Soluciones para ESP y prestadores | Greenatics",
  description: "Preparación, rutas, operación, orgánicos, infraestructura, dirección técnica y datos para empresas de servicios públicos y prestadores.",
  alternates: { canonical: "/soluciones/esp" },
};

export default function EspPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
