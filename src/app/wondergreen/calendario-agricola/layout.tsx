import type { Metadata } from "next";

export const metadata: Metadata = { title: "Calendario agrícola por cultivo", description: "Consulta momentos de manejo y observación por cultivo y región como apoyo para planear el trabajo de campo.", alternates: { canonical: "/wondergreen/calendario-agricola/" } };
export default function CalendarioAgricolaLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
