import type { Metadata } from "next";
import { PortfolioDemoApp } from "@/components/portfolio-demo-app";

export const metadata: Metadata = {
  title: "AGROWAY · Demo navegable",
  description: "Entorno demo de AGROWAY para explorar trazabilidad agrícola, trabajo de campo, evidencias y cosechas.",
  alternates: { canonical: "/agroway/app/" },
};

export default function AgrowayDemoPage() {
  return <PortfolioDemoApp kind="agroway" />;
}
