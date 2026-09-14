import { PublicShell } from "@/components/public-shell";

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
