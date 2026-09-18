import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biblioteca técnica y manuales de cultivo",
  description: "Recursos técnicos curados: manuales agronómicos, guías de aplicación Wondergreen, documentos de operación y rutas web para decidir con mejor información.",
  alternates: { canonical: "/biblioteca/" },
  openGraph: {
    type: "website",
    siteName: "Greenatics",
    title: "Biblioteca técnica y manuales de cultivo | Greenatics",
    description: "Recursos técnicos curados para conectar diagnóstico, aplicación, operación y aprendizaje en Greenatics.",
    images: ["/brand/greenatics-horizontal.webp"],
  },
};

export default function BibliotecaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
