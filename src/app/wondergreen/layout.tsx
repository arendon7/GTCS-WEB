import type { Metadata } from "next";

export const metadata: Metadata = {
  openGraph: {
    type: "website",
    siteName: "Greenatics",
    title: "Wondergreen | Nutrición organomineral y acompañamiento agronómico",
    description: "Nutrición, bioinsumos, herramientas agronómicas y acompañamiento para leer suelo, cultivo, etapa y objetivo.",
  },
};

export default function WondergreenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
