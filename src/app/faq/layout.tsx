import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes sobre Greenatics",
  description: "Respuestas claras sobre Wondergreen, operación de plantas, trazabilidad, herramientas digitales y soluciones de economía circular.",
  alternates: { canonical: "/faq/" },
};

export default function FaqLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
