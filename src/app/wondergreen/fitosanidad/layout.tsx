import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fitosanidad y observación de campo", description: "Organiza señales, observaciones y focos de atención por cultivo antes de solicitar una orientación fitosanitaria.", alternates: { canonical: "/wondergreen/fitosanidad/" } };
export default function FitosanidadLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
