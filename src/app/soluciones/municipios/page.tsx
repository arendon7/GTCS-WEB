import type { Metadata } from "next";
import { AudienceSolutionLanding } from "@/components/audience-solution-landing";
import { getAudienceLanding } from "@/data/audience-landings";
import { publicPageMetadata } from "@/lib/public-page-metadata";

const landing = getAudienceLanding("municipios");

export const metadata: Metadata = publicPageMetadata({
  title: "Soluciones para municipios | Greenatics",
  description: "Diagnóstico, PGIRS, programas de orgánicos, proyectos, activos, infraestructura y seguimiento técnico para municipios y entidades territoriales.",
  path: "/soluciones/municipios",
});

export default function MunicipiosPage() {
  if (!landing) return null;
  return <AudienceSolutionLanding landing={landing} />;
}
