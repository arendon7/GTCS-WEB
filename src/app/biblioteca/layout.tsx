import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca técnica, guías y análisis",
  description: "Guías de cultivo, fichas técnicas y lecturas de Greenatics para relacionar fuentes, evidencia y decisiones de proyecto.",
  alternates: { canonical: "/biblioteca/" },
  openGraph: {
    type: "website",
    siteName: "Greenatics",
    title: "Biblioteca técnica, guías y análisis | Greenatics",
    description: "Guías de cultivo, fichas y lecturas de Greenatics para conectar evidencia, operación y decisiones de proyecto.",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function BibliotecaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
