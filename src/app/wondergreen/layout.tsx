import { PublicShell } from "@/components/public-shell";
import { WondergreenVisualTruth } from "@/components/wondergreen-visual-truth";

export default function WondergreenLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}<WondergreenVisualTruth /></PublicShell>;
}
