import type { Metadata } from "next";
import { PortfolioDemoApp } from "@/components/portfolio-demo-app";

export const metadata: Metadata = {
  title: "SANA · Muestra de estructuración de proyectos",
  description: "Muestra con datos ficticios para explorar oportunidades productivas, inversión y acompañamiento.",
  alternates: { canonical: "/sana/app/" },
  openGraph: {
    title: "SANA | Muestra de estructuración de proyectos",
    description: "Explora oportunidades, portafolio, seguimiento, data room y decisiones con datos ficticios.",
    url: "/sana/app/",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function SanaDemoPage() {
  return <PortfolioDemoApp kind="sana" />;
}
