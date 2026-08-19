import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";

const landing = getAudienceLanding("esp-municipios");

export const metadata: Metadata = {
  title: "Soluciones para ESP y municipios | Greenatics",
  description: "Preparación, línea base, PGIRS, rutas, operación, orgánicos, datos e infraestructura para municipios y empresas de servicios públicos.",
  alternates: { canonical: "/soluciones/esp-municipios" },
};

export default function EspMunicipiosPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
