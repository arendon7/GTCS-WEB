import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viabilidad municipal y prefactibilidad",
  description: "Compara alternativas de generación, logística, tratamiento, financiación y operación antes de comprometer una solución municipal.",
  alternates: { canonical: "/soluciones/viabilidad-municipal/" },
};

export default function ViabilidadMunicipalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
