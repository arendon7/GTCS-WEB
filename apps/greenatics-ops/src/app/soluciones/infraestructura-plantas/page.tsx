import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getIntentLanding } from "@/data/intent-landings";
import { publicPageMetadata } from "@/lib/public-page-metadata";

const landing = getIntentLanding("infraestructura-plantas");

export const metadata: Metadata = publicPageMetadata({
  title: "Infraestructura y plantas de residuos | Greenatics",
  description: "Prefactibilidad, evaluación técnica, factibilidad, ingeniería, construcción, rehabilitación y operación de plantas de tratamiento y valorización.",
  path: "/soluciones/infraestructura-plantas",
});

export default function InfraestructuraPlantasPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
