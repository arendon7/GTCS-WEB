import type { Metadata } from "next";
import { OpsStoreProvider } from "@/components/ops-store";
import { MaintenanceStoreProvider } from "@/components/maintenance-store";
import { CompostStoreProvider } from "@/components/compost-store";
import { InventoryStoreProvider } from "@/components/inventory-store";
import { CommercialStoreProvider } from "@/components/commercial-store";
import { ExpenseStoreProvider } from "@/components/expense-store";
import "./globals.css";

export const metadata: Metadata = { title: "GREENATICS OPS", description: "Operación, trazabilidad y gestión de GREENATICS" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><OpsStoreProvider><MaintenanceStoreProvider><CompostStoreProvider><InventoryStoreProvider><CommercialStoreProvider><ExpenseStoreProvider>{children}</ExpenseStoreProvider></CommercialStoreProvider></InventoryStoreProvider></CompostStoreProvider></MaintenanceStoreProvider></OpsStoreProvider></body></html>;
}
