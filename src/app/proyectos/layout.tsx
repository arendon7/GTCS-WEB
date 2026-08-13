import { PublicShell } from "@/components/public-shell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell ownsMain={false}>{children}</PublicShell>;
}
