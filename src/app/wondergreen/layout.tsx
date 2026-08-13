import { PublicShell } from "@/components/public-shell";

export default function WondergreenLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
