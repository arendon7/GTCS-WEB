import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibilidad de mezclas en tanque",
  description:
    "Prepara una consulta técnica de mezcla: productos, formulaciones, vía de aplicación, cultivo y soportes para revisar con Greenatics.",
  alternates: { canonical: "/wondergreen/compatibilidad/" },
};

export default function CompatibilidadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
