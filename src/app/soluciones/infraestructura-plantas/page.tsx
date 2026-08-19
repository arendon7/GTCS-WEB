import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getIntentLanding } from "@/data/intent-landings";

const landing = getIntentLanding("infraestructura-plantas");

export const metadata: Metadata = {
  title: "Infraestructura y plantas de residuos | Greenatics",
  description: "Prefactibilidad, evaluación técnica, factibilidad, ingeniería, construcción, rehabilitación y operación de plantas de tratamiento y valorización.",
  alternates: { canonical: "/soluciones/infraestructura-plantas" },
};

export default function InfraestructuraPlantasPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
