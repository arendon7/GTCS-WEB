import type { Metadata } from "next";
import { GlosarioClient } from "./glosario-client";

export const metadata: Metadata = {
  title: "Glosario técnico de economía circular y agronomía",
  description: "Consulta conceptos de suelos, bioprocesos, gestión de residuos y agronomía en un glosario técnico con búsqueda interactiva.",
  alternates: { canonical: "/biblioteca/glosario/" },
};

export default function GlosarioPage() {
  return <GlosarioClient />;
}
