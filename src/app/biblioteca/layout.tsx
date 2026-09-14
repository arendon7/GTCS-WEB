import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca Técnica & Manuales de Cultivo | Greenatics",
  description: "88 documentos técnicos, manuales agronómicos de 20 páginas y guías de aplicación Wondergreen descargables en PDF.",
  alternates: { canonical: "/biblioteca/" },
};

export default function BibliotecaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
