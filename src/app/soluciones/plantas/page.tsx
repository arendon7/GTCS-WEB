import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";

const landing = getAudienceLanding("plantas");

export const metadata: Metadata = {
  title: "Soluciones para plantas y operadores | Greenatics",
  description: "Diagnóstico, rehabilitación, dirección técnica, trazabilidad, prefactibilidad e ingeniería para plantas, operadores y propietarios de infraestructura.",
  alternates: { canonical: "/soluciones/plantas" },
};

export default function PlantasPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
