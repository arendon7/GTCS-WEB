import type { Metadata } from "next";

export const metadata: Metadata = { title: "Análisis de suelo para decidir mejor", description: "Organiza pH, materia orgánica, C.I.C. y aluminio para preparar una conversación técnica sobre el suelo.", alternates: { canonical: "/wondergreen/analisis-suelo/" } };
export default function AnalisisSueloLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
