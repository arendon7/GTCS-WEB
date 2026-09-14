import type { Metadata } from "next";

export const metadata: Metadata = { title: "Análisis de agua de riego", description: "Organiza pH, conductividad eléctrica, sodio, calcio y otros datos para revisar la calidad del agua de riego.", alternates: { canonical: "/wondergreen/analisis-agua/" } };
export default function AnalisisAguaLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
