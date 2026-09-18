import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beneficio tributario ambiental",
  description: "Estructura la elegibilidad, la línea base y el expediente técnico de una inversión ambiental antes de solicitar un tratamiento tributario.",
  alternates: { canonical: "/soluciones/beneficio-tributario/" },
};

export default function BeneficioTributarioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
