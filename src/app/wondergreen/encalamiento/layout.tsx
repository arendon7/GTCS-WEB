import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orientador de encalamiento", description: "Organiza pH, aluminio, textura y cultivo para preparar una revisión técnica de necesidades de encalamiento.", alternates: { canonical: "/wondergreen/encalamiento/" } };
export default function EncalamientoLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
