import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preparación de soportes para el reporte SUI",
  description: "Organiza pesajes, procesos, balances, lixiviados, muestreo y soportes para revisar la información reportable de una operación de aprovechamiento.",
  alternates: { canonical: "/soluciones/auditoria-sui/" },
};

export default function AuditoriaSuiLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
