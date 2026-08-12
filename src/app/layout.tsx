import type { Metadata } from "next";
import { RuntimeProviders } from "@/components/runtime-providers";
import { publicSite } from "@/data/public-site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicSite.publicDomainTarget),
  title: "GREENATICS OPS",
  description: "Operación, trazabilidad y gestión de GREENATICS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><RuntimeProviders>{children}</RuntimeProviders></body>
    </html>
  );
}
