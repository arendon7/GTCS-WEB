import { AppShell } from "@/components/app-shell";
import { InventoryThresholdPanel } from "@/components/inventory-threshold-panel";

export default function InventoryThresholdsPage(){
  return <AppShell><header className="page-header"><div><p className="eyebrow">Inventario · política</p><h1>Umbrales de stock</h1><p className="lede">Configura mínimos técnicos por planta y producto sin modificar el kardex.</p></div></header><InventoryThresholdPanel/></AppShell>;
}
