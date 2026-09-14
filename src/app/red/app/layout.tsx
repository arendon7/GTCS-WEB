import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GREENATICS Red | Espacio de trabajo",
  description: "Estación navegable de GREENATICS Red para Proyecto 360, FIELD, QA/QC, PMIRS y coordinación.",
  robots: { index: false, follow: false },
};

export default function RedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
