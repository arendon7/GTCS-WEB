import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibilidad de mezclas en tanque",
  description:
    "Matriz preliminar para revisar compatibilidad física y biológica antes de combinar Wondergreen, bioinsumos y otros productos agrícolas.",
  alternates: { canonical: "/wondergreen/compatibilidad/" },
};

export default function CompatibilidadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
