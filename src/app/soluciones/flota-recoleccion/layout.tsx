import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Microrrutas y recolección diferenciada",
  description: "Diseña rutas de recolección selectiva conectando generadores, frecuencia, carga útil, accesibilidad, descarga y trazabilidad.",
  alternates: { canonical: "/soluciones/flota-recoleccion/" },
};

export default function FlotaRecoleccionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
