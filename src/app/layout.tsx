import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "GREENATICS OPS", description: "Operación, trazabilidad y gestión de GREENATICS" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
