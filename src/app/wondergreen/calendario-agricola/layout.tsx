import type { Metadata } from "next";

export const metadata: Metadata = { title: "Planificador agrícola por etapa", description: "Organiza tu año de trabajo en café o aguacate Hass según la etapa observada y las condiciones del lote, con las guías Wondergreen como apoyo.", alternates: { canonical: "/wondergreen/calendario-agricola/" } };
export default function CalendarioAgricolaLayout({ children }: Readonly<{ children: React.ReactNode }>) { return children; }
