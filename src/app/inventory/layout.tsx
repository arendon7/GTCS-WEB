import type { ReactNode } from "react";
import { OpsRouteGuard } from "@/components/ops-route-guard";

export default function OpsProtectedLayout({ children }: { children: ReactNode }) {
  return <OpsRouteGuard>{children}</OpsRouteGuard>;
}
