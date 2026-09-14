import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calcula tu Huella | Escenarios de desvío de residuos orgánicos",
  description: "Estimador Greenatics para explorar escenarios de desvío, emisiones evitadas y eficiencia logística con supuestos y metodología visibles.",
  alternates: { canonical: "/huella/" },
};

export default function CarbonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
