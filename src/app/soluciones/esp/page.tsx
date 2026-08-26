import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";
import { publicPageMetadata } from "@/lib/public-page-metadata";

const landing = getAudienceLanding("esp");

export const metadata: Metadata = publicPageMetadata({
  title: "Soluciones para ESP y prestadores | Greenatics",
  description: "Preparación, rutas, operación, orgánicos, infraestructura, dirección técnica y datos para empresas de servicios públicos y prestadores.",
  path: "/soluciones/esp",
});

export default function EspPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
