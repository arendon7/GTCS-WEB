import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valorización de podas municipales",
  description: "Convierte podas, césped y material leñoso en una corriente trazable, con clasificación, logística, proceso y destino de calidad.",
  alternates: { canonical: "/soluciones/podas-municipales/" },
};

export default function PodasMunicipalesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
