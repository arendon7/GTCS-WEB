"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CommercialStoreProvider } from "@/components/commercial-store";
import { CompostStoreProvider } from "@/components/compost-store";
import { ExpenseStoreProvider } from "@/components/expense-store";
import { InventoryStoreProvider } from "@/components/inventory-store";
import { MaintenanceStoreProvider } from "@/components/maintenance-store";
import { OpsStoreProvider } from "@/components/ops-store";
import { PurchaseRequestStoreProvider } from "@/components/purchase-request-store";
import { SettlementStoreProvider } from "@/components/settlement-store";
import { SupplyStoreProvider } from "@/components/supply-store";
import { isProtectedOpsPath } from "@/lib/ops-access-policy";

export function RuntimeProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!isProtectedOpsPath(pathname)) return children;

  return (
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
  );
}
