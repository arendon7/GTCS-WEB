import type { Metadata } from "next";
import { OpsStoreProvider } from "@/components/ops-store";
import { MaintenanceStoreProvider } from "@/components/maintenance-store";
import { CompostStoreProvider } from "@/components/compost-store";
import { InventoryStoreProvider } from "@/components/inventory-store";
import { CommercialStoreProvider } from "@/components/commercial-store";
import { ExpenseStoreProvider } from "@/components/expense-store";
import { SupplyStoreProvider } from "@/components/supply-store";
import { PurchaseRequestStoreProvider } from "@/components/purchase-request-store";
import { SettlementStoreProvider } from "@/components/settlement-store";
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
      <body>
        <OpsStoreProvider>
          <MaintenanceStoreProvider>
            <CompostStoreProvider>
              <InventoryStoreProvider>
                <CommercialStoreProvider>
                  <ExpenseStoreProvider>
                    <SupplyStoreProvider>
                      <PurchaseRequestStoreProvider>
                        <SettlementStoreProvider>{children}</SettlementStoreProvider>
                      </PurchaseRequestStoreProvider>
                    </SupplyStoreProvider>
                  </ExpenseStoreProvider>
                </CommercialStoreProvider>
              </InventoryStoreProvider>
            </CompostStoreProvider>
          </MaintenanceStoreProvider>
        </OpsStoreProvider>
      </body>
    </html>
  );
}
