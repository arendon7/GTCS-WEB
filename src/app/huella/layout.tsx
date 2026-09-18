import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calcula tu Huella | Inventario climático trazable",
  description: "Calcula tu Huella organiza fuentes, datos, factores, evidencias y revisión para convertir información climática en decisiones.",
  alternates: { canonical: "/huella/" },
  openGraph: {
    title: "Calcula tu Huella | Inventario climático trazable",
    description: "Explora escenarios públicos o entra a la plataforma completa para organizar inventarios, fuentes, evidencias y reportes.",
    url: "/huella/",
    images: ["/tools/huella/dashboard.png"],
  },
};

export default function HuellaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
