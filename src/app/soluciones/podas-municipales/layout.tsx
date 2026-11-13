import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valorización de podas y residuos vegetales municipales",
  description: "Diseña una ruta para podas, césped y material leñoso según su origen, condición, logística y posibles destinos.",
  alternates: { canonical: "/soluciones/podas-municipales/" },
};

export default function PodasMunicipalesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
