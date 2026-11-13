import type { Metadata } from "next";
import { PortfolioDemoApp } from "@/components/portfolio-demo-app";

export const metadata: Metadata = {
  title: "AGROWAY · Ejemplo de trazabilidad agrícola",
  description: "Muestra con datos ficticios sobre trazabilidad agrícola, trabajo de campo, evidencias y cosecha.",
  alternates: { canonical: "/agroway/app/" },
  openGraph: {
    title: "AGROWAY | Ejemplo de trazabilidad agrícola",
    description: "Explora módulos de trazabilidad agrícola, trabajo de campo, evidencias y cosechas con datos ficticios.",
    url: "/agroway/app/",
    images: ["/brand/agroway/agroway-logo.png"],
  },
};

export default function AgrowayDemoPage() {
  return <PortfolioDemoApp kind="agroway" />;
}
