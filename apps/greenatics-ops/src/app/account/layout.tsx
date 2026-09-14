import type { ReactNode } from "react";
import { OpsRouteGuard } from "@/components/ops-route-guard";

export const dynamic = "force-dynamic";

export default function AccountProtectedLayout({ children }: { children: ReactNode }) {
  return <OpsRouteGuard>{children}</OpsRouteGuard>;
}
