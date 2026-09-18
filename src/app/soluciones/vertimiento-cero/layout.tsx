import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Circularidad y trazabilidad empresarial",
  description: "Ordena la línea base de residuos, los destinos y la evidencia para construir metas empresariales de desvío y circularidad.",
  alternates: { canonical: "/soluciones/vertimiento-cero/" },
};

export default function VertimientoCeroLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
