import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encuentra tu ruta de transformación",
  description: "Ordena tu necesidad y encuentra una ruta Greenatics para municipios, empresas, agroindustria, productores, casa y jardín.",
  alternates: { canonical: "/diagnostico/" },
};

export default function DiagnosticoLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
