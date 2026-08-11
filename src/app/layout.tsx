import type { Metadata } from "next";
import { OpsStoreProvider } from "@/components/ops-store";
import "./globals.css";

export const metadata: Metadata = { title: "GREENATICS OPS", description: "Operación, trazabilidad y gestión de GREENATICS" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><OpsStoreProvider>{children}</OpsStoreProvider></body></html>;
}
