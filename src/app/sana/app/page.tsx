import type { Metadata } from "next";
import { PortfolioDemoApp } from "@/components/portfolio-demo-app";

export const metadata: Metadata = {
  title: "SANA · Demo navegable",
  description: "Entorno demo de SANA para explorar oportunidades, portafolio, seguimiento, data room y decisiones.",
  alternates: { canonical: "/sana/app/" },
};

export default function SanaDemoPage() {
  return <PortfolioDemoApp kind="sana" />;
}
