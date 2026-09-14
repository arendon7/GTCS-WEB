import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";
import { publicPageMetadata } from "@/lib/public-page-metadata";

const landing = getAudienceLanding("plantas");

export const metadata: Metadata = publicPageMetadata({
  title: "Soluciones para plantas y operadores | Greenatics",
  description: "Diagnóstico, rehabilitación, dirección técnica, trazabilidad, prefactibilidad e ingeniería para plantas, operadores y propietarios de infraestructura.",
  path: "/soluciones/plantas",
});

export default function PlantasPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
