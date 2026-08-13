import type { Metadata } from "next";
import { PublicShell } from "@/components/public-shell";

export const metadata: Metadata = {
  openGraph: {
    title: "Proyectos | Greenatics",
    description: "Casos documentados y aprendizajes Greenatics en operación, rehabilitación, tratamiento biológico, rutas selectivas y trazabilidad.",
    url: "https://greenatics.com.co/proyectos",
    siteName: "Greenatics",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Proyectos | Greenatics",
    description: "Casos documentados y aprendizajes Greenatics en operación, rehabilitación, tratamiento biológico, rutas selectivas y trazabilidad.",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
